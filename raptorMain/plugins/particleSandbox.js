raptorjs.particleSandbox = function( ){
	this.particleMesh = {};
	
	this.pingPositionFrameBuffer;
	this.pongPositionFrameBuffer;
	this.pingVelocityFrameBuffer;
	this.pongVelocityFrameBuffer;
	
	this.currentPositionFrameBuffer;
	this.currentVelociyFrameBuffer;
	
	this.gridPositionFramebuffer;
	
	this.pingPongPosition = 0;
	
	this.velocityFrameBuffer;
	
	this.positionShader;
	this.velocityShader;

	this.sphereShader;
	
	this.mode = 1;
	this.hasIntegerIndex = gl.getExtension('OES_element_index_uint');
	
	this.width = 100;
	
	this.quadProjection;
	this.quadView;
	this.quadViewProjection;
	
	this.sorter;
	
	
};

raptorjs.particleSandbox.prototype.create = function( ) {
	this.createSurface();

	this.quadView = raptorjs.matrix4.lookAt([0, 0, 0], [0, -1, 0], [0, 0, -1]);
	this.quadProjection = raptorjs.matrix4.orthographic(-1, 1, -1, 1, -1, 1);
	this.quadViewProjection = raptorjs.matrix4.mul(this.quadView, this.quadProjection);
	
	this.positionShader.setUniform("worldViewProjection", this.quadViewProjection );
	this.velocityShader.setUniform("worldViewProjection", this.quadViewProjection );
	this.gridPositionShader.setUniform("worldViewProjection", this.quadViewProjection );
};

raptorjs.particleSandbox.prototype.createPositionBuffer = function( size ) {
	this.pingPositionFrameBuffer = raptorjs.system.createFrameBuffer(size, size, gl.FLOAT);
	this.pongPositionFrameBuffer = raptorjs.system.createFrameBuffer(size, size, gl.FLOAT);
	this.pingVelocityFrameBuffer = raptorjs.system.createFrameBuffer(size, size, gl.FLOAT);
	this.pongVelocityFrameBuffer = raptorjs.system.createFrameBuffer(size, size, gl.FLOAT);
	
	this.pingPositionFrameBuffer.name = "ping";
	this.pongPositionFrameBuffer.name = "pong";
	
	this.pingVelocityFrameBuffer.name = "ping";
	this.pongVelocityFrameBuffer.name = "pong";
	
	var pingPositionTexture = raptorjs.createObject('texture');
	pingPositionTexture.dataType = 'framebuffer';
	pingPositionTexture.data = this.pingPositionFrameBuffer.texture;
	pingPositionTexture.width = size;
	pingPositionTexture.height = size;
	
	var pongPositionTexture = raptorjs.createObject('texture');
	pongPositionTexture.dataType = 'framebuffer';
	pongPositionTexture.data = this.pongPositionFrameBuffer.texture;
	pongPositionTexture.width = size;
	pongPositionTexture.height = size;
	
	
	var pingVelocityTexture = raptorjs.createObject('texture');
	pingVelocityTexture.dataType = 'framebuffer';
	pingVelocityTexture.data = this.pingVelocityFrameBuffer.texture;
	pingVelocityTexture.width = size;
	pingVelocityTexture.height = size;
	
	var pongVelocityTexture = raptorjs.createObject('texture');
	pongVelocityTexture.dataType = 'framebuffer';
	pongVelocityTexture.data = this.pongVelocityFrameBuffer.texture;
	pongVelocityTexture.width = size;
	pongVelocityTexture.height = size;

	
	var pingPositionSampler = raptorjs.createObject("sampler2D");
	pingPositionSampler.texture = pingPositionTexture;
	
	var pongPositionSampler = raptorjs.createObject("sampler2D");
	pongPositionSampler.texture = pongPositionTexture;
	
	var pingVelocitySampler = raptorjs.createObject("sampler2D");
	pingVelocitySampler.texture = pingVelocityTexture;
	
	var pongVelocitySampler = raptorjs.createObject("sampler2D");
	pongVelocitySampler.texture = pongVelocityTexture;

	
	this.pingPositionFrameBuffer.sampler = pingPositionSampler;
	this.pongPositionFrameBuffer.sampler = pongPositionSampler;
	
	this.pingVelocityFrameBuffer.sampler = pingVelocitySampler;
	this.pongVelocityFrameBuffer.sampler = pongVelocitySampler;

	this.currentPositionFrameBuffer = this.pongPositionFrameBuffer;
	this.currentVelociyFrameBuffer = this.pongVelocityFrameBuffer;

	this.gridPositionFramebuffer = raptorjs.system.createFrameBuffer(size, size, gl.FLOAT);
	
	var gridPositionTexture = raptorjs.createObject('texture');
	gridPositionTexture.dataType = 'framebuffer';
	gridPositionTexture.data = this.gridPositionFramebuffer.texture;
	gridPositionTexture.width = size;
	gridPositionTexture.height = size;
	
	var GridPositionSampler = raptorjs.createObject("sampler2D");
	GridPositionSampler.texture = gridPositionTexture;
	
	this.gridPositionFramebuffer.sampler = GridPositionSampler;
};

