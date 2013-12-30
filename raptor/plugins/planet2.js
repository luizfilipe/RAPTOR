raptorjs.planet = function(){
	this.shader;
	this.entity;
	this.groundFromSpace;
	this.spaceFromSpace;
	this.skyFromSpace;
	this.test;
	this.radius = 10.0;
	
	
	//this.createPlanet();
	this.createAtmosphere();

}


raptorjs.planet.prototype.createPlanet = function() {
	var texture = raptorjs.resources.getTexture("earth");

	var bumpSampler =  raptorjs.createObject("sampler2D");
	bumpSampler.texture = texture;
	
	var texture = raptorjs.resources.getTexture("earth");
	
	var textureSampler =  raptorjs.createObject("sampler2D");
	textureSampler.texture = texture;
	
	this.shader = raptorjs.createObject("shader");
	this.shader.createFomFile("shaders/planet2.shader");
	//this.shader.setUniform('bumpSampler', bumpSampler);
	this.shader.setUniform('DiffuseSampler', textureSampler);
	
	
	this.entity = raptorjs.primitives.createSphere(this.radius, 40, 40);
	this.entity.shader = this.shader;
}




raptorjs.planet.prototype.createAtmosphere = function() {

	var camera_mag = raptorjs.vector3.size(raptorjs.mainCamera.eye);
	var lightPosition = raptorjs.vector3(0, this.radius * 10,  this.radius * 10);
	var m_vLightDirection = raptorjs.vector3.normalize(lightPosition);
	
	var m_nSamples = 3;		// Number of sample rays to use in integral equation
	var m_Kr = 0.0025;		// Rayleigh scattering constant
	var m_Kr4PI = m_Kr * 4.0 * Math.PI;
	var m_Km =  0.0015;		// Mie scattering constant
	var m_Km4PI = m_Km * 4.0 * Math.PI;
	var m_ESun = 25.0;		// Sun brightness constant
	var m_g = -0.85;		// The Mie phase asymmetry factor
	var m_fExposure = 1.0;

	var m_fInnerRadius = this.radius;
	var m_fOuterRadius = m_fInnerRadius * 1.025;
	var m_fScale = 1 / (m_fOuterRadius - m_fInnerRadius);

	var m_fWavelength = [];
	var m_fWavelength4 = [];
	m_fWavelength[0] = 0.650;		// 650 nm for red
	m_fWavelength[1] = 0.570;		// 570 nm for green
	m_fWavelength[2] = 0.475;		// 475 nm for blue
	m_fWavelength4[0] = Math.pow(m_fWavelength[0], 4.0);
	m_fWavelength4[1] = Math.pow(m_fWavelength[1], 4.0);
	m_fWavelength4[2] = Math.pow(m_fWavelength[2], 4.0);

	var m_fRayleighScaleDepth = 0.25;
	var m_fMieScaleDepth = 0.1;
	


	//spaceFromSpace
	var shader = raptorjs.createObject("shader");
	shader.createFomFile("shaders/atmosphere/SpaceFromSpace.shader");
	
	shader.setUniform('cameraPos', raptorjs.mainCamera.eye );
	shader.setUniform('lightPos', m_vLightDirection );
	shader.setUniform('invWavelength', [1/m_fWavelength4[0], 1/m_fWavelength4[1], 1/m_fWavelength4[2]]);
	shader.setUniform('fCameraHeight2', camera_mag * camera_mag );
	shader.setUniform('fOuterRadius', m_fOuterRadius );
	shader.setUniform('fOuterRadius2', m_fOuterRadius*m_fOuterRadius );
	shader.setUniform('fInnerRadius', m_fInnerRadius );
	
	shader.setUniform('fKrESun', m_Kr*m_ESun );
	shader.setUniform('fKmESun', m_Km*m_ESun );
	shader.setUniform('fKr4PI', m_Kr4PI );
	shader.setUniform('fKm4PI', m_Km4PI );
	shader.setUniform('fScale', 1.0 / (m_fOuterRadius - m_fInnerRadius) );
	shader.setUniform('fScaleDepth', m_fRayleighScaleDepth );
	shader.setUniform('fScaleOverScaleDepth', (1.0 / (m_fOuterRadius - m_fInnerRadius)) / m_fRayleighScaleDepth );
	shader.setUniform('g', m_g );
	shader.setUniform('g2', m_g * m_g );
	
	
	//this.spaceFromSpace = raptorjs.primitives.createPlane(40, 40, 1, 1);
	this.spaceFromSpace = raptorjs.primitives.createSphere(m_fInnerRadius, 100, 100);	
	this.spaceFromSpace.shader = shader;
	
	//  GroundFromSpace
	var shader = raptorjs.createObject("shader");
	shader.createFomFile("shaders/atmosphere/GroundFromSpace.shader");


	shader.setUniform('lightPos', m_vLightDirection);
	shader.setUniform('invWavelength', [ 1/m_fWavelength4[0], 1/m_fWavelength4[1], 1/m_fWavelength4[2]]);
	
	shader.setUniform('fCameraHeight2', camera_mag * camera_mag );
	shader.setUniform('fOuterRadius', m_fOuterRadius);
	shader.setUniform('fOuterRadius2', m_fOuterRadius*m_fOuterRadius);
	shader.setUniform('fInnerRadius', m_fInnerRadius);
	shader.setUniform('fInnerRadius2', m_fInnerRadius*m_fInnerRadius);
	shader.setUniform('fKrESun', m_Kr*m_ESun);
	shader.setUniform('fKmESun', m_Km*m_ESun);
	shader.setUniform('fKr4PI', m_Kr4PI );
	shader.setUniform('fKm4PI', m_Km4PI );
	shader.setUniform('fScale', 1.0 / (m_fOuterRadius - m_fInnerRadius));
	shader.setUniform('fScaleDepth', m_fRayleighScaleDepth);
	shader.setUniform('fScaleOverScaleDepth', (1.0 / (m_fOuterRadius - m_fInnerRadius)) / m_fRayleighScaleDepth );


	this.groundFromSpace = raptorjs.primitives.createSphere(m_fOuterRadius, 100, 100);	
	this.groundFromSpace.shader = shader;

	//  skyFromSpace
	var shader = raptorjs.createObject("shader");
	shader.createFomFile("shaders/atmosphere/skyFromSpace.shader");
	
	shader.setUniform('cameraPos', raptorjs.mainCamera.eye);
	shader.setUniform('lightPos', m_vLightDirection);
	shader.setUniform('invWavelength', [1/m_fWavelength4[0], 1/m_fWavelength4[1], 1/m_fWavelength4[2]] );
	shader.setUniform('fCameraHeight2', camera_mag * camera_mag );
	shader.setUniform('fOuterRadius', m_fOuterRadius);
	shader.setUniform('fOuterRadius2', m_fOuterRadius*m_fOuterRadius);
	shader.setUniform('fCameraHeight', m_fInnerRadius);
	shader.setUniform('fInnerRadius', m_fInnerRadius );
	shader.setUniform('fInnerRadius2', m_fInnerRadius*m_fInnerRadius);
	shader.setUniform('fKrESun', m_Kr*m_ESun);
	shader.setUniform('fKmESun', m_Km*m_ESun);
	shader.setUniform('fKr4PI', m_Kr4PI );
	shader.setUniform('fKm4PI', m_Km4PI );
	shader.setUniform('fScale', 1.0 / (m_fOuterRadius - m_fInnerRadius) );
	shader.setUniform('fScaleDepth', m_fRayleighScaleDepth);
	shader.setUniform('fScaleOverScaleDepth', (1.0 / (m_fOuterRadius - m_fInnerRadius)) / m_fRayleighScaleDepth );
	shader.setUniform('fSamples', m_nSamples );
	shader.setUniform('g', m_g );
	shader.setUniform('g2', m_g * m_g );

	
	this.skyFromSpace = raptorjs.primitives.createSphere(m_fOuterRadius, 100, 100);	
	this.skyFromSpace.shader = shader;
	//console.log(this.skyFromSpace);
		
	//var shader = raptorjs.createObject("shader");
	//shader.createFomFile("shaders/precomputed/transmittance.glsl");
	//this.test = raptorjs.primitives.createPlane(100, 100, 1, 1);

	//this.test.shader = shader;
	
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.enable(gl.CULL_FACE);

	
}


