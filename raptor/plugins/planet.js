raptorjs.planet = function(){
	this.shader;
	this.entity;

	this.transmittance;
	this.irradiance1;
	this.inscatter1;
	this.copyIrradiance;
	this.copyInscatter1;
	this.inscatterS;
	this.irradianceN;
	this.inscatterN;
	
	
	this.transmittanceUnit;
	this.deltaEUnit
	this.deltaSRayUnit;
	this.deltaSMieUnit;
	this.irradianceUnit;
	this.inscatterUnit;
	
	this.dSampler;
	this.rSampler;
	
	this.deltaSRaySampler;
	
	this.test;
	this.radius = 10.0;


	this.Rg = 6360.0;
	this.Rt = 6420.0;
	this.RL = 6421.0;

	this.TRANSMITTANCE_W = 256;
	this.TRANSMITTANCE_H = 64;

	this.SKY_W = 64;
	this.SKY_H = 16;

	this.RES_R = 32;
	this.RES_MU = 128;
	this.RES_MU_S = 32;
	this.RES_NU = 8;
	this.libShader;
	
	
	this.quadVertexBuffer;				
	this.quadIndexBuffer;		
	
	this.createBuffers();
	this.createAtmosphere();
	this.createPlanet();
}

raptorjs.planet.prototype.createBuffers = function() {
	this.quadVertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([  -1.0, -1.0,
														1.0, -1.0,
													   -1.0,  1.0,
													   -1.0,  1.0,
														1.0, -1.0,
														1.0,  1.0 ]), gl.STATIC_DRAW);
														
	this.quadIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.quadIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([ 0, 2, 1, 2, 3,1 ]), gl.STATIC_DRAW);

}
					
					
raptorjs.planet.prototype.createAtmosphere = function() {
	var cubeSize = (this.RES_MU_S * this.RES_NU) * this.RES_MU * this.RES_R;
	var textureSize = Math.sqrt( cubeSize );

	this.transmittanceUnit = raptorjs.system.createFrameBuffer(this.TRANSMITTANCE_W, this.TRANSMITTANCE_H, gl.FLOAT);
	this.deltaEUnit = raptorjs.system.createFrameBuffer(this.SKY_W, this.SKY_H, gl.FLOAT);
	this.deltaSRayUnit = raptorjs.system.createFrameBuffer(textureSize, textureSize, gl.FLOAT);
	this.deltaSMieUnit = raptorjs.system.createFrameBuffer(textureSize, textureSize, gl.FLOAT);
	this.irradianceUnit = raptorjs.system.createFrameBuffer(this.SKY_W, this.SKY_H, gl.FLOAT);
	this.inscatterUnit = raptorjs.system.createFrameBuffer(textureSize, textureSize, gl.FLOAT);
	this.deltaJUnit = raptorjs.system.createFrameBuffer(textureSize, textureSize, gl.FLOAT);

	
	var transmittanceTexture = textureFromFramebuffer( this.transmittanceUnit );
	var deltaETexture = textureFromFramebuffer( this.deltaEUnit );
	var deltaSRayTexture = textureFromFramebuffer( this.deltaSRayUnit );
	var deltaSMieTexture = textureFromFramebuffer( this.deltaSMieUnit );
	var irradianceTexture = textureFromFramebuffer( this.irradianceUnit ); 
	var inscatterTexture = textureFromFramebuffer( this.inscatterUnit ); 
	var deltaJTexture = textureFromFramebuffer( this.deltaJUnit ); 
	
	
	this.transmittanceUnit.sampler = createSampler( transmittanceTexture );
	this.deltaEUnit.sampler = createSampler( deltaETexture );
	this.deltaSRayUnit.sampler = createSampler( deltaSRayTexture );
	this.deltaSMieUnit.sampler = createSampler( deltaSMieTexture );
	this.irradianceUnit.sampler = createSampler( irradianceTexture );
	this.inscatterUnit.sampler = createSampler( inscatterTexture );
	this.deltaJUnit.sampler = createSampler( deltaJTexture );
	
	var libShader = raptorjs.createObject("shader");
	
	libShader.createLibraryFomFile("shaders/precomputed/common.glsl");
	libShader.setUniform('Rg', 6360 );
	libShader.setUniform('Rt', 6420 );
	libShader.setUniform('RL', 6421 );
	
	libShader.setUniform('TRANSMITTANCE_W', 256 );
	libShader.setUniform('TRANSMITTANCE_H', 64 );
	
	libShader.setUniform('SKY_W', 64 );
	libShader.setUniform('SKY_H', 16 );
	
	libShader.setUniform('RES_R', 32 );
	libShader.setUniform('RES_MU', 128 );
	libShader.setUniform('RES_MU_S', 32 );
	libShader.setUniform('RES_NU', 8 );

	this.libShader = libShader;

	var rArray = [];
	var dArray = [];
	
	for (var layer = 0; layer < this.RES_R ; ++layer) {
		var r = layer / (this.RES_R - 1.0);

		r = r * r;

		r = Math.sqrt(this.Rg * this.Rg + r * (this.Rt * this.Rt - this.Rg * this.Rg)) + (layer == 0 ? 0.01 : (layer == this.RES_R - 1 ? -0.001 : 0.0));
		var dmin = this.Rt - r;
		var dmax = Math.sqrt(r * r - this.Rg * this.Rg) + Math.sqrt(this.Rt * this.Rt - this.Rg * this.Rg);
		var dminp = r - this.Rg;
		var dmaxp = Math.sqrt(r * r - this.Rg * this.Rg);

		dArray.push(dmin, dmax, dminp, dmaxp);
		rArray.push(r, 0, 0, 1);
	}

	var size = Math.sqrt((rArray.length / 4));

	var dTexture = raptorjs.textureFromArray(dArray, size, size, true);
	this.dSampler = raptorjs.createObject("sampler2D");
	this.dSampler.texture = dTexture;
	
	var rTexture = raptorjs.textureFromArray(rArray, size, size, true);
	this.rSampler = raptorjs.createObject("sampler2D");
	this.rSampler.texture = rTexture;
	
	this.transmittance = raptorjs.createObject("shader");
	this.transmittance.addLibrary(libShader, 1);
	this.transmittance.createFomFile("shaders/precomputed/transmittance.glsl");
	
	this.irradiance1 = raptorjs.createObject("shader");
	this.irradiance1.addLibrary(libShader, 1);
	this.irradiance1.createFomFile("shaders/precomputed/irradiance1.glsl");
	
	this.inscatter1 = raptorjs.createObject("shader");
	this.inscatter1.addLibrary(libShader, 1);
	this.inscatter1.createFomFile("shaders/precomputed/inscatter1.glsl");

	this.copyIrradiance = raptorjs.createObject("shader");
	this.copyIrradiance.addLibrary(libShader, 1);
	this.copyIrradiance.createFomFile("shaders/precomputed/copyIrradiance.glsl");
	
	this.copyInscatter1 = raptorjs.createObject("shader");
	this.copyInscatter1.addLibrary(libShader, 1);
	this.copyInscatter1.createFomFile("shaders/precomputed/copyInscatter1.glsl");
	
	this.inscatterS = raptorjs.createObject("shader");
	this.inscatterS.addLibrary(libShader, 1);
	this.inscatterS.createFomFile("shaders/precomputed/inscatterS.glsl");
	
	this.irradianceN = raptorjs.createObject("shader");
	this.irradianceN.addLibrary(libShader, 1);
	this.irradianceN.createFomFile("shaders/precomputed/irradianceN.glsl");

	this.inscatterN = raptorjs.createObject("shader");
	this.inscatterN.addLibrary(libShader, 1);
	this.inscatterN.createFomFile("shaders/precomputed/inscatterN.glsl");
	
	this.copyInscatterN = raptorjs.createObject("shader");
	this.copyInscatterN.addLibrary(libShader, 1);
	this.copyInscatterN.createFomFile("shaders/precomputed/copyInscatterN.glsl");
	
	
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	this.renderAtmosphere();
}

