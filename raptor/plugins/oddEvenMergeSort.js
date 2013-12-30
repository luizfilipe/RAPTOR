raptorjs.oddEvenMergeSort = function( ){
	this.width = 512;
	
	this.createShaders();
	
	this.logFieldsize = Math.logBase(this.width, 2);
	this.stage;
	this.pass;
	
	this.stepsLeft = 0;
	this.totalSteps;
	this.stepsToDo;
	
	this.oddevenMergeShader;
	this.shader;
	
	this.pingFrameBuffer;
	this.pongFrameBuffer;
	
	this.sourceFramebuffer;
	
	this.currentFrameBuffer;
	
	this.testSampler;
	this.started = false;
	
	this.cellStartFrameBuffer;
	this.cellEndFrameBuffer;
	this.sortedKeysFramebuffer;
	
	this.rasterizerMesh; // width * width vertices
	
	this.textureShader;
};

raptorjs.oddEvenMergeSort.prototype.createShaders = function( ){
	var system = raptorjs.system;
	var size = this.width;
	
	this.oddevenMergeShader = raptorjs.createObject("shader");
	this.oddevenMergeShader.createFomFile("shaders/particle sandbox/bitonicMergeSort/merge.shader");
	this.oddevenMergeShader.setUniform("worldViewProjection", system.quadViewProjection );
	
	this.cellStartIndex = raptorjs.createObject("shader");
	this.cellStartIndex.createFomFile("shaders/particle sandbox/cellStartIndex.shader");
	this.cellStartIndex.setUniform("worldViewProjection", system.quadViewProjection );
	this.cellStartIndex.setUniform("width", this.width );
	
	this.shader = raptorjs.createObject("shader");
	this.shader.createFomFile("shaders/textureNorm.shader");
	this.shader.setUniform("worldViewProjection", system.quadViewProjection );
	
	this.textureShader = raptorjs.createObject("shader");
	this.textureShader.createFomFile("shaders/texture.shader");
	this.textureShader.setUniform("worldViewProjection", system.quadViewProjection );
	
	
	this.cellStartFrameBuffer = raptorjs.system.createFrameBuffer(size, size, gl.FLOAT);
	this.cellEndFrameBuffer = raptorjs.system.createFrameBuffer(size, size, gl.FLOAT);

	var cellStartTexture = raptorjs.createObject('texture');
	cellStartTexture.dataType = 'framebuffer';
	cellStartTexture.data = this.cellStartFrameBuffer.texture;
	cellStartTexture.width = size;
	cellStartTexture.height = size;
	
	var cellEndTexture = raptorjs.createObject('texture');
	cellEndTexture.dataType = 'framebuffer';
	cellEndTexture.data = this.cellEndFrameBuffer.texture;
	cellEndTexture.width = size;
	cellEndTexture.height = size;

	
	var cellStartSampler = raptorjs.createObject("sampler2D");
	cellStartSampler.texture = cellStartTexture;
	
	var cellEndSampler = raptorjs.createObject("sampler2D");
	cellEndSampler.texture = cellEndTexture;
	
	this.cellStartFrameBuffer.sampler = cellStartSampler;
	this.cellEndFrameBuffer.sampler = cellEndSampler;

	this.pingFrameBuffer = raptorjs.system.createFrameBuffer(size, size, gl.FLOAT);
	this.pongFrameBuffer = raptorjs.system.createFrameBuffer(size, size, gl.FLOAT);
	
	this.pingFrameBuffer.name = "ping";
	this.pongFrameBuffer.name = "pong";
	
	var pingTexture = raptorjs.createObject('texture');
	pingTexture.dataType = 'framebuffer';
	pingTexture.data = this.pingFrameBuffer.texture;
	pingTexture.width = size;
	pingTexture.height = size;
	
	var pongTexture = raptorjs.createObject('texture');
	pongTexture.dataType = 'framebuffer';
	pongTexture.data = this.pongFrameBuffer.texture;
	pongTexture.width = size;
	pongTexture.height = size;
	
	var pingSampler = raptorjs.createObject("sampler2D");
	pingSampler.texture = pingTexture;
	
	var pongSampler = raptorjs.createObject("sampler2D");
	pongSampler.texture = pongTexture;
	
	this.pingFrameBuffer.sampler = pingSampler;
	this.pongFrameBuffer.sampler = pongSampler;
	
	this.currentFrameBuffer = this.pingFrameBuffer;
	
	
	
	this.sortedKeysFramebuffer = raptorjs.system.createFrameBuffer(size, size, gl.FLOAT);

	var sortedKeysTexture = raptorjs.createObject('texture');
	sortedKeysTexture.dataType = 'framebuffer';
	sortedKeysTexture.data = this.sortedKeysFramebuffer.texture;
	sortedKeysTexture.width = size;
	sortedKeysTexture.height = size;
	
	var sortedKeysSampler = raptorjs.createObject("sampler2D");
	sortedKeysSampler.texture = sortedKeysTexture;

	this.sortedKeysFramebuffer.sampler = sortedKeysSampler;
}


