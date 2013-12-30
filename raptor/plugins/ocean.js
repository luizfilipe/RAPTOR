raptorjs.ocean = function(){
	this.width = 512;

	this.heightFieldTexture;
	this.butterflyTexture;

	this.numButterflies;
	
	this.heightFieldFramebuffer;
	this.currentPingPongFrameBuffer;
	this.pingFrameBuffer;
	this.pongFrameBuffer;
	
	this.scrambledIndices = [];
	this.inverse = true;

	this.quadVertices = raptorjs.system.quadVertices;
	this.quadUv = raptorjs.system.quadUv;
	this.quadIndices = raptorjs.system.quadIndices;
	
	this.quadView = raptorjs.matrix4.lookAt([0, 0, 0], [0, -1, 0], [0, 0, -1]);
	this.quadProjection = raptorjs.matrix4.orthographic(-1, 1, -1, 1, -1, 1);
	this.quadViewProjection = raptorjs.matrix4.mul(this.quadView, this.quadProjection);

	this.heightFieldShader;
	this.horisontalFFTShader;
	this.scaleShader;
	
	this.numButterflies = Math.log(this.width) / Math.log(2.0);
	
	this.heightFieldSampler;
	this.flowerSampler;
	
	
	this.spectrum12Texture;
	this.spectrum12Sampler;
	
	
	
	
}

raptorjs.ocean.prototype.createHeightField = function(){

	this.generateWavesSpectrum();

	var system = raptorjs.system;
	
	this.createButterflyTexture(this.width, this.numButterflies);
	this.createPingPongFrameBuffers();
	
	//height field
	this.heightFieldShader = raptorjs.createObject("shader");
	this.heightFieldShader.createFomFile("shaders/createHeightField.shader");
	this.heightFieldShader.setUniform("viewProjection", system.quadViewProjection );
	
	this.heightFieldFramebuffer = system.createFrameBuffer(this.width, this.width, { type : gl.FLOAT, filter : gl.LINEAR });
	
	this.heightFieldSampler = system.samplerFromFramebuffer(this.heightFieldFramebuffer);
	this.heightFieldSampler.MIN_FILTER = gl.NEAREST;
	this.heightFieldSampler.MAG_FILTER = gl.NEAREST;
	
	//butterfly
	var butterflySampler = raptorjs.createObject("sampler2D");
	
	butterflySampler.texture = this.butterflyTexture;
	butterflySampler.WRAP_S = 	gl.CLAMP_TO_EDGE;
	butterflySampler.WRAP_T = 	gl.CLAMP_TO_EDGE;
	butterflySampler.MIN_FILTER = gl.NEAREST;
	butterflySampler.MAG_FILTER = gl.NEAREST;
	

	this.spectrum12Sampler = raptorjs.createObject("sampler2D");
	this.spectrum12Sampler.texture = this.spectrum12Texture;
	this.spectrum12Sampler.flipY = false;
	

	var flowerTexture = raptorjs.resources.getTexture("flower");
	this.flowerSampler = raptorjs.createObject("sampler2D");
	this.flowerSampler.texture = flowerTexture;

	
	//Horisontal fft
	this.horisontalFFTShader = raptorjs.createObject("shader");
	this.horisontalFFTShader.createFomFile("shaders/fft/fftH.shader");
	this.horisontalFFTShader.setUniform("viewProjection", system.quadViewProjection );
	this.horisontalFFTShader.setUniform("dateSource", this.flowerSampler );
	this.horisontalFFTShader.setUniform("butterfly", butterflySampler );
	
	
	//Vertical fft
	this.verticalFFTShader = raptorjs.createObject("shader");
	this.verticalFFTShader.createFomFile("shaders/fft/fftV.shader");
	this.verticalFFTShader.setUniform("viewProjection", system.quadViewProjection);
	this.verticalFFTShader.setUniform("butterfly", butterflySampler );
	this.verticalFFTShader.setUniform("dateSource", this.flowerSampler );
	
	
	this.scaleShader = raptorjs.createObject("shader");
	this.scaleShader.createFomFile("shaders/fft/scale.shader");
	this.scaleShader.setUniform("viewProjection", system.quadViewProjection );
	this.scaleShader.setUniform("scale", 1 );// 1 / (this.width )
}