function textureFromFramebuffer( framebuffer ) {
	var texture = raptorjs.createObject('texture');
	texture.dataType = 'framebuffer';
	texture.data = framebuffer.texture;
	texture.width = framebuffer.width;
	texture.height = framebuffer.height;
	framebuffer.texture = texture;
	
	return texture;
}

function createSampler(texture){
	var sampler = raptorjs.createObject("sampler2D");
	sampler.texture = texture;
	return sampler;
}

raptorjs.planet.prototype.renderAtmosphere = function() {

	// transmittance
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.transmittanceUnit);
	gl.viewport(0, 0, this.TRANSMITTANCE_W, this.TRANSMITTANCE_H);
	this.drawQuad( this.transmittance );
	
	// irradiance1
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.deltaEUnit);
	gl.viewport(0, 0, this.SKY_W, this.SKY_H);
	this.irradiance1.setUniform('transmittanceSampler', this.transmittanceUnit.sampler );
	this.drawQuad( this.irradiance1 );


	// inscatter1
	var cubeSize = (this.RES_MU_S * this.RES_NU) * this.RES_MU * this.RES_R;
	var textureSize = Math.sqrt( cubeSize );
	
	gl.viewport(0, 0, textureSize, textureSize);
	var shader = this.inscatter1;
	this.inscatter1.setUniform('dSampler', this.dSampler );
	this.inscatter1.setUniform('rSampler', this.rSampler );
	this.inscatter1.setUniform('transmittanceSampler', this.transmittanceUnit.sampler );
	
	
			// Ray
			shader.setUniform('renderRay', 1.0 );
			shader.update();
			gl.bindFramebuffer(gl.FRAMEBUFFER, this.deltaSRayUnit );
