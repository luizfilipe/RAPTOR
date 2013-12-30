/*
 * Copyright 2013, Raptorcode Studios Inc, 
 * Author, Kaj Dijkstra.
 * All rights reserved.
 *
 */

 
/**
 * primitive object
**/
raptorjs.primitives = function() {

};


/**
 * Create plane
 * @param {(int)} width
 * @param {(int)} depth
 * @param {(int)} subdivisionsDepth
 * @param {(int)} subdivisionsWidth
 * @param {(string)} type (triangleFan, triangleStrip)
 * @param {(int)} index_type
**/
raptorjs.primitives.createPlane = function(width, depth, subdivisionsDepth, subdivisionsWidth, type, index_type) {
	var vertices = [];
	var indices = [];
	var normals = [];
	var textcoords = [];

	var subMesh = raptorjs.createObject('subMesh');
	
	switch(type) {
		case "triangleFan":
			subMesh.vertices = raptorjs.primitives.getVertices(subdivisionsDepth, subdivisionsWidth);
			subMesh.indices = raptorjs.primitives.getIndices(subdivisionsDepth, subdivisionsWidth);
			subMesh.textcoords = raptorjs.primitives.getTextCoord(subdivisionsDepth, subdivisionsWidth);
		break;
		case "triangleStrip":
			subMesh.vertices = raptorjs.primitives.createPlaneTriangleStripVerts(subdivisionsDepth, subdivisionsWidth, width, depth, index_type);
			subMesh.indices = raptorjs.primitives.createPlaneTriangleStripIndices(subdivisionsDepth, subdivisionsWidth, index_type);
			subMesh.textcoords = raptorjs.primitives.createPlaneTriangleStripTextCoords(subdivisionsDepth, subdivisionsWidth);
		break;
		default:
		
				for (var z = 0; z <= subdivisionsDepth; z++) {
					for (var x = 0; x <= subdivisionsWidth; x++) {
					
						var u = x / subdivisionsWidth;
						var v = z / subdivisionsDepth;

						var vertex = raptorjs.vector3(	width * u - width * 0.5,
														0,
														depth * v - depth * 0.5);
									
						var normal = raptorjs.vector3(0, 1, 0);
						var textCoord = raptorjs.vector2(u , (1 - v ));
						
						vertices = vertices.concat(vertex);
						normals = normals.concat(normal);
						textcoords = textcoords.concat(textCoord);
					}
				}
				
				var numVertsAcross = subdivisionsWidth + 1;

				for (var z = 0; z < subdivisionsDepth; z++) {
					for (var x = 0; x < subdivisionsWidth; x++) {
						// triangle 1 of quad
						var triangle1 = raptorjs.vector3(	(z + 0) * numVertsAcross + x,
															(z + 1) * numVertsAcross + x,
															(z + 0) * numVertsAcross + x + 1 );

						// triangle 2 of quad
						var triangle2 = raptorjs.vector3(	(z + 1) * numVertsAcross + x,
															(z + 1) * numVertsAcross + x + 1,
															(z + 0) * numVertsAcross + x + 1 );
															
						indices = indices.concat(triangle1);
						indices = indices.concat(triangle2);
					}
				}
	
	
			subMesh.indices = indices;
			subMesh.vertices = vertices;
			subMesh.textcoords = textcoords;
			subMesh.normals = normals;
	}
	
	return this.createMesh(subMesh.indices, subMesh.vertices, subMesh.textcoords, subMesh.normals);
}


