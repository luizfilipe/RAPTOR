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
 * Boundingbox
**/
raptorjs.boundingBox = function() {
	this.maxExtent = [0, 0, 0];
	this.minExtent = [0, 0, 0];
	this.intersectionVector;
}


/**
 * make boundingbox as big as point cloud
 * @param {(array)} points
**/
raptorjs.boundingBox.prototype.fitBoxToPoints_ = function(points) {

  var minVector;

  for (var index = 0; index < 3; ++index) {
	this.maxExtent[index] = this.minExtent[index] = points[0][index];

	for (var i = 1; i < points.length; ++i) {
		var point = points[i];

		if(this.minExtent[index] > point[i] && index == 1)
		var minVector = point;

		this.minExtent[index] = Math.min(this.minExtent[index], point[index]);
		this.maxExtent[index] = Math.max(this.maxExtent[index], point[index]);
	}
  }
   
  this.intersectionVector = minVector;

  this.valid = true;
}