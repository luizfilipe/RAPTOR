/*
-----------------------------------------------------------------------------
This source file is part of Raptor Engine
For the latest info, see http://www.raptorEngine.com

Copyright (c) 2012-2013 Raptorcode Ltd

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
raptorjs.renderSystem = function( ) {

	this.ssaoShader;
	this.ssaoShaders = [];
	
	this.depthShader;

	this.sceneNodes = [];
	
	this.activeScene;
	this.activeCamera;
	this.ready = false;
	
	this.buffers = [];
	this.deferredBuffers = [];
	
	this.quadView = raptorjs.matrix4.lookAt([0, 0, 0], [0, -1, 0], [0, 0, -1]);
	this.quadProjection = raptorjs.matrix4.orthographic(-1, 1, -1, 1, -1, 1);
	this.quadViewProjection = raptorjs.matrix4.mul(this.quadView, this.quadProjection);

	this.splitPoints = [];
	this.mOptimalAdjustFactors;
	this.shadowMaps = [];

	this.indexType;
	
	this.ready = false;
	
	this.shadowMap;
	
	this.randomRotationSampler
	this.randomSampler;
	
	this.ssaoSampler;
	this.ssaoConvolutionX;
	this.ssaoConvolutionY;
	
	this.convolutionShaderX;
	this.convolutionShaderY;
	
	this.shadowConvolutionX;
	this.shadowConvolutionY;
	
	this.ssaoConvolutionYSampler;
	this.ssaoConvolutionXSampler;
	
	this.shadowSampler;
	this.shadowFramebuffer;
	this.shadowTexture;
	
	this.bake = false;
	this.shadowType = 'PCF'; // 'VARIANCE', PCF	
	this.antiAlias = false; // FXAA, SMAA, MSAA, false
	
	this.deferred = false; // forward = true, deferred = false
	this.useSSAO = false;
	this.ssaoOnly = false;

	this.cornerVertices = [ [-1,1,-1],[1,1,-1],  [1,-1,-1],[-1,-1,-1],  //near
						    [-1,1,1], [1,1,1],   [1,-1,1], [-1,-1,1] ];	
							
							
	this.envProbe;

}
				
raptorjs.renderSystem.prototype.setup = function(framebuffer) {		  
	this.shadowMap = raptorjs.createObject("shadowMap");
	this.shadowMap.set();
	
	
	this.envProbe = raptorjs.createObject("environmentProbe");
	this.envProbe.generateCubemap();
	
	this.createDeferredBuffers();
	this.createFramebuffers();
	this.createBuffers();
	this.createShadowMaps();
}

raptorjs.renderSystem.prototype.samplerFromFramebuffer = function(framebuffer) {
	var texture = raptorjs.createObject('texture');
	
	if(framebuffer.type == "depth")
		texture.dataType = 'depth';
	else
		texture.dataType = 'framebuffer';
		
		
	texture.data = framebuffer.texture;
	texture.width = framebuffer.width;
	texture.height = framebuffer.height;

	var sampler = raptorjs.createObject("sampler2D");
	sampler.texture = texture;
	
	return sampler;
}


raptorjs.renderSystem.prototype.getFrustumCorners = function(projection, view, world) {
	
	var viewClone = raptorjs.matrix4.copyMatrix(view);
	viewClone = raptorjs.matrix4.setTranslation(viewClone, [0,0,0]);
	
	if(world) {
		var viewProjection = raptorjs.matrix4.inverse( raptorjs.matrix4.composition(projection, viewClone) );
	} else {
		var viewProjection = raptorjs.matrix4.inverse( projection );
	}
	
	var corners = [];

	for(var c =0; c < this.cornerVertices.length;c++)
	{
		var vert = this.cornerVertices[c];
		
		vert.push(0.0);
		
		vert = raptorjs.matrix4.transformPoint(viewProjection, vert);

		corners.push(vert);
	}
	
	return corners;
};

raptorjs.renderSystem.prototype.test = function(pos) {
	var diffuseTexture = raptorjs.resources.getTexture("white");
	var diffuseSampler = raptorjs.createObject("sampler2D");
	diffuseSampler.texture = diffuseTexture;

	var material = raptorjs.createObject("material");
	material.addTexture(diffuseSampler);

	var plane = raptorjs.primitives.createSphere(2, 10, 10);
	
	var mesh = raptorjs.createObject('mesh');

	mesh.name = 'sky';
	mesh.addSubMesh(plane);
	mesh.addMaterial(material)
	
	var entity = raptorjs.createObject("entity");
	entity.transform.translate(pos[0], pos[1], pos[2]);
	entity.addMesh(mesh);

	raptorjs.scene.addEntity( entity );
}

raptorjs.renderSystem.prototype.drawQuad = function(shader, framebuffer, noUpdate) {
	var quadVertices = this.quadVertices;
	var quadIndices = this.quadIndices;
	var quadUv = this.quadUv;

	
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer );	
	gl.clearColor( 0, 0, 0, 0 );
	
	if(framebuffer == 'null')
		gl.viewport(0, 0, framebuffer.width, framebuffer.height);
		
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.useProgram( shader.program );

	if(!noUpdate)
		shader.update();

	var attribute = shader.getAttributeByName('position');
	gl.bindBuffer(gl.ARRAY_BUFFER, quadVertices);
	gl.vertexAttribPointer(attribute, quadVertices.itemSize, gl.FLOAT, false, 0, 0);

	var attribute = shader.getAttributeByName('uv');
	gl.bindBuffer(gl.ARRAY_BUFFER, quadUv);
	gl.vertexAttribPointer(attribute, quadUv.itemSize, gl.FLOAT, false, 0, 0);
	
	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, quadIndices );
	gl.drawElements( gl.TRIANGLES, quadIndices.numItems, gl.UNSIGNED_SHORT, 0 );
}


	
	raptorjs.renderSystem.prototype.materialExist = function(meshes, materialName) {
		for(var c = 0; c<meshes.length; c++) {
			if(meshes[c][0].materialName == materialName) {
				return c;
			}
		}
		
		return false;
	}
	
	var testest = 0; 
	
	raptorjs.renderSystem.prototype.updateBuffers = function( ) {
		
		var camera = raptorjs.mainCamera;

		var viewProjection = camera.worldViewProjection;
		var view = camera.view;
		
		var scene = this.activeScene;
		var entitys = scene.getEntitys();
		
		var shadowInfo = this.shadowMap;

		var shadowViewProjection = shadowInfo.viewProjection;
		
		var corners = this.getFrustumCorners( camera.projection, camera.view );
		var worldCorners = this.getFrustumCorners( camera.projection, camera.view, true );
		
		gl.enable(gl.CULL_FACE);
		
		if(raptorjs.system.ready)
		testest++;
		
		if(testest == 60) {
		
		
		
		
			var shadowFramebuffer = this.shadowFramebuffer;
			var depthShader = this.depthShader;
		
			gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFramebuffer);
			gl.viewport(0, 0, shadowFramebuffer.width, shadowFramebuffer.height);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			gl.useProgram(depthShader.program);

			depthShader.setUniform("viewProjection", shadowInfo.viewProjection );
			depthShader.setUniform("view", shadowInfo.view );

			for(var e = 0;e<entitys.length;e++) {
				var entity = entitys[e];
				var mesh = entity.mesh;

				var world = entity.getUpdatedWorldMatrix();

				depthShader.setUniform("world", world );
				depthShader.update();

				var attribute = depthShader.getAttributeByName('position');
				gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexPositionBuffer);
				gl.vertexAttribPointer(attribute, 3, gl.FLOAT, false, 0, 0);
				

				if(mesh.renderType == "indexed") {
					gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, mesh.vertexIndexBuffer);
					gl.drawElements( gl.TRIANGLES, mesh.vertexIndexBuffer.numItems, this.indexType, 0 ); 
				} else {
					gl.drawArrays(gl.TRIANGLES, 0, mesh.vertexPositionBuffer.numItems);
				}
			}
			
			if(this.shadowType == "VARIANCE") {
				
				this.drawQuad(this.convolutionShaderX, this.shadowConvolutionX );
				this.drawQuad(this.convolutionShaderY, this.shadowConvolutionY );
			
			}
		}


		//gl.frontFace(gl.CCW);
		
		var ssaoShader = this.ssaoShader;
		var colorInfoFramebuffer = this.colorInfoFramebuffer;
		var colorInfoShader = {};

		this.renderScene(scene, raptorjs.mainCamera.worldViewProjection, null);//this.envProbe.viewProjection
		
		if(this.deferred) {
		
			var ssaoShader = this.ssaoShader;
			var shaderProgram = ssaoShader.program;
			var infoFrameBuffer = this.infoFrameBuffer;
			var infoShader = this.infoShader;
			var currentShaderName;
			
			gl.useProgram(infoShader.program);
			gl.bindFramebuffer(gl.FRAMEBUFFER, infoFrameBuffer);
			gl.viewport(0, 0, infoFrameBuffer.width, infoFrameBuffer.height);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			
			for(var e = 0;e<entitys.length;e++) {
				var entity = entitys[e];
				var mesh = entity.mesh;
				var material = mesh.materials[0];
				var world = entity.getUpdatedWorldMatrix();
				
				if(mesh.shaderName != currentShaderName) {
				
					infoShader = mesh.infoShader;
					
					currentShaderName = mesh.shaderName;
						
					infoShader.setUniform("worldViewProjection", viewProjection );
					//infoShader.setUniform("view", view );
				}
				
				infoShader.setUniform("world", world );
				infoShader.update();
				
				var attribute = infoShader.getAttributeByName('position');
				gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexPositionBuffer);
				gl.vertexAttribPointer(attribute, 3, gl.FLOAT, false, 0, 0);
				
				if(material.normals.length > 0) {
					var sampler = material.normals[0];
					var normalTexture = sampler.texture;	

					var attribute = infoShader.getAttributeByName('uv');
					gl.bindBuffer(gl.ARRAY_BUFFER, mesh.textureCoordBuffer);
					gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
					
					var glTexture = normalTexture.glTexture;
					var textureUniform = infoShader.getUniformByName('normalSampler');
					gl.activeTexture( gl.TEXTURE0 );
					gl.bindTexture( gl.TEXTURE_2D, glTexture );
					gl.uniform1i(textureUniform, 0);
				}
				
				if(mesh.renderType == "indexed") {
					gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, mesh.vertexIndexBuffer);
					gl.drawElements( gl.TRIANGLES, mesh.vertexIndexBuffer.numItems, this.indexType, 0 );  
				} else {
					gl.drawArrays(gl.TRIANGLES, 0, mesh.vertexPositionBuffer.numItems);
				}
			}

			gl.disable(gl.CULL_FACE);
			gl.disable(gl.DEPTH_TEST);
			gl.disable(gl.BLEND);


			if(this.useSSAO) {
			
				// screen space ambiant occlusion
				if(this.ssaoOnly) {
					this.drawQuad(ssaoShader, this.ssaoFramebuffer  );// this.ssaoFramebuffer
					
					// ssao blur
					this.drawQuad(this.ssaoConvolutionShaderX, this.ssaoConvolutionX );
					this.drawQuad(this.ssaoConvolutionShaderY, null );
				} else {
					this.drawQuad(ssaoShader, this.ssaoFramebuffer );// this.ssaoFramebuffer
				
					// ssao blur
					this.drawQuad(this.ssaoConvolutionShaderX, this.ssaoConvolutionX );
					this.drawQuad(this.ssaoConvolutionShaderY, this.ssaoConvolutionY );
				}
			}
			

			if(!this.ssaoOnly) {
			
				
				// light accumulation
				// this.uberShader.setUniform("lightPosition", shadowInfo.eye);
				this.uberShader.setUniform("frustumWorldCorners", worldCorners);
				this.uberShader.setUniform("cameraPosition", camera.eye );
				this.uberShader.setUniform("lightViewProjection1", shadowViewProjection );
				
				gl.viewport(0, 0, raptorjs.width, raptorjs.height);
				
				//if(this.antiAlias)
				this.drawQuad(this.uberShader, null    ); //this.diffuseAcc 
				//else
				//	this.drawQuad(this.uberShader, null );
				//	this.globalIllumination.update();
				//		this.hdr.update();
			}
			
		} // end deferred
		
		
		switch(this.antiAlias) {
		
			case "FXAA":
				
				this.fxaa.update();
				
			break;
			
			case "SMAA":	// default
				
				this.smaa.update();
			
			break;
			
			case "MSAA":
				this.msaa.setMatrices(viewProjection, this.prevViewProjection);
				this.msaa.MSAAShader.setUniform("frustumWorldCorners", worldCorners);
				this.msaa.MSAAShader.setUniform("cameraPosition", camera.eye );
				this.msaa.MSAAShader.setUniform("test", camera.eye[2] );
				this.msaa.pipeline();
				

				this.drawQuad(this.prevDiffuseShader, this.prevDiffuseFramebuffer);//this.diffuseAcc
				this.prevViewProjection = viewProjection;	
			break;
			
			default: 
			
			break;
			
		}
		
		gl.flush();
	}

	raptorjs.renderSystem.prototype.renderScene = function(scene, viewProjection, framebuffer) {
		var currentShaderName;
		var camera = raptorjs.mainCamera;
		var shadowInfo = this.shadowMap;
		var entitys = scene.getEntitys();
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer );
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		raptorjs.skyInstance.update();
		
		gl.viewport(0, 0, raptorjs.width, raptorjs.height);
	
		for(var e = 0;e<entitys.length;e++) {
			var entity = entitys[e];
			var mesh = entity.mesh;
			var material = mesh.materials[0];
			var sampler = material.textures[0];

			if(material) {
			
				var color = material.color;
				var world = entity.getUpdatedWorldMatrix();
				
				if(mesh.shaderName != currentShaderName){
					colorInfoShader = mesh.colorInfoShader;
					
					currentShaderName = mesh.shaderName;

					colorInfoShader.setUniform("worldViewProjection", viewProjection );
					
					if(!this.deferred)
						colorInfoShader.setUniform("lightViewProjection1", shadowInfo.viewProjection );
					
					colorInfoShader.setUniform("lightPosition", shadowInfo.eye);
					colorInfoShader.setUniform("cameraPosition", camera.eye );
					colorInfoShader.setUniform("world", world  );
					
				}
				
				colorInfoShader.setUniform("world", world  );
				colorInfoShader.update();	
				
				var textureId = 0;
				
				if( material.textures.length > 0 ) {
				
					
					var textureSampler = material.textures[0];
					var texture = textureSampler.texture;
					var textureUniform = colorInfoShader.getUniformByName('texture');
					
					gl.activeTexture(gl.TEXTURE0 + textureSampler.id );
					gl.bindTexture( gl.TEXTURE_2D, texture.glTexture );
					gl.uniform1i(textureUniform, textureSampler.id);
					
					var attribute = colorInfoShader.getAttributeByName('uv');
					gl.bindBuffer(gl.ARRAY_BUFFER, mesh.textureCoordBuffer);
					gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
					
				}
				
				if(material.normals.length > 0) {
					
					var textureSampler = material.normals[0];
					var texture = textureSampler.texture;
					var textureUniform = colorInfoShader.getUniformByName('normalSampler');
					
					gl.activeTexture(gl.TEXTURE0  + textureSampler.id );
					gl.bindTexture( gl.TEXTURE_2D, texture.glTexture );
					gl.uniform1i(textureUniform, textureSampler.id);
					
				}
				
				
				if(material.specularMaps.length > 0) {
					
					var textureSampler = material.specularMaps[0];
					var texture = textureSampler.texture;
					var textureUniform = colorInfoShader.getUniformByName('specularMapSampler');
					
					gl.activeTexture(gl.TEXTURE0 + textureSampler.id );

					gl.bindTexture( gl.TEXTURE_2D, texture.glTexture );
					gl.uniform1i(textureUniform, textureSampler.id);
					
				}
			

				if(material.transparencyMaps.length > 0) {
					gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
					gl.enable(gl.BLEND);
					gl.disable(gl.DEPTH_TEST);
				} else  {
					gl.disable(gl.BLEND);
					gl.enable(gl.DEPTH_TEST);
				}
				
				if(material.useParallax) {
					colorInfoShader.setUniform("view", camera.view );
				}

				/*
				if(mesh.bones) {
					var attribute = colorInfoShader.getAttributeByName('boneIndices');
					gl.bindBuffer(gl.ARRAY_BUFFER, mesh.boneIndexBuffer);
					gl.vertexAttribPointer(attribute, 4, gl.FLOAT, false, 0, 0);
					
					var attribute = colorInfoShader.getAttributeByName('boneWeights');
					gl.bindBuffer(gl.ARRAY_BUFFER, mesh.boneWeightBuffer);
					gl.vertexAttribPointer(attribute, 4, gl.FLOAT, false, 0, 0);
					

					
					var bones = mesh.bones;
					var boneMatrices = [];
					
					for(var b = 0; b<bones.length; b++) {
						var bone = bones[b];
						var updatedBone = this.skeletons[0].getBoneByName(bone.name);
						
						var matrix = updatedBone.finalTransformation;
						
						boneMatrices.push(matrix);
						
					}
					
					
					colorInfoShader.setUniform("bones", boneMatrices );
		
				}
				*/
				
				var attribute = colorInfoShader.getAttributeByName('normal');
				gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexNormalBuffer);
				gl.vertexAttribPointer(attribute, 3, gl.FLOAT, false, 0, 0);

				var attribute = colorInfoShader.getAttributeByName('tangent');
				gl.bindBuffer(gl.ARRAY_BUFFER, mesh.tangentBuffer);
				gl.vertexAttribPointer(attribute, 3, gl.FLOAT, false, 0, 0);
				
				var attribute = colorInfoShader.getAttributeByName('bitangent');
				gl.bindBuffer(gl.ARRAY_BUFFER, mesh.bitangentBuffer);
				gl.vertexAttribPointer(attribute, 3, gl.FLOAT, false, 0, 0);

				var attribute = colorInfoShader.getAttributeByName('position');
				gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexPositionBuffer);
				gl.vertexAttribPointer(attribute, 3, gl.FLOAT, false, 0, 0);
				
				if(!this.ssaoOnly) {
					gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, mesh.vertexIndexBuffer);
					gl.drawElements( gl.TRIANGLES, mesh.vertexIndexBuffer.numItems, this.indexType, 0 );  
				}

			}
		}
	}

