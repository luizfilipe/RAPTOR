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

raptorjs.sceneManager = function() {
	this.meshData = [];
	this.sceneNodes = [];

	this.skeletons = [];
}

raptorjs.sceneManager.prototype.createEntity = function( entityName, meshName ) {

}

raptorjs.sceneManager.prototype.createScene = function( sceneName, fileName ) {
	if(fileName) {
		var data = raptorjs.loadTextFileSynchronous('media/models/' + fileName);
				
		var meshData = JSON.parse(data);
		
		this.meshData.push(meshData);
		
		var materials = meshData.materials; 
		var hasText = false;
		
		for(var c = 0; c<materials.length; c++) {
			var material = materials[c];
			var properties = material.properties;
			
			for(var b = 0; b<properties.length; b++) {
				var propertie = properties[b];
				var value = propertie.value;
				
				switch(propertie.key) {
					case "$tex.file":
						var stripped1 = value.split("\\");
						var stripped2 = stripped1[stripped1.length-1].split(".")[0];
						
						raptorjs.resources.addTexture("media/textures/sponza/"+stripped2+".png", stripped2);
						
						var normalName = this.getTextureName(stripped2, "ddn");
						
						raptorjs.resources.addTexture("media/textures/sponza/"+normalName+".png", normalName);
						
						var specularName = this.getTextureName(stripped2, "spec");
						
						raptorjs.resources.addTexture("media/textures/sponza/"+specularName+".png", specularName);
						
						var opacityName = this.getTextureName(stripped2, "mask");
						
						raptorjs.resources.addTexture("media/textures/sponza/"+opacityName+".png", opacityName);
						
						hasText = true;
					break;
					default:

				}
			}
		}
		
		
		raptorjs.resources.load( this );

		raptorjs.resources.finishCallback = function( sceneManager  ) {	
		
			gl.enable(gl.DEPTH_TEST);
			gl.depthFunc(gl.LEQUAL);
		
			sceneManager.parseScene();
			
			raptorjs.system.ready = true;
			removeElementById("loadingElements");
			document.getElementById('controls').style.visibility="visible";
		}
		
		
		if(!hasText)
			raptorjs.resources.finishCallback(this);
		
	} else {
		var scene = raptorjs.createObject("sceneNode");
		
	}
}
	
raptorjs.sceneManager.prototype.parseScene = function(  ) {

	var meshData = this.meshData[0];
	var rootnode = meshData.rootnode;
	var animations = meshData.animations;
	
	console.log(meshData);
	console.log(meshData.meshes);
	
	//this.parseAnimation(animations);
	this.parseBoneChildren(rootnode, this.skeletons);
	
	console.log(rootnode);
	this.parseChildren(rootnode, meshData, this.skeletons[0]);

	
	
	/*
	if(this.skeletons[0]) {
	

	
		var rootBone = this.skeletons[0].root;
	
		raptorjs.testAnimationManager.setAnimation("combinedAnim_0");
		
		this.skeletons[0].root.inverseTransformation = raptorjs.matrix4.inverse( this.skeletons[0].root.transformation );
		this.updateBones(rootBone,rootBone.transformation);
		
		console.log(raptorjs.testAnimationManager);
		console.log(this.skeletons);
	}
*/
	console.log(meshData);
	console.log(rootnode);
}


raptorjs.sceneManager.prototype.parseAnimation = function( animations ) {

	for(var c = 0; c<animations.length;c++) {
		var animation = animations[c];
	
		var newAnimation = raptorjs.createObject("animation");
		newAnimation.name = animation.name;
		newAnimation.duration = animation.duration;
		newAnimation.tickspersecond = animation.tickspersecond;
		newAnimation.channels = animation.channels;
		
		raptorjs.testAnimationManager.addAnimation(newAnimation);
	}

}
	//type = ddm, spec, diff etc
raptorjs.sceneManager.prototype.getTextureName = function( textureName, type ) {
	var parts = textureName.split("_"); 
	
	if(parts.length > 1) {
		parts.pop();
	}
	parts.push(type); 
	
	return parts.join('_');
}


