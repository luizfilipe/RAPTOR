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
*/
  
/**
 * Author: Kaj Dijksta
 */
/**
 * light
**/
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


/**
 * update light
**/
raptorjs.light.prototype.update = function(){
	var matrix4 = raptorjs.matrix4;
	this.projection = matrix4.perspective(raptorjs.math.degToRad(45), raptorjs.width / raptorjs.height, this.near, this.far);
	this.view = matrix4.lookAt(this.position, this.target, this.up);
	this.viewProjection = matrix4.mul(this.view, this.projection)
}