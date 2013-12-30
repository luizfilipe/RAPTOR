raptorjs.lightShafts = function(){
	this.create();
	
	this.world = raptorjs.matrix4.identity();
}

raptorjs.lightShafts.prototype.create = function() {

	var vertices = [];
	var indices = [];
	
	var width = 2611;
	var depth = 2611;
	var subdivisionsDepth = 1;
	var subdivisionsWidth = 1;
	var layers = 1;
	
	for(var l = 0; l<layers;l++){
		for (var z = 0; z <= subdivisionsDepth; z++) {
			for (var x = 0; x <= subdivisionsWidth; x++) {
			
				var u = x / subdivisionsWidth;
				var v = z / subdivisionsDepth;
			  
				var vertex = raptorjs.vector3(	width * u - width * 0.5,
												depth * v - depth * 0.5,
												.5 ); // l / layers
							
				vertices = vertices.concat(vertex);
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
	}
	
	vertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	vertexPositionBuffer.itemSize = 3;
	vertexPositionBuffer.numItems = vertices.length / 3;
	vertexPositionBuffer.data = vertices;

	vertexIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW);
	vertexIndexBuffer.itemSize = 3;
	vertexIndexBuffer.numItems = indices.length;
	vertexIndexBuffer.data = indices;
	
	var shadowInfo = raptorjs.system.shadowMapT;

	
	
	this.plane = {};
	
	this.plane.vertexBuffer = vertexPositionBuffer;
	this.plane.indexBuffer = vertexIndexBuffer;
	
	this.galaxyShader = raptorjs.createObject("shader"); 
	this.galaxyShader.createFomFile("shaders/lightShafts.shader");
	this.galaxyShader.setUniform("depthMap", raptorjs.system.shadowSampler );
	this.galaxyShader.setUniform("far", shadowInfo.far );
	this.galaxyShader.setUniform("shadowBias", 9.999);
	//this.galaxyShader.setUniform("text",sampler);
	
}

raptorjs.lightShafts.prototype.update = function(){
	var mesh = this.atmosphereMesh;
	var shader = this.atmosphereShader;
	
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
	gl.enable(gl.BLEND);
	gl.disable(gl.DEPTH_TEST);
	gl.frontFace(gl.CCW);
	gl.disable(gl.CULL_FACE);
	gl.viewport(0, 0, raptorjs.width, raptorjs.height);
	//	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	this.galaxyShader.setUniform("worldViewProjection", raptorjs.mainCamera.worldViewProjection);
	//this.galaxyShader.setUniform("world", raptorjs.matrix4.identity());
	
	var shadowInfo = raptorjs.system.shadowMapT;

	var shadowViewProjection = shadowInfo.viewProjection;
	
	this.galaxyShader.setUniform("lightViewProjection", shadowViewProjection );
	//this.galaxyShader.setUniform("view", raptorjs.mainCamera.view );

	this.galaxyShader.update();
		
	//var attribute = this.galaxyShader.getAttributeByName('uv');
	//gl.bindBuffer( gl.ARRAY_BUFFER, this.plane.uvBuffer );
	//gl.vertexAttribPointer( attribute, 2, gl.FLOAT, false, 0, 0 );
	
	var attribute = this.galaxyShader.getAttributeByName('position');
	gl.bindBuffer( gl.ARRAY_BUFFER, this.plane.vertexBuffer );
	gl.vertexAttribPointer( attribute, 3, gl.FLOAT, false, 0, 0 );
	
	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.plane.indexBuffer  );
	gl.drawElements( gl.TRIANGLES, this.plane.indexBuffer.numItems, raptorjs.system.indexType, 0 );

	
	gl.disable(gl.BLEND);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);

}
