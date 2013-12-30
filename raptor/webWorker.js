	
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
			return shaders;
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