/**
 * Initialize all shaders and renderbuffers.
 */
raptorjs.renderSystem.prototype.createBuffers = function() {

	this.createShadowSurface();
	
	this.depthShader = raptorjs.createObject("shader");
	this.depthShader.definePragma("VARIANCE", (this.shadowType == "VARIANCE") ? 1 : 0 );
	this.depthShader.createFomFile("shaders/regularDepth.shader");
	this.depthShader.setUniform("far", raptorjs.mainCamera.far );
	
	var diffuseTexture = raptorjs.textureFromTypedArray(randomImage, 64, 64);
	this.randomRotationSampler = raptorjs.createObject("sampler2D");
	this.randomRotationSampler.texture = diffuseTexture;
	this.randomRotationSampler.MIN_FILTER = gl.NEAREST;
	this.randomRotationSampler.MAG_FILTER = gl.NEAREST;
	
	var diffuseTexture = raptorjs.textureFromTypedArray(randomImage2, 4, 4);
	this.randomSampler = raptorjs.createObject("sampler2D");
	this.randomSampler.texture = diffuseTexture;
	this.randomSampler.MIN_FILTER = gl.NEAREST;
	this.randomSampler.MAG_FILTER = gl.NEAREST;
	
	//scene info shader
	this.infoShader = raptorjs.createObject("shader");
	this.infoShader.definePragma("NORMAL_MAP", 0);
	this.infoShader.createFomFile("shaders/info.shader");
	// ambiantOcclusion
	// setup SSAO
	this.setupAmbiantOcclusion();
}

