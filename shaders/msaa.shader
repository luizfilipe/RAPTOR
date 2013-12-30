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

    varying vec2 v_textureCoord;

    void main(void) {
        v_textureCoord = uv;
		gl_Position = viewProjection * vec4(position, 1.0);
    }
	
	// #raptorEngine - Split
	
	precision highp float;

	uniform sampler2D infoSampler;
	uniform sampler2D previousDiffuseSampler;
	uniform sampler2D currentDiffuseSampler;
	uniform sampler2D edgesTex;
	uniform sampler2D normalizedDepthSampler;
	uniform sampler2D depthSampler;
	
	uniform mat4 mViewProj;
	uniform mat4 mViewProjPrev;
	
	uniform float screenWidth;
	uniform float screenHeight;

	uniform float far;
	uniform float near;
	
	uniform vec3 frustumWorldCorners[8];
	uniform vec3 cameraPosition;
	uniform float test;
	
	varying vec2 v_textureCoord;

	vec4 HPosToScreenTC_PS(vec4 HPos)
	{
	  vec4 ScrTC = HPos;
	  ScrTC.xy = ( HPos.xy * vec2(1.0,-1.0) + HPos.ww  ) * 0.5;

	  return ScrTC;
	}
	
	vec3 constructPositionWorld( vec2 uv, float depth ) {
		return mix(
					mix(
						mix(frustumWorldCorners[0], frustumWorldCorners[1], uv.x), 
						mix(frustumWorldCorners[3], frustumWorldCorners[2], uv.x), 
						uv.y ), 		
					mix( 
						
						mix(frustumWorldCorners[7], frustumWorldCorners[6], uv.x), 
						mix(frustumWorldCorners[4], frustumWorldCorners[5], uv.x), 
						uv.y ), 
					depth ) + vec3( cameraPosition.y,cameraPosition.z, test);
	}
	
	void main() {
		
		vec2 uv = v_textureCoord;
		
		float fDepth = texture2D( infoSampler, uv ).z; // infoSampler.z; // * PS_NearFarClipDist.y;
		float depthNorm = fDepth / far;
		
		vec4 PostMsaaParams = vec4(1.0);
		vec4 PS_ScreenSize = vec4(screenWidth, screenHeight, screenWidth, screenHeight);
		
		vec2 PS_NearFarClipDist = vec2(near, far);
		

		

		vec3 vPosWS = constructPositionWorld(uv, depthNorm );
		vec4 vPrev  = mViewProjPrev * vec4(vPosWS, 1.0 );

		// vPrev = HPosToScreenTC_PS(vPrev);
		vPrev.xyz /= vPrev.w;
		vPrev = 0.5 * vPrev + 0.5;

		vec4 vCurr = (mViewProj * vec4(vPosWS, 1.0 ));
		// vCurr = HPosToScreenTC_PS(vCurr);
		
		vCurr.xyz /= vCurr.w;
		vCurr = 0.5 * vCurr + 0.5;

		float fExposureTime = PostMsaaParams.x;


		vec2 tcDelta = (vCurr.xy - vPrev.xy); // lerp(vCurr, vPrev, fExposureTime));

		float fSpeed = clamp(length(tcDelta), 0.0, 1.0);

		float nSamples = 8.0;
		
		vec4 cAcc = vec4(0.0);
		
		for(int t = 0; t < 8; t++)
		{
			cAcc += texture2D( currentDiffuseSampler, uv - tcDelta * (1.0 - ( float(t) / nSamples )) );
		}

		cAcc = texture2D(currentDiffuseSampler, vCurr.xy); // uv.xy);

		float fLerpAmount = clamp(1.0 - (1.0 / (2.0 * PostMsaaParams.w)), 0.0, 1.0);
		

		vec4 cAccPrev = texture2D(previousDiffuseSampler,  vPrev.xy);

		// sample center, determines whether to blend and is reference value for depth comparison  
		// normalizedDepthSampler
		mediump float sampleCenter	= texture2D(infoSampler, uv.xy).z / far;    
		mediump float dep = sampleCenter;	  

		PS_ScreenSize.zw *= 2.0;
		
		mediump float sampleRight	= texture2D( infoSampler, uv + vec2(PS_ScreenSize.z, 0.0) ).z / far;    
		mediump float sampleLeft	= texture2D( infoSampler, uv - vec2(PS_ScreenSize.z, 0.0) ).z / far;    
		mediump float sampleUp 		= texture2D( infoSampler, uv + vec2(0.0, PS_ScreenSize.w) ).z / far;    
		mediump float sampleDown 	= texture2D( infoSampler, uv - vec2(0.0, PS_ScreenSize.w) ).z / far;    

		mediump vec4 samples = vec4(0.0);
		
		samples.x = dep - sampleUp;	  
		samples.y = dep - sampleRight;	  
		samples.z = dep - sampleLeft;	  
		samples.w = dep - sampleDown;	  
		
		mediump float threshold = 0.016 * dep;  
		
		// samples = (samples>threshold);
		samples.x = (samples.x > threshold) ? 1.0 : 0.0;
		samples.y = (samples.y > threshold) ? 1.0 : 0.0;
		samples.z = (samples.z > threshold) ? 1.0 : 0.0;
		samples.w = (samples.w > threshold) ? 1.0 : 0.0;
		
		mediump float sum = clamp( 10000.0 * dot(samples, vec4(1.0)), 0.0, 1.0 );  

		float fEdge = 0.0;
		float fEdgePrev = texture2D(previousDiffuseSampler,  uv.xy).w;
		float fDepthPrev = 1.0; // GetLinearDepth( tex2D(_tex3, vPrev.xy).x )* PS_NearFarClipDist.y;

		if( abs(fDepth * PS_NearFarClipDist.y - fDepthPrev) > 0.1  )
		{
			fEdge = 1.0;
		}

		mediump float fOut;
		
		if(vPrev.x > 0.0 && vPrev.y > 0.0)
			fOut = 1.0;
		else
			fOut = 0.0;
			
		// mediump float fOut = all( vec4(vPrev.xy >= 0, vPrev.xy < 1.0) );
		
		fLerpAmount *= fOut;

		vec4 color = mix(cAcc, cAccPrev, clamp(fLerpAmount, 0.0, 1.0) );
		
		
		color.w = fEdge;

		gl_FragColor = vec4(color);
	}

	