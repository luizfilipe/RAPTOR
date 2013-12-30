/**
 * Raptor Engine - Core
 * Copyright (c) 2010 RAPTORCODE STUDIOS
 * All rights reserved.
 */
 
 /**
 * Author: Kaj Dijksta
 */

raptorjs.mesh = function() {
	this._className = 'mesh';
	this.fileName;
	this.name = "new";
	
	this.shaderName;
	
	this.vertexIndexBuffer;
	this.vertexPositionBuffer;
	this.vertexNormalBuffer;
	this.textureCoordBuffer;
	this.binormalBuffer = false;
	this.tangentBuffer = false;
	
	this.materials = [];
	this.subMeshes = [];
	
	this.jsonStruture;
	this.shader;
	this.renderType = "indexed";
	
	this.materialId = 1.0;
	this.useParallax = false;
	
	this.colorInfoShader;
	this.infoShader;
	
	this.customShader = raptorjs.createObject("shader");
	this.customShader.createLibraryFomFile("shaders/custom.default.shader");

	this.heightmap;
	this.test;

	this.useNormal = false;
	
	this.bones = false;
	this.boneIndexBuffer;
	this.boneWeightBuffer;
	this.boneIndexBuffer2;
	this.boneWeightBuffer2;
};

raptorjs.mesh.prototype.setCustomShader = function( name ) {
	this.customShader = raptorjs.createObject("shader");
	this.customShader.createLibraryFomFile("shaders/custom."+name+".shader");
}

raptorjs.mesh.prototype.addHeightmap = function( heightmap ) {
	this.heightmap = heightmap;
	
	this.colorInfoShader.setUniform("heightmap", heightmap );
	this.infoShader.setUniform("heightmap", heightmap );
}

raptorjs.mesh.prototype.setMaterialId = function( id ) {
	this.materialId = id;
	//this.colorInfoShader.setUniform("materialId", this.materialId / 256 );
}

raptorjs.mesh.prototype.loadMeshFromFile = function( url ) {
	this.jsonStruture = JSON.parse(raptorjs.loadTextFileSynchronous('media/models/'+url));
	this.fileName = url;
	this.parseLoadedMesh();
}

raptorjs.mesh.prototype.combineDisplacementNormal = function( displacement, normal ) {

	var displacementImage = displacement.data;
	var normalImage = normal.data;

	var canvas = document.createElement('Canvas');
	var width = displacement.width;
	var height = displacement.height;
	
	canvas.width  = width;
	canvas.height = height;
	
	canvas.getContext('2d').drawImage(displacementImage, 0, 0, width, height);
	var displacementpixelData = canvas.getContext('2d').getImageData(0, 0, width, height).data;
	
	
	canvas.getContext('2d').drawImage(normalImage, 0, 0, width, height);
	var normalpixelData = canvas.getContext('2d').getImageData(0, 0, width, height).data;

	var dataArray = [];
	console.log(width, height, 'aaa');
	for(var x = 0; x<width; x++) {
		for(var y = 0; y<height; y++) {
			var index = (x + (y * height) ) * 4;
			
			dataArray.push(normalpixelData[index] / 255);
			dataArray.push(normalpixelData[index+1] / 255);
			dataArray.push(normalpixelData[index+2] / 255);
			dataArray.push(displacementpixelData[index]  / 255);
				
		}
	}
	
	var text = raptorjs.textureFromArray(dataArray, width, height, true);
	var sampler = raptorjs.createObject("sampler2D");
	sampler.texture = dataArray;
	
	return sampler;
}


raptorjs.mesh.prototype.createTangentAndBinormal = function( ) {
	var bn = raptorjs.system.createTangentsAndBinormals(  this.vertexPositionBuffer,
														  this.vertexNormalBuffer,
														  this.textureCoordBuffer,
														  this.vertexIndexBuffer );
	if(bn.tangent) {
	
		var tangentArray = layoutArray(bn.tangent);							
		var binormalArray = layoutArray(bn.binormal);	
		
		console.log(bn, this.vertexNormalBuffer);
		
		this.binormalBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.binormalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(binormalArray), gl.STATIC_DRAW);
		this.binormalBuffer.itemSize = 3;
		this.binormalBuffer.numItems = binormalArray.length / 3;
		this.binormalBuffer.data = binormalArray;
		
		this.tangentBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.tangentBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tangentArray), gl.STATIC_DRAW);
		this.tangentBuffer.itemSize = 3;
		this.tangentBuffer.numItems = tangentArray.length / 3;
		this.tangentBuffer.data = tangentArray;
	
	}
}


