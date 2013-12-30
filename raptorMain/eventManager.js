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
 * Event Manager
 * Manage all mouse and keyboard events in this class 
 */
raptorjs.eventManager = function() {
	this.tempMouse = raptorjs.vector2(0,0);
	this.mouseDiff = raptorjs.vector2(0,0);
	this.mouseDown = raptorjs.vector3(0,0,0);

	var canvas = raptorjs.canvas;
	
	canvas.addEventListener("mousemove", function(e){ mouseMoveHandler(e); });
	canvas.addEventListener("mousedown", function(e){ mouseDownHandler(e); }); 
	canvas.addEventListener("mouseup", function(e){ mouseUpHandler(e); });
	
	
	window.addEventListener("keydown", function(e){ keyDownHandler(e); });
	window.addEventListener("keyup", function(e){ keyUpHandler(e); });
	
	this.lastTime = new Date().getTime();
	this.elapsed = 0;
	this.timeNow = 0;
	this.clientMouse = raptorjs.vector2(0,0);
}


/**
 * Mouse over event handler.
 * @param {(event)} event.
**/
mouseMoveHandler = function (e) {

	raptorjs.events.clientMouse = [ e.screenX , e.screenY ];
	
	if( raptorjs.events.mouseDown[1] || raptorjs.events.mouseDown[2] )
		raptorjs.events.lastTime  = new Date().getTime();

	if(!raptorjs.events.tempMouse)
		raptorjs.events.tempMouse = raptorjs.events.clientMouse;
};


/** 
 * Mouse down event handler.
 * @param {(event)} event.
 */
mouseDownHandler = function (e) {
	var events = raptorjs.events;
	switch(e.button)
	{
		case 0:
			events.mouseDown[1] = true;
		break;
		case 1:
			events.mouseDown[0] = true; 
		break;
		case 2:
			events.mouseDown[2] = true;
		break;
	}
}


/**
 * Mouse up event handler
 * @param {(event)} event.
**/
mouseUpHandler = function ( e ) {
var events = raptorjs.events;
	switch(e.button)
	{
		case 0:
			events.mouseDown[1] = false;
		break;
		case 1:
			events.mouseDown[0] = false;
		break;
		case 2:
			events.mouseDown[2] = false;
		break;
	}
}

/**
 * Key down event handler
**/
keyDownHandler = function (e) {

	switch(e.keyCode) {
		case 68: // a
			raptorjs.mainPlayer.right = false;
			raptorjs.mainPlayer.left = true;
		break;
		case 65: // d
			raptorjs.mainPlayer.left = false;
			raptorjs.mainPlayer.right = true;
		break;
		case 87: //w
			raptorjs.mainPlayer.backward = false;
			raptorjs.mainPlayer.forward = true;
		break;
		case 83: //s
			raptorjs.mainPlayer.forward = false;
			raptorjs.mainPlayer.backward = true;
		break;
		case 16: //shift
			raptorjs.mainPlayer.moveSpeed = 15.39;
		break;
		case 90:
			raptorjs.mainPlayer.down = true;
		break;
		case 32:
			raptorjs.mainPlayer.up = true;
		break;
		case 67://v
	

		break;
	} 
}

/**
 * Key up event handler
**/
keyUpHandler = function(e)
{
	switch(e.keyCode)
	{
		case 65: // a
			//g_animate = false;
		break;
	}
	
	switch(e.keyCode) {
		case 68: // a
			raptorjs.mainPlayer.left = false;
		break;
		case 65: // d
			raptorjs.mainPlayer.right = false;
		break;
		case 87: //w
			raptorjs.mainPlayer.forward = false;
		break;
		case 83: //s
			raptorjs.mainPlayer.backward = false;
		break;
		case 16: // shift
			raptorjs.mainPlayer.moveSpeed = 3.;
		break;
		case 90:
			raptorjs.mainPlayer.down = false;
		break;
		case 32:
			raptorjs.mainPlayer.up = false;

		break;
		case 67://v
	
		break;
	}
}

/**
 * set render mode
 **/
function setRenderMode() {
	if(document.getElementById('slideThree').checked) {
		raptorjs.system.deferred = true; // forward = true, deferred = false
		raptorjs.system.useSSAO = true;
		raptorjs.system.ssaoOnly = true;
	} else {
		raptorjs.system.deferred = false; // forward = true, deferred = false
		raptorjs.system.useSSAO = false;
		raptorjs.system.ssaoOnly = false;
	}
}

/**
 * set SSAO
 **/
function setSSAO( el ) {
	var value = el.options[el.selectedIndex].value;
	
	switch(value) {
		case "Fast":
			raptorjs.system.ssaoShader = raptorjs.system.ssaoShaders[0];
		break;
		case "Heavy":
			raptorjs.system.ssaoShader = raptorjs.system.ssaoShaders[1];
		break;
		case "Extreme":
			raptorjs.system.ssaoShader = raptorjs.system.ssaoShaders[2];
		break;
	}
}

var rendermode = "color";