/**
 * Create Sphere
 * @param {(int)} radius
 * @param {(int)} subdivisionsHeight
 * @param {(int)} subdivisionsAxis
**/
raptorjs.primitives.createSphere = function(radius, subdivisionsHeight, subdivisionsAxis) {
	var latitudeBands = subdivisionsHeight;
	var longitudeBands = subdivisionsAxis;

	var vertexPositionBuffer;
	var vertexNormalBuffer;
	var vertexTextureCoordBuffer;
	var vertexIndexBuffer;


	var vertexPositionData = [];
	var normalData = [];
	var textureCoordData = [];
	
	for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
		var theta = latNumber * Math.PI / latitudeBands;
		var sinTheta = Math.sin(theta);
		var cosTheta = Math.cos(theta);

		for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
			var phi = longNumber * 2 * Math.PI / longitudeBands;
			var sinPhi = Math.sin(phi);
			var cosPhi = Math.cos(phi);

			var x = cosPhi * sinTheta;
			var y = cosTheta;
			var z = sinPhi * sinTheta;
			var u = 1- (longNumber / longitudeBands);
			var v = latNumber / latitudeBands;

			normalData.push(x);
			normalData.push(y);
			normalData.push(z);
			textureCoordData.push(u);
			textureCoordData.push(v);
			vertexPositionData.push(radius * x);
			vertexPositionData.push(radius * y);
			vertexPositionData.push(radius * z);
		}
	}

	var indexData = [];
	
	for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
		for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
		  var first = (latNumber * (longitudeBands + 1)) + longNumber;
		  var second = first + longitudeBands + 1;
		  indexData.push(first);
		  indexData.push(second);
		  indexData.push(first + 1);

		  indexData.push(second);
		  indexData.push(second + 1);
		  indexData.push(first + 1);
		}
	}

	return this.createMesh(indexData, vertexPositionData, textureCoordData, normalData);
}


/**
 * Create mesh
 * @param {(array)} indexData
 * @param {(array)} vertexPositionData
 * @param {(array)} textureCoordData
 * @param {(array)} normalData
**/
raptorjs.primitives.createMesh = function(indexData, vertexPositionData, textureCoordData, normalData) {
	mesh = {};
	
	if(normalData) {
		vertexNormalBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
		vertexNormalBuffer.itemSize = 3;
		vertexNormalBuffer.numItems = normalData.length / 3;
		vertexNormalBuffer.data = normalData;
		mesh.normalBuffer = vertexNormalBuffer;
	}
	
	if(textureCoordData) {
		vertexTextureCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexTextureCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
		vertexTextureCoordBuffer.itemSize = 2;
		vertexTextureCoordBuffer.numItems = textureCoordData.length / 2;
		vertexTextureCoordBuffer.data = textureCoordData;
		
		mesh.uvBuffer = vertexTextureCoordBuffer;
	}
	
	
	vertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
	vertexPositionBuffer.itemSize = 3;
	vertexPositionBuffer.numItems = vertexPositionData.length / 3;
	vertexPositionBuffer.data = vertexPositionData;

	vertexIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);

	if(raptorjs.extensions.elementIndexUint)
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indexData), gl.STATIC_DRAW);
	else
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
	
	vertexIndexBuffer.itemSize = 1;
	vertexIndexBuffer.numItems = indexData.length;
	vertexIndexBuffer.data = indexData;
	
	if(normalData) {
		var bn = this.createTangentsAndBinormals( vertexPositionBuffer,
												  vertexNormalBuffer,
												  vertexTextureCoordBuffer,
												  vertexIndexBuffer);

		var binormalArray = layoutArray(bn.binormal);										  
		binormalBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, binormalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(binormalArray), gl.STATIC_DRAW);
		binormalBuffer.itemSize = 3;
		binormalBuffer.numItems = binormalArray.length / 3;
		binormalBuffer.data = binormalArray;
		  
		var tangentArray = layoutArray(bn.tangent);	
		tangentBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, tangentBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tangentArray), gl.STATIC_DRAW);
		tangentBuffer.itemSize = 3;
		tangentBuffer.numItems = tangentArray.length / 3;
		tangentBuffer.data = tangentArray;
		
		mesh.binormalBuffer = binormalBuffer;
		mesh.tangentBuffer = tangentBuffer;
	}
	
	mesh.vertexBuffer = vertexPositionBuffer;
	mesh.indexBuffer = vertexIndexBuffer;

	return mesh;
}


/**
 * lay out array
 * @param {(array)} array
 * @param {(string)} output
**/
function layoutArray(array) {
	
	var out = [];
	
	for(var c = 0; c<array.length; c++) {
		var a = array[c];
		
		if(a)
			for(var g = 0; g<a.length; g++) {
			
				out.push(a[g]);
			}
	}

	return out;
}


/**
 * Get element
 * @param {(array)} buffer
 * @param {(int)} vertexIndex
 * @return {(array)} out
**/
function getElement(buffer, vertexIndex) {
	var startId = buffer.itemSize * vertexIndex;
	var out = [];
	
	for(var c = 0; c<buffer.itemSize; c++) {
		out.push(buffer.data[c+startId]);
	}

	return out;
}


