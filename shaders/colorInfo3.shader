
	precision mediump float;

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
	
	attribute vec3 position;
	attribute vec3 normal;
	attribute vec3 tangent;
	attribute vec3 binormal;
	attribute vec2 uv;
	

	uniform vec3 rgb;
	uniform mat4 worldViewProjection;
	uniform mat4 world;
	uniform mat4 view;

	uniform vec3 world_light;
	uniform float uvScale;
	
	
	varying vec2 v_uv;
	varying vec4 v_worldPosition;
	varying vec3 v_viewDir;
	
	varying vec3 v_light;
	varying vec3 v_view;
	varying vec2 v_offset;
	varying vec3 v_diffuse;
	
    varying vec4 v_normal;
	varying vec4 v_tangent;
	varying vec4 v_binormal;
	
	
	mat3 transpose(mat3 matrix) {

		return mat3( matrix[0].x, matrix[1].x, matrix[2].x,
					 matrix[0].y, matrix[1].y, matrix[2].y,
					 matrix[0].z, matrix[1].z, matrix[2].z );
				 
	}

	void main(void) {
	
		#if PARALLAX == 1

			v_uv = uv * uvScale;
			v_worldPosition = world * vec4(position, 1.0);
			
			
			const float height_map_range = 0.05;
		
			vec4 w_normal  = world * vec4(normal.xyz, 0.0);
			vec4 w_tangent = world * vec4(tangent.xyz, 0.0);
			
			vec3 vs_normal = ( view * w_normal ).xyz;
			vec3 vs_tangent = ( view * w_tangent ).xyz;
			vec3 vs_bitangent = cross(vs_normal, vs_tangent);

			vec4 vs_position = view * v_worldPosition;
			
			v_view = -vs_position.xyz;
			v_normal = vs_normal;

			mat3 tbn = mat3( normalize(vs_tangent), normalize(vs_bitangent), normalize(vs_normal) );
			mat3 vs_to_ts = transpose(tbn);

			vec3 ts_view = vs_to_ts * v_view;

			v_offset = (ts_view.xy / ts_view.z) * height_map_range;
		
		#elif TEXTURE == 1  || TRANSPACENCY_MAP == 1
		
			v_uv = uv;
		
		#endif
		
		
		v_normal  =  normalize(world * vec4(normal, 0.0));
		v_tangent =   normalize( world * vec4(tangent, 0.0));
		v_binormal =   normalize(world * vec4(binormal, 0.0));

		
		//optimize!!!!!
		vec4 worldPosition = world * vec4(position, 1.0);
		
		gl_Position = worldViewProjection * worldPosition;

	}

	// #raptorEngine - Split

	#extension GL_OES_texture_float : enable
	
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
	
	#ifndef NORMAL_MAP
	#define NORMAL_MAP 0
	#endif
	
	#ifndef SPECULAR_MAP
	#define SPECULAR_MAP 0
	#endif
	
	

	uniform sampler2D texture;
	uniform sampler2D heightSampler;
	uniform sampler2D transparencyMapSampler;
	uniform sampler2D normalSampler;
	
	uniform float specular;
	
	uniform vec3 cameraPosition;
	uniform float test;
	
	varying vec2 v_uv;
	varying vec4 v_worldPosition;

	varying vec3 v_view;
	varying vec2 v_offset;
	varying vec3 v_diffuse;
	
	varying vec4 v_tangent;
	varying vec4 v_binormal;
	varying vec4 v_normal;
	
	mediump vec4 EncodeRGBECorrected( in mediump vec3 color )
	{  
	  mediump float fMaxChannel = max( color.x, max( color.y, color.z ) ) ;    
	  mediump float fExp = ceil( log2( fMaxChannel ) );
	  
	  mediump vec4 ret = vec4(0.0);
	  ret.xyz = color.xyz / exp2( fExp );  
	  ret.w = ( fExp + 128.0 ) / 256.0;
	  
	  return ret;
	}
	
	// void custom(inout fragmentPass pass)
	// {
	  // Set opacity, gloss-map and per pixel shininess
	  // pPass.fAlpha = pPass.cDiffuseMap.w * pPass.IN.Ambient.w;                                              // 1 alu    

	//  pPass.cGlossMap = pPass.cDiffuseMap.w;
	// #if !%GLOSS_DIFFUSEALPHA
	//  pPass.cGlossMap = tex2D(glossMapSampler, pPass.IN.baseTC.xy);    
	// #endif  

	//  pPass.fSpecPow *= pPass.cGlossMap.w;                                                              // 1 alu

	// #if %CUSTOM_SPECULAR

	//  pPass.pCustom.vTangent = ShiftVectorOpt(pPass.IN.vTangent.xyz, pPass.vNormal.xyz, -pPass.cBumpMap.x);
	//  pPass.pCustom.vBinormal = ShiftVectorOpt(pPass.IN.vBinormal.xyz, pPass.vNormal.xyz, -pPass.cBumpMap.y); // cross tan-norm
	  
	// #endif    

	//}
	
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
		
		vec3 diffuseMap;
		vec3 bumpMap;
		vec3 normalDiffuse;
		
		
		mediump vec3 eye;
		mediump vec3 reflectionVector;
		mediump float ambiantOcclusion;
		mediump float shadowOcclusion;
		
		mediump float NdotE;
		mediump vec3 reflVec;
		mediump vec3 ambientNormal;
		mediump mat3 tangentToWS;
		
		highp float far;
		highp float depth;
		highp float depthNorm;
		
		mediump vec3 glossinessMap;
		
		float specularPower;
	};
	
	struct lightObject{
		mediump vec3 position;
		mediump vec3 diffuse;
		mediump vec3 specular;
		mediump float nDotL;
	};