raptorjs.renderSystem.prototype.setupAmbiantOcclusion = function() {
	this.infoSampler 	= this.samplerFromFramebuffer(this.infoFrameBuffer);

	var vec3 = raptorjs.vector3;
	var vec4 = raptorjs.vector4;
	var radius = 0.02;
	
	var scale = [ vec3.scale( vec3(-0.556641,-0.037109,-0.654297), radius ), 
				vec3.scale( vec3(0.173828,0.111328,0.064453), radius ), 
				vec3.scale( vec3(0.001953,0.082031,-0.060547), radius ), 
				vec3.scale( vec3(0.220703,-0.359375,-0.062500), radius ), 
				vec3.scale( vec3(0.242188,0.126953,-0.250000), radius ), 
				vec3.scale( vec3(0.070313,-0.025391,0.148438), radius ), 
				vec3.scale( vec3(-0.078125,0.013672,-0.314453), radius ), 
				vec3.scale( vec3(0.117188,-0.140625,-0.199219), radius ), 
				vec3.scale( vec3(-0.251953,-0.558594,0.082031), radius ), 
				vec3.scale( vec3(0.308594,0.193359,0.324219), radius ), 
				vec3.scale( vec3(0.173828,-0.140625,0.031250), radius ), 
				vec3.scale( vec3(0.179688,-0.044922,0.046875), radius ), 
				vec3.scale( vec3(-0.146484,-0.201172,-0.029297), radius ), 
				vec3.scale( vec3(-0.300781,0.234375,0.539063), radius ), 
				vec3.scale( vec3(0.228516,0.154297,-0.119141), radius ), 
				vec3.scale( vec3(-0.119141,-0.003906,-0.066406), radius ), 
				vec3.scale( vec3(-0.218750,0.214844,-0.250000), radius ), 
				vec3.scale( vec3(0.113281,-0.091797,0.212891), radius ), 
				vec3.scale( vec3(0.105469,-0.039063,-0.019531), radius ), 
				vec3.scale( vec3(-0.705078,-0.060547,0.023438), radius ), 
				vec3.scale( vec3(0.021484,0.326172,0.115234), radius ), 
				vec3.scale( vec3(0.353516,0.208984,-0.294922), radius ), 
				vec3.scale( vec3(-0.029297,-0.259766,0.089844), radius ), 
				vec3.scale( vec3(-0.240234,0.146484,-0.068359), radius ), 
				vec3.scale( vec3(-0.296875,0.410156,-0.291016), radius ), 
				vec3.scale( vec3(0.078125,0.113281,-0.126953), radius ), 
				vec3.scale( vec3(-0.152344,-0.019531,0.142578), radius ), 
				vec3.scale( vec3(-0.214844,-0.175781,0.191406), radius ), 
				vec3.scale( vec3(0.134766,0.414063,-0.707031), radius ), 
				vec3.scale( vec3(0.291016,-0.833984,-0.183594), radius ), 
				vec3.scale( vec3(-0.058594,-0.111328,0.457031), radius ), 
				vec3.scale( vec3(-0.115234,-0.287109,-0.259766), radius ) ];
				
	var kernelRad = [[1.163003/radius,4.624262/radius,9.806342/radius,2.345541/radius], 
					[2.699039/radius,6.016871/radius,3.083554/radius,3.696197/radius], 
					[1.617461/radius,2.050939/radius,4.429457/radius,5.234036/radius], 
					[3.990876/radius,1.514475/radius,3.329241/radius,7.328508/radius], 
					[2.527725/radius,3.875453/radius,8.760140/radius,1.412308/radius], 
					[2.885205/radius,1.977866/radius,3.617674/radius,3.453552/radius], 
					[1.712336/radius,5.341163/radius,4.771728/radius,2.965737/radius], 
					[1.204293/radius,1.108428/radius,2.109570/radius,2.475453/radius] ]; 
					
	this.ssaoShaders = [];
	
	for(var c = 0; c<3; c++) {
		this.ssaoShader = raptorjs.createObject("shader");
		
		if(this.ssaoOnly) this.ssaoShader.definePragma("AMBIANT_ONLY", 1);
		
		this.ssaoShader.definePragma("SSAO_TYPE", c );
		
		this.ssaoShader.createFomFile("shaders/ambiantOcclusion.shader");
		
		this.ssaoShader.setUniform("viewProjection", this.quadViewProjection );
		this.ssaoShader.setUniform("screenWidth", raptorjs.width );
		this.ssaoShader.setUniform("screenHeight", raptorjs.height );
		this.ssaoShader.setUniform("far", raptorjs.mainCamera.far );
		this.ssaoShader.setUniform("randomSampler",  this.randomSampler);
		this.ssaoShader.setUniform("infoSampler", this.infoSampler);
		this.ssaoShader.setUniform("scale", scale );
		this.ssaoShader.setUniform("kernel", scale );
		this.ssaoShader.setUniform("kernelRad", kernelRad );
		//this.ssaoShader.setUniform("diffuseSampler", this.colorInfoSampler);
		
		this.ssaoShaders.push(this.ssaoShader);
	}
	
	this.ssaoShader = this.ssaoShaders[0];
	
	this.ssaoSampler = this.samplerFromFramebuffer(this.ssaoFramebuffer);
	this.ssaoSampler.format = gl.RGB;
	this.ssaoSampler.internalformat = gl.RGB;
	this.ssaoSampler.WRAP_S = gl.CLAMP_TO_EDGE;
	this.ssaoSampler.WRAP_T = gl.CLAMP_TO_EDGE;	
	
	this.ssaoConvolutionXSampler = this.samplerFromFramebuffer(this.ssaoConvolutionX);
	this.ssaoConvolutionXSampler.WRAP_S = gl.CLAMP_TO_EDGE;
	this.ssaoConvolutionXSampler.WRAP_T = gl.CLAMP_TO_EDGE;	
	
	this.ssaoConvolutionYSampler = this.samplerFromFramebuffer(this.ssaoConvolutionY);
	this.ssaoConvolutionYSampler.WRAP_S = gl.CLAMP_TO_EDGE;
	this.ssaoConvolutionYSampler.WRAP_T = gl.CLAMP_TO_EDGE;
	

	
	this.ssaoConvolutionShaderX = raptorjs.createObject("shader");
	this.ssaoConvolutionShaderX.createFomFile("shaders/convolution.shader");
	this.ssaoConvolutionShaderX.setUniform("viewProjection", this.quadViewProjection);
	this.ssaoConvolutionShaderX.setUniform("imageIncrement", [1 / raptorjs.width,0] );
	this.ssaoConvolutionShaderX.setUniform("image", this.ssaoSampler );
	this.ssaoConvolutionShaderX.setUniform("depthSampler", this.infoSampler);
	this.ssaoConvolutionShaderX.setUniform("far", raptorjs.mainCamera.far );

	this.ssaoConvolutionShaderY = raptorjs.createObject("shader");
	this.ssaoConvolutionShaderY.createFomFile("shaders/convolution.shader");
	this.ssaoConvolutionShaderY.setUniform("viewProjection", this.quadViewProjection );
	this.ssaoConvolutionShaderY.setUniform("imageIncrement", [0, 1 / raptorjs.height] );
	this.ssaoConvolutionShaderY.setUniform("image", this.ssaoConvolutionXSampler );
	this.ssaoConvolutionShaderY.setUniform("far", raptorjs.mainCamera.far );
	this.ssaoConvolutionShaderY.setUniform("depthSampler", this.infoSampler);
	
	

}

	raptorjs.renderSystem.prototype.createRandomSphereTexture = function( size ) {
		var width = size;
		var height = size;

		var dataArray = [];
		
		for (var y = 0; y <= width; y++) {
			for (var x = 0; x <= height; x++) {
			
				var u = Math.random();
				var v = Math.random();
				var theta = 2 * Math.PI * u;
				var phi = Math.PI * v;
				var sinTheta = Math.sin(theta);
				var cosTheta = Math.cos(theta);
				var sinPhi = Math.sin(phi);
				var cosPhi = Math.cos(phi);
				var ux = cosTheta * sinPhi;
				var uy = cosPhi;
				var uz = sinTheta * sinPhi;
				
				var randomLength = Math.random();
				
				dataArray.push(ux  , uy , uz , 1.0);
			}
		}

		
		var text = raptorjs.textureFromArray(dataArray, width, height, true);
		
		var sampler = raptorjs.createObject("sampler2D");
		sampler.texture = text;

		
		return sampler;
	}

	/**
	 * Create framebuffers.
	 */
	raptorjs.renderSystem.prototype.createFramebuffers = function () {
		this.infoFrameBuffer = this.createFrameBuffer(raptorjs.width, raptorjs.height, { type : gl.FLOAT, format: gl.RGB, internalformat: gl.RGB });
		this.reflectionFramebuffer = this.createFrameBuffer(1024, 1024);
		this.ssaoFramebuffer = this.createFrameBuffer(raptorjs.width, raptorjs.height, {  format: gl.RG, internalformat: gl.RG });
		this.ssaoConvolutionX = this.createFrameBuffer(raptorjs.width, raptorjs.height, {  format: gl.RG, internalformat: gl.RG });
		this.ssaoConvolutionY = this.createFrameBuffer(raptorjs.width, raptorjs.height,  { format: gl.RG, internalformat: gl.RG });
		
		this.shadowConvolutionX = this.createFrameBuffer(2048, 2048, {  filter : gl.LINEAR, type : gl.FLOAT, format: gl.RG, internalformat: gl.RG  });
		this.shadowConvolutionY = this.createFrameBuffer(2048, 2048, {  filter : gl.LINEAR, type : gl.FLOAT, format: gl.RG, internalformat: gl.RG  });
		
		this.shadowOcclusionFramebuffer = this.createFrameBuffer(raptorjs.width, raptorjs.height, { format: gl.RG, internalformat: gl.RG  });
		
		this.diffuseAcc = this.createFrameBuffer(raptorjs.width, raptorjs.height);
		this.colorInfoFramebuffer = this.createFrameBuffer(raptorjs.width, raptorjs.height, { });
	}

