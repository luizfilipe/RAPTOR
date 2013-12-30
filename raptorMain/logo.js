/*
-----------------------------------------------------------------------------
This source file is part of Raptor Engine
For the latest info, see http://www.raptorEngine.com

Copyright (c) 2012-2013 Raptorcode

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
-----------------------------------------------------------------------------
*/
  
/**
 * Author: Kaj Dijksta
 */
raptorjs.logo = function() {
	this.shader;
	this.sphereMesh;
	this.mesh;
	this.create();
	
	this.quadView = raptorjs.matrix4.lookAt([0, 1, 0], [0, 0, 0], [0, 0, -1]);
	this.quadProjection = raptorjs.matrix4.perspective(raptorjs.math.degToRad(raptorjs.mainCamera.fov), raptorjs.width / raptorjs.height, .1, 10);
	this.viewProjection = raptorjs.matrix4.mul(this.quadView, this.quadProjection);
	
	this.loadingBar = raptorjs.primitives.createPlane(.4, .05, 1, 1);
	this.progresBarShader  = raptorjs.createObject("shader");
	this.progresBarShader.createFomFile("shaders/progresBar.shader");
	
	this.backgroundTexture = raptorjs.resources.getTexture("loadingBackground");
	this.backgroundSampler =  raptorjs.createObject("sampler2D");
	this.backgroundSampler.texture = this.backgroundTexture;
	this.backgroundSampler.MIN_FILTER = gl.NEAREST;
	this.backgroundSampler.MAG_FILTER = gl.NEAREST;
	this.backgroundSampler.WRAP_S = gl.CLAMP_TO_EDGE;
	this.backgroundSampler.WRAP_T = gl.CLAMP_TO_EDGE;
	
	this.background = raptorjs.primitives.createPlane(.4, .05, 1, 1);

	this.textureShader  = raptorjs.createObject("shader");
	this.textureShader.createFomFile("shaders/texture.shader");
	this.textureShader.setUniform("text", this.backgroundSampler );
	this.textureShader.setUniform("worldViewProjection", raptorjs.system.quadViewProjection  );
	
	this.progressBarWorld = raptorjs.matrix4.identity();
	this.progressBarWorld = raptorjs.matrix4.translate(this.progressBarWorld, [0, 0, .4]);
	
	
	this.world = raptorjs.matrix4.identity();
	
	this.degrees = 0;
}


/**
 * Create Object
 */
raptorjs.logo.prototype.create = function() {
	var sphereMesh = raptorjs.primitives.createCube(.08);
	
	this.mesh = sphereMesh;
	
	this.shader = raptorjs.createObject("shader");
	this.shader.createFomFile("shaders/color.shader");
}

/**
 * update Object
 */
raptorjs.logo.prototype.update = function(){
	var mesh = this.mesh;
	var shader = this.shader;
	
	gl.viewport(0, 0, raptorjs.width, raptorjs.height);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	raptorjs.system.drawQuad( this.textureShader, null );
	
	gl.useProgram(shader.program);

	this.world = raptorjs.matrix4.rotateX( raptorjs.matrix4.identity(), -raptorjs.timeNow/1200 );
	this.world = raptorjs.matrix4.rotateY( this.world, -raptorjs.timeNow/1200 );

	shader.setUniform("worldViewProjection", this.viewProjection);
	shader.setUniform("world", this.world );
	shader.update();

	var attribute = shader.getAttributeByName('position');
	gl.bindBuffer( gl.ARRAY_BUFFER, mesh.vertexBuffer );
	gl.vertexAttribPointer( attribute, 3, gl.FLOAT, false, 0, 0 );

	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer );
	gl.drawElements( gl.LINES, mesh.indexBuffer.numItems, raptorjs.system.indexType, 0 );
	

	this.progresBarShader.setUniform("deltaTime", raptorjs.timeNow/1000 );
	this.progresBarShader.setUniform("worldViewProjection", this.viewProjection);
	this.progresBarShader.setUniform("world", this.progressBarWorld );
	
	this.progresBarShader.update();
	
	var attribute = this.progresBarShader.getAttributeByName('uv');
	gl.bindBuffer( gl.ARRAY_BUFFER, this.loadingBar.uvBuffer );
	gl.vertexAttribPointer( attribute, 2, gl.FLOAT, false, 0, 0 );
	
	var attribute = this.progresBarShader.getAttributeByName('position');
	gl.bindBuffer( gl.ARRAY_BUFFER, this.loadingBar.vertexBuffer );
	gl.vertexAttribPointer( attribute, 3, gl.FLOAT, false, 0, 0 );

	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.loadingBar.indexBuffer  );
	
	/*
	gl.drawElements( gl.TRIANGLES, this.loadingBar.indexBuffer .numItems, raptorjs.system.indexType, 0 );
	*/
}
