/**
 * Raptor Engine - Core
 * Copyright (c) 2010 RAPTORCODE STUDIOS
 * All rights reserved.
 */
  
/**
 * Author: Kaj Dijksta
 */
 
    attribute vec3 position;
    attribute vec2 uv;
	
    uniform mat4 viewProjection;
	uniform vec4 PixelOffset;

    varying vec2 v_textureCoord;
	
    void main(void) {
        v_textureCoord = uv;
		
		gl_Position = viewProjection * vec4(position, 1.0);
    }
	
	// #raptorEngine - Split
	
	precision highp float;

	uniform sampler2D depthSampler;
	uniform sampler2D ssaoSampler;
	
	uniform vec2 imageIncrement;

	uniform vec2 texSize;
	
	varying vec4 baseTC;
	varying vec2 v_textureCoord;

	float GaussianCoef(int x, int y)
	{
		float sigma = 1.0;
		return  ( 1. / ( sqrt(2. * 3.14) * sigma ) ) * exp( -float(x*x+y*y) / (2. *sigma*sigma) );
	}
	
	void main() {
	
	/*
		vec2 centerTC = v_textureCoord;

		mediump vec2 addr0, addr1, addr2, addr3;
	  
		addr0 = centerTC + imageIncrement * vec2(1.0, 1.0);
		addr1 = centerTC + imageIncrement * vec2(-1.0, 1.0);
		addr2 = centerTC + imageIncrement * vec2(1.0, -1.0);
		addr3 = centerTC + imageIncrement * vec2(-1.0, -1.0); 

		mediump vec4 depth4, value4;
		
		depth4.x = texture2D(depthSampler, addr0).x;
		depth4.y = texture2D(depthSampler, addr1).x;
		depth4.z = texture2D(depthSampler, addr2).x;
		depth4.w = texture2D(depthSampler, addr3).x;
		
		float centerDepth = texture2D( depthSampler, v_textureCoord ).x;
		float slope = 5.0 / centerDepth;
		
		mediump vec4 weight4 = clamp(1.0 - abs(depth4 - centerDepth) * slope, 0.0, 1.0);

		value4.x = texture2D(ssaoSampler, addr0).x;
		value4.y = texture2D(ssaoSampler, addr1).x;
		value4.z = texture2D(ssaoSampler, addr2).x;
		value4.w = texture2D(ssaoSampler, addr3).x;
	
		mediump float totalWeight = dot(weight4, vec4(1.0));
		mediump float color = clamp(max(0.01, dot(weight4, value4)) / totalWeight, 0.0, 1.0);
		
		gl_FragColor = vec4(color);
		
	
		
		float MSAA1X[5];
		MSAA1X[0] = 0.0002638650827373542;
		MSAA1X[1] = 0.10645077197359151;
		MSAA1X[2] = 0.7865707258873422;
		MSAA1X[3] = 0.10645077197359151;
		MSAA1X[4] = 0.0002638650827373542;

		vec2 imageCoordTmp = v_textureCoord - vec2(imageIncrement * 2.0);
		
		float centerDepth =  texture2D(depthSampler, v_textureCoord).x;
		float slope = 5.0 / centerDepth;
		
		vec4 colorSample;
		vec4 depthSample;
		
		for (int i = 0; i < 4; ++i) {
			colorSample[i] = texture2D(ssaoSampler, imageCoordTmp).x;
			depthSample[i] = texture2D(depthSampler, imageCoordTmp).x;
			
			imageCoordTmp += imageIncrement;
		}
		
		mediump vec4 weight = clamp(1.0 - abs(depthSample - centerDepth) * slope, 0.0, 1.0);
		
		mediump float totalWeight = dot(weight, vec4(1.0));
		mediump float color = clamp(max(0.01, dot(weight, colorSample)) / totalWeight, 0.0, 1.0);

		gl_FragColor = vec4(color);
		
		
			*/
		vec2 uv = v_textureCoord;
			
		const int kernelWidth = 13;
		float sigma = (kernelWidth - 1.0) / 6.0; // make the kernel span 6 sigma

		float fragmentDepth = texture2D(depthSampler, uv).x;

		float weights = 0.0;
		float blurred = 0.0;

		for (float i = -(kernelWidth - 1) / 2; i < (kernelWidth - 1) / 2; i++)
		{
			float geometricWeight = exp(-pow(i, 2.0) / (2.0 * pow(sigma, 2.0)));
			float sampleDepth = texture2D(depthSampler, vec2(uv.x - i * stepX, uv.y)).z;
			float photometricWeight = 1.0 / pow((1.0 + abs(fragmentDepth - sampleDepth)), cPhotometricExponent);

			weights += (geometricWeight * photometricWeight);
			blurred += texture2D(ssaoSampler, vec2(uv.x - i * stepX, uv.y)).r * geometricWeight * photometricWeight;
		}

		blurred /= weights;
		
		gl_FragColor = vec4(blurred);
	}