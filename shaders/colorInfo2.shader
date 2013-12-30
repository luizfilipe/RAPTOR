
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
	varying vec3 v_normal;
	varying vec3 v_diffuse;
	
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
		
			v_uv = uv * uvScale;
		
		#endif
		
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

	uniform sampler2D texture;
	uniform sampler2D heightSampler;
	uniform sampler2D transparencyMapSampler;

	varying vec2 v_uv;
	varying vec4 v_worldPosition;

	varying vec3 v_view;
	varying vec2 v_offset;
	varying vec3 v_normal;
	varying vec3 v_diffuse;
	
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
		
		
		
		gl_FragColor = vec4(result);
	}