raptorjs.particleSandbox.prototype.switchPositionPingPongBuffer = function() {
	var currentBuffer = this.currentPositionFrameBuffer;
	if(currentBuffer && currentBuffer.name == "ping") {
		this.currentPositionFrameBuffer = this.pongPositionFrameBuffer;
	} else {
		this.currentPositionFrameBuffer = this.pingPositionFrameBuffer;
	}
}

raptorjs.particleSandbox.prototype.switchVelocityPingPongBuffer = function() {
	var currentBuffer = this.currentVelociyFrameBuffer;
	if(currentBuffer && currentBuffer.name == "ping") {
		this.currentVelociyFrameBuffer = this.pongVelocityFrameBuffer;
	} else {
		this.currentVelociyFrameBuffer = this.pingVelocityFrameBuffer;
	}
}

raptorjs.particleSandbox.prototype.renderVelocity = function(  ) {

	var positionSampler = this.currentPositionFrameBuffer.sampler;
	var velocitySampler = this.currentVelociyFrameBuffer.sampler;
	
	var shader = this.velocityShader;
	
	shader.setUniform("mode", this.mode );
	shader.setUniform("positionSampler", positionSampler );
	shader.setUniform("velocitySampler", velocitySampler );

	shader.setUniform("cellStart", this.sorter.cellStartFrameBuffer.sampler );
	shader.setUniform("cellEnd", this.sorter.cellEndFrameBuffer.sampler );
	shader.setUniform("sortedKeys", this.sorter.sortedKeysFramebuffer.sampler );
	
	this.switchVelocityPingPongBuffer();
	
	var camera = raptorjs.mainCamera;
	var framebuffer = this.currentVelociyFrameBuffer;
	
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

raptorjs.particleSandbox.prototype.renderPosition = function(  ) {

	//first get sampler of last position draw
	var shader = this.positionShader;
	var positionSampler = this.currentPositionFrameBuffer.sampler;
	var velocitySampler = this.currentVelociyFrameBuffer.sampler;
	
	shader.setUniform("velocitySampler", velocitySampler );
	shader.setUniform("positionSampler", positionSampler );
	shader.setUniform("mode", this.mode );
	
	this.switchPositionPingPongBuffer();
	
	var camera = raptorjs.mainCamera;
	var framebuffer = this.currentPositionFrameBuffer;
	
	var uvbuffers = raptorjs.system.getDeferredBuffersByName('uv')[0];
	var indexbuffers = raptorjs.system.getDeferredBuffersByName('index')[0];
	var positionBuffers = raptorjs.system.getDeferredBuffersByName('position')[0];
	
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
	gl.viewport(0, 0, this.width, this.width);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.useProgram(shader.program);
	
	shader.update();

	var buffer = positionBuffers;
	var attribute = shader.getAttributeByName('position');
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.vertexAttribPointer(attribute, buffer.itemSize, gl.FLOAT, false, 0, 0);

	var buffer = uvbuffers;
	var attribute = shader.getAttributeByName('uv');
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.vertexAttribPointer(attribute, buffer.itemSize, gl.FLOAT, false, 0, 0);

	
	var buffer = indexbuffers;
	
	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, buffer );
	gl.drawElements( gl.TRIANGLES, buffer.numItems, gl.UNSIGNED_SHORT, 0 );
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};


