/*
 * Copyright 2013, Raptorcode Studios Inc, 
 * Author, Kaj Dijkstra.
 * All rights reserved.
 *
 */

 
/**
 * subMesh object
**/
raptorjs.subMesh = function() {
	this._className = 'subMesh';

	this.indices;
	this.vertices;
	this.textcoords;
	this.normals;
	
	this.material;
};