gl.bindFramebuffer(gl.FRAMEBUFFER, null );
			console.log('RES_MU_S * RES_NU, RES_MU, RES_R', 32 * 8, 128, 32 , 32 * 8*128* 32  );
			this.drawQuad( shader );

			// Mie
			gl.bindFramebuffer(gl.FRAMEBUFFER, this.deltaSMieUnit );	
			
			shader.setUniform('renderRay', 0.0 );
			this.drawQuad( shader );
/*

	//copyirredance Bug vaag k=0!!!!
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.irradianceUnit);
	gl.viewport(0, 0, this.SKY_W, this.SKY_H);

	this.copyIrradiance.setUniform('k', 1.0 );
	this.copyIrradiance.setUniform('deltaESampler', this.deltaEUnit.sampler );
	this.drawQuad( this.copyIrradiance );
	
	
	//copies deltaS into inscatter texture S (line 5 in algorithm 4.1)
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.inscatterUnit);
	gl.viewport(0, 0, textureSize, textureSize);
		
	this.copyInscatter1.setUniform('textureSize', textureSize );
	this.copyInscatter1.setUniform('deltaSRSampler', this.deltaSRayUnit.sampler );
	this.copyInscatter1.setUniform('deltaSMSampler', this.deltaSMieUnit.sampler );
	
	var attribute = this.copyInscatter1.getAttributeByName('position');
	this.drawQuad( this.copyInscatter1 );
	

	for (var order = 2; order <= 4; ++order) {
		//inscatter S
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.deltaJUnit);
		gl.viewport(0, 0, textureSize, textureSize);
		
		this.inscatterS.setUniform('dSampler', this.dSampler );
		this.inscatterS.setUniform('rSampler', this.rSampler );
		this.inscatterS.setUniform('deltaSRSampler', this.deltaSRayUnit.sampler );
		this.inscatterS.setUniform('deltaSMSampler', this.deltaSMieUnit.sampler );
		this.inscatterS.setUniform('deltaESampler', this.deltaEUnit.sampler );
		this.inscatterS.setUniform('transmittanceSampler', this.transmittanceUnit.sampler );
		this.inscatterS.setUniform('first', order == 2 ? 1.0 : 0.0 );

		this.drawQuad( this.inscatterS );
	
	
		//irradiance N
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.deltaEUnit);
		
		gl.viewport(0, 0, textureSize, textureSize);
		
		this.irradianceN.setUniform('deltaSRSampler', this.deltaSRayUnit.sampler );
		this.irradianceN.setUniform('deltaSMSampler', this.deltaSMieUnit.sampler );
		this.irradianceN.setUniform('first', order == 2 ? 1.0 : 0.0 );
		
		this.drawQuad( this.irradianceN );
		
		//inscatter N
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.deltaSRayUnit);
		
		gl.viewport(0, 0, textureSize, textureSize);
		
		this.inscatterN.setUniform('deltaJSampler', this.deltaJUnit.sampler );
		this.inscatterN.setUniform('dSampler', this.dSampler );
		this.inscatterN.setUniform('rSampler', this.rSampler );
		this.inscatterN.setUniform('transmittanceSampler', this.transmittanceUnit.sampler );
		
		this.drawQuad( this.inscatterN );
	
	
        gl.enable(gl.BLEND);
        gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
        gl.blendFuncSeparate(gl.ONE, gl.ONE, gl.ONE, gl.ONE);
		
		//copy Irradiance
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.irradianceUnit);
		gl.viewport(0, 0, this.SKY_W, this.SKY_H);
		
		this.copyIrradiance.setUniform('k', 1.0 );
		this.copyIrradiance.setUniform('deltaESampler', this.deltaEUnit.sampler );
		this.drawQuad( this.copyIrradiance );
	
	
		//inscatter Unit
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.inscatterUnit );
		gl.viewport(0, 0, textureSize, textureSize);
		
		this.copyInscatterN.setUniform('dSampler', this.dSampler );
		this.copyInscatterN.setUniform('rSampler', this.rSampler );
		this.copyInscatterN.setUniform('deltaSSampler', this.deltaSRayUnit.sampler );

		this.drawQuad( this.copyInscatterN );
		gl.disable(gl.BLEND);
	}
	
	*/
}

