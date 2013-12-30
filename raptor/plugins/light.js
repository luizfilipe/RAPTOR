raptorjs.light = function(){
	this.position = [190.0,20.0,100.0];
	this.target = [0,0,0];
	this.up = [0,1,0];
	
	this.projection;
	this.view;
	
	this.viewProjection;
	
	this.far = 2420;
	this.near = 0.1;
	
	this.type = 'directional';
	
	this.update();
}

raptorjs.light.prototype.update = function(){
	var matrix4 = raptorjs.matrix4;
	this.projection = matrix4.perspective(raptorjs.math.degToRad(45), raptorjs.width / raptorjs.height, this.near, this.far);
	this.view = matrix4.lookAt(this.position, this.target, this.up);
	this.viewProjection = matrix4.mul(this.view, this.projection)
}