/**
 * Create Tangent and Binormal vectors
 * @param {(array)} positionArray
 * @param {(array)} normalArray
 * @param {(array)} normalMapUVArray
 * @param {(array)} triangles
 * @return {(array)} primitive object
**/
raptorjs.primitives.createTangentsAndBinormals = function( positionArray, normalArray, normalMapUVArray, triangles) {

	// Maps from position, normal key to tangent and binormal matrix.
	var tangentFrames = {};

	// Rounds a vector to integer components.
	function roundVector(v) {
		return [Math.round(v[0]), Math.round(v[1]), Math.round(v[2])];
	}

	// Generates a key for the tangentFrames map from a position and normal
	// vector. Rounds position and normal to allow some tolerance.
	function tangentFrameKey(position, normal) {
	return roundVector(raptorjs.vector3.scale(position, 100)) + ',' +
		roundVector(raptorjs.vector3.scale(normal, 100));
	}

	// Accumulates into the tangent and binormal matrix at the approximate
	// position and normal.
	function addTangentFrame(position, normal, tangent, binormal) {
		var key = tangentFrameKey(position, normal);
		var frame = tangentFrames[key];
		if (!frame) {
			frame = [[0, 0, 0], [0, 0, 0]];
		}
		frame[0] = raptorjs.vector3.add(frame[0], tangent);
		frame[1] = raptorjs.vector3.add(frame[1], binormal);
		tangentFrames[key] = frame;
	}

	// Get the tangent and binormal matrix at the approximate position and
	// normal.
	function getTangentFrame(position, normal) {
		var key = tangentFrameKey(position, normal);
		return tangentFrames[key];
	}

	var numTriangles = triangles.numItems;
	for (var triangleIndex = 0; triangleIndex < numTriangles; ++triangleIndex) {
		
		// Get the vertex indices, uvs and positions for the triangle.
		var vertexIndices = getElement(triangles, triangleIndex);
		var uvs = [];
		var positions = [];
		var normals = [];
		
		for (var i = 0; i < 3; ++i) {
			var vertexIndex = vertexIndices[i];
			uvs[i] = getElement(normalMapUVArray, vertexIndex);
			positions[i] = getElement(positionArray,vertexIndex);
			normals[i] = getElement(normalArray,vertexIndex);
		}

		// Calculate the tangent and binormal for the triangle using method
		// described in Maya documentation appendix A: tangent and binormal
		// vectors.
		var tangent = [0, 0, 0];
		var binormal = [0, 0, 0];
		for (var axis = 0; axis < 3; ++axis) {
		  var edge1 = [positions[1][axis] - positions[0][axis],
					   uvs[1][0] - uvs[0][0], uvs[1][1] - uvs[0][1]];
		  var edge2 = [positions[2][axis] - positions[0][axis],
					   uvs[2][0] - uvs[0][0], uvs[2][1] - uvs[0][1]];
		  var edgeCross = raptorjs.vector3.normalize(raptorjs.vector3.cross(edge1, edge2));
		  if (edgeCross[0] == 0) {
			edgeCross[0] = 1;
		  }
		  tangent[axis] = -edgeCross[1] / edgeCross[0];
		  binormal[axis] = -edgeCross[2] / edgeCross[0];
		}

		// Normalize the tangent and binornmal.
		var tangentLength = raptorjs.vector3.size(tangent);
		if (tangentLength > 0.00001) {
		  tangent = raptorjs.vector3.scale(tangent, 1 / tangentLength);
		}
		var binormalLength = raptorjs.vector3.size(binormal);
		if (binormalLength > 0.00001) {
		  binormal = raptorjs.vector3.scale(binormal, 1 / binormalLength);
		}

		// Accumulate the tangent and binormal into the tangent frame map.
		for (var i = 0; i < 3; ++i) {
		  addTangentFrame(positions[i], normals[i], tangent, binormal);
		}
	}

	// Add the tangent and binormal streams.
	var numVertices = positionArray.numItems;
	var tangents = [];
	var binormals = [];

	// Extract the tangent and binormal for each vertex.
	for (var vertexIndex = 0; vertexIndex < numVertices; ++vertexIndex) {
		var position = getElement(positionArray,vertexIndex);
		var normal = getElement(normalArray, vertexIndex);
		var frame = getTangentFrame(position, normal);

		// Orthonormalize the tangent with respect to the normal.
		var tangent = frame[0];
		tangent = raptorjs.vector3.sub(
			tangent, raptorjs.vector3.scale(normal, raptorjs.vector3.dot(normal, tangent)));
		var tangentLength = raptorjs.vector3.size(tangent);
		if (tangentLength > 0.00001) {
			tangent = raptorjs.vector3.scale(tangent, 1 / tangentLength);
		}

		// Orthonormalize the binormal with respect to the normal and the tangent.
		var binormal = frame[1];
		binormal = raptorjs.vector3.sub(
			binormal, raptorjs.vector3.scale(tangent, raptorjs.vector3.dot(tangent, binormal)));
		binormal = raptorjs.vector3.sub(
			binormal, raptorjs.vector3.scale(normal, raptorjs.vector3.dot(normal, binormal)));
		var binormalLength = raptorjs.vector3.size(binormal);
		
		if (binormalLength > 0.00001) {
			binormal = raptorjs.vector3.scale(binormal, 1 / binormalLength);
		}

		tangents.push(tangent);
		binormals.push(binormal);
	}

	return {tangent: tangents,
			binormal: binormals	};

};