raptorjs.planet.prototype.drawQuad = function(shader)
{
	shader.update();
	var attribute = shader.getAttributeByName('position');
	gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVertexBuffer );
	gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.TRIANGLES, 0, 6);
}

raptorjs.planet.prototype.update = function(){
	//this.renderPlanet();
} 


raptorjs.planet.prototype.createPlanet = function() {
	var texture = raptorjs.resources.getTexture("earth");
	
	var textureSampler =  raptorjs.createObject("sampler2D");
	textureSampler.texture = texture;
	
	this.shader = raptorjs.createObject("shader");
	this.shader.addLibrary(this.libShader, 1);
	this.shader.createFomFile("shaders/precomputed/earth.glsl");
	
	this.shader.setUniform('c', [1,1,1]);

	this.shader.setUniform('exposure', .4);
	this.shader.setUniform('ISun', 12);
	this.shader.setUniform('transmittanceSampler', this.transmittanceUnit.sampler);
	this.shader.setUniform('reflectanceSampler', textureSampler);
	this.shader.setUniform('irradianceSampler', this.irradianceUnit.sampler);
	this.shader.setUniform('inscatterSampler', this.inscatterUnit.sampler);
	this.shader.update();
	
	this.entity = raptorjs.primitives.createPlane(2, 2, 1, 1);
	this.entity.shader = this.shader;
}

	var phi =1;
	var theta = 1;
	var move = 2;
	var oldy = 0;
	var oldx = 0;
	var s_public = [0.1, -1, 0.1];
	var lat = 1;
	var lon = 1;
	var Rg = 1;
	var d = Rg;