/**
 * Create texture to render the shadow depth to.
 */
raptorjs.renderSystem.prototype.createShadowSurface = function() {
	var width = 2048;
	var height = 2048;
	
	this.shadowFramebuffer = this.createFrameBuffer(width, height,  { filter : gl.LINEAR,  format: gl.RGBA, internalformat: gl.RGBA	});//, filter : gl.LINEAR  type : gl.FLOAT 
	
	this.shadowTexture = raptorjs.createObject('texture');

	this.shadowTexture.data = this.shadowFramebuffer.texture;
	this.shadowTexture.dataType = 'framebuffer';
	this.shadowTexture.width = this.shadowFramebuffer.width;
	this.shadowTexture.height = this.shadowFramebuffer.height;
	
	this.shadowSampler = raptorjs.createObject("sampler2D");
	this.shadowSampler.texture = this.shadowTexture;
	this.shadowSampler.format = gl.RGBA;
	this.shadowSampler.internalformat = gl.RGBA;
	this.shadowSampler.anisotropic = 16;
	// this.shadowSampler.MIN_FILTER = gl.NEAREST;
	// this.shadowSampler.MAG_FILTER = gl.NEAREST;
};

raptorjs.renderSystem.prototype.setScene = function(scene) {
	this.activeScene = scene;
}

