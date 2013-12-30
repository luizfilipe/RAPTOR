/*
 * Copyright 2013, Raptorcode Studios Inc, 
 * Author, Kaj Dijkstra.
 * All rights reserved.
 *
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