/**
 * Create sky sphere
 * @param {(int)} radius
 * @param {(int)} subdivisionsHeight
 * @param {(int)} subdivisionsAxis
**/
raptorjs.primitives.createSkySphere = function(radius, subdivisionsHeight, subdivisionsAxis) {
	var positions = [];
	var normals = [];
	var texCoord = [];
	var indices = [];
	for (var y = 0; y <= subdivisionsHeight; y++) {
		for (var x = 0; x <= subdivisionsAxis; x++) {
		  // Generate a vertex based on its spherical coordinates
		  var u = x / subdivisionsAxis;
		  var v = y / subdivisionsHeight;
		  var theta = 2 * Math.PI * u;
		  var phi = Math.PI * v;
		  var sinTheta = Math.sin(theta);
		  var cosTheta = Math.cos(theta);
		  var sinPhi = Math.sin(phi);
		  var cosPhi = Math.cos(phi );
		  var ux = cosTheta * sinPhi;
		  var uy = cosPhi;
		  var uz = sinTheta * sinPhi;
		  positions.push(radius * ux, radius * uy, radius * uz);
		  normals.push(ux, uy, uz);
		  texCoord.push(1 - u, 1 - v);
		}
	}
	var numVertsAround = subdivisionsAxis + 1;

	for (var x = 0; x < subdivisionsAxis; x++) {
		for (var y = 0; y < subdivisionsHeight; y++) {
		  // Make triangle 1 of quad.
		  indices.push(
			  (y + 0) * numVertsAround + x,
			  (y + 0) * numVertsAround + x + 1,
			  (y + 1) * numVertsAround + x);

		  // Make triangle 2 of quad.
		  indices.push(
			  (y + 1) * numVertsAround + x,
			  (y + 0) * numVertsAround + x + 1,
			  (y + 1) * numVertsAround + x + 1);
		}
	}
	var subMesh = raptorjs.createObject('subMesh');
	
	subMesh.indices = indices;
	subMesh.vertices = positions;
	subMesh.textcoords = texCoord;
	subMesh.normals = normals;
	return subMesh;
}


/**
 * get the number of vertices
 * @param {(int)} width
 * @param {(int)} height
**/
raptorjs.primitives.getVerticesCount = function( width, height ) {
    return width * height * 3;
}


/**
 * get the number of indices
 * @param {(int)} width
 * @param {(int)} height
**/
raptorjs.primitives.getIndicesCount = function( width, height ) {
    return (width*height) + (width-1)*(height-2);
}


/**
 * get vertices
 * @param {(int)} width
 * @param {(int)} height
**/
raptorjs.primitives.getVertices = function( width, height ) {

    var vertices = [];
    var i = 0;

    for ( var row=0; row<height; row++ ) {
        for ( var col=0; col<width; col++ ) {
            vertices[i++] = col / width;
            vertices[i++] = 0.0;
            vertices[i++] = row / height;
        }
    }

    return vertices;
}


/**
 * get texture coordinates
 * @param {(int)} width
 * @param {(int)} height
**/
raptorjs.primitives.getTextCoord = function( width, height ) {
    var uv = [];
    var i = 0;
    for ( var row=0; row<height; row++ ) {
        for ( var col=0; col<width; col++ ) {
            uv[i++] = col / width;
            uv[i++] = row / height;
        }
    }

    return uv;
}