raptorjs.oddEvenMergeSort.prototype.createRasterizer = function(  ) {
	var indexArray = [];
	var size = this.width * this.width;
	var width = this.width;
	
	for(var x = 0; x < width; x++) {
		for(var y = 0; y < width; y++) {
			var index = (x + (y*width) ) * 3;

			indexArray[index] = x/width;
			indexArray[index+1] = y/width;
			indexArray[index+2] = (x + (y*width) );
		}
	}

	var mesh = {};

	mesh.indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, mesh.indexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( indexArray ), gl.STATIC_DRAW);
	mesh.indexBuffer.itemSize = 3;
	mesh.indexBuffer.numItems = size;

	this.rasterizerMesh = mesh;
};

raptorjs.oddEvenMergeSort.prototype.getKeys = function( ) {
	this.rasterize( this.cellStartFrameBuffer, -1 );
	this.rasterize( this.cellEndFrameBuffer, 1 );
}


raptorjs.oddEvenMergeSort.prototype.rasterize = function( framebuffer, direction  ) {
	var shader = this.cellStartIndex;
	var camera = raptorjs.mainCamera;
	var shaderProgram = shader.program;
	
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
	
	gl.useProgram(shaderProgram);
	gl.viewport(0, 0, this.width, this.width);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	shader.setUniform("sortedKeysArray", this.sortedKeysFramebuffer.sampler );
	shader.setUniform("dir", direction );
	
	var buffer = this.rasterizerMesh.indexBuffer;
	var attribute = shader.getAttributeByName('uv');
	
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);	
	gl.vertexAttribPointer(attribute, buffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.drawArrays( gl.POINTS, 0, buffer.numItems );
	
	shader.update();
	
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

raptorjs.oddEvenMergeSort.prototype.sortedKeys = function(  ) {
	var framebuffer = this.sortedKeysFramebuffer;
	var shader = this.textureShader;
	
	var uvbuffers = raptorjs.system.getDeferredBuffersByName('uv')[0];
	var indexbuffers = raptorjs.system.getDeferredBuffersByName('index')[0];
	var positionBuffers = raptorjs.system.getDeferredBuffersByName('position')[0];
	
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
	gl.viewport(0, 0, this.width, this.width);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.useProgram(shader.program);

	var buffer = positionBuffers;
	var attribute = shader.getAttributeByName('position');
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.vertexAttribPointer(attribute, buffer.itemSize, gl.FLOAT, false, 0, 0);

	var buffer = uvbuffers;
	var attribute = shader.getAttributeByName('uv');
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.vertexAttribPointer(attribute, buffer.itemSize, gl.FLOAT, false, 0, 0);
	
	shader.setUniform("textureSampler", this.currentFrameBuffer.sampler );
	shader.update();
	
	var buffer = indexbuffers;
	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, buffer );
	gl.drawElements( gl.TRIANGLES, buffer.numItems, gl.UNSIGNED_SHORT, 0 );
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

raptorjs.oddEvenMergeSort.prototype.switchPingPongBuffer = function() {
	var currentBuffer = this.currentFrameBuffer;
	
	if(currentBuffer && currentBuffer.name == "ping") {
		//console.log('ping');
		this.currentFrameBuffer = this.pongFrameBuffer;
	} else {
		//console.log('pong');
		this.currentFrameBuffer = this.pingFrameBuffer;
	}
}

raptorjs.oddEvenMergeSort.prototype.sortstep = function() {
	var pstage = (1<<this.stage);
    var ppass  = (1<<this.pass);
	
	this.oddevenMergeShader.setUniform("TwoStage", pstage+pstage );
	this.oddevenMergeShader.setUniform("Pass_mod_Stage", ppass%pstage );
	this.oddevenMergeShader.setUniform("TwoStage_PmS_1", ((pstage+pstage)-(ppass%pstage)-1) );
	
	this.oddevenMergeShader.setUniform("Width", this.width );
	this.oddevenMergeShader.setUniform("Pass", ppass );

	var sampler = this.currentFrameBuffer.sampler;
	
	if(!this.started) {
		this.oddevenMergeShader.setUniform("Data",  raptorjs.particleSandbox.gridPositionFramebuffer.sampler);
		//console.log(raptorjs.particleSandbox.gridPositionFramebuffer.sampler);
		this.started = true;
	} else {
		this.oddevenMergeShader.setUniform("Data", sampler );
		
	}

	this.switchPingPongBuffer();
	this.renderQuad( this.oddevenMergeShader );
}

raptorjs.oddEvenMergeSort.prototype.renderQuad = function( shader ) {
	var framebuffer = this.currentFrameBuffer;

	var uvbuffers = raptorjs.system.getDeferredBuffersByName('uv')[0];
	var indexbuffers = raptorjs.system.getDeferredBuffersByName('index')[0];
	var positionBuffers = raptorjs.system.getDeferredBuffersByName('position')[0];
	
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
	gl.viewport(0, 0, this.width, this.width);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.useProgram(shader.program);

	var buffer = positionBuffers;
	var attribute = shader.getAttributeByName('position');
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.vertexAttribPointer(attribute, buffer.itemSize, gl.FLOAT, false, 0, 0);

	var buffer = uvbuffers;
	var attribute = shader.getAttributeByName('uv');
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.vertexAttribPointer(attribute, buffer.itemSize, gl.FLOAT, false, 0, 0);
	
	shader.update();
	
	var buffer = indexbuffers;
	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, buffer );
	gl.drawElements( gl.TRIANGLES, buffer.numItems, gl.UNSIGNED_SHORT, 0 );
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};

