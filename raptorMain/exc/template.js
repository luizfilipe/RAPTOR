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
raptorjs.lightShafts = function(){
	this.create();

}

raptorjs.lightShafts.prototype.create = function() {
	this.galaxyShader = raptorjs.createObject("shader"); 
	this.galaxyShader.createFomFile("shaders/lightShafts.shader");
	this.galaxyShader.setUniform("depthMap", raptorjs.system.shadowSampler );
}

raptorjs.lightShafts.prototype.update = function(){

	this.galaxyShader.setUniform("worldViewProjection", raptorjs.mainCamera.worldViewProjection);

	raptorjs.system.drawQuad(this.galaxyShader, null);
}