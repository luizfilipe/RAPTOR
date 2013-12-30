raptorjs.hdr = function () {
	this.luminanceFramebuffer = raptorjs.system.createFrameBuffer( 1024, 1024, { } );
	
	this.downSampledLuminanceFrambuffer = raptorjs.system.createFrameBuffer( 2, 2, { filter : gl.LINEAR} );
	this.adaptedLuminanceFramebuffer = raptorjs.system.createFrameBuffer( 2, 2, { filter : gl.LINEAR} );
	this.prevAdaptedLuminanceFramebuffer = raptorjs.system.createFrameBuffer( 2, 2, { filter : gl.LINEAR} );
	this.brightFilterFramebuffer = raptorjs.system.createFrameBuffer( 512, 512, { filter : gl.LINEAR} );
	this.convolutionXFramebuffer = raptorjs.system.createFrameBuffer( 256, 256, {} );
	this.convolutionYFramebuffer = raptorjs.system.createFrameBuffer( 256, 256, {} );

	this.downSampledLuminanceSampler = raptorjs.system.samplerFromFramebuffer(this.downSampledLuminanceFrambuffer);
	this.luminanceSampler = raptorjs.system.samplerFromFramebuffer(this.luminanceFramebuffer);
	this.adaptedLumSampler = raptorjs.system.samplerFromFramebuffer(this.adaptedLuminanceFramebuffer);
	this.prevAdaptedLumSampler = raptorjs.system.samplerFromFramebuffer(this.prevAdaptedLuminanceFramebuffer);
	this.brightFilterSampler = raptorjs.system.samplerFromFramebuffer(this.brightFilterFramebuffer);
	this.convolutionXSampler = raptorjs.system.samplerFromFramebuffer(this.convolutionXFramebuffer);
	this.convolutionYSampler = raptorjs.system.samplerFromFramebuffer(this.convolutionYFramebuffer);
	
	this.downSample = raptorjs.createObject("shader");
	this.downSample.createFomFile("shaders/downSample.shader");
	this.downSample.setUniform("viewProjection", raptorjs.system.quadViewProjection );
	
	this.downSampleFramebuffers = [];

	for(var c = 256; c>1; c/=2) {
		var framebuffer = raptorjs.system.createFrameBuffer( c, c, { filter : gl.LINEAR} );
		
		framebuffer.sampler = raptorjs.system.samplerFromFramebuffer(framebuffer);
		framebuffer.sampler.bind(this.downSample);
		
		this.downSampleFramebuffers.push(framebuffer);
	}
	
	this.luminanceShader = raptorjs.createObject("shader");
	this.luminanceShader.createFomFile("shaders/luminance.shader");
	this.luminanceShader.setUniform("viewProjection", raptorjs.system.quadViewProjection );
	
	this.adaptedLuminanceShader = raptorjs.createObject("shader");
	this.adaptedLuminanceShader.createFomFile("shaders/adaptedLuminance.shader");
	this.adaptedLuminanceShader.setUniform("viewProjection", raptorjs.system.quadViewProjection );
	this.adaptedLuminanceShader.setUniform("currentLuminanceSampler", this.downSampledLuminanceSampler );
	this.adaptedLuminanceShader.setUniform("prevAdaptedLumSampler", this.prevAdaptedLumSampler );
	
	this.prevadaptedLuminanceShader = raptorjs.createObject("shader");
	this.prevadaptedLuminanceShader.createFomFile("shaders/copy.shader");
	this.prevadaptedLuminanceShader.setUniform("viewProjection", raptorjs.system.quadViewProjection );
	this.prevadaptedLuminanceShader.setUniform("texture", this.adaptedLumSampler );
	
	var noiseTexture = raptorjs.resources.getTexture("randomRotation");
	var noiseSampler = raptorjs.createObject("sampler2D");
	
	noiseSampler.texture = noiseTexture;
	noiseSampler.MIN_FILTER = gl.NEAREST;
	noiseSampler.MAG_FILTER = gl.NEAREST;
	
	this.hdrShader = raptorjs.createObject("shader");
	this.hdrShader.createFomFile("shaders/hdr.shader");
	this.hdrShader.setUniform("viewProjection", raptorjs.system.quadViewProjection );
	this.hdrShader.setUniform("adaptedLuminanceSampler", this.adaptedLumSampler );
	this.hdrShader.setUniform("noiseMap", noiseSampler );
	this.hdrShader.setUniform("bloomSampler", this.convolutionYSampler );
	
	
	this.brightFilterShader = raptorjs.createObject("shader");
	this.brightFilterShader.createFomFile("shaders/brightPass.shader");
	this.brightFilterShader.setUniform("viewProjection", raptorjs.system.quadViewProjection );
	this.brightFilterShader.setUniform("luminanceSampler", this.adaptedLumSampler );

	this.brightFilterSampler.bind(this.downSample);
	//this.downSample.setUniform("texture", this.adaptedLumSampler );
	

	this.copy = raptorjs.createObject("shader");
	this.copy.createFomFile("shaders/copy.shader");
	this.copy.setUniform("viewProjection", raptorjs.system.quadViewProjection );

	
	this.convolution = raptorjs.createObject("shader");
	this.convolution.createFomFile("shaders/convolution.shader");
	this.convolution.setUniform("viewProjection", raptorjs.system.quadViewProjection );
	
}

raptorjs.hdr.prototype.setDiffuseSampler = function( sampler ) {
	this.luminanceShader.setUniform("diffuseSampler", sampler );
	this.hdrShader.setUniform("diffuseSampler", sampler );
	this.brightFilterShader.setUniform("diffuseSampler", sampler );
}

