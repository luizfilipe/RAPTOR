/*
 * Copyright 2013, Raptorcode Studios Inc, 
 * Author, Kaj Dijkstra.
 * All rights reserved.
 *
 */
 

/**
 * Material
**/
raptorjs.material = function () {
	this.color;
	
	this.textures = [];
	this.normals = [];
	this.displacementMaps = [];
	this.transparencyMaps = [];
	this.specularMaps = [];
	
	this.specularIntensity = [0.0, 0.0, 0.0, 0.0];
	this.useParallax = false;
	
	this.uvScale = 1;
}


/**
 * add texture to material
 * @param {(texture)} texture
**/
raptorjs.material.prototype.addTexture = function(texture) {
	this.textures.push(texture);
}


/**
 * add normal map to material
 * @param {(texture)} texture
**/
raptorjs.material.prototype.addNormal = function(texture) {
	this.normals.push(texture);
}


/**
 * add transparency map to material
 * @param {(texture)} transparentyMap
**/
raptorjs.material.prototype.addTransparentyMap = function(texture) {
	this.transparencyMaps.push(texture);
}


/**
 * add displacement map to material
 * @param {(texture)} heightmap
**/
raptorjs.material.prototype.addDisplacement = function( heightmap ) {
	this.useParallax = true;
	this.displacementMaps.push(heightmap);
}


/**
 * add specular map to material
 * @param {(texture)} specularMap
**/
raptorjs.material.prototype.addSpecularMap = function( specularMap ) {
	this.specularMaps.push(specularMap);
}
