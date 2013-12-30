/*
 * Copyright 2013, Raptorcode Studios Inc, 
 * Author, Kaj Dijkstra.
 * All rights reserved.
 *
 */
 

/**
 * Scene Node
**/
raptorjs.sceneNode = function(){
	this._className = 'sceneNode';
	this.entitys = [];
}


/**
 * add entity to sceneNode
 * @param {(entity)} entity
**/
raptorjs.sceneNode.prototype.addEntity = function(entity){
	this.entitys.push(entity);
}


/**
 * get entity's
 * @param {(entity)} entity
**/
raptorjs.sceneNode.prototype.getEntitys = function(entity){
	return this.entitys;
}

