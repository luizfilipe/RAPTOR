/**
 * Raptor Engine - Core
 * Copyright (c) 2013 RAPTORCODE STUDIOS
 * All rights reserved.
 *
 */
  
/**
 * Author: Kaj Dijksta
 */

    attribute vec2 uv;
    attribute vec3 position;
	
    uniform mat4 viewProjection;

    varying vec2 v_uv;

    void main(void) {
        v_uv = uv;
		
		gl_Position = viewProjection *  vec4(position, 1.0);
    }
	
	// #raptorEngine - Split
	
	#ifndef AMBIANT_ONLY
	#define AMBIANT_ONLY 0
	#endif
	
	
	precision highp float;

    varying vec2 v_uv;
	
	uniform sampler2D infoSampler;
	uniform sampler2D randomSampler;
	uniform sampler2D diffuseSampler;

	uniform float screenWidth;
	uniform float screenHeight;
	
	uniform vec3 cameraPosition;
	uniform float test;
//	uniform float scaleQuality;
//	uniform float definitionValue;

	uniform float far;
	uniform mat3 viewMatrix3;
	uniform float type;
	uniform vec3 scale[ 32 ];
	uniform vec4 kernelRad[ 8 ];
	
	
	struct fragmentPass {
		highp vec2 uv;
		
		mediump vec4 diffuse;
		
		mediump vec3 normal;
		mediump vec3 positionWorld;
		
		mediump float ambiantOcclusion;
		
		highp float far;
		highp float depth;
		highp float depthNorm;
	};
	
	float Phong( vec3 N, vec3 V, vec3 L, float Exp )
	{
		mediump vec3 R = reflect(-L, N);		
		return pow( clamp( dot(V, R), 0.0, 1.0 ), Exp);	
	}

	

	
	// Depth-Only based SSAO
	float Ambiant_Depth_Occlusion( vec2 uv ) {

		mediump vec4 SSAO_params = vec4( .6, 0.075, 1.0, 1.0 );
		
		const mediump float step = 1.0 - 1.0 / 8.0;
		const mediump float fScale = 0.025; // 0.025
		
		mediump float n = 0.0;
		
		mediump vec3 directions[8];

		directions[0] = normalize(vec3( 1.0, 1.0, 1.0))*fScale*(n+=step);
		directions[1] = normalize(vec3(-1.0,-1.0,-1.0))*fScale*(n+=step);
		directions[2] = normalize(vec3(-1.0,-1.0, 1.0))*fScale*(n+=step);
		directions[3] = normalize(vec3(-1.0, 1.0,-1.0))*fScale*(n+=step);
		directions[4] = normalize(vec3(-1.0, 1.0 ,1.0))*fScale*(n+=step);
		directions[5] = normalize(vec3( 1.0,-1.0,-1.0))*fScale*(n+=step);
		directions[6] = normalize(vec3( 1.0,-1.0, 1.0))*fScale*(n+=step);
		directions[7] = normalize(vec3( 1.0, 1.0,-1.0))*fScale*(n+=step);

		mediump vec3 randomSample = texture2D(randomSampler, vec2(screenWidth, screenHeight) * uv / 4.0).xyz  * 2.0 - 1.0;
		
		mediump float sceneDepth = texture2D(infoSampler, uv).x;  	  

		mediump float sceneDepthU = sceneDepth * far;  

		mediump vec3 vSampleScale = SSAO_params.zzw * clamp( sceneDepthU / 5.3, 0.0, 1.0 ) * ( 1.0 + sceneDepthU / 8.0 );

		mediump float fDepthRangeScale = far / vSampleScale.z * 0.75;

		vSampleScale.xy *= 1.0 / sceneDepthU;
		vSampleScale.z  *= 2.0 / far;

		float fDepthTestSoftness = 64.0 / vSampleScale.z;

		// sample
		mediump vec4 sceneDeptF[2];    
		mediump vec4 vSkyAccess = vec4(0.0);
		mediump vec3 iSample;
		mediump vec4 vDistance;
		
		highp vec4 fRangeIsInvalid = vec4(0.0);

		const float scaleQuality = 0.2;
		
		vec4 vDistanceScaled;

		// Help Angle a bit
		// for(int i=0; i<1; i++)
		// {    
		
			iSample = reflect(directions[0], randomSample) * vSampleScale;		
			sceneDeptF[0].x = texture2D( infoSampler, uv.xy + iSample.xy ).x  + iSample.z;  

			iSample.xyz *= scaleQuality;
			sceneDeptF[1].x = texture2D( infoSampler, uv.xy + iSample.xy ).x + iSample.z;  

			iSample = reflect(directions[1], randomSample) * vSampleScale;		
			sceneDeptF[0].y = texture2D( infoSampler, uv.xy + iSample.xy ).x + iSample.z;  

			iSample.xyz *= scaleQuality;
			sceneDeptF[1].y = texture2D( infoSampler, uv.xy + iSample.xy ).x + iSample.z;  


			iSample = reflect(directions[2], randomSample) * vSampleScale;		
			sceneDeptF[0].z = texture2D( infoSampler, uv.xy + iSample.xy ).x + iSample.z;  

			iSample.xyz *= scaleQuality;
			sceneDeptF[1].z = texture2D( infoSampler, uv.xy + iSample.xy ).x + iSample.z;  


			iSample = reflect(directions[3], randomSample) * vSampleScale;		
			sceneDeptF[0].w = texture2D( infoSampler, uv.xy + iSample.xy ).x + iSample.z;  

			iSample.xyz *= scaleQuality;
			sceneDeptF[1].w = texture2D( infoSampler, uv.xy + iSample.xy ).x + iSample.z;  

			const float definitionValue = 0.001;

			// for(int s=0; s<2; s++)
			// {
			
				vDistance = sceneDepth - sceneDeptF[0]; 
				vDistanceScaled = vDistance * fDepthRangeScale;
				fRangeIsInvalid = (clamp( abs(vDistanceScaled), 0.0, 1.0 ) + clamp( vDistanceScaled, 0.0, 1.0 )) / 2.0;  
				vSkyAccess += mix(clamp((-vDistance)*fDepthTestSoftness, 0.0, 1.0), vec4(definitionValue), fRangeIsInvalid);
				
				vDistance = sceneDepth - sceneDeptF[1]; 
				vDistanceScaled = vDistance * fDepthRangeScale;
				fRangeIsInvalid = (clamp( abs(vDistanceScaled), 0.0, 1.0 ) + clamp( vDistanceScaled, 0.0, 1.0 )) / 2.0;  
				vSkyAccess += mix(clamp((-vDistance)*fDepthTestSoftness, 0.0, 1.0), vec4(definitionValue), fRangeIsInvalid);
				
			// }
			
			/*
			iSample = reflect(directions[4], randomSample) * vSampleScale;		
			sceneDeptF[0].x = texture2D( infoSampler, uv.xy + iSample.xy ).x + iSample.z;  

			iSample.xyz *= scaleQuality;
			sceneDeptF[1].x = texture2D( infoSampler, uv.xy + iSample.xy ).x + iSample.z;  

			iSample = reflect(directions[5], randomSample) * vSampleScale;		
			sceneDeptF[0].y = texture2D( infoSampler, uv.xy + iSample.xy ).x + iSample.z;  

			iSample.xyz *= scaleQuality;
			sceneDeptF[1].y = texture2D( infoSampler, uv.xy + iSample.xy ).x + iSample.z;  


			iSample = reflect(directions[6], randomSample) * vSampleScale;		
			sceneDeptF[0].z = texture2D( infoSampler, uv.xy + iSample.xy ).x + iSample.z;  

			iSample.xyz *= scaleQuality;
			sceneDeptF[1].z = texture2D( infoSampler, uv.xy + iSample.xy ).x + iSample.z;  


			iSample = reflect(directions[7], randomSample) * vSampleScale;		
			sceneDeptF[0].w = texture2D( infoSampler, uv.xy + iSample.xy ).x + iSample.z;  

			iSample.xyz *= scaleQuality;
			sceneDeptF[1].w = texture2D( infoSampler, uv.xy + iSample.xy ).x + iSample.z;  

			const float definitionValue = 0.001;
			
			// for(int d=0; d<2; d++)
			// {
				vDistance = sceneDepth - sceneDeptF[0]; 
				vDistanceScaled = vDistance * fDepthRangeScale;
				fRangeIsInvalid = (clamp( abs(vDistanceScaled), 0.0, 1.0 ) + clamp( vDistanceScaled, 0.0, 1.0 )) / 2.0;  
				vSkyAccess += mix(clamp((-vDistance)*fDepthTestSoftness, 0.0, 1.0), vec4(definitionValue), fRangeIsInvalid);
				
				vDistance = sceneDepth - sceneDeptF[1]; 
				vDistanceScaled = vDistance * fDepthRangeScale;
				fRangeIsInvalid = (clamp( abs(vDistanceScaled), 0.0, 1.0 ) + clamp( vDistanceScaled, 0.0, 1.0 )) / 2.0;  
				vSkyAccess += mix(clamp((-vDistance)*fDepthTestSoftness, 0.0, 1.0), vec4(definitionValue), fRangeIsInvalid);
			// }
			*/
			
		// }

		float ambientOcclusion = dot( vSkyAccess, vec4( ( 1.0 / 16.0 ) * 2.0 ) ) - SSAO_params.y; // 0.075f
		ambientOcclusion = clamp(mix( 0.9, ambientOcclusion, SSAO_params.x ), 0.0, 1.0);
		
		return ambientOcclusion;
	}
	
	float Ambiant_Occlusion(vec2 uv, float depth, vec3 normal)
	{
		const mediump float occlusionIntensity = 0.4;
		const mediump int samplesNum = 16; // QUALITY_HIGH;
		
		const mediump float occFactor = 0.05;
		const mediump float effectAmount  = occlusionIntensity / ( float(samplesNum) / 2.0 );
		const mediump float slope = 1000.0;
		
		mediump float a = 2.8 * ( 1.0 + sqrt( occFactor ) ) / slope;
		const mediump float b = 1.0 - 2.8;

		mediump vec3 randomNormal = texture2D(randomSampler, vec2(screenWidth, screenHeight) * uv / 4.0).xyz  * 2.0 - 1.0; // optimize!
		mediump vec4 invDepth = vec4( slope / depth );
		
		mediump vec4 totalOcclusion = vec4(0.0);

		for (int i = 0; i < samplesNum / 4; i++)
		{
			mediump vec4 tapDepth = vec4(0.0);
			mediump vec4 sampleDepth = vec4(0.0);
			mediump vec4 dotProd = vec4(0.0);

			for (int j = 0; j < 4; ++j)
			{
				mediump vec3 sample = reflect(scale[4*i+j], randomNormal);

				dotProd[j] = dot(sample, normal);
				sample = (dotProd[j] >= 0.0) ? sample : -sample;

				tapDepth[j] = texture2D( infoSampler, uv.xy + sample.xy ).x;
				
				sampleDepth[j] = sample.z;
			}
			
			tapDepth = tapDepth * invDepth;

			mediump vec4 occAmount = clamp( slope + sampleDepth * (2.0 * slope) - tapDepth, 0.0, 1.0 );

			occAmount *= clamp(a * tapDepth + b, 0.0, 1.0);
			occAmount *= (abs(dotProd) * kernelRad[i]);

			totalOcclusion += occAmount;
		}

		totalOcclusion *= effectAmount;
		
		lowp float result = 1.0 - dot(vec4(1.0), totalOcclusion);
		
		return result;
	}
		

