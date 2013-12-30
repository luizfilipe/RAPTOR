/*
 * Copyright 2012, Raptorcode Studios Inc, 
 * Author, Kaj Dijkstra.
 * All rights reserved.
 *
 */

 
/**
 * Entity object
**/
raptorjs.entity = function() {
	this._className = 'entity';
	this.subEntitys = [];
	
	this.mesh;
	this.drawType = gl.TRIANGLES;
	this.transform = raptorjs.createObject('transform');
};


/**
 * add mesh to entity
 * @param {(meshObject)} mesh
**/
raptorjs.entity.prototype.addMesh = function(mesh) {
	this.mesh = mesh;
	
	var subMeshes = this.mesh.subMeshes;
	
	for(var c = 0;c<subMeshes.length; c++) {
		var subMesh = subMeshes[c];
	
		var newSubEntity = raptorjs.createObject("subEntity");
		newSubEntity.subMesh = subMesh;
		
		this.addSubEntity(newSubEntity);
	}
};


/**
 * add subEntity to entity
 * @param {(subEntityObject)} subEntity
**/
raptorjs.entity.prototype.addSubEntity = function(subEntity) {
	this.subEntitys.push(subEntity);
};


/**
 * get subentity from entity
**/
raptorjs.entity.prototype.getSubEntitys = function() {
	return this.subEntitys;
};


/**
 * update Uniforms
 * @param {(subEntityObject)} subEntity
**/
raptorjs.entity.prototype.updateUniforms = function() {
	var shader = this.shader;
	var transform = this.transform;
}


/**
 * get updated 4x4 world matrix
**/
raptorjs.entity.prototype.getUpdatedWorldMatrix = function() {
	return this.transform.getUpdatedWorldMatrix();
}