raptorjs.sceneManager.prototype.parseBoneChildren = function( parent, skeleton ) {
			
	var children = parent.children;
	 
	if(children) {
	
		for(var c = 0; c<children.length; c++) {
		
			var child = children[c];
			var meshesIds = child.meshes;
			
			child.parent = parent;
				
			if(child.children) {
				var bone = raptorjs.createObject("bone");
				
				bone.name = child.name;
				bone.transformation = raptorjs.matrix4.fromArray(child.transformation);
				
				if(parent.bone){
					bone.parent = child.parent.bone;
					bone.parent.addChild(bone);	
					
				} else {
					bone.parent = "parent";
					
					skeleton = raptorjs.createObject("skeleton");
					skeleton.root = bone;
					
					this.skeletons.push(skeleton);
				}
				
				child.bone = bone;
				
				skeleton.bones.push(bone);
					
				this.parseBoneChildren(child, skeleton);
			}
		}
	}
}

		
raptorjs.sceneManager.prototype.animateBone = function(boneAnimation, delta) {
	var positionKeys = boneAnimation.positionkeys;
	var rotationKeys = boneAnimation.rotationkeys;
	var scalingkeys = boneAnimation.scalingkeys;

	var index = floor( mod(delta / 100, rotationKeys.length / 4) );
	var rotationKey = rotationKeys[index][1];
	
	rotationKey = [rotationKey[0], rotationKey[1], rotationKey[2], rotationKey[3]];
	var rotationMatrix = raptorjs.quaternion.toMatrix(rotationKey);

	var positionKey = positionKeys[index][1];
	
	rotationMatrix[0][3] = positionKey[0];
	rotationMatrix[1][3] = positionKey[1];
	rotationMatrix[2][3] = positionKey[2];

	return  rotationMatrix;
}

mod = function(x,y){ return x % y; }

raptorjs.sceneManager.prototype.updateParent = function(boneNode, bt){
	if(boneNode.parent) {
		bt = raptorjs.matrix4.mul(boneNode.transformation, bt);
		return this.updateParent(boneNode.parent, bt);
	} else {
		return bt;
	}
}

raptorjs.sceneManager.prototype.updateBones = function(bone, parentTransform) {
/*
	var boneName = bone.name;
	var boneAnimation = raptorjs.testAnimationManager.getChannelByBoneName( boneName );

	var animationTransformation = this.animateBone(boneAnimation, raptorjs.timeNow);

	if(animationTransformation) {
		bone.transformation = animationTransformation;
		
		var globalTransformation = this.updateParent(bone, raptorjs.matrix4.identity());

		bone.finalTransformation = raptorjs.matrix4.transpose(raptorjs.matrix4.mul(globalTransformation, bone.offsetmatrix));
	} else {

	var globalTransformation = raptorjs.matrix4.mul( parentTransform,  raptorjs.matrix4.transpose(bone.transformation) );
		var globalInverseTransform = raptorjs.matrix4.inverse( this.skeletons[0].root.transformation );
		
		bone.finalTransformation = raptorjs.matrix4.mul( globalInverseTransform, raptorjs.matrix4.mul(globalTransformation, bone.offsetmatrix) );
		
		bone.finalTransformation = raptorjs.matrix4.transpose(bone.finalTransformation);
		
	}
	*/
	//this.test([animationTransformation[0][3], animationTransformation[1][3], animationTransformation[2][3]]);

	var children = bone.children;

	for(var c = 0; c<children.length; c++) {
		var child = children[c];
		
		if(child.offsetmatrix ) {
			this.updateBones(child, globalTransformation);
		}
	}
}

raptorjs.sceneManager.prototype.getParents = function( node, array ) {

	array.push(node);
		

	if(node.parent) {


		this.getParents(node.parent, array);
	} 

}