raptorjs.renderSystem.prototype.createDeferredBuffers = function() {
	var plane = raptorjs.primitives.createPlane(2, 2, 1, 1);
	
	this.quadView = raptorjs.matrix4.lookAt([0, 0, 0], [0, -1, 0], [0, 0, -1]);
	this.quadProjection = raptorjs.matrix4.orthographic(-1, 1, -1, 1, -1, 1);
	this.quadViewProjection = raptorjs.matrix4.mul(this.quadView, this.quadProjection);
	
	this.quadVertices = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVertices);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(plane.vertexBuffer.data), gl.STATIC_DRAW);
	this.quadVertices.name = 'position';
	this.quadVertices.itemSize = 3;
	this.quadVertices.numItems = plane.vertexBuffer.data.length / 3;
	
	this.quadUv = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.quadUv);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(plane.uvBuffer.data), gl.STATIC_DRAW);
	this.quadUv.name = 'uv';
	this.quadUv.itemSize = 2;
	this.quadUv.numItems = plane.uvBuffer.data.length / 2;

	
	this.quadIndices = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.quadIndices);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(plane.indexBuffer.data), gl.STATIC_DRAW);
	this.quadIndices.name = 'index';
	this.quadIndices.itemSize = 1;
	this.quadIndices.numItems = plane.indexBuffer.data.length;
}

raptorjs.renderSystem.prototype.createBuffer = function( itemSize, dataArray, name, isFloatType ) {
	var buffer = gl.createBuffer();

	var dataType = (isFloat(dataArray, false))?"float":"int";
	
	if(isFloatType) {
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dataArray), gl.STATIC_DRAW);
	} else {
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(dataArray), gl.STATIC_DRAW);
	}
	
	buffer.name = name;
	buffer.itemSize = itemSize;
	buffer.numItems = dataArray.length / itemSize;
	buffer.dataType = dataType;


	return buffer;
}


raptorjs.renderSystem.prototype.initializeWebgl = function(canvas) {
	try {
	
		var width = canvas.offsetWidth;
		var height = canvas.offsetHeight;
		
		canvas.width = raptorjs.math.nextHighestPowerOfTwo(width);
		canvas.height = raptorjs.math.nextHighestPowerOfTwo(height);
		
		console.log('adjusted resolution to width:', canvas.width , 'height', canvas.height);
		
		raptorjs.canvas = canvas;
		
		raptorjs.setLoadingText("Init Webgl");
		
		gl = canvas.getContext("experimental-webgl",  {alpha: false});
		
		raptorjs.extensions.textureFloat = gl.getExtension('OES_texture_float');
		raptorjs.extensions.textureHalf = gl.getExtension('OES_texture_half_float');
		raptorjs.extensions.elementIndexUint = gl.getExtension('OES_element_index_uint'); 
		raptorjs.extensions.derivatives = gl.getExtension('OES_standard_derivatives');
		raptorjs.extensions.texture3d = gl.getExtension("OES_texture_3D");
		raptorjs.extensions.depthTexture = gl.getExtension("WEBKIT_WEBGL_depth_texture");
		raptorjs.extensions.anisotropic = gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
		raptorjs.extensions.textureCompression = gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
		raptorjs.extensions.textureCompression = gl.getExtension("OES_texture_float_linear");
		
		
		raptorjs.setLoadingText("Init RaptorEngine");
		
		if(raptorjs.extensions.elementIndexUint)
			this.indexType = gl.UNSIGNED_INT;
		else
			this.indexType = gl.UNSIGNED_SHORT;
		
		
		var formats = gl.getParameter(gl.COMPRESSED_TEXTURE_FORMATS);
		 
		raptorjs.extensions.dxt5Supported = false;
		
		for(var i = 0; i<formats.length; i++) {

			if(formats[i] == raptorjs.extensions.textureCompression.COMPRESSED_RGBA_S3TC_DXT5_EXT) {
				raptorjs.extensions.dxt5Supported = true;
			}
		}
		 
		console.log(raptorjs.extensions, formats);
 		
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
		
		raptorjs.width = canvas.width;
		raptorjs.height = canvas.height;
		raptorjs.canvas = canvas;

	} catch (e) {  }
	
	if (!gl) {
		alert("Could not initialise WebGL, sorry :-(");
	}
}

