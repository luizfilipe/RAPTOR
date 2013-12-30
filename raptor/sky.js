raptorjs.sky = function(){
	this.shader;
	this.mesh;
	
	this.create();
}


raptorjs.sky.prototype.create = function() {
	
	var backgroundTexture = raptorjs.resources.getTexture("sky");
	var backgroundSampler =  raptorjs.createObject("sampler2D");
	backgroundSampler.texture = backgroundTexture;
	backgroundSampler.MIN_FILTER = gl.NEAREST;
	backgroundSampler.MAG_FILTER = gl.NEAREST;
	backgroundSampler.WRAP_S = gl.CLAMP_TO_EDGE;
	backgroundSampler.WRAP_T = gl.CLAMP_TO_EDGE;
	
	
	var sunTexture = raptorjs.resources.getTexture("sun");
	var sunSampler =  raptorjs.createObject("sampler2D");
	sunSampler.texture = sunTexture;
	
	var positiveX = raptorjs.resources.getTexture("posx"); 
	var positiveY = raptorjs.resources.getTexture("posy"); 
	var positiveZ = raptorjs.resources.getTexture("posz"); 
	
	var negativeX = raptorjs.resources.getTexture("negx"); 
	var negativeY = raptorjs.resources.getTexture("negy"); 
	var negativeZ = raptorjs.resources.getTexture("negz"); 
	
	var sampler = raptorjs.createObject("sampler3D");
	sampler.addFace(positiveX, gl.TEXTURE_CUBE_MAP_POSITIVE_X);
	sampler.addFace(negativeX, gl.TEXTURE_CUBE_MAP_NEGATIVE_X);
	sampler.addFace(positiveY, gl.TEXTURE_CUBE_MAP_POSITIVE_Y);
	sampler.addFace(negativeY, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y);
	sampler.addFace(positiveZ, gl.TEXTURE_CUBE_MAP_POSITIVE_Z);
	sampler.addFace(negativeZ, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z);

	
	this.mesh = raptorjs.primitives.createSphere(40000, 10, 10);
	this.sunMesh = raptorjs.primitives.createPlane(1000, 1000, 1, 1) ;
	
	
	this.shader  = raptorjs.createObject("shader");
	this.shader.createFomFile("shaders/s.shader");
	this.shader.setUniform("texture", sampler );
	
	this.sunShader  = raptorjs.createObject("shader");
	this.sunShader.createFomFile("shaders/texture.shader");
	
	
		var envProbe = raptorjs.createObject("environmentProbe");
	envProbe.generateCubemap();
	
	console.log(envProbe);
	
	
	this.sunShader.setUniform("texture", sunSampler);
	
	
}

raptorjs.sky.prototype.update = function() {
	
	gl.disable(gl.CULL_FACE);
	
	var shader = this.shader;
	var mesh = this.mesh;
	
	gl.viewport(0, 0, raptorjs.width, raptorjs.height);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.useProgram(shader.program);
	
	var e = raptorjs.mainCamera.eye;
	
	this.shader.setUniform("worldViewProjection", raptorjs.mainCamera.worldViewProjection  );
	this.shader.setUniform("eye", [e[0], e[1], e[2], 1.0]);
	
	shader.update();
	
	//var attribute = shader.getAttributeByName('uv');
	//gl.bindBuffer(gl.ARRAY_BUFFER, mesh.uvBuffer);
	//gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
					
	var attribute = shader.getAttributeByName('normal');
	gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
	gl.vertexAttribPointer(attribute, 3, gl.FLOAT, false, 0, 0);
					
	var attribute = shader.getAttributeByName('position');
	gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
	gl.vertexAttribPointer(attribute, 3, gl.FLOAT, false, 0, 0);

	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
	gl.drawElements( gl.TRIANGLES, mesh.indexBuffer.numItems, raptorjs.system.indexType, 0 );  


	var shader = this.sunShader;

	gl.useProgram(shader.program);

	var envProbe = raptorjs.createObject("environmentProbe");
	envProbe.generateCubemap();
	
this.sunShader.setUniform("worldViewProjection", envProbe.viewProjection );
	
	
	//shader.setUniform("projection", raptorjs.mainCamera.projection );
	//shader.setUniform("worldView", raptorjs.mainCamera.view );
//shader.setUniform("worldView", raptorjs.mainCamera.view );
/*

	shader.update();

	var mesh = this.sunMesh;

	var attribute = shader.getAttributeByName('uv');
	gl.bindBuffer(gl.ARRAY_BUFFER, mesh.uvBuffer);
	gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);

	var attribute = shader.getAttributeByName('position');
	gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
	gl.vertexAttribPointer(attribute, 3, gl.FLOAT, false, 0, 0);

	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
	gl.drawElements( gl.TRIANGLES, mesh.indexBuffer.numItems, raptorjs.system.indexType, 0 );
*/
}