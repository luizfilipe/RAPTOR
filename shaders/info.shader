/**
 * 	Raptor Engine - Core
 * 	Copyright (c) 2010 RAPTORCODE
 * 	All rights reserved.
 * 
 */
 
 /**
 * 	Author: Kaj Dijksta
 */
 
	#ifndef NORMAL_MAP
		#define NORMAL_MAP 0
	#endif
	
    attribute vec3 position;
	

	attribute vec2 uv;
	
    uniform mat4 view;
    uniform mat4 projection;

	uniform mat4 worldViewProjection;
	uniform mat4 world;

	uniform sampler2D heightmap;
	
	varying vec2 v_uv;
	
    varying vec4 v_normal;
	varying vec4 v_tangent;
	varying vec4 v_binormal;
	varying vec4 v_position;
	varying vec4 v_worldposition;
	varying float v_linear_depth;

    void main(void) {

		v_worldposition = world * vec4(position, 1.0);
		
		vec4 positionEyeSpace = worldViewProjection * v_worldposition;
		//v_normal  =  world * vec4(normal, 0.0);
		
		#if NORMAL_MAP == 1
		//	 v_tangent =  world * vec4(tangent, 0.0);
		//	 v_binormal =  world * vec4(binormal, 0.0);

			 v_uv = uv;
		#endif
		
		v_linear_depth = positionEyeSpace.z;
		
		v_position = positionEyeSpace;
	
		gl_Position = positionEyeSpace;
    }
	
	// #raptorEngine - Split
	
    precision highp float;
	
	#ifndef NORMAL_MAP
		#define NORMAL_MAP 0
	#endif

	uniform float far;
	
	uniform sampler2D normalSampler;
	
	varying vec4 v_position;	
	varying vec4 v_worldposition;
	
	varying vec2 v_uv;
	varying vec4 v_normal;
	
	varying vec4 v_tangent;
	varying vec4 v_binormal;
	
	varying float v_linear_depth;
	
	uniform mat4 view;

	mediump vec2 encode( mediump vec3 n )
	{
		mediump float p = sqrt(n.z * 8.0 + 8.0);
		return vec2(n.xy / p + 0.5);
	}
	
	void main() {
		vec3 worldNormal;
		
		#if NORMAL_MAP == 1
		
			//mat3 tangentToWorld = mat3( v_tangent.xyz,
			//							v_binormal.xyz,
			// 							v_normal.xyz );

			vec3 tangentNormal;
			
			tangentNormal.xy = texture2D(normalSampler, v_uv).xy * 2.0 - 1.0;
			tangentNormal.z = sqrt(clamp(1.0 + dot(tangentNormal.xy, -tangentNormal.xy),0.0,1.0)); 
		
			worldNormal = tangentNormal;
			
			//ambient = clamp( dot(worldNormal, v_normal.xyz), 0.0, 1.0 );
			
		#else
		
			worldNormal = vec3(0.0, 0.0, 1.0);
			
		#endif
			
		vec2 normalInfo = encode( worldNormal );
		
		gl_FragColor = vec4(v_position.z, normalInfo, 1.0); // -v_position.z
	}
	