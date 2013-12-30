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