void light_calculation(inout fragmentPass pass, inout lightObject light)
{
	mediump float DiffuseWrap = 1.0;
	
	// light.nDotL = dot(pass.normalDiffuse.xyz, light.position.xyz);
	// light.nDotL = clamp( light.nDotL * DiffuseWrap + (1.0 - DiffuseWrap),0.0, 1.0);
	
	mediump vec3 cDiffuse = vec3(light.nDotL);
            
	mediump vec3 h = normalize( light.position.xyz + pass.eye.xyz);
	mediump float NdotH = clamp( dot( pass.normal.xyz, h.xyz), 0.0, 1.0 );                  

	mediump float fSelfShadow = clamp( light.nDotL * 4.0, 0.0, 1.0 );

	mediump vec3 specular = vec3(0.0);
  
#if !SPECULAR_MAP

  specular = vec3(pow( NdotH, pass.specularPower)); 
  
#else

	//  pPass.pCustom.vTangent = ShiftVectorOpt(pPass.IN.vTangent.xyz, pPass.vNormal.xyz, -pPass.cBumpMap.x);
	//  pPass.pCustom.vBinormal = ShiftVectorOpt(pPass.IN.vBinormal.xyz, pPass.vNormal.xyz, -pPass.cBumpMap.y); // cross tan-norm
	// float2 HdotTB = vec2( dot( half.xyz, pass.pCustom.vTangent.xyz ), dot( half.xyz, pPass.pCustom.vBinormal.xyz ) );    // 2 alu
	// half4 pCustomSpec = tex2D( customSecMapSampler, - HdotTB.xy * 0.5 + 0.5 );       // 2 alu
	// cSpecular = pCustomSpec.xyz * pCustomSpec.w * 4.0;                                                // 2 alu

#endif  
  
  cDiffuse *=  light.diffuse;                                                                     // 1 alu
  specular *=  light.specular * fSelfShadow;                                                     // 1 alu
  
  // half3 cK = pLight.fOcclShadow * pLight.fFallOff * pLight.cFilter;                                // 2 alu 
  
pass.diffuseAcc.xyz += cDiffuse.xyz;                                                   // 1 alu
pass.specularAcc.xyz += specular.xyz;                                                 // 1 alu
}