var aaaa= 0;

raptorjs.planet.prototype.update = function(){
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//this.renderPlanet();
	this.renderAtmosphere();
} 

raptorjs.planet.prototype.renderPlanet = function(){
	aaaa++;
	//gl.cullFace(gl.BACK);
	var entity = this.entity;
	var shader = entity.shader;

	
	var shaderProgram = shader.program;
	gl.useProgram(shaderProgram);
	var world = raptorjs.matrix4.identity();
	//world = raptorjs.matrix4.rotateX(world, aaaa/1000,0);
	
	worldViewProjection = raptorjs.matrix4.composition(raptorjs.mainCamera.view, world);
	worldViewProjection = raptorjs.matrix4.composition(raptorjs.mainCamera.worldViewProjection, raptorjs.mainCamera.view);
	
	var worldInverseTranspose =  world;
	

	shader.setUniform('world', world );
	shader.setUniform('view', raptorjs.mainCamera.view);
	shader.setUniform('projection', raptorjs.mainCamera.projection);
	
	shader.update();
	
	var attribute = shader.getAttributeByName('normal');
	gl.bindBuffer(gl.ARRAY_BUFFER, entity.normalBuffer);
	gl.vertexAttribPointer(attribute, entity.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	var attribute = shader.getAttributeByName('binormal');
	gl.bindBuffer(gl.ARRAY_BUFFER, entity.binormalBuffer);
	gl.vertexAttribPointer(attribute, entity.binormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	var attribute = shader.getAttributeByName('tangent');
	gl.bindBuffer(gl.ARRAY_BUFFER, entity.tangentBuffer);
	gl.vertexAttribPointer(attribute, entity.tangentBuffer.itemSize, gl.FLOAT, false, 0, 0);

	
	var attribute = shader.getAttributeByName('uv');
	gl.bindBuffer(gl.ARRAY_BUFFER, entity.uvBuffer);
	gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
	
	var attribute = shader.getAttributeByName('position');
	gl.bindBuffer(gl.ARRAY_BUFFER, entity.vertexBuffer);
	gl.vertexAttribPointer(attribute, 3, gl.FLOAT, false, 0, 0);

	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, entity.indexBuffer );
	gl.drawElements( gl.TRIANGLES, entity.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0 ); 
}

raptorjs.planet.prototype.renderAtmosphere = function() {
	var entity = this.skyFromSpace;
	var shader = entity.shader;
	
	gl.useProgram(shader.program);
	//gl.enable();
	
	//gl.cullFace(gl.FRONT);
	//gl.enable(gl.BLEND);
	//gl.FrontFace(gl.CW);
	//gl.blendFunc(gl.ONE, gl.ONE);
	
	
	var cameraHeight = raptorjs.vector3.size(raptorjs.mainCamera.view[3].slice(0,3)); 
	var cameraHeight2 = cameraHeight * cameraHeight;
	
	shader.setUniform('view', raptorjs.mainCamera.view );
	shader.setUniform('projection', raptorjs.mainCamera.projection );
	shader.setUniform('cameraPos', raptorjs.mainCamera.eye);

	shader.setUniform('fCameraHeight2', cameraHeight2);
	console.log(shader);
	//var attribute = shader.getAttributeByName('uv');
	//gl.bindBuffer(gl.ARRAY_BUFFER, entity.uvBuffer);
	//gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
	
	shader.update();
	
	var attribute = shader.getAttributeByName('position');
	gl.bindBuffer(gl.ARRAY_BUFFER, entity.vertexBuffer);
	gl.vertexAttribPointer(attribute, 3, gl.FLOAT, false, 0, 0);

	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, entity.indexBuffer );
	gl.drawElements( gl.TRIANGLES, entity.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0 ); 
	
	//gl.cullFace(gl.BACK);
	//gl.FrontFace(gl.CCW);
}