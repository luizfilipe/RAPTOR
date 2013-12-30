/*
-----------------------------------------------------------------------------
This source file is part of Raptor Engine
For the latest info, see http://www.raptorEngine.com

Copyright (c) 2012-2013 Raptorcode

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
-----------------------------------------------------------------------------

Author: Kaj Dijksta

*/

 
/**
 * Camera Object
**/
raptorjs.camera = function() {
	this.yaw = 147;
	this.pitch = 57;
	this.roll = 0;
	
	this.distance = 400;
	this.fov = 55;
	
	this.eye = raptorjs.vector3(0,0,0);
	this.target = raptorjs.vector3(0,0,0);
	this.up = raptorjs.vector3(0, 1, 0);
	
	this.view;
	this.projection;
	this.worldViewProjection;
	
	this.center = raptorjs.vector3(-146, 1383, 78);
	this.rotationSpeed = .1;

	this.mode = "orbit"; //freeLook, orbit
	this.fieldOfView = 65;
	
	this.far = 16000;
	this.near = 0.4;
}

/**
 * Set camera position
 * @param {(vector3)} position you want to set
**/
raptorjs.camera.prototype.setPosition = function(p) {
	this.center = p;
};


/**
 * get position of camera
 * @return {(vector3)} camera position
**/
raptorjs.camera.prototype.getPosition = function () {
	return this.center;
};


/**
 * Move camera
 * @param {(vector3)} 
**/
raptorjs.camera.prototype.move = function (a) {
	this.center = raptorjs.vector3.add(a, this.center);
};


/**
 * Set camera direction
 * @param {(vector3)} 
**/
raptorjs.camera.prototype.setDirection = function ( normalizedVector ) {
	this.target = normalizedVector;
};


/**
 * get camera direction
 * @param {(vector3)} 
**/
raptorjs.camera.prototype.getDirection = function () {
	return this.target;
};


/**
 * get camera up vector
 * @param {(vector3)} 
**/
raptorjs.camera.prototype.getUp = function () {
	return this.up;
};


/**
 * get camera right (Depricated)
 * @param {(vector3)} 
**/
raptorjs.camera.prototype.getRight = function () {

};

/**
 * Rotate camera (Depricated)
 * @param {(vector3)} 
**/
raptorjs.camera.prototype.rotate = function (x,y,z) {
	
};


/**
 * set camera Orientation (Depricated)
 * @param {(vector3)} 
**/
raptorjs.camera.prototype.setOrientation  = function () {

};


/**
 * Calculate new up vector to prevent camera flipping on 90 degrees.
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
												raptor.events.tempMouse,
												mix );
												
	raptor.events.mouseDiff = [raptor.events.clientMouse[0] - raptor.events.tempMouse[0], raptor.events.clientMouse[1] - raptor.events.tempMouse[1]];

	raptor.events.tempMouse = raptor.events.clientMouse;

	if( raptor.events.mouseDown[1] || raptor.events.mouseDown[2] ) {
		if( raptor.events.mouseDiff[0]!=0 || raptor.events.mouseDiff[1]!=0 ) {
			this.UpdateOrbit( -raptor.events.mouseDiff[0] , raptor.events.mouseDiff[1] );
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


/**
 * Update camera matrices
**/
raptorjs.camera.prototype.update = function() {
	this.orbit();
}