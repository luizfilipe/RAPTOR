/**
 * 	Raptor Engine - Core
 * 	Copyright (c) 2013 RAPTORCODE STUDIOS
 * 	All rights reserved.
 *
 * 	Author: Kaj Dijksta
 *
 **/
 
 
 
/**
 * Program info Object
 * Object preserved to store a glsl program 
 */
raptorjs.programInfo = function() {
	this.url;
	this.program;
	this.pragmas;
	this.librarys;
	
	this.rawData;
	this.vertexShader;
	this.fragmentShader;
	this.vertexShaderData;
	this.fragmentShaderData;
}