raptorjs.mesh.prototype.setName = function( material ) {
	var name = this.name;
	
	if(material.normals.length > 0)
		name += "_normal";
		
	if(material.useParallax)
		name += "_parallax";
	
	if(material.textures.length > 0)
		name += "_texture";
		
	if(material.transparencyMaps.length > 0)
		name += "_transparent";
	
	if(material.specularMaps.length > 0)
		name += "_specular";
		
	this.shaderName = name;
	
}

raptorjs.mesh.prototype.addMaterial = function( material ) {

	this.materials.push(material);
	
	this.colorInfoShader = raptorjs.createObject("shader");

	this.colorInfoShader.definePragma("DEFERRED", (raptorjs.system.deferred) ? 1.0 : 0.0 );	

	this.colorInfoShader.definePragma("NORMAL_MAP", (material.normals.length > 0) ? 1.0 : 0.0 );
	this.colorInfoShader.definePragma("PARALLAX", (material.useParallax) ? 1.0 : 0.0 );
	this.colorInfoShader.definePragma("TEXTURE", (material.textures.length > 0) ? 1.0 : 0.0 );
	this.colorInfoShader.definePragma("TRANSPACENCY_MAP", (material.transparencyMaps.length > 0) ? 1.0 : 0.0 );	
	this.colorInfoShader.definePragma("SPECULAR_MAP", (material.specularMaps.length > 0) ? 1.0 : 0.0 );	
	this.colorInfoShader.definePragma("USE_BONES", 0.0 );	// this.bones.length > 0 ? 1.0 :
	

	//this.colorInfoShader.addLibrary(this.customShader, 0);
	this.colorInfoShader.addLibrary(this.customShader, 1);

	this.setName(material);

	this.colorInfoShader.createFomFile("shaders/colorInfo.shader");


	this.colorInfoShader.setUniform("specularIntensity", material.specularIntensity[0] );
	this.colorInfoShader.setUniform("ambiantOcclusion", raptorjs.system.ssaoConvolutionYSampler );
	
	
	var sunPosition =  raptorjs.system.shadowMap.lightPosition;
	
	console.log([parseFloat(sunPosition[0]), parseFloat(sunPosition[1]), parseFloat(sunPosition[2]), 0.0]);
	console.log([1.1, 2.3, 2.4]);
	this.colorInfoShader.setUniform("lightPosition", [sunPosition[0], sunPosition[1], sunPosition[2], 0.0])
	
	
	if( material.specularMaps.length > 0 ) {
		this.colorInfoShader.setUniform("specularMapSampler", material.specularMaps[0] );
		console.log(material.specularMaps[0]);
	}

	if( material.textures.length > 0 ) {
	
		material.textures[0].anisotropic = 4;
		
		this.colorInfoShader.setUniform("texture", material.textures[0] );
		
		if(	material.transparencyMaps.length > 0 ) {
			this.colorInfoShader.setUniform("transparencyMapSampler", material.transparencyMaps[0] );
		}
		
		if(	material.normals.length > 0 ) {
			this.colorInfoShader.setUniform("normalSampler", material.normals[0] );
		}
		
		if(material.useParallax) {
			this.colorInfoShader.setUniform("heightSampler", material.displacementMaps[0]);
		} 
		
	} else {
	
		var color = material.color;
		this.colorInfoShader.setUniform("rgb", color );
	}

	
	//if(raptorjs.system.deferred) {
		this.infoShader = raptorjs.createObject("shader");
		this.infoShader.definePragma("NORMAL_MAP", (material.normals.length > 0) ? 1.0 : 0.0 );
		this.infoShader.createFomFile("shaders/info.shader");
	//}
	
	this.colorInfoShader.setUniform("sunColorR", 255/256, true); 
	this.colorInfoShader.setUniform("sunColorG", 243/256, true);
	this.colorInfoShader.setUniform("sunColorB", 163/256, true);
	
	this.shadow_kernel = [];

	this.shadow_kernel[0] = [-0.556641,-0.037109,-0.654297, 0.111328]; 
	this.shadow_kernel[1] = [0.173828,0.111328,0.064453, -0.359375]; 
	this.shadow_kernel[2] = [0.001953,0.082031,-0.060547, 0.078125]; 
	this.shadow_kernel[3] = [0.220703,-0.359375,-0.062500, 0.001953];
	this.shadow_kernel[4] = [0.242188,0.126953,-0.250000, -0.140625]; 
	this.shadow_kernel[5] = [0.070313,-0.025391,0.148438, 0.082031]; 
	this.shadow_kernel[6] = [-0.078125,0.013672,-0.314453, 0.013672];
	this.shadow_kernel[7] = [0.117188,-0.140625,-0.199219, 0.117188];
		
	// if forward shading
	this.colorInfoShader.setUniform("randomSampler",  raptorjs.system.randomSampler);
	this.colorInfoShader.setUniform("randomRotationSampler", raptorjs.system.randomRotationSampler );
	

	this.colorInfoShader.setUniform("far", raptorjs.mainCamera.far );
	this.colorInfoShader.setUniform("screenWidth", raptorjs.width );
	this.colorInfoShader.setUniform("screenHeight", raptorjs.height );
	this.colorInfoShader.setUniform("shadowBias", 2.0001);
	this.colorInfoShader.setUniform("shadow_kernel", this.shadow_kernel);
	
	
	if(this.shadowType == "VARIANCE") {
		this.colorInfoShader.setUniform("shadowSampler1", raptorjs.system.shadowConvYSampler);
	} else {
		this.colorInfoShader.setUniform("shadowSampler1", raptorjs.system.shadowSampler);
	}
	
	console.log(this);
}