raptorjs.ocean.prototype.pipeline = function() {

	var heightFieldFramebuffer = this.heightFieldFramebuffer;
	var heightFieldShader = this.heightFieldShader;
	
	raptorjs.system.drawQuad(this.heightFieldShader, heightFieldFramebuffer);
	
	var numPasses = this.numButterflies;
	var horisontalFFTShader = this.horisontalFFTShader;
	
	for (var pass = 0; pass < numPasses; pass++) {
		
		var butterflyPassNumber = (pass + 0.5) / numPasses;
		
		horisontalFFTShader.setUniform("butterflyPassNumber", butterflyPassNumber );
		
		if(pass == 0) 
			horisontalFFTShader.setUniform("dateSource", this.heightFieldSampler );//horisontalFFTShader.setUniform("dateSource", this.heightFieldSampler );
		else
			horisontalFFTShader.setUniform("dateSource", this.currentPingPongFrameBuffer.sampler );
		
		this.switchPingPongBuffer();

		raptorjs.system.drawQuad(horisontalFFTShader, this.currentPingPongFrameBuffer);
	}


	var verticalFFTShader = this.verticalFFTShader;
	
	for (var pass = 0; pass < numPasses; pass++) {
		
		var butterflyPassNumber = (pass + 0.5) / numPasses;
		

			verticalFFTShader.setUniform("dateSource", this.currentPingPongFrameBuffer.sampler );
			
			
		verticalFFTShader.setUniform("butterflyPassNumber", butterflyPassNumber );
		
		this.switchPingPongBuffer();
			
		raptorjs.system.drawQuad(verticalFFTShader, this.currentPingPongFrameBuffer);
	}
	/*
	
	var butterflyPassNumber = (1) / (9);
	
	this.verticalFFTShader.setUniform("butterflyPassNumber", butterflyPassNumber );
	
	raptorjs.system.drawQuad(this.verticalFFTShader, this.currentPingPongFrameBuffer);
	*/

	this.scaleShader.setUniform("texture",this.currentPingPongFrameBuffer.sampler);
	
	
	raptorjs.system.drawQuad(this.scaleShader, null);
	
}

raptorjs.ocean.prototype.createPingPongFrameBuffers = function() {
	this.pingFrameBuffer = raptorjs.system.createFrameBuffer(this.width, this.width, { type : gl.FLOAT, filter : gl.LINEAR });
	this.pongFrameBuffer = raptorjs.system.createFrameBuffer(this.width, this.width, { type : gl.FLOAT, filter : gl.LINEAR });
	
	this.pingFrameBuffer.name = "ping";
	this.pongFrameBuffer.name = "pong";
	
	this.pingFrameBuffer.sampler = raptorjs.system.samplerFromFramebuffer(this.pingFrameBuffer);
	this.pongFrameBuffer.sampler = raptorjs.system.samplerFromFramebuffer(this.pongFrameBuffer);
	
	this.pingFrameBuffer.WRAP_S = gl.REPEAT;
	this.pingFrameBuffer.WRAP_T = gl.REPEAT;
	this.pingFrameBuffer.MIN_FILTER = gl.LINEAR_MIPMAP_LINEAR;
	this.pingFrameBuffer.MAG_FILTER = gl.LINEAR;
	
	this.pongFrameBuffer.WRAP_S = gl.REPEAT;
	this.pongFrameBuffer.WRAP_T = gl.REPEAT;
	this.pongFrameBuffer.MIN_FILTER = gl.LINEAR_MIPMAP_LINEAR;
	this.pongFrameBuffer.MAG_FILTER = gl.LINEAR;
	//this.pongFrameBuffer.MIN_FILTER = gl.NEAREST;
	//this.pongFrameBuffer.MAG_FILTER = gl.NEAREST;
	
	this.currentPingPongFrameBuffer = this.pingFrameBuffer;
}

raptorjs.ocean.prototype.lrandom  = function(seed)
{
    var seed = (seed * 1103515245 + 12345) & 0x7FFFFFFF;
    return seed;
}

raptorjs.ocean.prototype.frandom = function(seed)
{
    var r = this.lrandom(seed) >> (parseInt(31) - parseInt(24));
    return r / (1 << 24);
}

raptorjs.ocean.prototype.grandom = function( mean,  stdDeviation, seed)
{
    var x1, x2, w, y1;
    var y2;
    var use_last = 0;

    if (use_last) {
        y1 = y2;
        use_last = 0;
    } else {
        do {
            x1 = 2.0 * this.frandom(seed) - 1.0;
            x2 = 2.0 * this.frandom(seed) - 1.0;
            w  = x1 * x1 + x2 * x2;
        } while (w >= 1.0);
        w  = sqrt((-2.0 * log(w)) / w);
        y1 = x1 * w;
        y2 = x2 * w;
        use_last = 1;
    }
	return mean + y1 * stdDeviation;
}

