
	precision mediump float;

	attribute vec2 uv;

	varying vec3 v_normal;
	varying vec3 v_binormal;
	varying vec3 v_tangent;
		
	varying vec2 v_uv;
	varying vec4 v_worldPosition;
	
	varying vec3 positionWS;
	varying vec2 texcoord;
	varying vec4 depthmap_scaler;
	varying vec4 screenPos;
	
	
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


		// getting rough estimate of water depth from depth map texture 
		//depthmap_scaler=texture2D(g_DepthMapTexture, vec2(texcoord0to1.x,1.0-texcoord0to1.y));
		depthmap_scaler = vec4(1.0);
		// calculating water surface geometry position and normal
		vertexPosition.xz = origin + uv * size;
	
		
		vec4 texvalue = texture2D(g_WaterBumpTexture,  texcoord0to1);

		vertexPosition.y = length(texvalue) * 10.0;
		
		vertexPosition.y +=  texture2D(g_WaterBumpTexture,  texcoord0to1 * .2) * 50.0;
		
		//vertexPosition.y = length(texture2D(g_WaterBumpTexture,  texcoord0to1)) * 40.0;


		// writing output params
		screenPos = g_ModelViewProjectionMatrix * vec4(vertexPosition, 1.0);
		texcoord = texcoord0to1;

		v_worldPosition.xyz = vertexPosition;
		
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
	uniform sampler2D waterNorm; // SamplerPointClamp
	uniform sampler2D offsetSampler;
	uniform vec3 g_WaterDeepColor;
	uniform vec3 g_WaterScatterColor;
	
	
	
	varying vec4 v_worldPosition;
	varying vec2 texcoord;
	varying vec4 depthmap_scaler;
	varying vec4 screenPos;
	// varying vec3 normal;
	varying vec3 v_normal;
	uniform vec3 g_CameraPosition;
	
vec4 lit(float l ,float h, float m) {
  return vec4(1.0,
              max(l, 0.0),
              (l > 0.0) ? pow(max(0.0, h), m) : 0.0,
              1.0);
}

	
	void main() {
		float shininess = 291.0;
		float lightIntensity = .9;
		float specular = 311.0;
		
		vec4 diffuse = vec4(g_WaterDeepColor, 1.0);
		vec4 textureDiffuse = vec4(1.0);
		
		vec3 lightPosition = vec3(50.0, 100.0, 20.0);
		vec3 eye_dir = g_CameraPosition;
		
		
		
		vec3 tangentNormal = texture2D(waterNorm, texcoord.xy ).xyz - vec3(0.5, 0.5, 0.5);	
		
		vec3 worldNormal = normalize(tangentNormal);
		
		vec3 surfaceToLight = normalize(lightPosition.xyz - v_worldPosition.xyz);
		vec3 surfaceToView = normalize(eye_dir.xyz - v_worldPosition.xyz);
		 
		  vec3 halfVector = normalize(surfaceToLight + surfaceToView);
		  vec4 litResult = lit(dot(worldNormal, surfaceToLight),
								 dot(worldNormal, halfVector), shininess);
		  vec4 outColor = vec4(46.0 / 255.0, 49.0 / 255.0, 58.0 / 255.0, 1.0) * .5;//ambientIntensity * ambient * textureAmbient
		  outColor += lightIntensity * (diffuse * textureDiffuse * litResult.y + specular * litResult.z);
		  //outColor += emissive;
  


		
		gl_FragColor = vec4(outColor.rgb , 1.0);
	}

