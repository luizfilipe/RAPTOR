

    attribute vec2 uv;
    attribute vec3 position;
	
    uniform mat4 viewProjection;

    varying vec2 v_uv;

    void main(void) {
        v_uv = uv;
		
		gl_Position = viewProjection *  vec4(position, 1.0);
    }
	
	// #raptorEngine - Split
	
	precision highp float;

    varying vec2 v_uv;

	uniform sampler2D adaptedLuminanceSampler;
	uniform sampler2D diffuseSampler;
	uniform sampler2D noiseMap;
	uniform sampler2D bloomSampler;
	
	uniform float contrast;
	
	mediump float EyeAdaption( mediump float fSceneLuminance )
	{
		float hdreyeadaptationbase = 0.25;
		float hdreyeadaptationfactor = 0.5; // r_hdreyeadaptationbase=0.25, r_hdreyeadaptationfactor=0.5
		
		mediump float ret = mix(hdreyeadaptationbase, fSceneLuminance, hdreyeadaptationfactor);

		return ret;
	}
		
	mediump vec4 ReinhardMapping(mediump vec4 cScene, mediump vec4 cBloom, mediump float fAdaptedLum ) {
	
		mediump vec3 LUMINANCE_VECTOR = vec3(0.2125, 0.7154, 0.0721);

		const mediump float fWhitePoint = 1.1;
		const mediump float fTargetAvgLum = 0.32;

		const mediump float fInvWhitePoint2 = 1.0 / (fWhitePoint*fWhitePoint);  

		mediump float fAdaptedLumDest = EyeAdaption(fAdaptedLum);

		mediump float fLum = dot(vec4(cScene.rgb,1.0), vec4(LUMINANCE_VECTOR,0.000001));

		mediump vec3 cBlackColor = vec3(0.0,0.0,0.0);
		mediump float fBlackLevel = 0.0;

		cScene.rgb = mix((0.5 + 0.5 * texture2D(noiseMap,v_uv.xy * 16.).xyz) * (fLum+fBlackLevel) * vec3(0.8,0.8,1.4) * 2.0, cScene.rgb, clamp(5.0*fLum, 0.0, 1.0));

		mediump float Ls = fTargetAvgLum * fLum / fAdaptedLumDest;
		mediump float Ld = Ls * (1.0+Ls*fInvWhitePoint2) / (1.0+Ls);

		cScene.rgb *= Ld / fLum;

		// desaturate
		mediump float fSaturation = 1.2;			// 1.0=full saturation, 0.0=grayscale
		mediump float fFinalLum = dot(cScene.rgb, LUMINANCE_VECTOR); 	
		cScene.rgb = mix(vec3(fFinalLum), cScene.rgb, fSaturation); 

		// contrast enhance
		mediump float fInvContrast = 1.15;		// 2.0 = contrast enhanced, 1.0=normal contrast, 0.01= max contrast reduced
		cScene.rgb = (cScene.rgb - 0.5) * fInvContrast + 0.5;	

		return cScene;
	}
	

mediump vec4 ApplyBlueShift(mediump vec4 cScene, mediump float fLum )
{

	mediump float fLumBlendMul = 2.0;                   
	mediump vec3 cBlueTarget = vec3( 0.8, 0.8, 1.4);

	cBlueTarget = vec3( 0.8, 0.8, 1.0);
	cBlueTarget = cBlueTarget * cBlueTarget;
	fLumBlendMul = 32.0;


	cBlueTarget *= fLum;
	cScene.rgb = mix(cBlueTarget * ( 1.0 + texture2D(noiseMap, v_uv.xy * 32.0).xyz ), cScene.rgb,  clamp(.5 + fLumBlendMul * fLum, 0.0, 1.0));


  return cScene;

}
	
	mediump float GetLuminance( mediump vec3 color )
	{
		return dot( color, vec3( 0.2126, 0.7152, 0.0722 ) );
	}
		
	mediump vec4 ExpMapping( mediump vec4 cScene, mediump vec4 cBloom, mediump float fAdaptedLum, mediump float fVignetting )
	{
		mediump float fLum = GetLuminance( cScene.rgb );
		fAdaptedLum = EyeAdaption( fAdaptedLum );

		mediump float fAdaptedLumDest = 3.0 / (0.000001 + 1.0 + 10.0 * fAdaptedLum);

		cScene = ApplyBlueShift( cScene, fLum );

		mediump float fLumLerp = clamp( fLum, 0.0, 1.0 );
		cScene.x = pow(cScene.x, contrast + fLumLerp* ( 1.0 - contrast) );
		cScene.y = pow(cScene.y, contrast + fLumLerp* ( 1.0 - contrast) );
		cScene.z = pow(cScene.z, contrast + fLumLerp* ( 1.0 - contrast) );

		// Tone mapping
		cScene.xyz = 1.0 - exp2( -fVignetting * (fAdaptedLumDest * cScene.xyz + cBloom.xyz  ));

		return cScene;
	}
	
	// Using RGBE format (exponent in alpha- filtering should decode first)
	// quality: perfect
	mediump vec4 EncodeRGBE( in mediump vec3 color )
	{
	  mediump float fLen = max( color.x, max( color.y, color.z ) ) ;  
	  mediump float fExp = ceil( log(fLen) / log(1.06) );

	  mediump vec4 ret;
	  ret.w = (fExp + 128.0) / 256.0;
	  ret.xyz = color.xyz / pow( 1.06, fExp);

	  return ret;   
	}

	// Using RGBE format (exponent in alpha- filtering should decode first)
	// quality: perfect
	mediump vec4 DecodeRGBE( mediump vec4 rgbe )
	{ 
	  mediump float fExp = rgbe.w * 256.0 - 128.0;
	  mediump float fScale = pow(1.06, fExp);

	  return vec4( rgbe.xyz * fScale, 1.0 );  
	}
	
	mediump vec4 DecodeRGBECorrected( in mediump vec4 rgbe )
	{   
	  return vec4( rgbe.xyz * exp2( rgbe.w * 256.0 - 128.0), 1.0 );
	}
	
    void main(void) {
		vec4 params = vec4(1.0);
	

		mediump vec4 vSample = DecodeRGBE(texture2D(diffuseSampler, v_uv.xy));

		// mediump vec4 cBloom0 = texture2D(bloomMap0, v_uv.xy);
		// mediump vec4 cBloom1 = texture2D(bloomMap1, v_uv.xy);
		// mediump vec4 cBloom2 = texture2D(bloomMap2, v_uv.xy);
		mediump vec4 cBloom0 = texture2D(bloomSampler, v_uv.xy);
		// 2.0, 1.15, 0.45 - handtweaked values to get nice sharp falloff (keeping backward compatibility with crysis1)
		mediump vec4 cBloom = (cBloom0 * 2.0 + cBloom0 * 1.15 * 0.5 + cBloom0 * 0.45* 0.5);
		
		mediump float fAdaptedLum = texture2D(adaptedLuminanceSampler, v_uv.xy).x;

		//    half fCenterDist = dot((IN.baseTC.xy*2-1), (IN.baseTC.xy*2-1));
		//    half fVignetting = saturate(1 - (fCenterDist - HDRParams3.z) * HDRParams3.w);
		//  mediump float fVignetting = texture2D(vignettingMap, v_uv.xy);  
		mediump float fVignetting = 1.0;

	//	vSample = ExpMapping( vSample, cBloom, fAdaptedLum, fVignetting);
		vSample = ReinhardMapping( vSample, cBloom, fAdaptedLum );

		float gamma = 2.2;
		
		gl_FragColor =  pow(vSample, vec4(1.0 / gamma));
 
	
    }
	