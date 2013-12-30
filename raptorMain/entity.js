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
