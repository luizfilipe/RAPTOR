
	precision mediump float;

	attribute vec2 uv;


		
	varying vec2 v_uv;
	varying vec4 v_worldPosition;
	
	varying vec3 positionWS;
	varying vec2 texcoord;
	varying vec4 depthmap_scaler;
	varying vec4 screenPos;
	varying vec3 v_normal;
	
	uniform sampler2D g_DepthMapTexture;//SamplerLinearWrap
	uniform float g_WaterHeightBumpScale;

	uniform mat4 g_ModelViewProjectionMatrix;
	uniform vec2 g_WaterMicroBumpTexcoordScale;
	uniform vec2 g_WaterBumpTexcoordShift;

	uniform vec2 g_WaterBumpTexcoordScale;
	uniform float g_HeightFieldSize;
	uniform sampler2D g_WaterBumpTexture;
	uniform vec3 g_CameraPosition;
	
	vec4 CombineWaterNormal(vec3 world_position)
	{
		vec4 water_normal=vec4(0.0,4.0,0.0,0.0);
		float water_miplevel;
		float distance_to_camera;
		float texcoord_scale=1.0;
		float height_disturbance_scale=1.0;
		float normal_disturbance_scale=1.0;
		
		vec2 variance= vec2(1.0,1.0);

		// calculating MIP level for water texture fetches
		distance_to_camera=length(g_CameraPosition-world_position);
		water_miplevel= 1.0/2.0-2.0; //  CalculateMIPLevelForDisplacementTextures(distance_to_camera)/2.0-2.0;
		vec2 tc = (world_position.xz/g_HeightFieldSize);

		// fetching water heightmap
		for(float i=0.0;i<5.0;i++)
		{
			vec4 texvalue = texture2D(g_WaterBumpTexture,  tc*texcoord_scale+g_WaterBumpTexcoordShift*0.03*variance);//,water_miplevel
			variance.x *= -1.0;
			water_normal.xz+=(2.0*texvalue.yx-vec2(1.0,1.0))*normal_disturbance_scale;
			water_normal.w += (texvalue.z - 0.5)*height_disturbance_scale;
			texcoord_scale*=1.4;
			height_disturbance_scale*=0.65;
			normal_disturbance_scale*=0.65;
		}

		
		water_normal.w*=g_WaterHeightBumpScale;
		return vec4(normalize(water_normal.xyz),water_normal.w);
	}
	
	void main(void) {
		
		texcoord = uv;
		
		vec2 size = vec2(300.0 +  g_CameraPosition.y * 5.);
		vec2 origin = g_CameraPosition.xz -  vec2(size / 2.0);
		//vec2 origin = vec2(0.0);	
		vec3 vertexPosition = vec3(0.0);
		vec2 texcoord0to1 = (origin + uv * size) / g_HeightFieldSize;
		vec4 water_normal = vec4(1.0);

		// getting rough estimate of water depth from depth map texture 
		//depthmap_scaler=texture2D(g_DepthMapTexture, vec2(texcoord0to1.x,1.0-texcoord0to1.y));
		depthmap_scaler = vec4(1.0);
		// calculating water surface geometry position and normal
		vertexPosition.xz = origin + uv * size;
		
		vertexPosition.y  = -g_WaterHeightBumpScale/2.0;
		water_normal=CombineWaterNormal(vertexPosition.xyz);

		// fading out displacement and normal disturbance near shores by 60%
		water_normal.xyz=mix(vec3(0.0,1.0,0.0),normalize(water_normal.xyz),0.4+0.6*depthmap_scaler.g);
		vertexPosition.y =water_normal.w*g_WaterHeightBumpScale*(0.4+0.6*depthmap_scaler.g);
		vertexPosition.xz-=(water_normal.xz)*0.5*(0.4+0.6*depthmap_scaler.g);
	
		//	vertexPosition.y = texture2D(g_WaterBumpTexture, uv).b*10.;
	
		// writing output params
		screenPos = g_ModelViewProjectionMatrix * vec4(vertexPosition, 1.0);
		texcoord = texcoord0to1*g_WaterMicroBumpTexcoordScale+g_WaterBumpTexcoordShift*0.07;
		v_normal=normalize(water_normal.xyz);
		positionWS.xyz = vertexPosition;
		

		
		gl_Position = screenPos;
	}

	// #raptorEngine - Split

	precision mediump float;

	uniform float g_ZFar;
	uniform float g_ZNear;
	uniform vec2 g_ScreenSizeInv;
	uniform float g_FogDensity;
	uniform mat4 g_LightModelViewProjectionMatrix;
	uniform mat4 g_ModelViewProjectionMatrix;
	uniform mat4 g_ModelViewMatrix;
	uniform vec2 g_WaterBumpTexcoordShift;
	uniform vec3 g_LightPosition;	
	uniform sampler2D g_DepthTexture; // SamplerDepthAnisotropic
	uniform sampler2D g_WaterBumpTexture; // SamplerAnisotropicWrap
	
	uniform vec3 g_WaterColorIntensity;
	uniform float g_WaterSpecularPower;
	
	uniform vec3 g_WaterSpecularIntensity;
	uniform vec3 g_WaterSpecularColor;
	uniform vec3 g_AtmosphereDarkColor;
	uniform vec3 g_AtmosphereBrightColor;
	uniform sampler2D g_RefractionDepthTextureResolved; // SamplerPointClamp
	uniform sampler2D g_ReflectionTexture;
	uniform vec3 g_WaterDeepColor;
	uniform vec3 g_WaterScatterColor;
	
	uniform vec3 g_CameraPosition;
	
	
	varying vec3 positionWS;
	varying vec2 texcoord;
	varying vec4 depthmap_scaler;
	varying vec4 screenPos;
	// varying vec3 normal;
	varying vec3 v_normal;
	
	vec3 CalculateFogColor(vec3 pixel_to_light_vector, vec3 pixel_to_eye_vector)
	{
		return mix(g_AtmosphereDarkColor, g_AtmosphereBrightColor, 0.5 * dot(pixel_to_light_vector , -pixel_to_eye_vector) + 0.5);
	}
		
	float GetRefractionDepth(vec2 p)
	{
		return texture2D(g_RefractionDepthTextureResolved, p).r;
	}
	
	float GetConservativeRefractionDepth(vec2 pos)
	{
		float result =      texture2D(g_RefractionDepthTextureResolved, pos + 2.0 * vec2(g_ScreenSizeInv.x,g_ScreenSizeInv.y) ).r;
		result = min(result,texture2D(g_RefractionDepthTextureResolved, pos + 2.0 * vec2(g_ScreenSizeInv.x,-g_ScreenSizeInv.y) ).r);
		result = min(result,texture2D(g_RefractionDepthTextureResolved, pos + 2.0 * vec2(-g_ScreenSizeInv.x,g_ScreenSizeInv.y) ).r);
		result = min(result,texture2D(g_RefractionDepthTextureResolved, pos + 2.0 * vec2(-g_ScreenSizeInv.x,-g_ScreenSizeInv.y) ).r);
		
		return result;
	}

	void main() {
		vec3 normal = v_normal.xyz;
		vec4 color;
		vec3 pixel_to_light_vector = normalize(g_LightPosition-positionWS);
		vec3 pixel_to_eye_vector = normalize(g_CameraPosition-positionWS);
		vec3 reflected_eye_to_pixel_vector;
		vec3 microbump_normal; 
		mat3 normal_rotation_matrix;

		float fresnel_factor;
		float diffuse_factor;
		float specular_factor;
		float scatter_factor;
		vec4 refraction_color;
		vec4 reflection_color;
		vec4 disturbance_eyespace;
	
		float water_depth;
		vec4 water_color;

		// calculating pixel position in light space
		vec4 positionLS = g_LightModelViewProjectionMatrix * vec4(positionWS,1.0);
		positionLS.xyz /= positionLS.w;
		positionLS.x = (positionLS.x + 1.0) * 0.5;
		positionLS.y = (1.0 - positionLS.y) * 0.5;
/*
		// calculating shadow multiplier to be applied to diffuse/scatter/specular light components
		float dsf= 1.0 / 4096.0;
		float shadow_factor = 0.2 * texture2D(g_DepthTexture, positionLS.xy, positionLS.z * 0.995).r;
		shadow_factor+= 0.2 * texture2D(g_DepthTexture, positionLS.xy + vec2(dsf,dsf),positionLS.z * 0.995).r;
		shadow_factor+= 0.2 * texture2D(g_DepthTexture, positionLS.xy + vec2(-dsf,dsf),positionLS.z * 0.995).r;
		shadow_factor+= 0.2 * texture2D(g_DepthTexture, positionLS.xy + vec2(dsf,-dsf),positionLS.z * 0.995).r;
		shadow_factor+= 0.2 * texture2D(g_DepthTexture, positionLS.xy + vec2(-dsf,-dsf),positionLS.z * 0.995).r;
*/
		float shadow_factor = 0.0;
		// need more high frequency bumps for plausible water surface, so creating normal defined by 2 instances of same bump texture
		microbump_normal = normalize(2.0 * texture2D(g_WaterBumpTexture, texcoord - g_WaterBumpTexcoordShift * 0.2).gbr - vec3(1.0,-8.0,1.0));
		microbump_normal+= normalize(2.0 * texture2D(g_WaterBumpTexture, texcoord * 0.5 + g_WaterBumpTexcoordShift * 0.05).gbr - vec3 (1.0,-8.0,1.0));

		// calculating base normal rotation matrix
		normal_rotation_matrix[1] = normal.xyz;
		normal_rotation_matrix[2] = normalize(cross(vec3(0.0,0.0,-1.0),normal_rotation_matrix[1]));
		normal_rotation_matrix[0] = normalize(cross(normal_rotation_matrix[2],normal_rotation_matrix[1]));

		// applying base normal rotation matrix to high frequency bump normal
		microbump_normal = normalize(microbump_normal) * normal_rotation_matrix;
	
	
		
		

		
		// simulating scattering/double refraction: light hits the side of wave, travels some distance in water, and leaves wave on the other side
		// it's difficult to do it physically correct without photon mapping/ray tracing, so using simple but plausible emulation below
		
		// only the crests of water waves generate double refracted light
		scatter_factor = 2.5 * max(0.0, positionWS.y * 0.25 + 0.25);

		// the waves that lie between camera and light projection on water plane generate maximal amount of double refracted light 
		scatter_factor *= shadow_factor * pow(max(0.0,dot(normalize(vec3(pixel_to_light_vector.x, 0.0, pixel_to_light_vector.z)),-pixel_to_eye_vector)), 2.0);
		
		// the slopes of waves that are oriented back to light generate maximal amount of double refracted light 
		scatter_factor *= pow(max(0.0, 1.0 - dot(pixel_to_light_vector, microbump_normal)),8.0);
		
		// water crests gather more light than lobes, so more light is scattered under the crests
		scatter_factor += shadow_factor * 1.5 * g_WaterColorIntensity.y * max(0.0, positionWS.y+1.0) *
			// the scattered light is best seen if observing direction is normal to slope surface
			max(0.0, dot(pixel_to_eye_vector, microbump_normal)) *
			// fading scattered light out at distance and if viewing direction is vertical to avoid unnatural look
			max(0.0, 1.0 - pixel_to_eye_vector.y) * ( 300.0 / (300.0 + length(g_CameraPosition - positionWS)));

		// fading scatter out by 90% near shores so it looks better
		scatter_factor *= 0.1 + 0.9 * depthmap_scaler.g;

		// calculating fresnel factor 
		float r = (1.2-1.0) / (1.2+1.0);
		fresnel_factor = max(0.0, min(1.0, r + (1.0 - r) * pow(1.0 - dot(microbump_normal, pixel_to_eye_vector), 4.0)));

		// calculating specular factor
		reflected_eye_to_pixel_vector=-pixel_to_eye_vector+2.0 * dot(pixel_to_eye_vector, microbump_normal) * microbump_normal;
		specular_factor = shadow_factor * fresnel_factor * pow(max(0.0, dot(pixel_to_light_vector, reflected_eye_to_pixel_vector)), g_WaterSpecularPower);

		// calculating diffuse intensity of water surface itself
		diffuse_factor = g_WaterColorIntensity.x + g_WaterColorIntensity.y * max(0.0, dot(pixel_to_light_vector, microbump_normal));

		// calculating disturbance which has to be applied to planar reflections/refractions to give plausible results
		disturbance_eyespace =  g_ModelViewMatrix * vec4(microbump_normal.x, 0.0, microbump_normal.z, 0.0);

		vec2 reflection_disturbance = vec2(disturbance_eyespace.x, disturbance_eyespace.z) * 0.03;
		vec2 refraction_disturbance = vec2(-disturbance_eyespace.x, disturbance_eyespace.y) * 0.05 *
			// fading out reflection disturbance at distance so reflection doesn't look noisy at distance
			(20.0 / (20.0 + length(g_CameraPosition - positionWS)));
		
		


	// calculating correction that shifts reflection up/down according to water wave Y position
	vec4 projected_waveheight = g_ModelViewProjectionMatrix * vec4(positionWS.x,positionWS.y,positionWS.z,1.0);
	float waveheight_correction = -0.5 * projected_waveheight.y / projected_waveheight.w;
	projected_waveheight = g_ModelViewProjectionMatrix * vec4(positionWS.x, -0.8, positionWS.z, 1.0);
	waveheight_correction += 0.5 * projected_waveheight.y / projected_waveheight.w;
	reflection_disturbance.y = max(-0.15, waveheight_correction + reflection_disturbance.y);

	
	
	// picking refraction depth at non-displaced point, need it to scale the refraction texture displacement amount according to water depth
	float refraction_depth = texture2D(g_RefractionDepthTextureResolved, screenPos.xy * g_ScreenSizeInv).r;
	
	refraction_depth = g_ZFar * g_ZNear / (g_ZFar - refraction_depth * (g_ZFar - g_ZNear));
	vec4 vertex_in_viewspace =  g_ModelViewMatrix * vec4(positionWS, 1.0);
	water_depth = refraction_depth - vertex_in_viewspace.z;
	float nondisplaced_water_depth = water_depth;
	
	// scaling refraction texture displacement amount according to water depth, with some limit
	refraction_disturbance *= min(2.0, water_depth);

	// picking refraction depth again, now at displaced point, need it to calculate correct water depth
	refraction_depth = texture2D(g_RefractionDepthTextureResolved, screenPos.xy * g_ScreenSizeInv + refraction_disturbance).r;
	refraction_depth = g_ZFar * g_ZNear / (g_ZFar - refraction_depth * (g_ZFar - g_ZNear));
	vertex_in_viewspace = g_ModelViewMatrix * vec4(positionWS,1.0);
	water_depth = refraction_depth - vertex_in_viewspace.z;

	// zeroing displacement for points where displaced position points at geometry which is actually closer to the camera than the water surface
	float conservative_refraction_depth=GetConservativeRefractionDepth(screenPos.xy * g_ScreenSizeInv + refraction_disturbance);
	conservative_refraction_depth = g_ZFar * g_ZNear / (g_ZFar - conservative_refraction_depth * (g_ZFar-g_ZNear));
	vertex_in_viewspace = g_ModelViewMatrix * vec4(positionWS,1.0);
	float conservative_water_depth = conservative_refraction_depth - vertex_in_viewspace.z;

	if(conservative_water_depth<0.0)
	{
		refraction_disturbance = vec2(0.0);
		water_depth = nondisplaced_water_depth;
	}
	
	water_depth = max(0.0,water_depth);

	// getting reflection and refraction color at disturbed texture coordinates
	reflection_color = texture2D(g_ReflectionTexture, vec2(screenPos.x * g_ScreenSizeInv.x, 1.0 - screenPos.y * g_ScreenSizeInv.y) + reflection_disturbance, 0.0);
	refraction_color = texture2D(g_ReflectionTexture, screenPos.xy * g_ScreenSizeInv + refraction_disturbance, 0.0);

	// calculating water surface color and applying atmospheric fog to it
	water_color = diffuse_factor * vec4(g_WaterDeepColor,1.0);
	water_color.rgb = mix(CalculateFogColor(pixel_to_light_vector, pixel_to_eye_vector).rgb, water_color.rgb, min(1.0, exp(-length(g_CameraPosition - positionWS) * g_FogDensity)));
	
	// fading fresnel factor to 0 to soften water surface edges
	fresnel_factor *= min(1.0, water_depth * 5.0);

	// fading refraction color to water color according to distance that refracted ray travels in water 
	refraction_color = mix(water_color, refraction_color, min(1.0, 1.0 * exp(-water_depth / 8.0)));
	
	// combining final water color
	color.rgb = mix(refraction_color.rgb, reflection_color.rgb, fresnel_factor);
	color.rgb += g_WaterSpecularIntensity * specular_factor * g_WaterSpecularColor * fresnel_factor;
	color.rgb += g_WaterScatterColor * scatter_factor;
	color.a = 1.0;
	
		gl_FragColor = color;
	}

