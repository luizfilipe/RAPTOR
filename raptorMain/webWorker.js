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

	
	/**
	 * load url
	 * @param {string} url 
	 */
	function loadTextFileSynchronous(url) {
		var request;

		
			request = new XMLHttpRequest();
			if (request.overrideMimeType) {
			  request.overrideMimeType('text/plain');
			}

		
		request.open('GET', url, false);
		request.send(null);
		
		if (request.readyState != 4) {
			throw error;
		}
		
		return request.responseText;
	}
	
	function process() {
	
		for(var c = 0; c<24; c++) {
			var meshData = loadTextFileSynchronous('compressor.php?path=sponza/mesh'+c+'.json');
			var jsonEntity = JSON.parse(meshData);
			
			
			//self.postMessage(meshData);
			var arrayBuffers = {};
			arrayBuffers.indices = new Int32Array(jsonEntity.indices);
			arrayBuffers.vertices = new Float32Array(jsonEntity.vertices);
			arrayBuffers.normals = new Float32Array(jsonEntity.normals);
			arrayBuffers.textureCoords = new Float32Array(jsonEntity.textureCoords);
			arrayBuffers.tangents = new Float32Array(jsonEntity.tangents);
			arrayBuffers.binormals = new Float32Array(jsonEntity.binormals);
			arrayBuffers.material = jsonEntity.material;
			
			
			
			self.postMessage(arrayBuffers);
			
		}
			
	}
	process();