var GRID1_SIZE = 5488.0; // size in meters (i.e. in spatial domain) of the first grid
var GRID2_SIZE = 392.0; // size in meters (i.e. in spatial domain) of the second grid
var GRID3_SIZE = 28.0;
var GRID4_SIZE = 2.0;
var M_PI = Math.PI;
var WIND = 5.0; // wind speed in meters per second (at 10m above surface)
var OMEGA = 0.84; // sea state (inverse wave age)
var A = 1.0; // wave amplitude factor (should be one)
var cm = 0.23; // Eq 59
var km = 370.0; // Eq 59

raptorjs.ocean.prototype.spectrum = function( kx,  ky )
{
    var U10 = WIND;
    var Omega = OMEGA;

    // phase speed
    var k = sqrt(kx * kx + ky * ky);
    var c = omega(k) / k;

    // spectral peak
    var kp = 9.81 * sqr(Omega / U10); // after Eq 3
    var cp = omega(kp) / kp;

    // friction velocity
    var z0 = 3.7e-5 * sqr(U10) / 9.81 * pow(U10 / cp, 0.9); // Eq 66
    var u_star = 0.41 * U10 / log(10.0 / z0); // Eq 60

    var Lpm = exp(- 5.0 / 4.0 * sqr(kp / k)); // after Eq 3
    var gamma = Omega < 1.0 ? 1.7 : 1.7 + 6.0 * log(Omega); // after Eq 3 // log10 or log??
    var sigma = 0.08 * (1.0 + 4.0 / pow(Omega, 3.0)); // after Eq 3
    var Gamma = exp(-1.0 / (2.0 * sqr(sigma)) * sqr(sqrt(k / kp) - 1.0));
    var Jp = pow(gamma, Gamma); // Eq 3
    var Fp = Lpm * Jp * exp(- Omega / sqrt(10.0) * (sqrt(k / kp) - 1.0)); // Eq 32
    var alphap = 0.006 * sqrt(Omega); // Eq 34
    var Bl = 0.5 * alphap * cp / c * Fp; // Eq 31

    var alpham = 0.01 * (u_star < cm ? 1.0 + log(u_star / cm) : 1.0 + 3.0 * log(u_star / cm)); // Eq 44
    var Fm = exp(-0.25 * sqr(k / km - 1.0)); // Eq 41
    var Bh = 0.5 * alpham * cm / c * Fm * Lpm; // Eq 40 (fixed)

   // if (omnispectrum) {
   //     return A * (Bl + Bh) / (k * sqr(k)); // Eq 30
  //}

    var a0 = log(2.0) / 4.0; 
	var ap = 4.0; 
	var am = 0.13 * u_star / cm; // Eq 59
	
    var Delta = tanh(a0 + ap * pow(c / cp, 2.5) + am * pow(cm / c, 2.5)); // Eq 57

    var phi = atan2(ky, kx);

    if (kx < 0.0) {
        return 0.0;
    } else {
        Bl *= 2.0;
        Bh *= 2.0;
    }

	
    return A * (Bl + Bh) * (1.0 + Delta * cos(2.0 * phi)) / (2.0 * M_PI * sqr(sqr(k))); // Eq 67
}


raptorjs.ocean.prototype.getSpectrumSample = function( i,  j, lengthScale, kMin,  result )
{
	var result = [];
    var seed = 1234;
    var dk = 2.0 * M_PI / lengthScale;
    var kx = i * dk;
    var ky = j * dk;
    if (abs(kx) < kMin && abs(ky) < kMin) {
        result[0] = 0.0;
        result[1] = 0.0;
    } else {
        var S = this.spectrum(kx, ky);
        var h = sqrt(S / 2.0) * dk;
        var phi = this.frandom(seed) * 2.0 * M_PI;
        result[0] = h * cos(phi);
        result[1] = h * sin(phi);
    }
	
	return result;
}




function omega(k)
{
    return sqrt(9.81 * k * (1.0 + sqr(k / km))); // Eq 24
}


