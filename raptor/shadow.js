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