raptorjs.sceneManager.prototype.parseChildren = function( parent, meshData, skeleton ) {

	var children = parent.children;
	var meshes = meshData.meshes;
	

	
	//if element has children 
	if(children) {
	
		for(var c = 0; c<children.length; c++) {
		
			var child = children[c];
			var meshesIds = child.meshes;
			
			var meshBones = [];
			console.log(child);
			
			//if element has meshes
			if(meshesIds) {
				var mesh = meshes[meshesIds[0]];
				var bones = mesh.bones;
				
				
				var subEntity = raptorjs.createObject("subEntity");
				var meshObject = raptorjs.createObject("mesh");
					
				var vertices 	= new Float32Array( mesh.vertices );
				var tangent 	= new Float32Array( mesh.tangents );
				var bitangent 	= new Float32Array( mesh.bitangents );
				
				var normals   = new Float32Array( mesh.normals );
				var indices 	=  new Int32Array(flatten(mesh.faces));
				var materialName = mesh.materialindex;
				
				var textcoords = new Float32Array( mesh.texturecoords[0] );
				
				var weightArray1 = [];
				var weightArray2 = [];
				
				var indexArray1 = [];
				var indexArray2 = [];
				
				for(var indexId = 0; indexId<(vertices.length/3); indexId++) {
					weightArray1[indexId] = [0,0,0,0];
					weightArray2[indexId] = [0,0,0,0];
					indexArray1[indexId] = [0,0,0,0];
					indexArray2[indexId] = [0,0,0,0];
				}

				
				var materials = meshData.materials; 
				var material = raptorjs.createObject("material");
				
				var materialProperties = materials[materialName];
				var properties = materialProperties.properties;
				
				for(var b = 0; b<properties.length; b++) {
					var property = properties[b];
					var value = property.value;
				
					var key = property.key;

					switch(key) {
						case "$clr.specular":
							material.specularIntensity = value;
								console.log(value);
						break;
						
						case "$tex.file":
						
							var stripped1 = value.split("\\");// split("/").
							var stripped2 = stripped1[stripped1.length-1].split(".")[0];
						
								
							// texture
							switch(property.semantic){
								case 0:

								break;
							
								case 1:
								
									var diffuseTexture = raptorjs.resources.getTexture(stripped2);
									var diffuseSampler = raptorjs.createObject("sampler2D");
									diffuseSampler.texture = diffuseTexture;
									diffuseSampler.anisotropic = true;
						
									material.addTexture(diffuseSampler);
									
									var normalName = this.getTextureName(stripped2, 'ddn');
									var normalTexture = raptorjs.resources.getTexture(normalName);
									
									if(normalTexture) {
										var normalSampler = raptorjs.createObject("sampler2D");
										normalSampler.texture = normalTexture;
										normalSampler.anisotropic = true;
							
										material.addNormal(normalSampler);
									}
									
									
									var specName = this.getTextureName(stripped2, 'spec');
									var specTexture = raptorjs.resources.getTexture(specName);
									console.log(specTexture);
									
									if(specTexture) {
										var normalSampler = raptorjs.createObject("sampler2D");
										normalSampler.texture = specTexture;
							
										material.addSpecularMap(normalSampler);
									}
									
								break;
								
								case 2:
						
									//material.addTransparentyMap(diffuseSampler);
									
								break;
								
								case 6:
								
									material.addNormal(diffuseSampler);
									
								break;
							}
						
						break;
					}
						
							
				}

				var mesh = raptorjs.createObject('mesh');
				
				mesh.createMeshFromArrays(indices, vertices, normals, textcoords, tangent, bitangent);
				
				if(bones) {
					for(var BoneIndex = 0; BoneIndex<bones.length;BoneIndex++) {
						
						var currentBone = bones[BoneIndex];
						var weights =  currentBone.weights;
						var boneName = currentBone.name;

						var weightBuffer = new Array();
						 
						var bone = skeleton.getBoneByName(boneName);
						
						bone.offsetmatrix = raptorjs.matrix4.fromArray(currentBone.offsetmatrix);
						
						meshBones[BoneIndex] = bone;
						
						var numWeights = weights.length;
						
						for(var v = 0; v<numWeights; v++) {
							var weightInfo = weights[v];
							
							var weight = weightInfo[1];
							var vertexIndex = weightInfo[0];

							weightBuffer[vertexIndex] = [weight, BoneIndex];
							
							this.addWeight( BoneIndex, weight, indexArray1,indexArray2, weightArray1, weightArray2,vertexIndex );
						}
					}
					
					mesh.addBoneWeights(indexArray1, weightArray1, meshBones);
				} 
				
				mesh.addMaterial(material);

				var entity = raptorjs.createObject("entity");
				entity.addMesh(mesh);
				
				var nodes = [];
				
				this.getParents(child, nodes);
				
				var nodesO = nodes.reverse();
				
				var transform = raptorjs.matrix4.identity();
				
				for(var v = 1; v<nodesO.length; v++) {
					var currentParent = nodesO[v];
					var parentTransform = raptorjs.matrix4.fromArray(currentParent.transformation);
					
					transform = raptorjs.matrix4.mul(transform, parentTransform);
				
				}
				
				console.log(nodes);
				
				if(child.transformation)
					entity.transform.world = transform;
					
					
					
				raptorjs.scene.addEntity( entity );
			}
		}
	}
}

raptorjs.sceneManager.prototype.addWeight = function( boneIndex, weight, indexArray1,indexArray2, weightArray1, weightArray2, vertexIndex ) {
	for(var b=0;b<4;b++) {

		if(weightArray1[vertexIndex][b] == 0) {
			indexArray1[vertexIndex][b] = boneIndex;
			weightArray1[vertexIndex][b] = weight;
			return;
		}

		
	}
}

var flatten = function flatten(arr) {
  return arr.reduce(function (flat, toFlatten) {
	// See if this index is an array that itself needs to be flattened.
	if (toFlatten.some(Array.isArray)) {
	  return flat.concat(flatten(toFlatten));
	// Otherwise just add the current index to the end of the flattened array.
	} else {
	  return flat.concat(toFlatten);
	}
  }, []);
};	