raptorjs.renderSystem.prototype.setGraphicsLibrary = function(name) {
	/*
		
	*/
}
raptorjs.firstTime = false;
/**
 * Calculate elapsed time and current time
 */
raptorjs.renderSystem.prototype.smoothTimeEvolution = function() {
	if(!raptorjs.firstTime)
		raptorjs.firstTime = new Date().getTime();

	var timeNow = new Date().getTime() - raptorjs.firstTime;
	if (raptorjs.lastTime != 0) {
		var elapsed = timeNow - raptorjs.lastTime;
		raptorjs.elapsed = elapsed / 1000;
		raptorjs.timeNow = timeNow;
	}
	raptorjs.lastTime = timeNow;
	
}


raptorjs.renderSystem.prototype.getBuffersByName = function(name) {
	var buffers = this.buffers;
	var returnbuffersDepth = [];
	
	for(var c = 0; c < buffers.length; c++) {
		var buffer = buffers[c];
		if(buffer.name == name)
			returnbuffersDepth.push(buffer);
	}
	
	return returnbuffersDepth;
}

raptorjs.renderSystem.prototype.getDeferredBuffersByName = function(name) {
	var deferredBuffers = this.deferredBuffers;
	var returnbuffersDepth = [];
	
	for(var c = 0; c < deferredBuffers.length; c++) {
		var buffer = deferredBuffers[c];
		if(buffer.name == name)
			returnbuffersDepth.push(buffer);
	}
	
	return returnbuffersDepth;
}

raptorjs.renderSystem.prototype.getDeferredBufferByName = function(name) {
	var deferredBuffers = this.deferredBuffers;
	var returnbuffersDepth = [];
	
	for(var c = 0; c < deferredBuffers.length; c++) {
		var buffer = deferredBuffers[c];
		if(buffer.name == name)
			returnbuffersDepth.push(buffer);
	}
	
	return returnbuffersDepth[0];
}

function getElement(buffer, vertexIndex) {
	var startId = buffer.itemSize * vertexIndex;
	var out = [];
	
	for(var c = 0; c<buffer.itemSize; c++) {
		out.push(buffer.data[c+startId]);
	}

	return out;
}

raptorjs.renderSystem.prototype.createFrameBuffer = function(width, height, properties) { //type, depth
	if(!properties)
		var properties = {};
	
	var texture = gl.createTexture();
	var framebuffer = gl.createFramebuffer();

	framebuffer.width = width;
	framebuffer.height = height;

	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	
	switch(properties.filter) {
		case gl.NEAREST:
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		break;
		case gl.LINEAR:
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		break;
		default:
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	}

	if(properties.anisotropic) {
		//var extension = raptorjs.extensions.anisotropic;
		//gl.texParameteri( gl.TEXTURE_2D, extension.TEXTURE_MAX_ANISOTROPY_EXT, properties.anisotropic );
	}

	
	var renderbuffer = gl.createRenderbuffer();
	
	if(!properties.type)
		properties.type = gl.UNSIGNED_BYTE;
	
	if(!properties.internalformat)
		properties.internalformat = gl.RGBA;

	if(!properties.format)
		properties.format = gl.RGBA;

	if(properties.type == "depth") {
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, framebuffer.width, framebuffer.height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);
		gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, texture, 0);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, framebuffer.width, framebuffer.height);
		//gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);
	} else if(properties.type) {
		gl.texImage2D(gl.TEXTURE_2D, 0, properties.internalformat, framebuffer.width, framebuffer.height, 0, properties.format, properties.type, null);
		gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, framebuffer.width, framebuffer.height);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);
	}
	
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	framebuffer.type = 'float';
	framebuffer.texture = texture;
	framebuffer._className = "framebuffer";

	return framebuffer;
}

raptorjs.renderSystem.prototype.createSampler = function() {
	
}

raptorjs.renderSystem.prototype.addScene = function(scene) {
	this.sceneNodes.push(scene);
}

raptorjs.renderSystem.prototype.setCamera = function(camera) {
	this.activeCamera = camera;
}


/**
 * Setup shadow camera, Create basic view and renderpass. pssm 
 * @param {vector3} eye
 * @param {vector3} target
 * @param {vector3} up
 */
raptorjs.renderSystem.prototype.createShadowMaps = function(  ) {
	this.shadow = true;
	var camera = raptorjs.mainCamera;
	
	this.calculateSplitPoints(this.numberOfSplitpoints, camera.near, camera.far, this.lambda);
	
	var shadowMap = {};
	shadowMap.width = 1024;
	shadowMap.height = 1024;
	shadowMap.nearSplitPoint = this.splitPoints[this.shadowMaps.length];
	shadowMap.farSplitPoint = this.splitPoints[this.shadowMaps.length+1];

	this.shadowMaps.push( shadowMap );
}


/**
 * Calculate splitpoints for the near and far depth value's for the shadow sub frusta
 */
raptorjs.renderSystem.prototype.calculateSplitPoints = function(splitCount, nearDist, farDist, lambda) {
	if (splitCount < 2)
		console.log("Cannot specify less than 2 splits", "PSSMShadowCameraSetup::calculateSplitPoints");
		
	this.splitPoints = [];
	this.mOptimalAdjustFactors = new Array(splitCount);

	mSplitCount = splitCount;

	this.splitPoints[0] = nearDist;
	for (var i = 1; i < mSplitCount; i++)
	{
		var fraction = i / splitCount;
		var splitPoint = ( lambda * nearDist * Math.pow(farDist / nearDist, fraction) +
				(1.0 - lambda) * (nearDist + fraction * (farDist - nearDist)) );

		this.splitPoints[i] = splitPoint;
	}

	this.splitPoints[splitCount] = farDist;
	console.log(this.splitPoints);
	
}
var scasd = 0;

