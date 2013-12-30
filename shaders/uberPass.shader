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

    varying vec2 v_uv;

    void main(void) {
        v_uv = uv;
		gl_Position = viewProjection * vec4(position, 1.0);
    }
	
	// #raptorEngine - Split
	
	precision mediump float;

	varying vec2 v_uv;

	uniform sampler2D ambiantOccSampler;
	uniform sampler2D sceneDiffuseAccSampler;
	uniform sampler2D albedoSampler;
	uniform sampler2D globalIlluminationSampler;
	
	uniform sampler2D diffuseSampler;
	uniform sampler2D infoSampler;
	uniform sampler2D shadowSampler1;
	uniform sampler2D randomSampler;
	uniform sampler2D jitterSampler;
	uniform sampler2D sRotSampler;
	
	uniform mat4 view;
	
	uniform float screenWidth;
	uniform float screenHeight;
	
	uniform float far;
	
	uniform vec3 frustumWorldCorners[8];
	
	uniform vec3 cameraPosition;
	uniform float test;
	
	uniform vec3 lightPosition1;
	uniform mat4 lightViewProjection1;
	uniform mat3 view3;
	
	
	uniform float shadowBias;
	uniform float g_minVariance;
	uniform float occlusionAmount;

	uniform mat4 worldToLPV;
	
	struct fragmentPass{
		highp vec2 uv;
		
		mediump vec3 albedo;
		mediump vec3 ambient;
		mediump vec3 gloss;
		
		mediump vec3 normal;
		mediump vec3 normalW;
		mediump vec3 positionWorld;
		
		mediump vec3 specularAcc;
		mediump vec3 diffuseAcc;
		mediump vec3 ambientAcc;
		
		mediump vec3 eye;
		mediump vec3 reflectionVector;
		mediump float ambiantOcclusion;
		mediump float shadowOcclusion;
		
		mediump float ndotE;
		
		highp float far;
		highp float depth;
		highp float depthNorm;
	};

	float DecodeFloatRGBA( vec4 rgba ) {
	  return dot( rgba, vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 160581375.0) );
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
	
	// Shadow Mapping
	
	// Variance
	float linestep(float min, float max, float value) {  
		return clamp((value - min) / (max - min), 0.2, 1.);
	}

	float reduceBleeding(float p_max, float amount) {
		return linestep(amount, 1.0, p_max);
	}

	float ChebyshevUpperBound(vec2 moments, float distance) {  
		if (distance <= moments.x)
			return 1.0;

		float variance = moments.y - (moments.x*moments.x);
		variance = max(variance,g_minVariance);

		float d = distance - moments.x;
		float p_max = variance / (variance + d*d);

		return reduceBleeding(p_max, shadowBias);
	}
	
	#define SAMPLES_COUNT 32

	#define INV_SAMPLES_COUNT (1.0 / SAMPLES_COUNT)
	
	// 
	float poissonPCFmultitap(vec4 projCoords, float shadowDepth, vec2 uv)
	{
		const mediump float step = 1.0 - 1.0 / 8.0;
		const mediump float fScale = 0.025; // 0.025
		
		mediump float n = 0.0;
		
		mediump vec3 directions[8];
		float vSampleScale = 1.0 / 2048.0;
		
		
		directions[0] = normalize(vec3( 1.0, 1.0, 1.0))*fScale*(n+=step);
		directions[1] = normalize(vec3(-1.0,-1.0,-1.0))*fScale*(n+=step);
		directions[2] = normalize(vec3(-1.0,-1.0, 1.0))*fScale*(n+=step);
		directions[3] = normalize(vec3(-1.0, 1.0,-1.0))*fScale*(n+=step);
		directions[4] = normalize(vec3(-1.0, 1.0 ,1.0))*fScale*(n+=step);
		directions[5] = normalize(vec3( 1.0,-1.0,-1.0))*fScale*(n+=step);
		directions[6] = normalize(vec3( 1.0,-1.0, 1.0))*fScale*(n+=step);
		directions[7] = normalize(vec3( 1.0, 1.0,-1.0))*fScale*(n+=step);

		mediump vec3 randomSample = texture2D(randomSampler, vec2(64.0, 64.0) * uv.xy / 4.0).xyz  * 2.0 - 1.0;
		
		

		float sum = 0.0;

		// for( int i = 0; i < 4; i++ ) {
		// 	vec3 sampler = reflect(directions[0], randomSample) * vSampleScale;	
			
			float pixelDepth = DecodeFloatRGBA(texture2D(shadowSampler1, projCoords.xy )); // + sampler.xy     + sampler.z

			if( pixelDepth + shadowBias > shadowDepth) {
				sum += 0.25;
			} else {
				sum += 0.0;
			}
		// }

		return sum;
	}

	float unpackDepth(vec4 packedZValue)
	{
		return ( packedZValue.a +
				 packedZValue.b / 256.0 +
				 packedZValue.g / 65536.0 +
				 packedZValue.r / 16777216.0 ) * far;
	}
		
	float shadow_sample(sampler2D depthMap, vec2 coord)
	{
		return DecodeFloatRGBA(texture2D(depthMap, coord.xy)) * far;
	}
	
	vec2 DoubleSampleRotated(sampler2D depthMap, vec4 p, vec4 rotMatr, vec4 kernel) {
			// Rotate tap for this pixel location
			vec4 rotatedOff;

			rotatedOff = rotMatr.xyzw * kernel.xxww +
						 rotMatr.zwxy * kernel.yyzz;

			vec4 fetchPos = p.xyxy + rotatedOff;// + rotatedOff

			// float4 fetchPos = p.xyxy + ( float4(kernel1,kernel2) * 1.0f * vInvShadowMapWH.xyxy );
	// #if D3D10
	// 		shadow_sample(depthMap, float3(fetchPos.xy,p.z), result.x);
	// 		shadow_sample(depthMap, float3(fetchPos.zw,p.z), result.y);

	// #else
	// 		#if %_RT_HW_PCF_COMPARE
		  // optimization for shader compiler
	// 			result.x = tex2Dproj(depthMap, p + (rotatedOff.xyzw*float4(1,1,0,0)) ).r;
	// 			result.y = tex2Dproj(depthMap, p + (rotatedOff.zwxy*float4(1,1,0,0)) ).r;
	// 		#else
				vec2 result;
				
				result.x = shadow_sample(depthMap, fetchPos.xy);
				result.y = shadow_sample(depthMap, fetchPos.zw);
	// 		#endif
	// #endif
		
		return result;
	}
	
	
	float PCF(sampler2D depthMap, vec4 p, vec2 randDirTC, float depth)
	{
	
		vec2 kernelRadius = vec2(4.0);
		
		vec4 irreg_kernel_2d[8];
		irreg_kernel_2d[0] = vec4(-0.556641,-0.037109,-0.654297, 0.111328); 
		irreg_kernel_2d[1] = vec4(0.173828,0.111328,0.064453, -0.359375); 
		irreg_kernel_2d[2] = vec4(0.001953,0.082031,-0.060547, 0.078125); 
		irreg_kernel_2d[3] = vec4(0.220703,-0.359375,-0.062500, 0.001953);
		irreg_kernel_2d[4] = vec4(0.242188,0.126953,-0.250000, -0.140625); 
		irreg_kernel_2d[5] = vec4(0.070313,-0.025391,0.148438, 0.082031); 
		irreg_kernel_2d[6] = vec4(-0.078125,0.013672,-0.314453, 0.013672);
		irreg_kernel_2d[7] = vec4(0.117188,-0.140625,-0.199219, 0.117188);

		vec2 vInvShadowMapWH = vec2(1.0 / 2048.0);
		
		const int kernelSize = 8;
		
		mediump float P_Z = depth; // p.z;

		vec4 p0 = vec4(p.xyz, 1.0);

		
		mediump vec2 rotScale = vec2(kernelRadius.y * 15.0);

		float shadowTest = 0.0;

		#define KERNEL_STEP_SIZE 2

		//#if PS3
			// hints the compiler to use the _bx2 modifier
			// #pragma sce-cgc("-texformat 1 RGBA8");
			// mediump vec2 rotSample = 2.0 * texture2D(sRotSampler, vec2(randDirTC).xy * rotScale.xy).xy - 1.0;
			// rotSample.xy = normalize(rotSample.xy);
			// rotSample.xy *= (kernelRadius.xy * vInvShadowMapWH.xy);

			// mediump vec4 rot = vec4(rotSample.x, -rotSample.y, rotSample.y, rotSample.x);

			// half4 sampleDepth;
			// DoubleSampleRotated(depthMap, p0, rot, irreg_kernel_2d[0], sampleDepth.xy);
			// DoubleSampleRotated(depthMap, p0, rot, irreg_kernel_2d[1], sampleDepth.zw);

			// half4 InShadow	= sampleDepth;
			// half fInvSamplNum = (1.0 / 4.0);
			// shadowTest = dot(InShadow,fInvSamplNum.xxxx);

			//	DoubleSampleRotated(depthMap, p0, rot, irreg_kernel_2d[2], sampleDepth.xy);
			//	DoubleSampleRotated(depthMap, p0, rot, irreg_kernel_2d[3], sampleDepth.zw);
			//	InShadow	= sampleDepth;
			//  shadowTest += dot(InShadow,fInvSamplNum.xxxx);
		// #else
			vec2 rotSample = 2.0 * texture2D(sRotSampler, randDirTC.xy).xy - 1.0;
			rotSample.xy = normalize(rotSample.xy);
			rotSample.xy *= (kernelRadius.xy * vInvShadowMapWH.xy);

			// rotation 2x2 matrix for SampleRotated
			// float4 rot = float4(rotSample.x, rotSample.y, -rotSample.y, rotSample.x);
			// rotation 2x2 matrix for DoubleSampleRotated
			vec4 rot = vec4(rotSample.x, -rotSample.y, rotSample.y, rotSample.x);
			// rot *= radius * vInvShadowMapWH.xyxy;
			
			const int kernelOffset = 0;
			
			
			for(int i=kernelOffset; i<kernelSize; i+=KERNEL_STEP_SIZE) // Loop over taps
			{

				mediump vec4 sampleDepth = vec4(0.0);
				vec4 irr =  irreg_kernel_2d[i+0];
				sampleDepth.xy = DoubleSampleRotated(depthMap, p0, rot, irr);
				sampleDepth.zw = DoubleSampleRotated(depthMap, p0, rot, irreg_kernel_2d[i+1]);
			

				// #if D3D10		
				// was for _RT_HW_PCF_COMPARE
				// 		//FIX: flag to simulate InShadow
				// 		#if %_RT_TEX_ARR_SAMPLE
						mediump vec4 InShadow;
						InShadow.x = ( P_Z < sampleDepth.x + shadowBias ) ? 1. : 0.02;
						InShadow.y = ( P_Z < sampleDepth.y + shadowBias ) ? 1. : 0.02;
						InShadow.z = ( P_Z < sampleDepth.z + shadowBias  ) ? 1. : 0.02;
						InShadow.w = ( P_Z < sampleDepth.w + shadowBias  ) ? 1. : 0.02;
				// 		#else
				//			vec4 InShadow = sampleDepth;
				// 		#endif
				// #else
						// Determine whether tap is in shadow                
				// 		#if %_RT_HW_PCF_COMPARE 
				// 			half4 InShadow	= sampleDepth;
				// 		#else
				// 			half4 InShadow = ( P_Z.xxxx < sampleDepth);
				// 		 //float4 InShadow = saturate((sampleDepth-P_Z.xxxx)*10000.0f);
				// 		#endif
				// #endif
				
				const mediump float quality = 8.0; // 8 == high
				const mediump float fInvSamplNum = (1.0 / quality);
				
				shadowTest += dot(InShadow, vec4(fInvSamplNum));
			}

		return shadowTest;
	}
	


	vec4 sampleAs3DTexture(sampler2D tex, vec3 texCoord, float size) {
	   float sliceSize = 1.0 / size;                         // space of 1 slice
	   float slicePixelSize = sliceSize / size;              // space of 1 pixel
	   float sliceInnerSize = slicePixelSize * (size - 1.0); // space of size pixels
	   float zSlice0 = min(floor(texCoord.z * size), size - 1.0);
	   float zSlice1 = min(zSlice0 + 1.0, size - 1.0);
	   float xOffset = slicePixelSize * 0.5 + texCoord.x * sliceInnerSize;
	   float s0 = xOffset + (zSlice0 * sliceSize);
	   float s1 = xOffset + (zSlice1 * sliceSize);
	   vec4 slice0Color = texture2D(tex, vec2(s0, texCoord.y));
	   vec4 slice1Color = texture2D(tex, vec2(s1, texCoord.y));
	   float zOffset = mod(texCoord.z * size, 1.0);
	   return mix(slice0Color, slice1Color, zOffset);
	}
	
	


	float smoothShadow(vec4 projCoords, float shadowDepth, vec2 uv)
	{
		float m_softness = 8.0;
		float m_jitter = 1.0;
		
		float JITTER_SIZE = 32.0;
		
		vec4 FilterSize = vec4(0.0, 0.0, 0.0, m_softness / 2048.0);
		vec4 JitterScale = vec4(m_jitter / JITTER_SIZE, m_jitter / JITTER_SIZE, 0.0, 0.0);
		
		float fsize = projCoords.w * FilterSize.w;
		
		vec4 smcoord = vec4(0.0, 0.0, projCoords.zw);
		vec4 jcoord  = vec4(uv.xy * JitterScale.xy, 0.0, 0.0);
		
		float shadow = 0.0;
		
		vec4 jitter;
		
		// Perform 16 samples
		for(int i = 0; i <= 7; i++) {
			// jitter = (2 * tex3D(JitterSampler, jcoord) - 1.0);
			// jitter = texture2D(jitterSampler, vec2(screenWidth, screenHeight) * jcoord.xy / 4.0)  * 2.0 - 1.0;

			jitter = sampleAs3DTexture(jitterSampler, jcoord.xyz, JITTER_SIZE);
			jcoord.z += 0.03125;
			smcoord.xy = jitter.xy * fsize + projCoords.xy;
			shadow += texture2DProj(shadowSampler1, smcoord.xyz).x;
			smcoord.xy = jitter.zw * fsize + projCoords.xy;
			shadow += texture2DProj(shadowSampler1, smcoord.xyz).x;
		}
		
		shadow /= 7.0;

		return shadow;
		
	}
	
	float calculateShadowOcclusion( vec3 worldPosition, vec2 uv ) {

		vec4 projCoords = lightViewProjection1 *  vec4(worldPosition, 1.0);
		
		float shadowDepth = length( vec3(400., 1800., 650.).xyz - worldPosition );
		// float shadowDepth = length( lightPosition1.xyz - worldPosition );
		
		 projCoords.xy /= projCoords.w;
		 projCoords = 0.5 * projCoords + 0.5;

		vec4 moments = texture2D( shadowSampler1, projCoords.xy );


		
		
		mediump vec2 randomSample = texture2D(randomSampler, vec2(screenWidth, screenHeight) * uv / 64.0).xy  * 2.0 - 1.0;
		
		float outFrustum = 0.0;
		
		if(projCoords.x <  0.0 || projCoords.x > 1.0) {
			outFrustum = 1.0;
		}
		
		if(projCoords.y <  0.0 || projCoords.y > 1.0) {
			outFrustum = 1.0;
		}
		

		// 	return poissonPCFmultitap(projCoords, shadowDepth,uv);
		// float PCF(sampler2D depthMap, vec4 p, vec2 randDirTC)
			return PCF( shadowSampler1, projCoords, randomSample, shadowDepth);
		// return smoothShadow(projCoords, shadowDepth,uv); 

	}
	
	


			
			

	// Lightning
	//float Phong( vec3 N, vec3 V, vec3 L, float Exp )
	//{
	//	mediump vec3 R = reflect(-L, N);		
	//	return pow( clamp( dot(V, R), 0.0, 1.0 ), Exp);	
	//}
	
	float Phong(mediump vec3 R, mediump vec3 L, mediump float Exp)
	{	
		mediump float fNormFactor = Exp * 6.283185307179586476925286766559 + 6.283185307179586476925286766559;
		return fNormFactor *  pow(clamp(dot(L, R), 0.0, 1.0), Exp);
	}
	
	vec4 calculateLightning(vec3 worldPos, vec3 albedo, vec3 normal, float shadow ) {
		

		const float g_directLight = 2.4;
		
		vec4 g_lightWorldPos = vec4(1600., 1800., 250., 0.0);
		
		
		vec3 lightDir = g_lightWorldPos.xyz - worldPos;
		
		float lightDistSq = dot(lightDir, lightDir);
		
		lightDir = normalize(lightDir);
	 
		float diffuse = 0.0;

		
		
		diffuse = max( dot( lightDir, normal ), 0.0);
		diffuse *= g_directLight * clamp(1.0 - lightDistSq * g_lightWorldPos.w, 0.0, 1.0);
		
		float g_ambientLight = 0.2;
		vec3 diffuseGI = vec3(0.1);
		

		return vec4(shadow *  diffuse * albedo  + diffuseGI.xyz * albedo + g_ambientLight * albedo, 1.0);
	}
	
		
	mediump vec3 decodeNormal( mediump vec2 enc ) {
		mediump vec2 fenc = enc * 4.0 - 2.0;
		mediump float f = dot(fenc, fenc);
		mediump float g = sqrt(1.0 - f / 4.0);
		mediump vec3 n;
		n.xy = fenc * g;
		n.z = 1.0 - f / 2.0;
		return n;
	}
	
	vec4 DecodeColor(vec4 color)
	{
	  color.rgb *= vec3(color.a * 64.0);
	  return color;
	}
		
	
	vec4 SSGI( vec3 normal, vec2 uv, float depth ) {
		const mediump vec4 SSAO_params = vec4( 1.0, 0.075, 1.0, 2.0 );
		
		const int samplesNum = 4; // QUALITY_HIGH;

		const float radius = 0.2; // 0.2

		float effectAmount = SSAO_params.x / float(samplesNum);
		
		vec3 kernel[32];
		
		kernel[0] = vec3(-0.556641,-0.037109,-0.654297); 
		kernel[1] = vec3(0.173828,0.111328,0.064453); 
		kernel[2] = vec3(0.001953,0.082031,-0.060547); 
		kernel[3] = vec3(0.220703,-0.359375,-0.062500);
		kernel[4] = vec3(0.242188,0.126953,-0.250000); 
		kernel[5] = vec3(0.070313,-0.025391,0.148438); 
		kernel[6] = vec3(-0.078125,0.013672,-0.314453);
		kernel[7] = vec3(0.117188,-0.140625,-0.199219);
		kernel[8] = vec3(-0.251953,-0.558594,0.082031); 
		kernel[9] = vec3(0.308594,0.193359,0.324219); 
		kernel[10] = vec3(0.173828,-0.140625,0.031250);
		kernel[11] = vec3(0.179688,-0.044922,0.046875); 
		kernel[12] = vec3(-0.146484,-0.201172,-0.029297);
		kernel[13] = vec3(-0.300781,0.234375,0.539063); 
		kernel[14] = vec3(0.228516,0.154297,-0.119141); 
		kernel[15] = vec3(-0.119141,-0.003906,-0.066406); 
		kernel[16] = vec3(-0.218750,0.214844,-0.250000);
		kernel[17] = vec3(0.113281,-0.091797,0.212891); 
		kernel[18] = vec3(0.105469,-0.039063,-0.019531);
		kernel[19] = vec3(-0.705078,-0.060547,0.023438); 
		kernel[20] = vec3(0.021484,0.326172,0.115234); 
		kernel[21] = vec3(0.353516,0.208984,-0.294922);
		kernel[22] = vec3(-0.029297,-0.259766,0.089844);
		kernel[23] = vec3(-0.240234,0.146484,-0.068359);
		kernel[24] = vec3(-0.296875,0.410156,-0.291016);
		kernel[25] = vec3(0.078125,0.113281,-0.126953); 
		kernel[26] = vec3(-0.152344,-0.019531,0.142578);
		kernel[27] = vec3(-0.214844,-0.175781,0.191406);
		kernel[28] = vec3(0.134766,0.414063,-0.707031); 
		kernel[29] = vec3(0.291016,-0.833984,-0.183594);
		kernel[30] = vec3(-0.058594,-0.111328,0.457031);
		kernel[31] = vec3(-0.115234,-0.287109,-0.259766);  



		mediump vec3 randomSample = texture2D(randomSampler, vec2(screenWidth, screenHeight) * uv / 4.0).xyz  * 2.0 - 1.0;
		vec3 colorBleeding = vec3(0.0);

		for (int i = 0; i < samplesNum; i++)
		{
			vec3 sample;

			float sampleDepth, tapDepth;
			float alpha, gamma;

			/////////////////////////
			// Construct the sample
			sample = reflect(kernel[i] * radius, randomSample);
			sample = sample * (dot(sample, normal) < 0.0 ? -1.:1.);

			/////////////////////////
			// Find the offset
			gamma = 1. / (1.0 + sample.z);
			vec2 centerPos = (uv * 2.0) - vec2(1.0, 1.0);
			vec2 samplePos = (centerPos + sample.xy) * (gamma * 0.5) + 0.5;

			/////////////////////////
			// Get tap data
			vec3 tapNormal, tapAlbedo, tapRadiance;

			tapDepth  = texture2D( infoSampler, (samplePos)).x; 
			alpha = gamma * tapDepth;

			tapNormal =  decodeNormal(texture2D( infoSampler, samplePos ).yz);
			// tapNormal = normalize(mul(SSAO_CameraMatrix, tapNormal));

			tapAlbedo = DecodeColor(texture2D(albedoSampler, samplePos)).rgb;  
			tapRadiance = DecodeColor(texture2D(sceneDiffuseAccSampler, samplePos)).rgb; 

			// Compute the direction vector between the point and the bleeder
			vec3 D = vec3(centerPos, 1.0) * (alpha - depth) + sample * alpha;

			const float minDist = 0.0005;
			float r = max(minDist, length(D));

			D = normalize(D);

			// Compute attenuation
			float atten = 
				//pow(minDist / r, 2.)
				//min(depth * pow(0.05 / r, 2.0), 1.)
				min(pow(0.05 * depth / r, 2.0), 1.)
				//1
				;

			float factor = 400.
				// Visibility
				* (((depth * (1. + sample.z) - tapDepth) > 0. )? 1. : 0. ) //> 0.
				// Reflector lambertian term
				* max(0., -dot(D, tapNormal))
				// Incident radiance projection term
				* dot(D, normal) 
				// Attenuation term
				* atten
				;

			vec3 radiance = factor * tapAlbedo * tapRadiance;
			colorBleeding += tapAlbedo;
		}

		colorBleeding *= effectAmount;

		return vec4(max(vec3(0.0), colorBleeding), 1.0);
	}
		

	struct lightObject {
		vec3 position;
		vec3 diffuse;
		vec3 specular;
	};

	void ambient( inout fragmentPass pass ) {
		
		// for now ambiant is calculated in info.shader
		pass.ambientAcc += pass.ambient;

	}
	
	uniform float specularPow;
	uniform float spec;
	uniform float gloss;

	
	void per_light( inout fragmentPass pass, lightObject light ) {
		
		float diffuseWrap = 1.;
		// float specularPow = 1.;
		const vec3 filterColor = vec3(1.);
		const float fallOff = 1.0;
		
		float nDotL = dot(pass.normal, light.position);
		 
		nDotL = clamp( nDotL, 0.0, 1.0);  
			
		mediump vec3 diffuse = vec3(nDotL);
            
		mediump vec3 vHalf = normalize( light.position.xyz + pass.eye.xyz);                      
		mediump float NdotH = clamp( dot( pass.normal.xyz, vHalf.xyz), 0.0, 1.0 );                                                  
		  
		mediump float fSelfShadow = clamp( nDotL * 4.0, 0.0, 1.0 );
		
		vec3 specular = vec3(pow( NdotH, specularPow ));      
		
	
  
		diffuse *=  light.diffuse ;    // ??                                    
		specular *=  light.specular * vec3(fSelfShadow);      
		
		mediump vec3 cK = pass.shadowOcclusion * fallOff * filterColor; 

		pass.diffuseAcc.xyz += diffuse.xyz * cK.xyz;
		pass.specularAcc.xyz += specular.xyz * cK.xyz;
	}



	vec3 compose_scene( inout fragmentPass pass  )
	{  
		
		mediump vec3 diffuse = ( pass.ambientAcc + pass.diffuseAcc.xyz ) * pass.albedo.xyz;  // 3 alu
		
		
		// if( pPass.nReflectionMapping )
		// {
		// apply shading to environment map
		//	pPass.cEnvironment.xyz *= ( pass.ambientAcc.xyz + pass.diffuseAcc.xyz ) ;                 // 2 alu
		//	pPass.cSpecularAcc.xyz += pPass.cEnvironment.xyz;                                // 1 alu        
		// }
		// pass.specularAcc += pass.ambientAcc.xyz + pass.diffuseAcc.xyz;

		mediump vec3 specular = pass.specularAcc.xyz; 
		
		vec3 finalColor = vec3(0.0);

		finalColor.xyz += diffuse;
		finalColor.xyz += specular;
		
	
		// Deffered
		return ( pass.diffuseAcc * finalColor + pass.specularAcc );
	}
	

	
	mediump vec4 DecodeRGBK(mediump vec4 Color)
	{
	  Color.rgb *= Color.a * 32.0;
	  return Color;
	}
	
	vec2 getTexture3DCoord(vec3 texCoord) {
		const float size = 36.0;
		const float sliceSize = 1.0 / size;  
		const float slicePixelSize = sliceSize / size;   
		const float sliceInnerSize = slicePixelSize * (size - 1.0); 
		
		float layer = min(floor(texCoord.z * size), size - 1.0);
		float xOffset = slicePixelSize * 0.5 + texCoord.x * sliceInnerSize;
		float s0 = xOffset + (layer * sliceSize);

		return vec2(s0, texCoord.y);
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
	
	mediump vec4 EncodeRGBECorrected( in mediump vec3 color )
	{  
	  mediump float fMaxChannel = max( color.x, max( color.y, color.z ) ) ;    
	  mediump float fExp = ceil( log2( fMaxChannel ) );
	  
	  mediump vec4 ret = vec4(0.0);
	  ret.xyz = color.xyz / exp2( fExp );  
	  ret.w = ( fExp + 128.0 ) / 256.0;
	  
	  return ret;
	}
	void main() {

		vec4 passInfo = texture2D( infoSampler, v_uv.xy );
		vec4 colorInfo = texture2D(diffuseSampler, v_uv.xy );
		
		fragmentPass pass;
		
		pass.uv = v_uv;
		pass.ambiantOcclusion = texture2D(ambiantOccSampler, pass.uv ).x;
		pass.albedo = (DecodeRGBE( colorInfo )).rgb;//DecodeRGBK

		
		// pass.albedo = vec3(1.2);
		pass.ambient = vec3(0.4);
		pass.normalW = decode( passInfo.yz );
		pass.normal = pass.normalW;
		pass.depth = passInfo.x;
		pass.depthNorm = pass.depth / far;
		pass.positionWorld = constructPositionWorld( pass.uv, pass.depthNorm );
		pass.shadowOcclusion =  calculateShadowOcclusion( pass.positionWorld, pass.uv );
		// pass.shadowOcclusion = texture2D(shadowSampler1, pass.uv ).r;
		
		pass.ambientAcc = vec3(1.0);
		pass.specularAcc = vec3(0.0);
		pass.diffuseAcc = vec3(0.0);
		pass.eye = vec3( cameraPosition.y,cameraPosition.z, test);
		pass.gloss = vec3(gloss); // texture2D(diffuseSampler, pass.uv ).w
		pass.ndotE = dot(pass.normal, normalize(pass.eye));
		pass.reflectionVector = (2.0 * pass.ndotE * pass.normal.xyz) - pass.eye.xyz; 
		

		vec4 lpvPosition = vec4(pass.positionWorld, 1.0) * worldToLPV;
		
		// lpvSampler
		// float invOccl = 1.0 - pass.ambiantOcclusion;
		vec4 finalColor = calculateLightning(pass.positionWorld, pass.albedo.rgb, pass.normalW.xyz, pass.shadowOcclusion ) * vec4( pass.ambiantOcclusion );
		
		
		lightObject light;
		
		light.position = normalize( vec3(1400.0, 1800.0, 250.0) );
		light.diffuse = vec3(0.0);
		light.specular = vec3(0.0);
		
		per_light( pass, light );
		
		
		
		
		 mediump vec3 ambient = vec3(0.0);    
		
		// bool hemisphereLightning = true;
		
		// if( hemisphereLightning )  
		// {
		// 	mediump float fBlendFactor = (pass.normal.z*0.25+0.75); // 1 inst
		// 	ambient.xyz *= fBlendFactor; // 1 inst
		// }
		
		
		//  ambient += vec3(passInfo.w);

		
		
		pass.ambientAcc.xyz += ambient.xyz;    
		
		// pass.ambientAcc += vec3(0.74);
		vec3 normPosition = pass.positionWorld / 2000.0;
		

		
		vec3 gridPosition = floor(normPosition * 36.0) / 36.0;
		
		
		vec3 test = texture2D( globalIlluminationSampler, v_uv ).rgb;
		
		// float p = Phong( pass.normal, pass.positionWorld, vec3(100., 1800., 550.), 10. );
		// vec4 finalColor = vec4(pass.normal, 0.0);

		// if(v_uv.x < .5)
		//	gl_FragColor = ( vec4(compose_scene( pass ) * pass.ambiantOcclusion, 1.0) );//+texture2D( shadowSampler1, v_uv.xy );
		// gl_FragColor = sqrt( vec4(compose_scene( pass ), 1.0) ) * pass.ambiantOcclusion;// SSGI( pass.normal, pass.uv, pass.depthNorm ) 
		// else
		//	gl_FragColor =  vec4(pass.albedo, 1.0);
		
		// if(colorInfo.w == .4)
		//	gl_FragColor = vec4(pass.albedo*pass.shadowOcclusion, 1.0)*pass.ambiantOcclusion;
		// else
		// if(v_uv.x < .25 && v_uv.y < .25)
		//	gl_FragColor = vec4(sqrt(texture2D(shadowSampler1, vec2(v_uv.x *4., v_uv.y*4.) )));
		//else
		vec3 color = pass.albedo.rgb*pass.ambiantOcclusion*pass.shadowOcclusion;
			// gl_FragColor = EncodeRGBE(color );    
			float gamma = 2.2;
			// gl_FragColor = EncodeRGBE( color );    
			 gl_FragColor =  vec4(pow(color, vec3(1.0 / gamma)), 1.0);
	}

	