float ambiant_Fast_Occlusion(vec2 uv, float depth, vec3 normal)
{
	const mediump vec4 SSAO_params = vec4( 1., 0.075, 1.0, 2.0 );
	
	const int samplesNum = 8; // QUALITY_HIGH;

	const mediump float radius = 0.6;
	const mediump float invRadius = 1.0 / radius;
	const mediump float fadeIn = 2.5;
	const mediump float effectAmount  = SSAO_params.x;

	// Kernel definition
		vec3 scale[ 16 ];
		
		scale[0] = vec3(-0.055664, -0.00371090, -0.0654297);
		scale[1] = vec3(0.0173828, 0.0111328, 0.0064453);
		scale[2] = vec3(0.0001953, 0.008203100000000001, -0.0060547); 
		scale[3] = vec3(0.0220703, -0.035937500000000004, -0.00625);
		scale[4] = vec3(0.0242188, 0.012695300000000001, -0.025);
		scale[5] = vec3(0.0070313, -0.0025391000000000003, 0.014843799999999999);
		scale[6] = vec3(-0.007812, 0.0013672, -0.0314453); 
		scale[7] = vec3(0.0117188, -0.0140625, -0.019921900000000003); 
		scale[8] = vec3(-0.025195, -0.055859400000000003, 0.008203100000000001);
		scale[9] = vec3(0.0308594, 0.019335900000000003, 0.0324219); 
		scale[10] = vec3(0.0173828, -0.0140625, 0.003125); 
		scale[11] = vec3(0.0179688, -0.0044922, 0.004687500000000001);
		scale[12] = vec3(-0.014648, -0.020117200000000002, -0.0029297000000000004);
		scale[13] = vec3(-0.030078, 0.0234375, 0.0539063); 
		scale[14] = vec3(0.0228516, 0.0154297, -0.0119141);
		scale[15] = vec3(-0.011914, -0.00039060000000000006, -0.006640600000000001); 
		// scale[16] = vec3(-0.021875, 0.0214844, -0.025);
		// scale[17] = vec3(0.0113281, -0.0091797, 0.021289100000000002); 
		// scale[18] = vec3(0.0105469, -0.003906300000000001, -0.0019531000000000001);
		// scale[19] = vec3(-0.0705078, -0.0060547, 0.0023438); 
		// scale[20] = vec3(0.0021484, 0.032617200000000006, 0.011523400000000001); 
		// scale[21] = vec3(0.035351600000000004, 0.0208984, -0.029492200000000003); 
		// scale[22] = vec3(-0.0029297000000000004, -0.025976600000000002, 0.0089844); 
		// scale[23] = vec3(-0.0240234, 0.0146484, -0.006835900000000001);
		// scale[24] = vec3(-0.029687500000000002, 0.041015600000000006, -0.029101600000000002);
		// scale[25] = vec3(0.0078125, 0.0113281, -0.012695300000000001); 
		// scale[26] = vec3(-0.015234400000000002, -0.0019531000000000001, 0.014257800000000001); 
		// scale[27] = vec3(-0.0214844, -0.0175781, 0.0191406); 
		// scale[28] = vec3(0.0134766, 0.04140630000000001, -0.0707031); 
		// scale[29] = vec3(0.029101600000000002, -0.0833984, -0.0183594); 
		// scale[30] = vec3(-0.005859400000000001, -0.0111328, 0.0457031); 
		// scale[31] = vec3(-0.011523400000000001, -0.0287109, -0.025976600000000002); 



	mediump vec3 randomNormal = texture2D(randomSampler, vec2(screenWidth, screenHeight) * uv / 4.0).xyz  * 2.0 - 1.0;
	
	mediump vec4 depthInv = vec4(1.0 / depth);

	// Init the occlusion
	mediump vec4 fOcclusion = vec4(0.0);

	for (int i = 0; i < samplesNum; i += 4)
	{
		mediump vec4 fTapDepth = vec4(0.0);
		mediump vec4 fSampleDepth = vec4(0.0);
		mediump vec4 amount;		
		mediump vec4 fadeOut;

		// Prepare a data packet of 4 samples
		for (int j = 0; j < 4; ++j)
		{
			mediump vec3 sample = reflect(scale[i+j], randomNormal);

			float sign_test = dot(sample,normal);
			sample = (sign_test >= 0.0) ? sample : -sample;

			fTapDepth[j] = texture2D( infoSampler, ( uv + sample.xy )).x;

			fSampleDepth[j] = sample.z;
		}


		fTapDepth = fTapDepth * depthInv;

		// Compute the relative sample depth. The depth is multiplied by 2 in order to avoid the sampling sphere
		// distortion since the screen space is in [0..1]x[0..1] while the depth is in [-1..1].
		mediump vec4 distScale = (1.0 + fSampleDepth * 2. - fTapDepth) * invRadius;

		// Compute the occlusion amount
		// If the occluders are inside the effect radius, make sure that closer occluders contribute less.
		amount = clamp( fadeIn * distScale, 0.0, 1.0 );

		// Compute the occlusion falloff factor
		// Fade the effect away for occluders that are outside the effect radius.
		fadeOut = clamp( 1.0 / distScale, 0.0, 1.0 );

		fOcclusion += amount * fadeOut;
	}

	fOcclusion *= effectAmount/float(samplesNum);

	mediump float result = dot(vec4(1.0), fOcclusion);

	return 1.0 - result;
}
		
		
	mediump vec3 decode( mediump vec2 enc ) {
		mediump vec2 fenc = enc * 4.0 - 2.0;
		mediump float f = dot(fenc, fenc);
		mediump float g = sqrt(1.0 - f / 4.0);
		mediump vec3 n;
		n.xy = fenc * g;
		n.z = 1.0 - f / 2.0;
		return n;
	}

	#ifndef SSAO_TYPE
		#define SSAO_TYPE 0
	#endif
	
    void main(void) {
		
		vec4 sceneInfo = texture2D( infoSampler, v_uv );
		
		float depth = sceneInfo.x;
		float depthNorm = depth / far;
		
		vec3 normal = decode(sceneInfo.yz);
		
		float ambiantOcclusion;
		
		#if SSAO_TYPE == 0
		
			ambiantOcclusion = Ambiant_Depth_Occlusion( v_uv );
		
		#elif SSAO_TYPE == 1
			
			ambiantOcclusion = ambiant_Fast_Occlusion( v_uv, depth, normal );
			
		#elif SSAO_TYPE == 2 

			ambiantOcclusion = Ambiant_Occlusion( v_uv, depth, normal );
		
		#endif
			
			
		//#if AMBIANT_ONLY == 1
			gl_FragColor = vec4(ambiantOcclusion, ambiantOcclusion, ambiantOcclusion, 1.0);
	//	#else
	//		gl_FragColor = vec4(ambiantOcclusion, depthNorm, 0.0, 0.0);
	//	#endif

    }
	