raptorjs.oddEvenMergeSort.prototype.test = function(  ) {
	//var sampler = raptorjs.particleSandbox.currentPositionFrameBuffer.sampler;
	//var sampler = raptorjs.particleSandbox.gridPositionFramebuffer.sampler;
	////var sampler = this.cellEndFrameBuffer.sampler;
	var sampler = this.sortedKeysFramebuffer.sampler;
	
	this.shader.setUniform("textureSampler2", sampler);
	this.renderQuadNoFrame( this.shader );
}

raptorjs.oddEvenMergeSort.prototype.renderQuadNoFrame = function( shader ) {

	var uvbuffers = raptorjs.system.getDeferredBuffersByName('uv')[0];
	var indexbuffers = raptorjs.system.getDeferredBuffersByName('index')[0];
	var positionBuffers = raptorjs.system.getDeferredBuffersByName('position')[0];

	gl.viewport(0, 0, this.width, this.width);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.useProgram(shader.program);

	var buffer = positionBuffers;
	var attribute = shader.getAttributeByName('position');
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.vertexAttribPointer(attribute, buffer.itemSize, gl.FLOAT, false, 0, 0);

	var buffer = uvbuffers;
	var attribute = shader.getAttributeByName('uv');
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.vertexAttribPointer(attribute, buffer.itemSize, gl.FLOAT, false, 0, 0);
	
	shader.update();
	
	var buffer = indexbuffers;
	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, buffer );
	gl.drawElements( gl.TRIANGLES, buffer.numItems, gl.UNSIGNED_SHORT, 0 );
};

raptorjs.oddEvenMergeSort.prototype.checksort = function() {

    if (this.stepsToDo && this.stepsLeft) {

		this.pass--;
		
		if (this.pass<0) {
		    // next stage
		    this.stage++;
		    this.pass = this.stage;
		}
		
		this.sortstep();
		
		this.stepsToDo--;
		this.stepsLeft--;
    }
	
	if(this.stepsLeft == 0) {
		
		this.sortedKeys();
		this.getKeys();
		//this.copyOrderedKeys();
		
		//raptorjs.particleSandbox.renderVelocity();
		//raptorjs.particleSandbox.renderPosition();
			
		this.reset();
	}

}

raptorjs.oddEvenMergeSort.prototype.reset = function() {
	this.stepsLeft = this.totalSteps = ((this.logFieldsize+this.logFieldsize)*(this.logFieldsize+this.logFieldsize+1))/2;
	this.stage = this.pass = -1;
	
	this.stepsToDo = this.stepsLeft;
	
	this.testSampler = this.sourceFramebuffer.sampler;

	
	this.started = false;
}


/*
 *	Create error texture
 */
raptorjs.oddEvenMergeSort.prototype.sample = function() {
	var dataArray = [];
	
	var width = 256;
	var height = 256;
	
	for( var y = 0; y < height; y++ )
	{
		for( var x = 0; x < width; x++ )
		{
			var rand = Math.random();
			dataArray.push(rand);
			dataArray.push(rand);

			dataArray.push(rand);
			dataArray.push(rand); 
		}
	}
	
	var text = raptorjs.textureFromArray(dataArray, width, height, true);
	
	var sampler = raptorjs.createObject("sampler2D");
	sampler.texture = text;

	this.testSampler = sampler;
}


raptorjs.oddEvenMergeSort.prototype.sort = function( ) {


}


Math.logBase = (function() {
  var log = Math.log;
  return function(n, base) {
    return log(n)/(base ? log(base) : 1);
  };
})();