vec3 compose( inout fragmentPass pass )
{  
	mediump vec3 cDiffuse = ( pass.ambientAcc.xyz + pass.diffuseAcc.xyz ) * pass.diffuseMap.xyz; 

	mediump vec3 cSpecular = pass.specularAcc.xyz * pass.glossinessMap.xyz;       

	//  if( pPass.nQuality != QUALITY_LOW && !pPass.bSkipMaterial)
	//  cSpecular.xyz *= MatSpecColor.xyz;
	vec3 finalImage = vec3(0.0);

	finalImage.xyz += cDiffuse;
	// finalImage.xyz += cSpecular;

	return finalImage;
}


	void main() {
	
		fragmentPass pass;
		
		pass.uv = v_uv;
		pass.tangentToWS = mat3( v_tangent.xyz,
							   	 v_binormal.xyz,
								 v_normal.xyz );
								 
		pass.eye = normalize(-vec3( cameraPosition.y,cameraPosition.z, test))   ;
		pass.diffuseMap = texture2D(texture, v_uv).rgb;     
		
		#if NORMAL_MAP == 1
			pass.bumpMap = texture2D(normalSampler, v_uv).rgb * 2.0 - 1.0;
		#else
			pass.bumpMap = vec3(0.0, 0.0, 1.0);
		#endif
		
		pass.normalDiffuse = pass.bumpMap;
		pass.normal = pass.bumpMap.xyz * pass.tangentToWS; 
		pass.normal = normalize(pass.normal);
		pass.NdotE = dot(pass.eye.xyz, pass.normal.xyz);
		pass.reflVec = (2.0 * pass.NdotE * pass.normal.xyz) - pass.eye.xyz;
		pass.specularPower = 2.0;
		pass.ambientNormal = pass.normalDiffuse.xyz;
		pass.diffuseAcc = vec3(0.0);
		pass.specularAcc = vec3(0.0);
		pass.glossinessMap = vec3(0.0);
		
		
		
		lightObject light1;
		light1.position =  vec3(800., 1200., 150.)  * 1000.0;
		light1.diffuse  = vec3(1.0);
		light1.specular = light1.diffuse;
		// light1.specular.xyz *= light1.diffuse.w;
		light1.nDotL = dot(light1.position.xyz, pass.normal.xyz);
		
		light_calculation(pass, light1);
	
	
	//	mediump vec3 ambient = vec3(0.1);    

		// if( pPass.bHemisphereLighting )  
		// {
		//	mediump float fBlendFactor = (pass.ambientNormal.z * 0.25 + 0.75); // 1 inst
		//	ambient.xyz *= fBlendFactor; // 1 inst
		// }

		// ambient.xyz *= clamp( dot(pass.normalDiffuse.xyz, pass.normal.xyz), 0.0, 1.0 );		
		// pass.ambientAcc.xyz += ambient.xyz;      

		vec3 finalImage = compose( pass );
		
		
	
		highp vec3 diffuse = vec3(0.0, 0.0, 0.0);
		float alpha = 1.0;

		#if TEXTURE == 1
			
			diffuse = texture2D(texture, v_uv).rgb ; // [0..256]
			
		#elif PARALLAX == 1 
		
			const float max_samples = 30.0;
			const float min_samples = 5.0;
			const float lod_threshold = 10.0;
			const float heightMapScale = 0.61;
			const float shadowSoftening = 0.5;
			
			vec3 normal = normalize(v_normal);
			vec3 view = normalize(v_view);

			//vec2 dx = dFdx(v_uv);
			//vec2 dy = dFdy(v_uv);


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
			vec2 tex_sample = v_uv - parallax_offset;
			
			diffuse = texture2D(texture, tex_sample).rgb;
			
		#elif COLOR == 1
		
			diffuse = vec3(0.7);
			

		
		#endif

		vec4 result;
		
		result = EncodeRGBECorrected(diffuse);
			
		#if TRANSPACENCY_MAP == 1 
		
			alpha = texture2D(transparencyMapSampler, v_uv).r;
			
			result.w = alpha;
			
		#endif
		
		
		gl_FragColor = vec4(finalImage,1.0);
	}