raptorjs.particleSandbox.prototype.renderGridPosition = function(  ) {


	
		

};

raptorjs.particleSandbox.prototype.createSurface = function( ) {

	this.createPositionBuffer( this.width );

	this.shader = raptorjs.createObject("shader");
	this.shader.createFomFile("shaders/particle sandbox/pointSpriteSphere.shader");
	this.createParticleBuffer( this.width * this.width );
	
	this.positionShader = raptorjs.createObject("shader");
	this.positionShader.createFomFile("shaders/particle sandbox/position.shader");
	this.positionShader.setUniform("numCells", Math.ceil( Math.pow( (this.width * this.width) ,0.33333333) ) );
	this.positionShader.setUniform("width", this.width );
	
	console.log(Math.ceil( Math.pow((this.width * this.width),0.33333333) ), this.width * this.width, this.width );
	
	this.velocityShader = raptorjs.createObject("shader");
	this.velocityShader.createFomFile("shaders/particle sandbox/velocity.shader");
	this.velocityShader.setUniform("numCells", Math.ceil( Math.pow( (this.width * this.width) ,0.33333333) ) );
	this.velocityShader.setUniform("width", this.width );
	
	this.gridPositionShader = raptorjs.createObject("shader");
	this.gridPositionShader.createFomFile("shaders/particle sandbox/calculateGridPosition.shader");
	this.gridPositionShader.setUniform("width", this.width );
	this.gridPositionShader.setUniform("numCells", Math.ceil( Math.pow( (this.width * this.width) ,0.33333333) ) );

	this.sphereShader = raptorjs.createObject("shader");
	this.sphereShader.createFomFile("shaders/particle sandbox/sphere.shader");

	//this.createSphereBuffer(this.width * this.width); // 32 * 32 * 32 // 32768 128 * 128
	
	//this.sorter = raptorjs.createObject("oddEvenMergeSort");
	//this.sorter.sourceFramebuffer = this.gridPositionFramebuffer;
	
	//this.sorter.createRasterizer();
	//this.sorter.reset();
};

raptorjs.particleSandbox.prototype.samplerFromFramebuffer = function( framebuffer ) {
	var texture = raptorjs.createObject('texture');
	texture.data = framebuffer.texture;
	texture.dataType = 'framebuffer';
	texture.width = framebuffer.width;
	texture.height = framebuffer.height;
	
	var sampler = raptorjs.createObject("sampler2D");
	sampler.texture = texture;
	return sampler;
};

raptorjs.particleSandbox.prototype.createParticleBuffer = function( size ) {
	var indexArray = [];

	for(var c = 0; c < size; c++) {
		indexArray[c] = c;
	}

	var mesh = {};
	mesh.indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, mesh.indexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( indexArray ), gl.STATIC_DRAW);
	mesh.indexBuffer.itemSize = 1;
	mesh.indexBuffer.numItems = size;
	
	console.log(mesh.indexBuffer);

	this.particleMesh = mesh;
};