raptorjs.renderSystem.prototype.updateShadowsPSSM = function( shadowMap, lightDir ) {

	var matrix4 = raptorjs.matrix4;
	var camera = raptorjs.mainCamera;

	var SplitProjection = matrix4.perspective( 	raptorjs.math.degToRad(camera.fov),  
												raptorjs.width /  raptorjs.height, 
												.1, 
												1000 );
	
	var SplitView = camera.view;
	var SplitMatrix = matrix4.mul( SplitView, SplitProjection );

	var InverseViewProjection = matrix4.inverse(SplitMatrix);
	
	var points = [];
	//var vertices = [[-1,1,1], [1,1,1],[-1,-1,1], [1,-1,1],
	//				[-1,1,-1], [1,1,-1],[-1,-1,-1], [1,-1,-1]	];
					

	var vertices = [[-1,1,-1],[1,1,-1],  [1,-1,-1],[-1,-1,-1],  //near
						  [-1,1,1],[1,1,1],[1,-1,1], [-1,-1,1]      ];
					  
					  
					 
	lightDir = raptorjs.vector3.normalize( lightDir );
	
	var lightRotation  =  matrix4.lookAt(	[ 0, 0, 0 ], 
											lightDir, 
											[ 0, 1, 0 ] );
													
	for(var c =0;c<vertices.length; c++) {
		var vert = vertices[c];
		
		var worldPosition = matrix4.transformPoint(InverseViewProjection, vert);
		
		if(scasd == 100) {
		//	this.test([c*1000, 0,0]);
		
			console.log(worldPosition, vert);
		}
		points.push(matrix4.transformPoint(lightRotation, worldPosition));
	}
	
	scasd++;
	
	var boundingBox = raptorjs.createObject('boundingBox');
	
	boundingBox.fitBoxToPoints_(points);
	
	
	//var cropMatrix = CalculateCropMatrix(boundingBox);
	//var lightViewProjectionFull = g_math.matrix4.composition( lightProjection, lightView );
	//boundingBox = findClosestBindingBox(boundingBox);
	
	var boxSize = raptorjs.vector3.sub(boundingBox.maxExtent, boundingBox.minExtent);
	var halfBoxSize = raptorjs.vector3.scale(boxSize, 0.5);
		
	var lightPosition = raptorjs.vector3.add(boundingBox.minExtent, halfBoxSize);

	lightPosition[2] = boundingBox.minExtent[2];//*3
	lightPosition = matrix4.transformPoint(matrix4.inverse(lightRotation),lightPosition); 

	var shadowEye = raptorjs.vector3.add(lightPosition, raptorjs.vector3.scale(lightDir, 1200) );
	
	var lightView = matrix4.lookAt(	shadowEye, //raptorjs.vector3.scale(lightDir, this.pssmOffset) 
									raptorjs.vector3.sub(lightPosition, lightDir), 
									[0, 0, 1]);

	//var lightProjection = createOrthographic(boxSize[0], boxSize[1], -boxSize[2], boxSize[2], this.pssmOffset);
	var lightProjection = raptorjs.matrix4.orthographic(-1500, 1500, -1500, 1500, -2000, 3000);
	
	var lightViewProjection = matrix4.mul( lightView, lightProjection  );


	var shadowInfo = {};
	shadowInfo.eye = shadowEye;
	shadowInfo.view = lightView;
	shadowInfo.projection = lightProjection;
	shadowInfo.SplitProjection = SplitMatrix;
	shadowInfo.viewProjection = lightViewProjection;


	if(testest == 60) {
		console.log(shadowInfo);
	}
		
	return shadowInfo;
}

function createOrthographic (width, height, near, far, offset) {
	var depth = far - near;
	var faddn = far + near;
	depth += offset;
	
	var x     =  2.0 / width;
	var y     =  2.0 / height;
	var z     =  -2.0 / depth;
	var zt    = -faddn / depth;

    return 	[  	[x, 0.0, 0.0, 0.0],
				[0.0, y, 0.0, 0.0],
				[0.0, 0.0, z, zt],
				[0.0, 0.0, 0.0, 1.0] ];
}

function isFloat(array, isfloat) {
	for(var c = 0; c < array.length; c++) 
	{
		var child = array[c];
		if(typeof child == "object") 
		{
			getFirstvalue(child, isfloat);
		} else {
			if(isFloatCheck(child))
				return true;
		}
	}
	return isfloat;
}

function getFirstvalue (array, isInt) {
	if(typeof array == "object") {
			return getFirstvalue(array[0]);
	} else {
		return array;
	}
}

function isInteger(f) {
    return typeof(f)==="number" && Math.round(f) == f;
}

function isFloatCheck(f) { return typeof(f)==="number" && !isInteger(f); }