raptorjs.mesh.prototype.loadObjFromFile = function( url ) {

	var objText = raptorjs.loadTextFileSynchronous(url);
	var obj = {};
	var vertexMatches = objText.match(/^v( -?\d+(\.\d+)?){3}$/gm);
	if (vertexMatches)
	{
		console.log(obj.vertices = vertexMatches.map(function(vertex)
		{
			var vertices = vertex.split(" ");
			vertices.shift();
			return vertices;
		}));
	}
	
	
}



raptorjs.mesh.prototype.parseLoadedMesh = function( url ) {

	var subMesh = raptorjs.createObject('subMesh');
	
	if(this.jsonStruture.indices) {
		this.renderType = "indexed";
	
		subMesh.indices = this.jsonStruture.indices;

		this.vertexIndexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
		
		
		if(raptorjs.extensions.elementIndexUint)
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(subMesh.indices), gl.STATIC_DRAW);
		else
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(subMesh.indices), gl.STATIC_DRAW);
		
		this.vertexIndexBuffer.itemSize = 3;
		this.vertexIndexBuffer.numItems = subMesh.indices.length;
		this.vertexIndexBuffer.data = subMesh.indices;
	} else {
		this.renderType = "array";
	}
	
	subMesh.vertices = this.jsonStruture.positions;
	
	this.vertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(subMesh.vertices), gl.STATIC_DRAW);
	this.vertexPositionBuffer.itemSize = 3;
	this.vertexPositionBuffer.numItems = subMesh.vertices.length / 3;
	this.vertexPositionBuffer.data = subMesh.vertices;
	
	if(this.jsonStruture.uv) {
	
		subMesh.textcoords = this.jsonStruture.uv;
		
		this.textureCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(subMesh.textcoords), gl.STATIC_DRAW);
		this.textureCoordBuffer.itemSize = 2;
		this.textureCoordBuffer.numItems = subMesh.textcoords.length / 2;
		this.textureCoordBuffer.data = subMesh.textcoords;
		
	}
	
	if(this.jsonStruture.normals) {
	
		subMesh.normals = this.jsonStruture.normals;
	
		this.vertexNormalBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(subMesh.normals), gl.STATIC_DRAW);
		this.vertexNormalBuffer.itemSize = 3;
		this.vertexNormalBuffer.numItems = subMesh.normals.length / 3;
		this.vertexNormalBuffer.data = subMesh.normals;
	
	}

	this.subMeshes.push(subMesh);
}


