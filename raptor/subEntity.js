/*
 * Copyright 2013, Raptorcode Studios Inc, 
 * Author, Kaj Dijkstra.
 * All rights reserved.
 *
 */

 
/**
 * sub Entity
**/
raptorjs.subEntity = function() {
	this._className = 'subEntity';

	this.subMeshes = [];
};


/**
 * add subMesh
 * @param {(submesh)} submesh
**/
raptorjs.subEntity.prototype.addSubMesh = function(submesh) {
	this.subMeshes.push(submesh);
}


/**
 * get all submeshes
**/
raptorjs.subEntity.prototype.getSubMeshes = function() {
	return this.subMeshes;
}


/**
 * parse subEntity (Deprecated)
 * @param {(submesh)} submesh
**/
raptorjs.subEntity.prototype.parse = function(submesh) {
	
}
