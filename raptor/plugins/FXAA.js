raptorjs.fxaa = function () {
	//Framebuffers
	this.edgesFramebuffer = raptorjs.system.createFrameBuffer( raptorjs.width, raptorjs.width );
	
	this.edgesSampler = raptorjs.system.samplerFromFramebuffer(this.edgesFramebuffer);

	this.edgesSampler.MIN_FILTER = gl.NEAREST;
	this.edgesSampler.MAG_FILTER = gl.NEAREST;
	this.edgesSampler.WRAP_S = gl.CLAMP_TO_EDGE;
	this.edgesSampler.WRAP_T = gl.CLAMP_TO_EDGE;
	
	// Shaders
	this.fxaaShader = raptorjs.createObject("shader");
	this.fxaaShader.createFomFile("shaders/fxaa.shader");
	this.fxaaShader.setUniform("viewProjection", raptorjs.system.quadViewProjection );
	this.fxaaShader.setUniform("edgeTreshold", .1 );
	this.fxaaShader.setUniform("edgeTresholdMin", .1 );
	this.fxaaShader.setUniform("subpixQuality",  0.25 );
	this.fxaaShader.setUniform("screenSizeInv", [1/raptorjs.width, 1/raptorjs.width] );
	
}

raptorjs.fxaa.prototype.setColorSampler = function( sampler ) {
	this.fxaaShader.setUniform("test", sampler );
}

raptorjs.fxaa.prototype.update = function() {
	raptorjs.system.drawQuad( this.fxaaShader, null );//edgesFramebuffer
}