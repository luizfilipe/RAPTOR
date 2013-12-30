	/*
		
		var mtllibCallback = function(a){
			console.log(a);
		}
		
		var vertices = [];
		var normals = [];
		var uvs = [];

        // v float float float

        var vertex_pattern = /v( +[\d|\.|\+|\-|e]+)( [\d|\.|\+|\-|e]+)( [\d|\.|\+|\-|e]+)/;

		// vn float float float

        var normal_pattern = /vn( +[\d|\.|\+|\-|e]+)( [\d|\.|\+|\-|e]+)( [\d|\.|\+|\-|e]+)/;

		// vt float float

        var uv_pattern = /vt( +[\d|\.|\+|\-|e]+)( [\d|\.|\+|\-|e]+)/;

		// f vertex vertex vertex ...

        var face_pattern1 = /f( +[\d]+)( [\d]+)( [\d]+)( [\d]+)?/;

		// f vertex/uv vertex/uv vertex/uv ...

        var face_pattern2 = /f( +([\d]+)\/([\d]+))( ([\d]+)\/([\d]+))( ([\d]+)\/([\d]+))( ([\d]+)\/([\d]+))?/;

		// f vertex/uv/normal vertex/uv/normal vertex/uv/normal ...

        var face_pattern3 = /f( +([\d]+)\/([\d]+)\/([\d]+))( ([\d]+)\/([\d]+)\/([\d]+))( ([\d]+)\/([\d]+)\/([\d]+))( ([\d]+)\/([\d]+)\/([\d]+))?/;

		// f vertex//normal vertex//normal vertex//normal ...

        var face_pattern4 = /f( +([\d]+)\/\/([\d]+))( ([\d]+)\/\/([\d]+))( ([\d]+)\/\/([\d]+))( ([\d]+)\/\/([\d]+))?/;


		
		var geometry = raptorjs.createObject('geometry');
        geometry.vertices = vertices;

		var cur_mesh = {
            material: {}, //new THREE.MeshLambertMaterial()
            geometry: geometry
        };
		
		var meshes = [];
		
		var vector = raptorjs.vector3;
		var uv =  raptorjs.vector2;
        var lines = data.split( "\n" );

        for ( var i = 0; i < lines.length; i ++ ) {

            var line = lines[ i ];
            line = line.trim();

            // temporary variable storing pattern matching result

            var result;

            if ( line.length === 0 || line.charAt( 0 ) === '#' ) {

                continue;

            } else if ( ( result = vertex_pattern.exec( line ) ) !== null ) {

                // ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

                vertices.push( vector(
                    parseFloat( result[ 1 ] ),
                    parseFloat( result[ 2 ] ),
                    parseFloat( result[ 3 ] )
                ) );

            } else if ( ( result = normal_pattern.exec( line ) ) !== null ) {

				// ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

				normals.push( vector(
                    parseFloat( result[ 1 ] ),
                    parseFloat( result[ 2 ] ),
                    parseFloat( result[ 3 ] )
                ) );

            } else if ( ( result = uv_pattern.exec( line ) ) !== null ) {

                // ["vt 0.1 0.2", "0.1", "0.2"]

                uvs.push( uv(
                    parseFloat( result[ 1 ] ),
                    parseFloat( result[ 2 ] )
                ) );

            } else if ( ( result = face_pattern1.exec( line ) ) !== null ) {

                // ["f 1 2 3", "1", "2", "3", undefined]

                if ( result[ 4 ] === undefined ) {

                    geometry.faces.push( face3(
                        parseInt( result[ 1 ] ) - 1,
                        parseInt( result[ 2 ] ) - 1,
                        parseInt( result[ 3 ] ) - 1
                    ) );

                } else {

                    geometry.faces.push( face4(
                        parseInt( result[ 1 ] ) - 1,
                        parseInt( result[ 2 ] ) - 1,
                        parseInt( result[ 3 ] ) - 1,
                        parseInt( result[ 4 ] ) - 1
                    ) );

                }

            } else if ( ( result = face_pattern2.exec( line ) ) !== null ) {

                // ["f 1/1 2/2 3/3", " 1/1", "1", "1", " 2/2", "2", "2", " 3/3", "3", "3", undefined, undefined, undefined]

                if ( result[ 10 ] === undefined ) {

                    geometry.faces.push( face3(
                        parseInt( result[ 2 ] ) - 1,
                        parseInt( result[ 5 ] ) - 1,
                        parseInt( result[ 8 ] ) - 1
                    ) );

					if(!geometry.faceVertexUvs[0])
						geometry.faceVertexUvs[0] = [];
					
                    geometry.faceVertexUvs[ 0 ].push( [
                        uvs[ parseInt( result[ 3 ] ) - 1 ],
                        uvs[ parseInt( result[ 6 ] ) - 1 ],
                        uvs[ parseInt( result[ 9 ] ) - 1 ]
                    ] );

                } else {

                    geometry.faces.push( face4(
                        parseInt( result[ 2 ] ) - 1,
                        parseInt( result[ 5 ] ) - 1,
                        parseInt( result[ 8 ] ) - 1,
                        parseInt( result[ 11 ] ) - 1
                    ) );
					
					if(!geometry.faceVertexUvs[0])
						geometry.faceVertexUvs[0] = [];
					
                    geometry.faceVertexUvs[ 0 ].push( [
                        uvs[ parseInt( result[ 3 ] ) - 1 ],
                        uvs[ parseInt( result[ 6 ] ) - 1 ],
                        uvs[ parseInt( result[ 9 ] ) - 1 ],
                        uvs[ parseInt( result[ 12 ] ) - 1 ]
                    ] );

                }

            } else if ( ( result = face_pattern3.exec( line ) ) !== null ) {

                // ["f 1/1/1 2/2/2 3/3/3", " 1/1/1", "1", "1", "1", " 2/2/2", "2", "2", "2", " 3/3/3", "3", "3", "3", undefined, undefined, undefined, undefined]

                if ( result[ 13 ] === undefined ) {

                    geometry.faces.push( face3(
                        parseInt( result[ 2 ] ) - 1,
                        parseInt( result[ 6 ] ) - 1,
                        parseInt( result[ 10 ] ) - 1,
                        [
                            normals[ parseInt( result[ 4 ] ) - 1 ],
                            normals[ parseInt( result[ 8 ] ) - 1 ],
                            normals[ parseInt( result[ 12 ] ) - 1 ]
                        ]
                    ) );
					
				if(!geometry.faceVertexUvs[0])
						geometry.faceVertexUvs[0] = [];

                    geometry.faceVertexUvs[ 0 ].push( [
                        uvs[ parseInt( result[ 3 ] ) - 1 ],
                        uvs[ parseInt( result[ 7 ] ) - 1 ],
                        uvs[ parseInt( result[ 11 ] ) - 1 ]
                    ] );

                } else {

                    geometry.faces.push( face4(
                        parseInt( result[ 2 ] ) - 1,
                        parseInt( result[ 6 ] ) - 1,
                        parseInt( result[ 10 ] ) - 1,
                        parseInt( result[ 14 ] ) - 1,
                        [
                            normals[ parseInt( result[ 4 ] ) - 1 ],
                            normals[ parseInt( result[ 8 ] ) - 1 ],
                            normals[ parseInt( result[ 12 ] ) - 1 ],
                            normals[ parseInt( result[ 16 ] ) - 1 ]
                        ]
                    ) );
					
				if(!geometry.faceVertexUvs[0])
						geometry.faceVertexUvs[0] = [];

                    geometry.faceVertexUvs[ 0 ].push( [
                        uvs[ parseInt( result[ 3 ] ) - 1 ],
                        uvs[ parseInt( result[ 7 ] ) - 1 ],
                        uvs[ parseInt( result[ 11 ] ) - 1 ],
                        uvs[ parseInt( result[ 15 ] ) - 1 ]
                    ] );

                }

            } else if ( ( result = face_pattern4.exec( line ) ) !== null ) {

                // ["f 1//1 2//2 3//3", " 1//1", "1", "1", " 2//2", "2", "2", " 3//3", "3", "3", undefined, undefined, undefined]

                if ( result[ 10 ] === undefined ) {

                    geometry.faces.push( face3(
                        parseInt( result[ 2 ] ) - 1,
                        parseInt( result[ 5 ] ) - 1,
                        parseInt( result[ 8 ] ) - 1,
                        [
                            normals[ parseInt( result[ 3 ] ) - 1 ],
                            normals[ parseInt( result[ 6 ] ) - 1 ],
                            normals[ parseInt( result[ 9 ] ) - 1 ]
                        ]
                    ) );

                } else {

                    geometry.faces.push( face4(
                        parseInt( result[ 2 ] ) - 1,
                        parseInt( result[ 5 ] ) - 1,
                        parseInt( result[ 8 ] ) - 1,
                        parseInt( result[ 11 ] ) - 1,
                        [
                            normals[ parseInt( result[ 3 ] ) - 1 ],
                            normals[ parseInt( result[ 6 ] ) - 1 ],
                            normals[ parseInt( result[ 9 ] ) - 1 ],
                            normals[ parseInt( result[ 12 ] ) - 1 ]
                        ]
                    ) );

                }

            } else if ( line.startsWith( "usemtl " ) ) {

                var material_name = line.substring( 7 );
                material_name = material_name.trim();

                var material = {};//new THREE.MeshLambertMaterial()
                material.name = material_name;

                if ( geometry.faces.length > 0 ) {

                    // Finalize previous geometry and add to model

                   // finalize_mesh( final_model, cur_mesh );
				   
                    geometry = raptorjs.createObject('geometry');
                    geometry.vertices = vertices;
					geometry.material = material_name;

                    cur_mesh = {  geometry: geometry };
					
					meshes.push( geometry );
					
					console.log( geometry );
                }

                cur_mesh.material = material;
                //material_index = materialsCreator.getIndex( material_name );

            } else if ( line.startsWith( "g " ) ) {

                // Polygon group for object

                var group_name = line.substring( 2 );
                group_name = group_name.trim();

            } else if ( line.startsWith( "o " ) ) {

                // Object
                var object_name = line.substring(2);
                //object_name = $.trim(object_name);
            } else if (line.startsWith("s ")) {
                // Smooth shading
            } else if (line.startsWith("mtllib ")) {
                // mtl file
                if (mtllibCallback) {
                    var mtlfile = line.substring(7);
                    mtlfile = $.trim(mtlfile);
                    mtllibCallback(mtlfile);
                }
            } else {
                console.error("Unhandled line " + line);
            }
        }
		
		var indices = [];
		var vertexArray = [];
		var uvArray = [];
		var normalArray = [];
		
		
		
		var vertexCounter = 0;
		var uv = geometry.faceVertexUvs[0];
		
		for(var c = 0; c<meshes.length; c++) {
		
			var geometry = meshes[c];
			var faces = geometry.faces;
			
			//for(var i = 0; i<faces.length; i++) {
			//	normalArray.push(1,1,1);
			//}
			
			for(var i = 0; i<faces.length; i++) {
				indices.push(1,1,1);
			}
			
			var index = 0;
			
			for(var i = 0; i<faces.length; i++) {

				var currentFace = faces[i];
				
				

				var index1 = vertexCounter++;
				var index2 = vertexCounter++;
				var index3 = vertexCounter++;
				
				
				indices[index1] = currentFace.a;
				indices[index2] = currentFace.b;
				indices[index3] = currentFace.c;

				
				
				// vertex
				
				
				var sum = raptorjs.vector3(0,0,0);
				
				sum = raptorjs.vector3.add(sum, vertices[ currentFace.a ] );
				sum = raptorjs.vector3.add(sum, vertices[ currentFace.b ] );
				sum = raptorjs.vector3.add(sum, vertices[ currentFace.c ] );
				
				sum = raptorjs.vector3.div(sum, 3);
				
				

				var faceId = index++;
	
				if(!geometry.faceVertexUvs) {
					geometry.faceVertexUvs = [];

				}
				
				if(!geometry.faceVertexUvs[0]) {
					geometry.faceVertexUvs[0] = [];
				}
				
				var faceUVS = geometry.faceVertexUvs[0][index++];
				
				if(!faceUVS) {
					faceUVS = [[1,1,1], [1,1,1], [1,1,1]];
				
				}


				var vertexA = vertices[index1];
				var vertexB = vertices[index2];
				var vertexC = vertices[index3];

				vertexArray[index1] = vertexA;
				vertexArray[index2] = vertexB;
				vertexArray[index3] = vertexC;


				uvArray[index1] = ( faceUVS[0] );
				uvArray[index2] = ( faceUVS[1] );
				uvArray[index3] = ( faceUVS[2] );

				// normal
				vA = vertices[currentFace.a];
				vB = vertices[currentFace.b];
				vC = vertices[currentFace.c];
				
				if(!vA || !vB || !vC)
					var vA = [1,1,1], vB = [1,1,1], vC = [1,1,1];
				
				cb = raptorjs.vector3.sub( vC, vB );
				ab = raptorjs.vector3.sub( vA, vB );
				cb = raptorjs.vector3.cross( ab, cb );
				
				cb = raptorjs.vector3.normalize(cb);
				
	
				normalArray[index1] = ( cb	);
				normalArray[index2] = ( cb	);
				normalArray[index3] = ( cb	);
				


				
				// uv

			}
		}
		
		//for(var c = 0; c<vertices.length; c++) {
		//		vertexArray.push(vertices[c][0], vertices[c][1], vertices[c][2]);
		//}
		
		console.log( vertexArray.length, uvArray.length, normalArray.length, indices.length );
		console.log( vertexArray, uvArray, indices, normalArray );
		
	
		var normalTexture = raptorjs.resources.getTexture("spnza_bricks_a_diff");
		var normalSampler = raptorjs.createObject("sampler2D");
		normalSampler.texture = normalTexture;
		normalSampler.anisotropic = 16;
		
		var material = raptorjs.createObject("material");
		material.addTexture(normalSampler);

		var mesh = raptorjs.createObject("mesh");
		mesh.createMeshFromArrays(indices, vertexArray, normalArray, uvArray);
		mesh.addMaterial(material);

		var entity = raptorjs.createObject("entity");
		entity.addMesh(mesh);
	
		raptorjs.scene.addEntity( entity );
		
		*/