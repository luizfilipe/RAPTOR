raptorjs.directionalLight = function(){
	this.position = [10,10,10];
	this.target = [0,0,0];
	this.up = [0,1,0];
	
	this.projection;
	this.view;
	
	this.viewProjection;
	
	this.far = 4420;
	this.near = 0.1;
}

raptorjs.directionalLight.prototype.update = function(){
	this.projection = raptorjs.matrix4.perspective(raptorjs.math.degToRad(45), raptorjs.width / raptorjs.height, this.near, this.far);
	this.view = raptorjs.matrix4.lookAt(this.position, this.target, this.up);
	this.viewProjection = matrix4.mul(this.view, this.projection)
}