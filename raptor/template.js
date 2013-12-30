raptorjs.lightShafts = function(){
	this.create();

}

raptorjs.lightShafts.prototype.create = function() {
	this.galaxyShader = raptorjs.createObject("shader"); 
	this.galaxyShader.createFomFile("shaders/lightShafts.shader");
	this.galaxyShader.setUniform("depthMap", raptorjs.system.shadowSampler );
}

raptorjs.lightShafts.prototype.update = function(){

	this.galaxyShader.setUniform("worldViewProjection", raptorjs.mainCamera.worldViewProjection);

	raptorjs.system.drawQuad(this.galaxyShader, null);
}
