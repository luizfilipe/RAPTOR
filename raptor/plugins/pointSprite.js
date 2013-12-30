raptorjs.pointSprite = function() {

	this.particleShader;
	
}

raptorjs.pointSprite.prototype.fromArray = function( array  ) {
	this.particleShader = raptorjs.createObject("shader");
	this.particleShader.createFomFile("shaders/pointSprite.shader");
	this.particleShader.setUniform("worldViewProjection", raptorjs.mainCamera.worldViewProjection );
	this.particleShader.setUniform("pointScale", 3 );
	
	var positionArray = [];

	for(var c = 0; c< array.length; c++) {
		var currentParticle = array[c];
		var index = c * 4;
		positionArray[index] = currentParticle[0];
		positionArray[index+1] = currentParticle[1];
		positionArray[index+2] = currentParticle[2];
		positionArray[index+3] = 1;
	}

	this.positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( positionArray ), gl.STATIC_DRAW);
	this.positionBuffer.itemSize = 4;
	this.positionBuffer.numItems = positionArray.length / 4;
	this.positionBuffer.data = positionArray;
	
	console.log();
};

raptorjs.pointSprite.prototype.update = function(   ) {
	var attribute = this.particleShader.getAttributeByName('position');
		var camera = raptorjs.mainCamera;
	
	this.particleShader.setUniform("worldView", camera.worldViewProjection );
	this.particleShader.setUniform("eye", camera.eye );
	this.particleShader.update();
	
	
	gl.useProgram(this.particleShader.program);
	//gl.bindFramebuffer( gl.FRAMEBUFFER, null );
	gl.viewport(0, 0, raptorjs.width, raptorjs.height);
	//gl.clear(gl.COLOR_BUFFER_BIT);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.vertexAttribPointer(attribute, this.positionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.POINTS, 0, this.positionBuffer.numItems);
	

	

	
}