raptorjs.hdr.prototype.update = function() {

	raptorjs.system.drawQuad( this.luminanceShader,this.luminanceFramebuffer ); // this.luminanceFramebuffer

	this.downSample.setUniform("texture", this.luminanceSampler );
	this.downSample.update();
	
	for(var c = 0; c<this.downSampleFramebuffers.length; c++) {
		var framebuffer = this.downSampleFramebuffers[c];
		
		var sampler = framebuffer.sampler;
		
		this.downSample.setUniform("pixelSize", 1 / framebuffer.width, true );
		
		if(c<this.downSampleFramebuffers.length-1)
		raptorjs.system.drawQuad( this.downSample, framebuffer, true  );
		else
		raptorjs.system.drawQuad( this.downSample, this.downSampledLuminanceFrambuffer, true   );
		

		var textureUniform = this.downSample.getUniformByName('texture');
		gl.activeTexture( gl.TEXTURE0 );
		gl.bindTexture( gl.TEXTURE_2D, sampler.texture.glTexture );
		gl.uniform1i(textureUniform, 0);
	}
	
	
	
	this.adaptedLuminanceShader.setUniform("ElapsedTime", [raptorjs.elapsed,raptorjs.elapsed, raptorjs.elapsed, raptorjs.elapsed] );
	
	raptorjs.system.drawQuad( this.adaptedLuminanceShader, this.adaptedLuminanceFramebuffer );
	
	raptorjs.system.drawQuad( this.prevadaptedLuminanceShader, this.prevAdaptedLuminanceFramebuffer );
	

	raptorjs.system.drawQuad( this.brightFilterShader, this.brightFilterFramebuffer );

	
	var textureUniform = this.downSample.getUniformByName('texture');
	gl.useProgram(this.downSample.program);
	gl.activeTexture( gl.TEXTURE0 );
	gl.bindTexture( gl.TEXTURE_2D, this.brightFilterSampler.texture.glTexture );
	gl.uniform1i(textureUniform, 0);

	for(var c = 0; c<this.downSampleFramebuffers.length-5; c++) {
		var framebuffer = this.downSampleFramebuffers[c];
		
		var sampler = framebuffer.sampler;
		
		this.downSample.setUniform("pixelSize", 1 / framebuffer.width, true );
		
		if(c<this.downSampleFramebuffers.length-6)
			raptorjs.system.drawQuad( this.downSample, framebuffer, true  );
		else
			raptorjs.system.drawQuad( this.downSample, null, true   );
		

		var textureUniform = this.downSample.getUniformByName('texture');
		gl.activeTexture( gl.TEXTURE0 );
		gl.bindTexture( gl.TEXTURE_2D, sampler.texture.glTexture );
		gl.uniform1i(textureUniform, 0);
	}
	
	/*
	
	// horisontal convolution
	this.convolution.setUniform("image", this.brightFilterSampler );
	this.convolution.setUniform("imageIncrement",  [1/this.convolutionXFramebuffer.width, 0.0]);
	
	raptorjs.system.drawQuad( this.convolution, this.convolutionXFramebuffer );
	

	// vertical
	this.convolution.setUniform("image", this.convolutionXSampler );
	this.convolution.setUniform("imageIncrement",  [0.0, 1/this.convolutionXFramebuffer.height]);
	
	raptorjs.system.drawQuad( this.convolution, this.convolutionYFramebuffer );

	
	this.convolution.setUniform("image", this.convolutionYSampler );
	this.convolution.setUniform("imageIncrement",  [1/this.convolutionXFramebuffer.width, 0.0]);
		
	raptorjs.system.drawQuad( this.convolution, this.convolutionXFramebuffer );
	
	
	this.convolution.setUniform("image", this.convolutionXSampler );
	this.convolution.setUniform("imageIncrement",  [1/this.convolutionXFramebuffer.width, 0.0]);
	
	raptorjs.system.drawQuad( this.convolution, this.convolutionYFramebuffer );
	
	
	this.convolution.setUniform("image", this.convolutionYSampler );
	this.convolution.setUniform("imageIncrement",  [1/this.convolutionXFramebuffer.width, 0.0]);
	
	raptorjs.system.drawQuad( this.convolution, this.convolutionXFramebuffer );
	
	
	this.convolution.setUniform("image", this.convolutionXSampler );
	this.convolution.setUniform("imageIncrement",  [1/this.convolutionXFramebuffer.width, 0.0]);
	
	raptorjs.system.drawQuad( this.convolution, this.convolutionYFramebuffer );
	
	*/
	
	raptorjs.system.drawQuad( this.hdrShader, null );
		/*	
			
	this.copy.setUniform("texture", sampler );
	
	
	
	
	//raptorjs.system.drawQuad( this.downSample, null );
	
 raptorjs.system.drawQuad( this.copy, null );
	

	
	

	

	// horisontal convolution
	this.convolution.setUniform("image", this.downSampler128Sampler );
	this.convolution.setUniform("imageIncrement",  [1/128, 0.0]);
	
	raptorjs.system.drawQuad( this.convolution, this.convolutionXFramebuffer );
	

	// vertical
	this.convolution.setUniform("image", this.convolutionXSampler );
	this.convolution.setUniform("imageIncrement",  [0.0, 1/128]);
	
	raptorjs.system.drawQuad( this.convolution, null );
	*/
	
	// raptorjs.system.drawQuad( this.show, null );
	
}