raptorjs.renderSystem.prototype.setupDeferredPipeline = function() {

/*
 
 
 	this.uberShader;
	this.ssgiShader;
	this.colorInfoSampler;
	this.colorInfoShader;
	this.colorInfoTransparentShader;
	this.bumpInfoShader;
	this.shadowShader;
	this.reflectionShader;
	this.diffuseAcc;
	this.diffuseAccSampler;
	this.infoShader;
	this.infoFrameBuffer;
	this.reflectionFramebuffer;
	this.colorInfoFramebuffer;


	this.shadowOcclusionFramebuffer;
	this.shadowOcclusionSampler;
	this.prevDiffuseFramebuffer;
	this.prevDiffuseShader;
		
	this.globalIllumination;
	this.irradianceVolume;
	this.fxaa;
	this.smaa;
	this.hrd;
	
	this.msaa;
*/


	this.colorInfoSampler 	= this.samplerFromFramebuffer(this.colorInfoFramebuffer);
	this.diffuseAccSampler  = this.samplerFromFramebuffer(this.diffuseAcc);
	//var prevDiffuseSampler = this.samplerFromFramebuffer(this.prevDiffuseFramebuffer); 
	//this.shadowConvXSampler = this.samplerFromFramebuffer(this.shadowConvolutionX);
	//this.shadowConvYSampler = this.samplerFromFramebuffer(this.shadowConvolutionY);

	var infoTexture = raptorjs.createObject('texture');

	infoTexture.data = this.infoFrameBuffer.texture;
	infoTexture.dataType = 'framebuffer';
	infoTexture.width = this.infoFrameBuffer.width;
	infoTexture.height = this.infoFrameBuffer.height;

	infoSampler = raptorjs.createObject("sampler2D");
	infoSampler.texture = infoTexture;

	this.bumpInfoShader = raptorjs.createObject("shader");
	this.bumpInfoShader.definePragma("NORMAL_MAP", 1);
	this.bumpInfoShader.createFomFile("shaders/info.shader");

	//this.infoShader.setUniform("far", raptorjs.mainCamera.far );
	//this.infoShader.setUniform("near", raptorjs.mainCamera.near );
	//this.infoShader.setUniform("shadowSampler1", raptorjs.system.shadowConvYSampler );
	//this.infoShader.setUniform("shadowBias", .0012  );
	//this.infoShader.setUniform("g_minVariance", 0.001);
	//this.infoShader.setUniform("kernel", buildKernel(1) );
	
	//this.colorInfoShader = raptorjs.createObject("shader");
	//this.colorInfoShader.definePragma("TEXTURE", 1);
	//this.colorInfoShader.createFomFile("shaders/colorInfo.shader");
	//this.colorInfoShader.setUniform("uvScale", 1 );

	this.reflectionShader = raptorjs.createObject("shader");
	this.reflectionShader.createFomFile("shaders/texture.shader");

	
	/*
		this.colorInfoSimpleShader = raptorjs.createObject("shader");
		this.colorInfoSimpleShader.createFomFile("shaders/colorInfoSimple.shader");

		var randomSampler = this.createRandomSphereTexture(64);
		randomSampler.MIN_FILTER = gl.NEAREST;
		randomSampler.MAG_FILTER = gl.NEAREST;
	*/
	
	this.shadowShader = raptorjs.createObject("shader");
	this.shadowShader.createFomFile("shaders/shadow.shader");
	this.shadowShader.setUniform("viewProjection", this.quadViewProjection );
	this.shadowShader.setUniform("far", raptorjs.mainCamera.far );
	this.shadowShader.setUniform("shadowBias", .5);
	this.shadowShader.setUniform("shadowDepthSampler", this.shadowSampler);
	this.shadowShader.setUniform("infoSampler", infoSampler);
	
	//this.prevDiffuseShader = raptorjs.createObject("shader");
	//this.prevDiffuseShader.createFomFile("shaders/copy.shader");
	//this.prevDiffuseShader.setUniform("viewProjection", this.quadViewProjection );
	//this.prevDiffuseShader.setUniform("texture", this.diffuseAccSampler );
	
	for(var c = 0; c<scale.length; c++){
		var currentScale = scale[c];
	}
	
	this.globalIllumination = raptorjs.createObject("globalIllumination");
	this.globalIllumination.init();

		switch(this.antiAlias) {
			case "FXAA":
				
				//this.fxaa = raptorjs.createObject("fxaa");
				//this.fxaa.setColorSampler(this.diffuseAccSampler);
				
			break;
			
			case "SMAA":	// default
				
				this.smaa = raptorjs.createObject("smaa");
				this.smaa.setColorSampler( this.diffuseAccSampler );
				
			break;
			
			case "MSAA":
				this.msaa = raptorjs.createObject("MSAA");
				this.msaa.setColorSampler(this.diffuseAccSampler, prevDiffuseSampler);
				this.msaa.setDepthSampler(infoSampler);
			break;
		}
	
	//this.hdr = raptorjs.createObject("hdr");
	//this.hdr.setDiffuseSampler(this.diffuseAccSampler);

	this.uberShader = raptorjs.createObject("shader");
	this.uberShader.definePragma("VARIANCE", (this.shadowType == "VARIANCE") ? 1 : 0 );
	this.uberShader.createFomFile("shaders/uberPass.shader");
	this.uberShader.setUniform("viewProjection", this.quadViewProjection );
	
	this.uberShader.setUniform("infoSampler", infoSampler);
	this.uberShader.setUniform("diffuseSampler", this.colorInfoSampler);
	//this.uberShader.setUniform("ambiantOccSampler", this.ssaoConvolutionYSampler ); // ssaoConvolutionYSampler
	this.uberShader.setUniform("randomSampler",  this.randomSampler);
	//this.uberShader.setUniform("shadow_kernel", shadow_kernel);
	this.uberShader.setUniform("sRotSampler", this.randomRotationSampler );

	 
	// if variance use saperate convolution
	if(this.shadowType == "VARIANCE") {
		this.uberShader.setUniform("shadowSampler1", this.shadowConvYSampler);
	} else {
		this.uberShader.setUniform("shadowSampler1", this.shadowSampler);
	}

	// saperate shadow
	// this.uberShader.setUniform("shadowSampler1", this.shadowOcclusionSampler);
	this.uberShader.setUniform("globalIlluminationSampler", this.globalIllumination.initLPVSampler);
	this.uberShader.setUniform("shadowBias", 9.999);
	this.uberShader.setUniform("far", raptorjs.mainCamera.far );
	this.uberShader.setUniform("occlusionAmount", 1);
	this.uberShader.setUniform("specularPow", 6.381);
	this.uberShader.setUniform("spec", 0.281);
	this.uberShader.setUniform("randomSampler", this.randomSampler);
	this.uberShader.setUniform("screenWidth", raptorjs.width );
	this.uberShader.setUniform("screenHeight", raptorjs.height );
	//this.uberShader.setUniform("gloss", .001);
	//this.uberShader.setUniform("g_minVariance", 0.001);

	/*
	this.ssgiShader = raptorjs.createObject("shader");
	this.ssgiShader.createFomFile("shaders/globalillumination.shader");
	this.ssgiShader.setUniform("viewProjection", this.quadViewProjection );
	this.ssgiShader.setUniform("infoSampler", infoSampler);
	this.ssgiShader.setUniform("albedoSampler",  this.colorInfoSampler  );
	this.ssgiShader.setUniform("diffuseAccSampler",this.diffuseAccSampler );
	this.ssgiShader.setUniform("randomSampler", randomSampler);
	this.ssgiShader.setUniform("screenWidth", raptorjs.width );
	this.ssgiShader.setUniform("screenHeight", raptorjs.height );
	this.ssgiShader.setUniform("far", raptorjs.mainCamera.far );
	*/

	//random
	//var randomTexture = raptorjs.resources.getTexture("random");
	//var randomSampler = raptorjs.createObject("sampler2D");
	//randomSampler.texture = randomTexture;

	//info
	//this.ssaoShader.setUniform("colorInfoSampler", this.colorInfoSampler );
	//this.ssaoShader.setUniform("shadowSampler1", this.shadowConvYSampler);
	//this.ssaoShader.setUniform("shadowSampler1", this.shadowSampler);
	
	/*
	
	//default shader
	this.defaultShader = raptorjs.createObject("shader");
	this.defaultShader.createFomFile("shaders/texture.shader");

	this.finalTexture = raptorjs.createObject("texture");
	this.finalTexture.data = this.fxaaFrameBuffer.texture;
	this.finalTexture.dataType = 'framebuffer';
	this.finalTexture.width = this.fxaaFrameBuffer.width;
	this.finalTexture.height = this.fxaaFrameBuffer.height;
		
	this.finalSampler = raptorjs.createObject("sampler2D");
	this.finalSampler.texture = this.finalTexture;

	this.fxaaShader = raptorjs.createObject("shader");
	this.fxaaShader.createFomFile("shaders/fxaa3.shader");
	
	this.fxaaShader.setUniform("projection", this.quadProjection );
	this.fxaaShader.setUniform("view", this.quadView );
	//this.fxaaShader.setUniform("occlusionSampler", this.yConvSampler );
	this.fxaaShader.setUniform("colorSampler", colorInfoSampler );
	//this.fxaaShader.setUniform("test", this.shadowConvYSampler );
	this.fxaaShader.setUniform("edgeTreshold", 1.0 );
	this.fxaaShader.setUniform("edgeTresholdMin", 1.0 );
	this.fxaaShader.setUniform("subpixQuality", 0.25 );
	this.fxaaShader.setUniform("screenSizeInv", [1.0/raptorjs.width, 1.0/raptorjs.height] );
	*/
}