// generates the waves spectrum
raptorjs.ocean.prototype.generateWavesSpectrum = function()
{
	var FFT_SIZE = this.width;
    spectrum12 = [];
    spectrum34 = [];
	var test = [];
    for (var y = 0; y < FFT_SIZE; ++y) {
        for (var x = 0; x < FFT_SIZE; ++x) {
            var offset = 4 * (x + y * FFT_SIZE);
            var i = x >= FFT_SIZE / 2 ? x - FFT_SIZE : x;
            var j = y >= FFT_SIZE / 2 ? y - FFT_SIZE : y;
			
			test.push(i, j);
			
            var s1 = this.getSpectrumSample(i, j, GRID1_SIZE, M_PI / GRID1_SIZE);
            var s2 = this.getSpectrumSample(i, j, GRID2_SIZE, M_PI * FFT_SIZE / GRID1_SIZE);
            var b1 = this.getSpectrumSample(i, j, GRID3_SIZE, M_PI * FFT_SIZE / GRID2_SIZE);
            var b2 = this.getSpectrumSample(i, j, GRID4_SIZE, M_PI * FFT_SIZE / GRID3_SIZE);
			
			if(isNaN(s1[0])) s1[0]=0;
			if(isNaN(s1[1])) s1[1]=0;
			if(isNaN(s2[0])) s2[0]=0;
			if(isNaN(s2[1])) s2[1]=0;
			
			spectrum12[offset] 		= s1[0];
			spectrum12[offset + 1]  = s1[1];
			spectrum12[offset + 2]	= s2[0];
			spectrum12[offset + 3]	= s2[1];
			
			spectrum34[offset] 		= b1[0];
			spectrum34[offset + 1]  = b1[1];
			spectrum34[offset + 2]	= b2[0];
			spectrum34[offset + 3]	= b2[1];
			
        }
    }

	this.spectrum12Texture = raptorjs.textureFromArray(spectrum12, FFT_SIZE, FFT_SIZE, true);
	console.log(spectrum12.length, FFT_SIZE*FFT_SIZE*4);
/*
    glActiveTexture(GL_TEXTURE0 + SPECTRUM_1_2_UNIT);
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA16F_ARB, FFT_SIZE, FFT_SIZE, 0, GL_RGBA, GL_FLOAT, spectrum12);
    glActiveTexture(GL_TEXTURE0 + SPECTRUM_3_4_UNIT);
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA16F_ARB, FFT_SIZE, FFT_SIZE, 0, GL_RGBA, GL_FLOAT, spectrum34);
    TwDefine("Parameters color='255 0 0'");
*/

}

raptorjs.ocean.prototype.switchPingPongBuffer = function() {
	var currentBuffer = this.currentPingPongFrameBuffer;
	if(currentBuffer && currentBuffer.name == "ping") {
		this.currentPingPongFrameBuffer = this.pongFrameBuffer;
	} else {
		this.currentPingPongFrameBuffer = this.pingFrameBuffer;
	}
}


raptorjs.ocean.prototype.renderOcean = function() {
	var shader = this.surfaceShader;
	var camera = raptorjs.mainCamera;
	var shaderProgram = shader.program;

	gl.useProgram(shader.program);
	shader.setUniform("worldViewProjection", camera.worldViewProjection );

	var textureSampler = shader.getUniformByName('textureSampler');
	var primitive = this.surfaceMesh64;
	
	var buffer = primitive.verticesBuffer;
	var attribute = shader.getAttributeByName('position');
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.vertexAttribPointer(attribute, buffer.itemSize, gl.FLOAT, false, 0, 0);

	var buffer = primitive.textcoordsBuffer;
	var attribute = shader.getAttributeByName('uv');
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.vertexAttribPointer(attribute, buffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, fftOceanTexture);
	gl.uniform1i(textureSampler, 0);

	var buffer = primitive.indicesBuffer;
	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, buffer );
	gl.drawElements( gl.LINE_STRIP, buffer.numItems, gl.UNSIGNED_SHORT, 0 ); 
}