raptorjs.particleSandbox.prototype.createSphereBuffer = function( numberOfSpheres ) {
	var sphereIndexArray = [];
	var sphere = raptorjs.primitives.createSphere (1, 6, 6) 

	var vertices = [];
	var indices = [];
	var normals = [];
	
	var sphereVertices = sphere.vertices;
	var sphereIndices = sphere.indices;
	var sphereNormals = sphere.normals;
	
	var sphereInstanceIndex = [];

	console.log('creating ', numberOfSpheres, 'paritcles');
	
	var indexPointer = 0;
	for(var c = 0; c<numberOfSpheres; c++) {
		for(var b = 0; b<sphereVertices.length / 3; b++) {
			var id = b*3;
		
			var verta = sphereVertices[id];
			var vertb = sphereVertices[id+1];
			var vertc = sphereVertices[id+2];
			
			vertices.push(verta, vertb, vertc);
			
			var normA = sphereNormals[id];
			var normB = sphereNormals[id+1];
			var normC = sphereNormals[id+2];
			
			normals.push(normA, normB, normC, c);
		}
		
		for(var b = 0; b<sphereIndices.length; b++) {
			var index = sphereIndices[b];
			indices.push(index + indexPointer);
		}

		indexPointer = (sphereVertices.length / 3) + indexPointer;
	}	
	
	vertices =  new Float32Array( vertices );
	normals = new Float32Array( normals );
	
	if(this.hasIntegerIndex)
		indices = new Uint32Array( indices  );
	else
		indices = new Uint16Array( indices  );

	
	sphereInstanceIndex = new Float32Array( sphereInstanceIndex );
	
	var mesh = {};
	
	mesh.vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
	mesh.vertexBuffer.itemSize = 3;
	mesh.vertexBuffer.numItems = vertices.length / 3;
	
	mesh.normalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
	mesh.normalBuffer.itemSize = 4;
	mesh.normalBuffer.numItems = normals.length / 4;
	
	mesh.indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
	mesh.indexBuffer.itemSize = 1;
	mesh.indexBuffer.numItems = indices.length;
	
	
	mesh.sphereIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.sphereIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphereInstanceIndex, gl.STATIC_DRAW);
	mesh.sphereIndexBuffer.itemSize = 1;
	mesh.sphereIndexBuffer.numItems = vertices.length / 3;
	
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
	gl.depthFunc(gl.NEVER); 

	console.log(vertices.length / 3, 'triangles');
	
	this.particleMesh = mesh;
};

raptorjs.particleSandbox.prototype.updateSphere = function( ) {
	var currentSampler = this.currentPositionFrameBuffer.sampler;
	
	this.renderVelocity();
	this.renderPosition();

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
 
	var entity = this.particleMesh;
	var shader = this.sphereShader;
	var shaderProgram = shader.program;
	
	gl.useProgram(shaderProgram);

	shader.setUniform("worldViewProjection", raptorjs.mainCamera.worldViewProjection );
	shader.setUniform("positionSampler", currentSampler );
	shader.update();

	var attribute = shader.getAttributeByName('normal');
	gl.bindBuffer(gl.ARRAY_BUFFER, entity.normalBuffer);
	gl.vertexAttribPointer(attribute, entity.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	var attribute = shader.getAttributeByName('position');
	gl.bindBuffer(gl.ARRAY_BUFFER, entity.vertexBuffer);
	gl.vertexAttribPointer(attribute, entity.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, entity.indexBuffer );
	
	if(this.hasIntegerIndex)
		gl.drawElements( gl.TRIANGLES, entity.indexBuffer.numItems, gl.UNSIGNED_INT, 0 ); 
	else
		gl.drawElements( gl.TRIANGLES, entity.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0 ); 	
};


raptorjs.particleSandbox.prototype.update = function( ) {

	/*

	var positionSampler = this.currentPositionFrameBuffer.sampler;
	var shader = this.gridPositionShader;
	var camera = raptorjs.mainCamera;
	var framebuffer = this.gridPositionFramebuffer;

	shader.setUniform("positionSampler", positionSampler );
	shader.update();
	
	raptorjs.system.drawQuad( shader, framebuffer );
	
	this.switchPositionPingPongBuffer();
	
	var positionSampler = this.currentPositionFrameBuffer.sampler;
	
	for(var c = 0; c<this.sorter.totalSteps/8; c++) {
		this.sorter.checksort();
	}

	this.renderVelocity();
	this.renderPosition();
	
	*/
	var shader = this.shader;
	var camera = raptorjs.mainCamera;
	var shaderProgram = shader.program;
	
	gl.useProgram(shaderProgram);
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	shader.setUniform("eye", camera.eye );
	shader.setUniform("worldViewProjection", camera.worldViewProjection );
	//shader.setUniform("positionSampler", positionSampler );
	shader.setUniform("pointScale", raptorjs.height / Math.tan( camera.fov * 0.5 * Math.PI / 180.0) );	
	
	shader.update();
	
	
	var buffer = this.particleMesh.indexBuffer;
	var attribute = shader.getAttributeByName('index');

	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);	
	
	console.log(attribute);
	gl.vertexAttribPointer(attribute, buffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.drawArrays( gl.POINTS, 0, buffer.numItems );
	
	


gl.flush();
	//this.sorter.test();
	
	
}