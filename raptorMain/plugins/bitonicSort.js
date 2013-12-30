raptorjs.bitonicSorter = function( ){
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
	
	this.rasterizerMesh; // width * width vertices
};

raptorjs.bitonicSorter.prototype.createShaders = function( ){
	var system = raptorjs.system;
	var size = this.width;
	
	this.oddevenMergeShader = raptorjs.createObject("shader");
	this.oddevenMergeShader.createFomFile("shaders/particle sandbox/bitonicMergeSort/merge.shader");
	this.oddevenMergeShader.setUniform("worldViewProjection", system.quadViewProjection );
	
	
	this.cellStartIndex = raptorjs.createObject("shader");
	this.cellStartIndex.createFomFile("shaders/particle sandbox/cellStartIndex.shader");
	this.cellStartIndex.setUniform("worldViewProjection", system.quadViewProjection );
	
	
	this.shader = raptorjs.createObject("shader");
	this.shader.createFomFile("shaders/textureNorm.shader");
	this.shader.setUniform("worldViewProjection", system.quadViewProjection );
	
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
}


raptorjs.bitonicSorter.prototype.createRasterizer = function(  ) {
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

raptorjs.bitonicSorter.prototype.rasterize = function( ) {

	var shader = this.cellStartIndex;
	var camera = raptorjs.mainCamera;
	var shaderProgram = shader.program;
	
	gl.useProgram(shaderProgram);
	gl.viewport(0, 0, this.width, this.width);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	shader.setUniform("sortedKeysArray", this.currentFrameBuffer.sampler);
	
	var buffer = this.rasterizerMesh.indexBuffer;
	var attribute = shader.getAttributeByName('uv');
	
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);	
	gl.vertexAttribPointer(attribute, buffer.itemSize, gl.FLOAT, false, 0, 0);
	
	gl.drawArrays( gl.POINTS, 0, buffer.numItems );
	
	shader.update();
}

raptorjs.bitonicSorter.prototype.switchPingPongBuffer = function() {
	var currentBuffer = this.currentFrameBuffer;
	
	if(currentBuffer && currentBuffer.name == "ping") {
		//console.log('ping');
		this.currentFrameBuffer = this.pongFrameBuffer;
	} else {
		//console.log('pong');
		this.currentFrameBuffer = this.pingFrameBuffer;
	}
}

raptorjs.bitonicSorter.prototype.sortstep = function() {
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

raptorjs.bitonicSorter.prototype.renderQuad = function( shader ) {
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

raptorjs.bitonicSorter.prototype.test = function(  ) {
	var sampler = this.currentFrameBuffer.sampler;

	this.shader.setUniform("textureSampler", sampler);
	this.renderQuadNoFrame( this.shader );
}

raptorjs.bitonicSorter.prototype.renderQuadNoFrame = function( shader ) {

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

raptorjs.bitonicSorter.prototype.checksort = function() {

    // Check if we have to do one sorting step in user interactive mode
    // and perform it if so.
    var odd = true;
	
	//console.log( this.stepsToDo, this.stepsLeft );
		
    if (this.stepsToDo && this.stepsLeft) {

		this.pass--;
		
		if (this.pass<0) {
		    // next stage
		    this.stage++;
		    this.pass=this.stage;
		}
		
		this.sortstep(odd);
		
		this.stepsToDo--;
		this.stepsLeft--;
    }
	if(this.stepsLeft == 0) {
		
		this.sorter.rasterize();
		
		this.reset();
	}
	
}

raptorjs.bitonicSorter.prototype.reset = function() {
	this.stepsLeft = this.totalSteps = ((this.logFieldsize+this.logFieldsize)*(this.logFieldsize+this.logFieldsize+1))/2;
	this.stage = this.pass = -1;
	
	this.stepsToDo = this.stepsLeft;
	
	this.testSampler = this.sourceFramebuffer.sampler;
	this.started = false;
	//this.sample();
}

/*
 *	Create error texture
 */
raptorjs.bitonicSorter.prototype.sample = function() {
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


raptorjs.bitonicSorter.prototype.sort = function( ){


}


Math.logBase = (function() {
  var log = Math.log;
  return function(n, base) {
    return log(n)/(base ? log(base) : 1);
  };
})();
