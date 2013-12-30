raptorjs.shadowMap = function( ) {
	//shadow	
	this.shadowFramebuffer;
	this.shadowTexture;
	this.shadowSampler;
	this.numberOfSplitpoints = 3;

	this.lambda = 0.75;
	this.pssmOffset = 1000;

	
	this.lightPosition = [400.0, 2800.0, 650.0];
	
	var near = .1;
	var far = 4600;
	var view = raptorjs.matrix4.lookAt(this.lightPosition,  [0,-1,0], [0,0, -1] );
	var projection = raptorjs.matrix4.orthographic(-1060, 1060, -680, 1500, -near, far);
	var viewProjection = raptorjs.matrix4.composition( projection, view );

	this.view = view;
	this.projection = projection;
	this.viewProjection = viewProjection;
	this.near = near;
	this.far = far;
	this.eye = this.lightPosition;
}


raptorjs.shadowMap.prototype.set = function() {
	var near = .1;
	var far = 5600;
	var view = raptorjs.matrix4.lookAt(this.lightPosition,  [0,1,0], [0, 1, 0] );
	var projection = raptorjs.matrix4.orthographic(-1260, 1260, -1680, 1900, -near, far);
	var viewProjection = raptorjs.matrix4.composition( projection, view );

	this.view = view;
	this.projection = projection;
	this.viewProjection = viewProjection;
	this.near = near;
	this.far = far;
	this.eye = this.lightPosition;
}