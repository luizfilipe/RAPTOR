/*
 * Copyright 2012, raptorjscode Studios Inc, 
 * 	Author, Kaj Dijkstra.
 * All rights reserved.
 *
 */
raptorjs.camera = function() {
	this.yaw = 123;
	this.pitch = 315;
	this.roll = 0;
	
	this.distance = 40;
	this.fov = 55;
	
	this.eye = raptorjs.vector3(0,0,0);
	this.target = raptorjs.vector3(0,0,0);
	this.up = raptorjs.vector3(0, 1, 0);
	
	this.view;
	this.projection;
	this.worldViewProjection;
	
	this.target;
	this.frustumCorners;
	this.center = raptorjs.vector3(0, 40, 0);

	this.rotationSpeed = .1;

	this.lastPriority = 0;
	this.mode = "orbit";//freeLook, orbit
	this.fieldOfView = 65;
	
	this.far = 55400;
	this.near = 0.4;
}

raptorjs.camera.prototype.setPosition = function (a) {
	this.center = a;
};

raptorjs.camera.prototype.getPosition = function () {
	return this.center;
};

raptorjs.camera.prototype.move = function (a) {
	this.center = raptorjs.vector3.add(a, this.center);
};

raptorjs.camera.prototype.setDirection = function ( normalizedVector ) {
	this.target = normalizedVector;
};

raptorjs.camera.prototype.getDirection = function () {
	return this.target;
};

raptorjs.camera.prototype.getUp = function () {
	return this.up;
};

raptorjs.camera.prototype.getRight = function () {

};

raptorjs.camera.prototype.rotate = function (x,y,z) {
	
};

raptorjs.camera.prototype.setOrientation  = function () {

};

/**
 * Calculate new up vector to prevent camera flipping on 90 or something degrees.
**/
raptorjs.camera.prototype.checkup = function () {
	var that = this;
	if(that.pitch<=0)
		that.pitch += 360;
	if(((that.pitch+90)/180)%2<=1)
		that.up = raptorjs.vector3(0,1,0);
	else
		that.up = raptorjs.vector3(0,-1,0);
};

/**
 * update camera orbit position.
**/
raptorjs.camera.prototype.UpdateOrbit = function (yaw, pitch) {
	this.yaw += yaw * this.rotationSpeed;
	this.pitch += pitch * this.rotationSpeed;

	this.checkup();
};

/**
 * Orbit camera.
**/
raptorjs.camera.prototype.orbit = function() {
	var raptor = raptorjs;
	
	var timeNow = new Date().getTime();
	
	if (raptor.events.lastTime != 0) {
		var elapsed = timeNow - raptor.events.lastTime;
	}
	
	var mix = Math.max(0, Math.min(1, elapsed/120));

	var smooth = raptorjs.vector2.interpolate(	raptor.events.clientMouse,
												raptor.events.oldMousPos,
												mix );


	raptor.events.mouseVerschil = [raptor.events.clientMouse[0] - raptor.events.oldMousPos[0], raptor.events.clientMouse[1] - raptor.events.oldMousPos[1]];

	raptor.events.oldMousPos = raptor.events.clientMouse;

	if( raptor.events.mouseDown[1] || raptor.events.mouseDown[2] ) {
		if( raptor.events.mouseVerschil[0]!=0 || raptor.events.mouseVerschil[1]!=0 ) {
			this.UpdateOrbit( -raptor.events.mouseVerschil[0] , raptor.events.mouseVerschil[1] );
		}
	}

	if(this.yaw > 360)
		this.yaw -=360;
		
	if(this.yaw < 0)
		this.yaw +=360;
		
	if(this.pitch > 360)
		this.pitch -=360;
		
	if(this.pitch < 0)
		this.pitch +=360;
		
	var matrix4 = raptor.matrix4;
	
	var beginVector = raptorjs.vector3( 0, 0, -this.distance ); 

	var yawMatrix =   matrix4.rotationY( raptorjs.math.degToRad(this.yaw) );
	var pitchMatrix = matrix4.rotationX( raptorjs.math.degToRad(this.pitch) );
	
	var transMatrix = matrix4.mul(pitchMatrix, yawMatrix);
	
	this.target = this.center;
	this.eye = raptor.vector3.add( matrix4.transformDirection(transMatrix, beginVector), this.target);

	
	this.projection = raptorjs.matrix4.perspective(raptorjs.math.degToRad(this.fov), raptorjs.width / raptorjs.height, this.near, this.far);
	this.view = raptorjs.matrix4.lookAt(this.eye, this.target, this.up);
	
	this.worldViewProjection = matrix4.mul(this.view, this.projection);
	
	
};

raptorjs.camera.prototype.update = function() {
	this.orbit();
}