/*
raptorjs.ocean.prototype.createButterflyTexture = function(width, NumButterflies) {

	var indices = this.generateIndices(width, NumButterflies);
	var weights = this.generateWeights(width, NumButterflies);

	var dataArray = [];
	
	for( var row = 0; row < NumButterflies; row++ )
	{
		var rowStart = row * width * 4;
		for( var col = 0; col < width; col++ )
		{
			var colStart = col * 4;

			dataArray[rowStart + colStart + 0] = ( indices[NumButterflies-row-1][2*col] + 0.5 ) / width;
			dataArray[rowStart + colStart + 1] = ( indices[NumButterflies-row-1][2*col+1] + 0.5 ) / width;

			dataArray[rowStart + colStart + 2] =  weights.re[row][col];
			dataArray[rowStart + colStart + 3] =  weights.im[row][col]; 
		}
	}

	this.butterflyTexture = raptorjs.textureFromArray(dataArray, width, NumButterflies, true);
};
*/
/*
raptorjs.ocean.prototype.bitReverse = function(Indices, N, n) {
	var mask = 0x1;
	for (var j = 0; j < N; j++)
	{
		var val = 0x0;
		var temp = Indices[j];
		for (var i = 0; i < n; i++)
		{
			var t = (mask & temp);
			val = (val << 1) | t;
			temp = temp >> 1;
		}
		Indices[j] = val;
	}
	return Indices;
};
*/
raptorjs.ocean.prototype.createButterflyTexture = function(width, NumButterflies) {

    var data = [];
	var FFT_SIZE = this.width;
	var PASSES = 9;
	
	for (var i = 0; i < PASSES; i++) {
		var nBlocks  =  Math.pow(2.0, (PASSES - 1 - i));
		var nHInputs =  Math.pow(2.0, (i));
		for (var j = 0; j < nBlocks; j++) {
			for (var k = 0; k < nHInputs; k++) {
			    var i1, i2, j1, j2;
				if (i == 0) {
					i1 = j * nHInputs * 2 + k;
					i2 = j * nHInputs * 2 + nHInputs + k;
					j1 = this.bitReverse(i1, FFT_SIZE);
					j2 = this.bitReverse(i2, FFT_SIZE);
				} else {
					i1 = j * nHInputs * 2 + k;
					i2 = j * nHInputs * 2 + nHInputs + k;
					j1 = i1;
					j2 = i2;
				}

				var complex = this.getWeights(FFT_SIZE, k * nBlocks);
	
				var wr = complex.re;
				var wi = complex.im;
				
                var offset1 = 4 * (i1 + i * FFT_SIZE);
                data[offset1 + 0] = (j1 + 0.5) / FFT_SIZE;
                data[offset1 + 1] = (j2 + 0.5) / FFT_SIZE;
                data[offset1 + 2] = wr;
                data[offset1 + 3] = wi;

                var offset2 = 4 * (i2 + i * FFT_SIZE);
                data[offset2 + 0] = (j1 + 0.5) / FFT_SIZE;
                data[offset2 + 1] = (j2 + 0.5) / FFT_SIZE;
                data[offset2 + 2] = -wr;
                data[offset2 + 3] = -wi;
			}
		}
	}

	this.butterflyTexture = raptorjs.textureFromArray(data, width, NumButterflies, true);
}


raptorjs.ocean.prototype.getWeights = function(NumPoints, K) {
	w = {};
	w.re = Math.cos( ( 2.0 * Math.PI * K / NumPoints) );
	w.im = -Math.sin( (  2.0 * Math.PI * K / NumPoints)  );
	return w;
};

raptorjs.ocean.prototype.generateWeights = function(NumPoints, NumButterflies) {
	var groups = NumPoints / 2;
	var numKs = 1;

	var weightRe = [];
	var weightIm = [];

	for (var i = 0; i < NumButterflies; i++)
	{
		var start = 0;
		var end = numKs;

		weightRe[i] = [];
		weightIm[i] = [];

		for (var b = 0; b < groups; b++)
		{
			for (var k = start, K=0; k < end; k++,K++)
			{
				var c = this.getWeights(NumPoints, K * groups);

				weightRe[i][k] = c.re;
				weightIm[i][k] = c.im;
				weightRe[i][k+numKs] = -c.re;
				weightIm[i][k+numKs] = -c.im;
			}
			start += 2 * numKs;
			end = start + numKs;
		}
		
		groups = groups >> 1;
		numKs = numKs << 1;
	}

	var weights = {};
	weights.re = weightRe;
	weights.im = weightIm;

	return weights;
};

raptorjs.ocean.prototype.bitReverse = function(i,  N)
{
	var j = parseInt(i);
	var M = parseInt(N);
	var Sum = parseInt(0);
	var W = parseInt(1);
	M = parseInt(M / 2);
	while (parseInt(M) != parseInt(0)) {
		j = (i & M) > M - (1);
		Sum += (j * W);
		W *= 2;
		M = M / 2;
	}
	return Sum;
}

raptorjs.ocean.prototype.generateIndices = function(numPoints, numButterflies) {
	var indices = [];
	
	for (var i = 0; i < numButterflies; i++)
		indices[i] = [];
	
	var numIters = 1;
	var step;
	var offset = numPoints;
	
	for (var b = 0; b < numButterflies; b++) {
		offset = offset / 2;
		step = 2 * offset;
		var p = 0;
		var start = 0;
		var end = step;
		
		for (var i = 0; i < numIters; i++)
		{
			for (var j = start, k = p,l = 0; j < end; j+=2,l+=2,k++)
			{
				indices[b][j] = k;
				indices[b][j+1] = k + offset;
				indices[b][l+end] = k;
				indices[b][l+end+1] = k + offset;
			}
			
			start += 2 * step;
			end += 2 * step;
			p += step;
		}

		numIters = numIters << 1;
	}
	
	indices[numButterflies-1]  = this.bitReverse(indices[numButterflies-1], 2 * numPoints, numButterflies);
	
	return indices;
};