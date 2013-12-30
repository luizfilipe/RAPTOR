/*
 * Copyright 2013, Raptorcode Studios Inc, 
 * Author, Kaj Dijkstra.
 * All rights reserved.
 *
 */

raptorjs.transform = function(){
	this.world = raptorjs.matrix4.identity();
}

raptorjs.transform.prototype.translate = function(x,y,z) {
	this.world = raptorjs.matrix4.translate(this.world, raptorjs.vector3(x,y,z) );
}

raptorjs.transform.prototype.scale = function(x,y,z) {
	this.world = raptorjs.matrix4.scale(this.world, raptorjs.vector3(x,y,z) ) 
}

raptorjs.transform.prototype.rotate = function(x,y,z) {
	this.world = raptorjs.matrix4.rotateZYX( this.world, raptorjs.vector3(x,y,z) ) 
}
raptorjs.transform.prototype.rotateZ = function(x) {
	this.world = raptorjs.matrix4.rotateZ( this.world, raptorjs.math.degToRad( x ) ); 
}

raptorjs.transform.prototype.rotateX = function(x) {
	this.world = raptorjs.matrix4.rotateX( this.world, raptorjs.math.degToRad( x ) ); 
}
raptorjs.transform.prototype.rotateY = function(y) {
	this.world = raptorjs.matrix4.rotateY( this.world, raptorjs.math.degToRad( y ) ); 
}

raptorjs.transform.prototype.getUpdatedWorldMatrix = function() {
	return this.world;
}

raptorjs.transform.prototype.translateVec = function(v) {
	this.world = raptorjs.matrix4.translate(this.world, v);
}