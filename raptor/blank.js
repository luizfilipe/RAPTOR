raptorjs.seaShore = function(){
	
	this.createSurface();
}

raptorjs.seaShore.prototype.createSurface = function(){
	this.shader = raptorjs.createObject("shader");
	this.shader.createFomFile("shaders/texture.shader");

	var texture = raptorjs.resources.getTexture("water_bump");
	var g_WaterBumpSampler =  raptorjs.createObject("sampler2D");
	g_WaterBumpSampler.texture = texture;
	g_WaterBumpSampler.useAlpha = true;

	this.shader.setUniform("texture",  g_WaterBumpSampler );
}

raptorjs.seaShore.prototype.render = function() {
	raptorjs.system.drawQuad(this.shader, null);
}