/*
    if (ctrl) {
    	move = 0;
    } else if (shift) {
        move = 1;
    } else {
    	move = 2;
    }
	*/
function mouseMotionFunc(x, y)
{
    if (move == 0) {
    	phi += (oldx - x) / 500.0;
    	theta += (oldy - y) / 500.0;
        theta = max(0.0, min(M_PI, theta));
        updateView();
        oldx = x;
        oldy = y;
    } else if (move == 1) {
    	var factor = position.length() - Rg;
    	factor = factor / Rg;
    	lon += (oldx - x) / 400.0 * factor;
    	lat -= (oldy - y) / 400.0 * factor;
        lat = max(-M_PI / 2.0, min(M_PI / 2.0, lat));
        updateView();
        oldx = x;
        oldy = y;
    } else if (move == 2) {
    	var vangle = asin(s_public[2]);

    	var hangle = atan2(s_public[1], s_public[0]);
		
    	vangle += (oldy - y) / 180.0 * Math.PI / 4;
    	hangle += (oldx - x) / 180.0 * Math.PI / 4;
    	s_public[0] = cos(vangle) * cos(hangle);
    	s_public[1] = cos(vangle) * sin(hangle);
    	s_public[2] = sin(vangle);
		updateView();

		raptorjs.planet.entity.shader.setUniform('s', s_public);

        oldx = x;
        oldy = y;
    }
}
function updateView()
{
	var vec3 = raptorjs.vector3;
	
	var co = cos(lon);
	var so = sin(lon);
	var ca = cos(lat);
	var sa = sin(lat);
	
	var po = raptorjs.vector3(co*ca, so*ca, sa * Rg);
	var px = raptorjs.vector3(-so, co, 0);
    var py = raptorjs.vector3(-co*sa, -so*sa, ca);
    var pz = raptorjs.vector3(co*ca, so*ca, sa);

    var ct = cos(theta);
    var st = sin(theta);
    var cp = cos(phi);
    var sp = sin(phi);
	
    var cx = vec3.add( vec3.scale(px, cp), vec3.scale(py, sp) );

    var cy = vec3.add( vec3.scale( vec3.scale(vec3.negativeVector(px), sp), ct), vec3.add( vec3.scale( vec3.scale(py, cp), ct), vec3.scale(pz, st)));

	var cz = vec3.sub(vec3.scale(vec3.scale(px, sp), st), vec3.add( vec3.scale(vec3.scale(py, cp),st), vec3.scale(pz, ct) ) );

    position = vec3.scale(vec3.add(po, cz), d);

    if (vec3.size(position) < Rg + 0.01) {
		var position = vec3.scale( vec3.normalize(position), Rg + 0.01);
    
    }

   var view = [	[cx[0], cx[1], cx[2], 0],
				[cy[0], cy[1], cy[2], 0],
				[cz[0], cz[1], cz[2], 0],
				[0, 0, 0, 1] ];
			
			
	publicView = view;

   // view = view * mat4d::translate(-position);
}
var publicView = [	[1,0,0,0],
					[0,1,0,0],
					[0,0,1,0],
					[0,0,0,1] ];

raptorjs.planet.prototype.renderPlanet = function(){
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.viewport(0, 0, raptorjs.width, raptorjs.height);

	var entity = this.entity;
	var shader = entity.shader;

	shader.setUniform('viewInverse', raptorjs.matrix4.inverse(raptorjs.mainCamera.view) );
	shader.setUniform('projInverse', raptorjs.matrix4.inverse(raptorjs.mainCamera.projection) );
	
	shader.update();
	
	var attribute = shader.getAttributeByName('position');
	gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVertexBuffer );
	gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.TRIANGLES, 0, 6);
}