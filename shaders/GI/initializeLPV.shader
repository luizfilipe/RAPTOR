/**
 * Raptor Engine - Core
 * Copyright (c) 2010 RAPTORCODE STUDIOS
 * All rights reserved.
 */
  
/**
 * Author: Kaj Dijksta
 */
 
	#define RSM_RES 216.0 //the resolution of the RSMs (this has to be a power of two, see note below)
	#define RSM_RES_M_1 RSM_RES-1.0 // one RSM_RES-1 (to be used for doing modulus with RSM_RES - note that any code using this assumes RSM_RES is a power of two)
	#define RSM_RES_SQR RSM_RES*RSM_RES
	#define RSM_RES_SQR_M_1 RSM_RES_SQR-1.0

	#define LPV3DWidth 36.0 //resolution of the 3D LPV
	#define LPV3DHeight 36.0 //resolution of the 3D LPV
	#define LPV3DDepth 36.0 //resolution of the 3D LPV

	#define RSMHeight 256.0 
	#define RSMWidth 256.0 


    attribute vec3 uvBuffer;

	uniform sampler2D shadowDepthNormalSampler;	// [depth, depth*depth, packed normal]
	
	uniform mat4 worldViewProjection;
	uniform mat4 viewToLPV;
	uniform mat4 view;
	
	uniform vec3 cameraPosition;
	uniform vec3 frustumWorldCorners[8];
	
	uniform float test;
	uniform float shadowFar;
	
	varying vec3 v_position;
	varying vec3 v_normal;
	
	mediump vec3 decodeNormal( mediump vec2 enc ) {
		mediump vec2 fenc = enc * 4.0 - 2.0;
		mediump float f = dot(fenc, fenc);
		mediump float g = sqrt(1.0 - f / 4.0);
		mediump vec3 n;
		n.xy = fenc * g;
		n.z = 1.0 - f / 2.0;
		return n;
	}
		
		
	struct vpl{
		vec3 normal;
		vec3 diffuse;
		vec3 position;
		vec2 textureCoord;
	};
	
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
					depth ) +vec3(  cameraPosition.y,cameraPosition.z, test);
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

	float DecodeFloatRGBA( vec4 rgba ) {
	  return dot( rgba, vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 160581375.0) );
	}
	
	float shadow_sample(sampler2D depthMap, vec2 coord)
	{
		return DecodeFloatRGBA(texture2D(depthMap, coord.xy));
	}
	
	vpl initializeLPV(vec2 textureCoord)
	{
		vec3 normal = decodeNormal( texture2D(shadowDepthNormalSampler, textureCoord).zw ); // g_txRSMNormal.Load(uvw).rgb;
		
		float normalizedDepth = shadow_sample( shadowDepthNormalSampler, textureCoord ); // g_txRSMDepth.Load(uvw).x;
		
		vec3 vplWorldPosition = constructPositionWorld(textureCoord, normalizedDepth);
		
		vec3 normPosition = vplWorldPosition / 2000.0;


		vec3 gridPosition = floor(normPosition * 36.0) / 36.0;
		
		vec2 wuv = getTexture3DCoord(gridPosition + .5);

		vpl pointLight;
		
		vec2 normalizedUv = (wuv) ;
		
		// pointLight.position = vec4(x / RSMWidth,y / RSMWidth, 0.2, 1.0);
		pointLight.position = vec3(normalizedUv-.5, 0.1);
		pointLight.normal = vec3(gridPosition );
		pointLight.textureCoord = textureCoord;

		return pointLight;
	}
	
	
    void main() {
		vpl light = initializeLPV(uvBuffer.xy);
		
		v_position = light.position.xyz;
		v_normal = light.normal;
		
		vec4 pos = vec4(light.position , 1.0);
		
		gl_PointSize = 1.0;
		gl_Position = pos;
		// gl_Position = vec4(pos, 1.0);
	// gl_Position = vec4(inputPos.xy, 0.0, 1.0);
		
    }
	
	// #raptorEngine - Split
	
	precision highp float;

	varying vec3 v_normal;
	varying vec3 v_position;
	
	uniform vec3 eye;
	
	
	void main() {
		vec4 color = vec4(1.0,0.0,0.0,0.0);
		vec3 lightDir =  vec3(0.577, 0.577, 0.577);
		vec4 light_specular = vec4(6.0);

		float Ns = 250.0;

		vec3 N;
		N.xy = gl_PointCoord * vec2(2.0, -2.0) + vec2(-1.0, 1.0);
		float mag = dot( N.xy, N.xy );
		
		if (mag > 1.0) discard;   // kill pixels outside circle
		N.z = sqrt(1.0-mag);

		// calculate lighting
		float diffuse = max(0.0, dot(lightDir, N));
		
		vec3 halfVector = normalize( eye + lightDir);
		float spec = max( pow(dot(N,halfVector), Ns), 0.); 
		vec4 S = light_specular * spec;
		
		vec4 total = color * diffuse + S;
		
		gl_FragColor = vec4( v_normal,1.);
	
		// gl_FragColor = vec4(v_position,1.0);
	}

	