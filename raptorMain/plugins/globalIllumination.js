raptorjs.globalIllumination = function() {
	this.initLPVShaders;
	
	this.LPVIndexBuffer;
	
	this.srtSize = 512.0;
	this.LPVscale = 32.0;
	
	this.worldToLPVNormTex;
	this.worldToLPVNormTexRender;
	this.viewToLPVMatrix;
	this.inverseViewToLPV;
	this.viewToLPVMatrixGV;
	this.objTranslation = raptorjs.matrix4.identity();
	
	this.initLPVFramebuffer;
	
	this.pingFrameBuffer;
	this.pongFrameBuffer;
	this.currentFrameBuffer;

	this.propagationVolumeShader;
	this.showPropagationVolumeShader;
	this.initLPVSampler;
	this.shadowMap = raptorjs.system.shadowMapT;
}

raptorjs.globalIllumination.prototype.init = function( ) {
	var camera = raptorjs.mainCamera;
	var matrix4 = raptorjs.matrix4;
	var system = raptorjs.system;
	var shadow = this.shadowMap;
	
	this.initLPVShaders = raptorjs.createObject("shader");
	this.initLPVShaders.createFomFile("shaders/GI/initializeLPV.shader");
	this.initLPVShaders.setUniform("shadowDepthNormalSampler", raptorjs.system.shadowSampler );
	this.initLPVShaders.setUniform("inverseProjection", ( matrix4.inverse( this.shadowMap.projection ) ) );
	this.initLPVShaders.setUniform("displacement", 1 );
	this.initLPVShaders.setUniform("shadowFar", shadow.far );
	this.initLPVShaders.setUniform("eye", shadow.eye );
	
	this.initLPVFramebuffer = system.createFrameBuffer(216, 216,  { });
	
	this.initLPVSampler = system.samplerFromFramebuffer(this.initLPVFramebuffer);
	this.initLPVSampler.MIN_FILTER = gl.NEAREST;
	this.initLPVSampler.MAG_FILTER = gl.NEAREST;
	this.initLPVSampler.WRAP_S = gl.CLAMP_TO_EDGE;
	this.initLPVSampler.WRAP_T = gl.CLAMP_TO_EDGE;
	
	this.createIndexbuffer();
}

raptorjs.globalIllumination.prototype.createPingPongBuffers = function() {
	this.pingFrameBuffer = raptorjs.system.createFrameBuffer(this.srtSize, this.srtSize,  { });
	this.pongFrameBuffer = raptorjs.system.createFrameBuffer(this.srtSize, this.srtSize,  { });
	
	this.pingFrameBuffer.name = "ping";
	this.pongFrameBuffer.name = "pong";
	
	this.pingFrameBuffer.sampler =  raptorjs.system.samplerFromFramebuffer(this.pingFrameBuffer);
	this.pongFrameBuffer.sampler =  raptorjs.system.samplerFromFramebuffer(this.pongFrameBuffer);
	
	this.pingFrameBuffer.sampler.MIN_FILTER = gl.NEAREST;
	this.pingFrameBuffer.sampler.MAG_FILTER = gl.NEAREST;
	this.pingFrameBuffer.sampler.WRAP_S = gl.CLAMP_TO_EDGE;
	this.pingFrameBuffer.sampler.WRAP_T = gl.CLAMP_TO_EDGE;
	
	this.pongFrameBuffer.sampler.MIN_FILTER = gl.NEAREST;
	this.pongFrameBuffer.sampler.MAG_FILTER = gl.NEAREST;
	this.pongFrameBuffer.sampler.WRAP_S = gl.CLAMP_TO_EDGE;
	this.pongFrameBuffer.sampler.WRAP_T = gl.CLAMP_TO_EDGE;
	
	this.currentFrameBuffer = this.pongFrameBuffer;
}

raptorjs.globalIllumination.prototype.switchPingPongBuffer = function() {
	var currentBuffer = this.currentFrameBuffer;
	
	if(currentBuffer && currentBuffer.name == "ping") {
		this.currentFrameBuffer = this.pongFrameBuffer;
	} else {
		this.currentFrameBuffer = this.pingFrameBuffer;
	}
}

raptorjs.globalIllumination.prototype.createIndexbuffer = function(  ) {
	var indexArray = [];

	var width = 216;
	
	for(var x = 0; x<width; x++) {
		for(var y = 0; y<width; y++) {
			indexArray.push(x / width);
			indexArray.push(y / width);
			indexArray.push(0);
		}
	}
	

	
	this.LPVIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.LPVIndexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( indexArray ), gl.STATIC_DRAW);
	this.LPVIndexBuffer.itemSize = 3;
	this.LPVIndexBuffer.numItems = indexArray.length / 3;
};


raptorjs.globalIllumination.prototype.update = function() {
	var camera = raptorjs.mainCamera;
	var shadow = this.shadowMap;
	var system = raptorjs.system;
	
	var worldCorners = system.getFrustumCorners( shadow.projection, shadow.view, true );
	
	var inverseView = raptorjs.matrix4.inverse( shadow.view );
	
	//this.initLPVShaders.setUniform("view", raptorjs.mainCamera.worldViewProjection );
	//this.initLPVShaders.setUniform("viewToLPV", raptorjs.matrix4.inverse(shadow.view) );
	
		this.initLPVShaders.setUniform("frustumWorldCorners", worldCorners );
		this.initLPVShaders.setUniform("cameraPosition", shadow.eye );
		this.initLPVShaders.setUniform("test", shadow.eye[2] );
		//this.initLPVShaders.setUniform("worldViewProjection", camera.worldViewProjection );
		
	
	var attribute = this.initLPVShaders.getAttributeByName('uv');
	
	gl.useProgram(this.initLPVShaders.program);
	//gl.bindFramebuffer( gl.FRAMEBUFFER, null );
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.initLPVFramebuffer);
	//gl.viewport(0, 0, raptorjs.width, raptorjs.height);
	gl.viewport(0, 0, this.initLPVFramebuffer.width, this.initLPVFramebuffer.height);
	// gl.clear(gl.COLOR_BUFFER_BIT);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.LPVIndexBuffer);
    gl.vertexAttribPointer(attribute, this.LPVIndexBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.POINTS, 0, this.LPVIndexBuffer.numItems);
	
	this.initLPVShaders.update();
/*

	for(var c = 0; c<1; c++) {
		if(c == 0) {
			this.propagationVolumeShader.setUniform("volumeTexture", this.initLPVSampler );
		} else {
			this.propagationVolumeShader.setUniform("volumeTexture", this.currentFrameBuffer.sampler );
		}
		
		this.switchPingPongBuffer();
		
		system.drawQuad( this.propagationVolumeShader, this.currentFrameBuffer );
		
		
	}


	this.showPropagationVolumeShader.setUniform("volumeTexture", this.initLPVSampler );
	raptorjs.system.uberShader.setUniform("globalIlluminationSampler",this.initLPVSampler );
	system.drawQuad( this.showPropagationVolumeShader, null );
	*/

}

