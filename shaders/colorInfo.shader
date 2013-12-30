/**
 * Raptor Engine - Core
 * Copyright (c) 2013 RAPTORCODE STUDIOS
 * All rights reserved.
 *
 */
  
/**
 * Author: Kaj Dijkstra
 */

	// precision mediump float;
	precision highp float;
	#ifndef COLOR
	#define COLOR 0
	#endif
	
	#ifndef TEXTURE
	#define TEXTURE 0
	#endif
	
	#ifndef PARALLAX
	#define PARALLAX 0
	#endif
	
	#ifndef BUMP
	#define BUMP 0
	#endif
	
	#ifndef TRANSPACENCY_MAP
	#define TRANSPACENCY_MAP 0
	#endif
	
	#ifndef USE_BONES
	#define USE_BONES 0
	#endif
	
	
	attribute vec3 position;
	attribute vec3 normal;
	attribute vec3 tangent;
	attribute vec3 bitangent;

	#if USE_BONES == 1
	
		attribute vec4 boneIndices;
		attribute vec4 boneWeights;
		uniform mat4 bones[32];
	
	#endif
	
	attribute vec2 uv;
	
	uniform vec3 cameraPosition;

	uniform mat4 worldViewProjection;
	uniform mat4 world;
	uniform mat4 view;

	uniform float test;
	
	varying vec2 v_uv;
	varying vec4 v_worldPosition;
	varying vec3 v_viewDir;
	
	varying vec3 v_light;
	varying vec3 v_view;
	varying vec2 v_offset;
	varying vec3 v_diffuse;
	
    varying vec4 v_normal;
	varying vec4 v_tangent;
	varying vec4 v_bitangent;
	
	varying vec4 v_screenProj;
	
	
	mat3 transpose(mat3 matrix) {

		return mat3( matrix[0].x, matrix[1].x, matrix[2].x,
					 matrix[0].y, matrix[1].y, matrix[2].y,
					 matrix[0].z, matrix[1].z, matrix[2].z );
				 
	}

	void main(void) {
	
		vec4 vertexPosition = vec4(position, 1.0);
	
		#if PARALLAX == 1

			mat4 worldview = (world * view);
			
			const float height_map_range = 0.09;
		
			vec4 w_normal  = world * vec4(normal.xyz, 0.0);
			vec4 w_tangent = world * vec4(tangent.xyz, 0.0);
			vec4 w_bitangent = world * vec4(bitangent.xyz, 0.0);
			
			vec3 vs_normal = ( view * w_normal ).xyz;
			vec3 vs_tangent = ( view * w_tangent ).xyz;
			vec3 vs_bitangent = ( view * w_bitangent ).xyz;

			vec4 a = view * vec4(position, 1.0);
			
			v_view = a.xyz;

			mat3 tbn = mat3( normalize(vs_tangent), normalize(vs_bitangent), normalize(vs_normal) );
			mat3 vs_to_ts = transpose(tbn);

			vec3 ts_view = vs_to_ts * v_view;

			v_offset = (ts_view.xy / ts_view.z) * height_map_range;
		
		
		#elif TEXTURE == 1  || TRANSPACENCY_MAP == 1
		
			
		
		#endif
		
		
		#if USE_BONES == 1
			
			ivec4 indices = ivec4(boneIndices);

			mat4 BoneTransform = bones[indices[0]] * boneWeights[0];
			
			BoneTransform += bones[indices[1]] * boneWeights[1];
			BoneTransform += bones[indices[2]] * boneWeights[2];
			BoneTransform += bones[indices[3]] * boneWeights[3];

			vertexPosition = BoneTransform * vertexPosition;
			
		#endif
		
		v_worldPosition = world * vertexPosition;//world * 
		
		v_uv = uv;
		v_normal  =  normalize(world * vec4(normal, 0.0));
		v_tangent =   normalize( world * vec4(tangent, 0.0));
		v_bitangent =   normalize(world * vec4(bitangent, 0.0));

		v_screenProj = worldViewProjection * v_worldPosition;
		
		gl_Position = v_screenProj;
	}

	// #raptorEngine - Split

	#extension GL_OES_texture_float : enable
	#extension GL_OES_standard_derivatives : enable
	
	// precision mediump float;
	
	precision highp float;
	
	#ifndef DEFERRED
	#define DEFERRED 0
	#endif
	
	#ifndef COLOR
	#define COLOR 0
	#endif

	#ifndef TEXTURE
	#define TEXTURE 0
	#endif

	#ifndef PARALLAX
	#define PARALLAX 0
	#endif

	#ifndef BUMP
	#define BUMP 0
	#endif
	
	#ifndef TRANSPACENCY_MAP
	#define TRANSPACENCY_MAP 0
	#endif
	
	#ifndef NORMAL_MAP
	#define NORMAL_MAP 0
	#endif
	
	#ifndef SPECULAR_MAP
	#define SPECULAR_MAP 0
	#endif
	
	#ifndef SPECULAR_MAP
	#define SPECULAR_MAP 0
	#endif
	
	uniform sampler2D texture;

	uniform sampler2D transparencyMapSampler;
	uniform sampler2D normalSampler;
	uniform sampler2D specularMapSampler;
	uniform sampler2D shadowSampler1;
	uniform sampler2D heightSampler;
	uniform sampler2D ambiantOcclusion;
	
	uniform sampler2D randomSampler;
	uniform sampler2D randomRotationSampler;
	
	uniform float specular;
	uniform float test;
	
	uniform vec3 cameraPosition;
	uniform vec3 eye;
	uniform vec4 lightPosition;
	
	uniform float sunColorG;
	uniform float sunColorB;
	uniform float sunColorR;
	
	uniform float far;
	uniform float screenWidth;
	uniform float screenHeight;
	uniform float shadowBias;
	
	uniform float specularIntensity;
	uniform vec4 shadow_kernel[8];
	
	uniform mat4 view;
	uniform mat4 viewInverse;
	uniform mat4 lightViewProjection1;
	
	varying vec2 v_uv;
	varying vec4 v_worldPosition;

	varying vec3 v_view;
	varying vec2 v_offset;
	varying vec3 v_diffuse;
	
	varying vec4 v_tangent;
	varying vec4 v_bitangent;
	varying vec4 v_normal;
	
	varying vec4 v_screenProj;
	
	mediump vec4 EncodeRGBE( in mediump vec3 color )
	{
	  mediump float fLen = max( color.x, max( color.y, color.z ) ) ;  
	  mediump float fExp = ceil( log(fLen) / log(1.06) );

	  mediump vec4 ret;
	  ret.w = (fExp + 128.0) / 256.0;
	  ret.xyz = color.xyz / pow( 1.06, fExp);

	  return ret;   
	}
		
	struct fragmentPass{
		highp vec2 uv;
		highp vec2 bumpUv;
		
		mediump vec3 albedo;
		mediump vec3 ambient;
		mediump vec3 gloss;
		
		mediump vec3 normal;
		mediump vec3 normalW;
		mediump vec3 positionWorld;
		
		mediump vec3 specularAcc;
		mediump vec3 diffuseAcc;
		mediump vec3 ambientAcc;
		
		vec3 diffuseMap;
		vec3 bumpMap;
		vec3 normalDiffuse;
		
		mediump vec3 eye;
		mediump float ambiantOcclusion;
		mediump float shadowOcclusion;
		
		mediump vec3 ambientNormal;
		mediump mat3 tangentToWS;
		
		highp float far;
		highp float depth;
		highp float depthNorm;

		mediump vec4 specularMap;
		
		float specularPower;
	};
	
	
	struct lightObject{
		mediump vec3 surfaceToLight;
		mediump vec3 worldPositionNorm;

		mediump vec3 position;
		mediump vec3 diffuse;
		mediump vec3 specular;
		
		mediump float falloff;
		mediump float normalDotLight;
		mediump vec3 filter;
	};
	
	float DecodeFloatRGBA( vec4 rgba ) {
		return dot( rgba, vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 160581375.0) );
	}

	float shadow_sample(sampler2D depthMap, vec2 coord)
	{
		return DecodeFloatRGBA(texture2D(depthMap, coord.xy)) * far;
	}
	
	vec2 doubleSample(sampler2D depthMap, vec2 projCoords, vec4 rotMatr, vec4 kernel) {
	
		vec4 rotated = rotMatr.xyzw * kernel.xxww + rotMatr.zwxy * kernel.yyzz;

		vec4 fetchPos = projCoords.xyxy + rotated;
		
		vec2 result;

		result.x = shadow_sample(depthMap, fetchPos.xy);
		result.y = shadow_sample(depthMap, fetchPos.zw);

		return result;
	}
	
	float PCF(sampler2D depthMap, vec4 projCoords, vec2 randomDir, float depth)
	{
		const vec2 kernelRadius = vec2(4.0);
		const vec2 inverseSize  = vec2(1.0 / 1048.0);
		
		const int kernelSize = 8;
		const int kernelStepSize = 2;
		
		vec2 rotationSample = 2.0 * texture2D(randomRotationSampler, randomDir.xy).xy - 1.0;
		rotationSample.xy = normalize(rotationSample.xy);
		rotationSample.xy *= (kernelRadius.xy * inverseSize.xy);

		vec4 rotationVector = vec4(rotationSample.x, -rotationSample.y, rotationSample.y, rotationSample.x);

		float shadowTest = 0.0;
		
		for(int i=0; i<kernelSize; i+=kernelStepSize)
		{
			mediump vec4 sampleDepth = vec4(0.0);
			
			sampleDepth.xy = doubleSample(depthMap, projCoords.xy, rotationVector, shadow_kernel[i]);
			sampleDepth.zw = doubleSample(depthMap, projCoords.xy, rotationVector, shadow_kernel[i+1]);
			
			mediump vec4 shadowSampler;
			
			shadowSampler.x = ( depth < sampleDepth.x + shadowBias ) ? 1.0 : 1.;
			shadowSampler.y = ( depth < sampleDepth.y + shadowBias ) ? 1.0 : 1.;
			shadowSampler.z = ( depth < sampleDepth.z + shadowBias ) ? 1.0 : 1.;
			shadowSampler.w = ( depth < sampleDepth.w + shadowBias ) ? 1.0 : 1.;

			const mediump float quality = 8.0;
			const mediump float fInvSamplNum = (1.0 / quality);
			
			shadowTest += dot(shadowSampler, vec4(fInvSamplNum));
		}

		return shadowTest;
	}
	

	float calculateShadowOcclusion( vec3 worldPosition, vec2 uv ) {
	
		float shadowDepth = length( lightPosition.xyz - worldPosition );
		
		vec4 projCoords = lightViewProjection1 *  vec4(worldPosition, 1.0);
		
		projCoords.xy /= projCoords.w;
		projCoords = 0.5 * projCoords + 0.5;

		mediump vec2 randomSample = texture2D(randomSampler, vec2(screenWidth, screenHeight) * uv / 64.0).xy  * 2.0 - 1.0;

		return PCF( shadowSampler1, projCoords, randomSample, shadowDepth);

	}
	
	
	vec3 applyFogContribution(vec3 fogColor, vec3 color, float depth) {
		return mix( color, fogColor, depth );
	}
	

	
	
	
	void main() {
	
		fragmentPass pass;
		
		pass.uv = v_uv;
		pass.bumpUv = pass.uv;

		pass.diffuseMap = texture2D(texture, v_uv).rgb;
		
		pass.tangentToWS = mat3( v_tangent.xyz,
							   	 v_bitangent.xyz,
								 v_normal.xyz );
		
		pass.eye = cameraPosition; 

		#if NORMAL_MAP == 1
		 
			pass.bumpMap.xyz = texture2D(normalSampler, v_uv).xyz - vec3(0.5);

		#else

			pass.bumpMap = vec3(0.0, 0.0, 1.0);

		#endif


		#if SPECULAR_MAP == 1
		
			pass.specularMap = texture2D(specularMapSampler, v_uv);
			
		#else
		
			pass.specularMap = vec4(.1);
			
		#endif
		

		
		#if PARALLAX == 1

			const float max_samples = 30.0;
			const float min_samples = 8.0;
			const float lod_threshold = 10.0;
			const float heightMapScale = 0.61;
			const float shadowSoftening = 0.5;
			
			vec3 normal = normalize(v_normal.xyz);
			vec3 view = normalize(v_view);

			// vec2 dx = dFdx(v_uv);
			// vec2 dy = dFdy(v_uv);

			float num_steps = mix(max_samples, min_samples, dot(view, normal));

			float current_height = 0.0;
			float step_size = 1.0 / float(num_steps);
			float prev_height = 1.0;

			float step_index = 0.0;
			
			bool condition = true;

			vec2 tex_offset_per_step = step_size * v_offset;
			vec2 tex_current_offset = v_uv;
			float current_bound = 1.0;
			float parallax_amount = 0.0;

			vec2 pt1 = vec2(0.0);
			vec2 pt2 = vec2(0.0);

			vec2 tex_offset = vec2(0.0);

			
			for(int x = 0; x<30; x++) {
				if(step_index < num_steps)
				{
					tex_current_offset -= tex_offset_per_step;

					current_height = texture2D(heightSampler, tex_current_offset).r; //, dx, dy

					current_bound -= step_size;

					if(current_height > current_bound)
					{
						pt1 = vec2(current_bound, current_height);
						pt2 = vec2(current_bound + step_size, prev_height);

						tex_offset = tex_current_offset - tex_offset_per_step;

						step_index = num_steps + 1.0;
					}
					else
					{
						step_index++;
						prev_height = current_height;
					}
				}
			}

			float delta1 = pt1.x - pt1.y;
			float delta2 = pt2.x - pt2.y;
			float denominator = delta2 - delta1;

			if(denominator == 0.0)
			{
				parallax_amount = 0.0;
			}
			else
			{
				parallax_amount = (pt1.x * delta2 - pt2.x * delta1) / denominator;
			}
			
			vec2 parallax_offset = v_offset * (1.0 - parallax_amount);
			pass.uv.xy -= parallax_offset;
		
		#endif
		
		const float gamma = 2.2;
		
		pass.diffuseMap = pow(texture2D(texture, pass.uv).rgb, vec3(gamma));// pow(texture2D(texture, pass.uv).rgb, vec3(gamma))
		pass.normalDiffuse = pass.bumpMap;
		pass.normal = pass.tangentToWS *  pass.bumpMap; 
		pass.normal = normalize(pass.normal);
		pass.specularPower = 185.0;
		pass.ambientNormal = pass.normalDiffuse.xyz;
		pass.diffuseAcc  = vec3(0.);
		pass.specularAcc = vec3(0.0);
		pass.depth = v_screenProj.z;
		pass.depthNorm = pass.depth / far;
  
  
		lightObject light2;
		light2.position = vec3(-1000.0, 10000.5, 11110.0);
		light2.surfaceToLight = normalize(light2.position - v_worldPosition.xyz);
		light2.normalDotLight = dot(normalize(light2.position.xyz), pass.normal.xyz);
		light2.falloff = 1.0; //; GetAttenuation( light2.position.xyz, 1.0 / 2200.0 );
		light2.falloff *= light2.falloff;
		light2.filter = vec3(1.);
		light2.diffuse  = vec3(1.0, .9, .8);//vec3(sunColorR, sunColorG, sunColorB);//;vec3(sunColorR, sunColorG, sunColorB);
		light2.specular = light2.diffuse;
		
		light_pass(pass, light2);
		
		pass.shadowOcclusion = calculateShadowOcclusion( v_worldPosition.xyz,  v_screenProj.xy );
	
	
		mediump vec3 ambient = vec3(0.7);    
		mediump float fBlendFactor = (pass.ambientNormal.z * 0.25 + 0.75); 
		
		ambient.xyz *= fBlendFactor; 
		ambient.xyz *= clamp( dot(pass.normalDiffuse.xyz, pass.normal.xyz), 0.0, 1.0 );
		 
		pass.ambientAcc.xyz += ambient.xyz;      
		 
		vec3 finalImage = compose( pass );
		
		// finalImage = applyFogContribution(vec3(1.0), finalImage, pass.depthNorm);
	
		vec4 result;

		result = vec4(finalImage.rgb, 1.0);
	
		#if TRANSPACENCY_MAP == 1 
		
			float alpha = texture2D(transparencyMapSampler, v_uv).r;
			
			result.w = alpha;
			
		#endif
		
		
		
		mediump float fAdaptedLum = 1.2; //texture2D(adaptedLuminanceSampler, v_uv.xy).x;

		//vec4 vSample = ReinhardMapping( result * 4.0 , fAdaptedLum );
		

		#if DEFERRED == 1
			gl_FragColor = EncodeRGBE( result.xyz  );
			// gl_FragColor =  EncodeRGBE(  pass.specularAcc.xyz )   + vec4(result.xyz * pass.diffuseMap.xyz * .00001,0.0); // EncodeRGBK pass.diffuseAcc.xyz
			/gl_FragColor = vec4(pass.normal.xyz, 1.0) + vec4(.00001 * result );
		#else
 
			gl_FragColor =  vec4(pow(result.xyz  * pass.shadowOcclusion, vec3(1.0 / gamma)), 1.0);
			//gl_FragColor =  result;
			
			//gl_FragColor =  texture2D(ambiantOcclusion, v_screenProj.xy / pass.depth) + (.00001 * result  * pass.shadowOcclusion);
	//	gl_FragColor =  vec4(pass.diffuseAcc * pass.diffuseMap.xyz, 1.0) + (.00001 * result  * pass.shadowOcclusion);
			// gl_FragColor = vec4(texture2D(shadowSampler1, v_uv.xy).xyz, 1.0 ) + vec4(.00001 * vec4(pow(result.xyz  * pass.shadowOcclusion, vec3(1.0 / gamma)), 1.0) );
			 // gl_FragColor = vec4( pass.specularAcc.xyz,1.0 )   + vec4(result.xyz * pass.diffuseMap.xyz * .00001,0.0); // EncodeRGBK pass.diffuseAcc.xyz
		#endif
	}
