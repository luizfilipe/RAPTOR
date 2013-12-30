raptorjs.seaShore = function(){
	this.width = 256;
	this.surfaceMesh64;
	
	this.createSurface();
}

raptorjs.seaShore.prototype.createSurface = function(){

	this.lightPosition = [100, 1200, 100];
	this.lightView = raptorjs.matrix4.lookAt(this.lightPosition, [0,0,0], [0, 1, 0]);
	this.lightProjection = raptorjs.matrix4.perspective(raptorjs.math.degToRad(90), raptorjs.width / raptorjs.height, .1, 4000);
	this.ligthViewProjection = raptorjs.matrix4.mul(this.lightView, this.lightProjection);

	var texture = raptorjs.resources.getTexture("water_bump");
	var g_WaterBumpSampler =  raptorjs.createObject("sampler2D");
	g_WaterBumpSampler.texture = texture;
	g_WaterBumpSampler.useAlpha = true;
	
	var texture = raptorjs.resources.getTexture("water_bump_norm");
	var offsetSampler =  raptorjs.createObject("sampler2D");
	offsetSampler.texture = texture;
	offsetSampler.useAlpha = true;

	var texture = raptorjs.resources.getTexture("black");
	var depthSampler = raptorjs.createObject("sampler2D");
	depthSampler.texture = texture;
	
	var texture = raptorjs.resources.getTexture("sky");
	var reflectionSampler = raptorjs.createObject("sampler2D");
	reflectionSampler.texture = texture;

	var texture = raptorjs.resources.getTexture("white");
	var whiteSampler = raptorjs.createObject("sampler2D");
	whiteSampler.texture = texture;
	/*
	var reflectionFrameBuffer = raptorjs.system.reflectionFrameBuffer;
	var texture = raptorjs.createObject('texture');
	
	texture.data = reflectionFrameBuffer.texture;
	texture.dataType = 'framebuffer';
	texture.width = reflectionFrameBuffer.width;
	texture.height = reflectionFrameBuffer.height;
	
	var reflectionTexture = texture;

	var reflectionSampler = raptorjs.createObject("sampler2D");
	reflectionSampler.texture = reflectionTexture;
	*/
	

	
	
	//create shader
	var shader = raptorjs.createObject("shader");
	
	shader.createFomFile("shaders/seaShore.shader");
	shader.setUniform("g_DepthTexture",  depthSampler );
	shader.setUniform("g_DepthMapTexture",  depthSampler );
	shader.setUniform("waterNorm", offsetSampler );
	
	shader.setUniform("g_ReflectionTexture",  reflectionSampler);
	shader.setUniform("g_WaterBumpTexture", g_WaterBumpSampler );

	shader.setUniform("g_HeightFieldSize", 256 );
	shader.setUniform("g_WaterHeightBumpScale", 2 );
	shader.setUniform("g_WaterMicroBumpTexcoordScale", [1,1] );
	shader.setUniform("g_WaterBumpTexcoordScale", [1,1] );
	shader.setUniform('g_LightPosition', [0, 100, 0]);
	shader.setUniform('g_WaterColorIntensity', [0.1,0.2,0.1]);
	shader.setUniform('g_WaterSpecularPower', 10);
	shader.setUniform('g_ZFar', raptorjs.mainCamera.far);
	shader.setUniform('g_ZNear', raptorjs.mainCamera.near);
	shader.setUniform('g_WaterDeepColor', [0.1,0.4,0.7]);
	shader.setUniform('g_WaterSpecularIntensity', [50.0, 50.0, 50.0]);
	shader.setUniform('g_WaterScatterColor', [0.3,0.7,0.6]);
	shader.setUniform('g_WaterSpecularColor', [1,1,1]);
	shader.setUniform('g_ScreenSizeInv', [ 1.0 / raptorjs.width, 1.0 / raptorjs.height]);
	shader.setUniform('g_FogDensity', 1.0 / 200.0);
	shader.setUniform('g_AtmosphereDarkColor', [0.6,0.6,0.7] );
	shader.setUniform('g_AtmosphereBrightColor', [1.0,1.1,1.4] );
	shader.setUniform("size", 256.0 );

	this.surfaceShader = shader;
	
	for(var c = 0; c<shader.uniforms.length; c++) {
		//console.log(shader.uniforms[c].name, shader.uniforms[c].value);
	}

	//create buffers
	//if(gl.getExtension('OES_element_index_uint'))
	//	this.surfaceMesh64 = raptorjs.primitives.createPlane(100, 100, 512, 512, "triangleStrip", 'int');
	//else
		this.surfaceMesh64 = raptorjs.primitives.createPlane(50, 50, 256, 256, "triangleStrip");
		
}

var ggggggg = 0;

raptorjs.seaShore.prototype.render = function() {
	var shader = this.surfaceShader;
	var camera = raptorjs.mainCamera;
	var shaderProgram = shader.program;
	
	if(raptorjs.system.antiAlias) {
		gl.bindFramebuffer(gl.FRAMEBUFFER, raptorjs.system.fxaaFrameBuffer);
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}
	
	gl.useProgram(shaderProgram);
	
	
	ggggggg += raptorjs.elapsed;
	
	var  waterTexcoordShift = [ggggggg*.4  ,ggggggg*.4];

	shader.setUniform("g_CameraPosition", raptorjs.mainCamera.eye );
	shader.setUniform("g_WaterBumpTexcoordShift", waterTexcoordShift );
	
	shader.setUniform('g_ModelViewProjectionMatrix', raptorjs.mainCamera.worldViewProjection);
	shader.setUniform('g_ModelViewMatrix', raptorjs.mainCamera.view);
	
	shader.setUniform('g_LightModelViewProjectionMatrix', this.ligthViewProjection);
	shader.setUniform('g_LightPosition', this.lightPosition);
	
	var primitive = this.surfaceMesh64;

	shader.update();
	
	var attribute = shader.getAttributeByName('uv');
	gl.bindBuffer(gl.ARRAY_BUFFER, primitive.uvBuffer);
	gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);


	
	var buffer =  primitive.indexBuffer;
	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, buffer);
	gl.drawElements( gl.TRIANGLE_STRIP, primitive.indexBuffer.numItems, raptorjs.system.indexType, 0 );

	
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.flush();
}