/**
 * get indices
 * @param {(int)} width
 * @param {(int)} height
**/
raptorjs.primitives.getIndices = function( width, height ) {

    indices = [];
    var i = 0;

    for ( var row=0; row<height-1; row++ ) {
        if ( (row&1)==0 ) { // even rows
            for ( var col=0; col<width; col++ ) {
                indices[i++] = col + row * width;
                indices[i++] = col + (row+1) * width;
            }
        } else { // odd rows
            for ( var col=width-1; col>0; col-- ) {
                indices[i++] = col + (row+1) * width;
                indices[i++] = col - 1 + row * width;
            }
        }
    }
    if ( (height&1) && height>2 ) {
        indices[i++] = (height-1) * width;
    }

    return indices;
}


/**
 * create plane (trianglestrip) indices
 * @param {(int)} width
 * @param {(int)} height
**/
raptorjs.primitives.createPlaneTriangleStripIndices = function(width, height){

    var indices = new Uint32Array( getIndicesCount(  width,  height )  );

    var i = 0;

    for ( var row=0; row<height-1; row++ ) {
        if ( (row&1)==0 ) { // even rows
            for ( var col=0; col<width; col++ ) {
                indices[i++] = col + row * width;
                indices[i++] = col + (row+1) * width;
            }
        } else { // odd rows
            for ( var col=width-1; col>0; col-- ) {
                indices[i++] = col + (row+1) * width;
                indices[i++] = col - 1 + + row * width;
            }
        }
    }
	
	return indices;
}


/**
 * Get the number of vertices
 * @param {(int)} width
 * @param {(int)} height
**/
function getVerticesCount(  width,  height ) {
    return width * height * 3;
}


/**
 * Get the number of indices
 * @param {(int)} width
 * @param {(int)} height
**/
function getIndicesCount(  width,  height ) {
    return (width*height) + (width-1)*(height-2);
}


/**
 * Create plane vertices (trianglestrip)
 * @param {(int)} subdivisionsDepth
 * @param {(int)} subdivisionsWidth
 * @param {(int)} width
 * @param {(int)} height
**/
raptorjs.primitives.createPlaneTriangleStripVerts = function(subdivisionsDepth, subdivisionsWidth, width, height) {

    var vertices =  new Float32Array(getVerticesCount( subdivisionsWidth, subdivisionsDepth ));
    var i = 0;

    for ( var row=0; row<subdivisionsDepth; row++ ) {
        for ( var col=0; col<subdivisionsWidth; col++ ) {
			var half = (subdivisionsDepth / 2) * 10;
            vertices[i++] = (col * 10 ) - half;
            vertices[i++] = 0.0;
            vertices[i++] = (row* 10) - half;
        }
    }

    return vertices;
	

}


/**
 * Create plane texture coordinates (Trianglestrip)
 * @param {(int)} subdivisionsWidth
 * @param {(int)} subdivisionsDepth
**/
raptorjs.primitives.createPlaneTriangleStripTextCoords = function(subdivisionsWidth, subdivisionsDepth){
	var textCoords = new Float32Array(subdivisionsWidth * subdivisionsDepth * 2);
	var index = 0;
	
    for(var y=0; y<subdivisionsDepth; y++) {
        for(var x=0; x<subdivisionsWidth; x++) {
            var u = x / subdivisionsWidth;
            var v = y / subdivisionsDepth;
 
			textCoords[index++] = u;
			textCoords[index++] = v;
        }
    }
	
	return textCoords;
}


/**
 * Create cube
 * @param {(int)} size
**/
raptorjs.primitives.createCube = function(size) {

	var vertices = [
    -size, -size,  size,  // vertex 0
     size, -size,  size,  // vertex 1
    -size,  size,  size,  // vertex 2
     size,  size,  size,  // vertex 3
    -size,  size, -size,  // vertex 4
     size,  size, -size,  // vertex 5
    -size, -size, -size,  // vertex 6
     size, -size, -size   // vertex 7
	];

	var cubeVertexIndices = [
        0, 1,
        1, 3,
        3, 2,
        2, 0,
        6, 7,
        7, 5,
        5, 4,
        4, 6,
        2, 4,
        3, 5,
        0, 6,
        1, 7
	];
	
	return this.createMesh(cubeVertexIndices, vertices);
}