raptorjs.mesh.prototype.addBoneWeights = function( boneIndices, boneWeights, bones ) {
	this.boneWeightBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.boneWeightBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatten(boneWeights)), gl.STATIC_DRAW);
	this.boneWeightBuffer.itemSize = 4;
	this.boneWeightBuffer.numItems = boneWeights.length;
	this.boneWeightBuffer.data = boneWeights;
	
	this.boneIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.boneIndexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatten(boneIndices)), gl.STATIC_DRAW);
	this.boneIndexBuffer.itemSize = 4;
	this.boneIndexBuffer.numItems = boneIndices.length;
	this.boneIndexBuffer.data = boneIndices;
	
	this.bones = bones;
}


raptorjs.mesh.prototype.createMeshFromArrays = function( indices, vertices, normals, uvs, tangents, bitangents ) {

	//todo: loop trough sub meshes
	var subMesh = raptorjs.createObject('subMesh');
	
	if(indices) {
		this.renderType = "indexed";
	
		subMesh.indices = indices;

		this.vertexIndexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
		
		if(raptorjs.extensions.elementIndexUint)
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, subMesh.indices, gl.STATIC_DRAW);
		else
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(subMesh.indices), gl.STATIC_DRAW);
		
			
		this.vertexIndexBuffer.itemSize = 3;
		this.vertexIndexBuffer.numItems = subMesh.indices.length;
		this.vertexIndexBuffer.data = indices;
		
	} else {
		this.renderType = "array";
	}
	
	subMesh.vertices = vertices;
	
	this.vertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
	this.vertexPositionBuffer.itemSize = 3;
	this.vertexPositionBuffer.numItems = vertices.length / 3;
	this.vertexPositionBuffer.data = vertices;

	if(tangents) {
		subMesh.tangents = tangents;
		
		this.tangentBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.tangentBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tangents), gl.STATIC_DRAW);
		this.tangentBuffer.itemSize = 3;
		this.tangentBuffer.numItems = tangents.length / 3;
		this.tangentBuffer.data = tangents;
	}
	
	if(bitangents) {
		this.bitangentBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.bitangentBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bitangents), gl.STATIC_DRAW);
		this.bitangentBuffer.itemSize = 3;
		this.bitangentBuffer.numItems = bitangents.length / 3;
		this.bitangentBuffer.data = bitangents;
	}
	
	if(uvs) {
		subMesh.textcoords = uvs;
		
		this.textureCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
		this.textureCoordBuffer.itemSize = 2;
		this.textureCoordBuffer.numItems = uvs.length / 2;
		this.textureCoordBuffer.data = uvs;
	}
	
	if(normals) {
		subMesh.normals = normals;
		
		this.vertexNormalBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
		this.vertexNormalBuffer.itemSize = 3;
		this.vertexNormalBuffer.numItems = normals.length / 3;
		this.vertexNormalBuffer.data = normals;
	}

	this.subMeshes.push(subMesh);
}


function writeConsole(content) {
 top.consoleRef=window.open('','myconsole',
  'width=350,height=250'
   +',menubar=0'
   +',toolbar=1'
   +',status=0'
   +',scrollbars=1'
   +',resizable=1')
 top.consoleRef.document.writeln(
  '<html><head><title>Console</title></head>'
   +'<body bgcolor=white onLoad="self.focus()">'
   +content
   +'</body></html>'
 )
 top.consoleRef.document.close()
}
raptorjs.mesh.prototype.showTangent = function( subMesh ) {


	writeConsole( this.fileName + ' Tangent ' + JSON.stringify(this.tangentBuffer.data) );
}
raptorjs.mesh.prototype.showBinormal = function( subMesh ) {
	var tangentArray = this.binormalBuffer.data;
	var a = [];
	for(var c = 0; c<tangentArray.length;c++){
	
		var s = tangentArray[c];

		a[c] = parseFloat(s.toFixed(5));
	
	}


	writeConsole( this.fileName + ' binormal ' + JSON.stringify(a) );
}

raptorjs.mesh.prototype.addSubMesh = function( subMesh ) {

	this.vertexIndexBuffer = subMesh.indexBuffer;
	this.vertexPositionBuffer = subMesh.vertexBuffer;
	this.vertexNormalBuffer = subMesh.normalBuffer;
	this.textureCoordBuffer = subMesh.uvBuffer;
	this.tangentBuffer = subMesh.tangentBuffer;
	this.binormalBuffer = subMesh.binormalBuffer;
	
	this.subMeshes.push(subMesh);
}



