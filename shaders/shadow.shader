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
	
	precision highp float;



	uniform sampler2D shadowDepthSampler;
	uniform sampler2D infoSampler;
	
	uniform float far;
	uniform float shadowBias;
	uniform mat4 lightViewProjection1;
	
	
	varying vec2 v_uv;
	
	uniform vec3 frustumWorldCorners[8];
	
	uniform vec3 cameraPosition;
	uniform float test;

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
	
	void main() {
	
		float depth = texture2D( infoSampler, v_uv	).z;
		
		vec3 worldPosition = constructPositionWorld( v_uv, depth / far );
		
		float shadowDepth = length( (vec3(700., 1800., 250.) - worldPosition) );
		
		vec4 projCoords = lightViewProjection1 *  vec4(worldPosition, 1.0);
		
		projCoords.xy /= projCoords.w;
		projCoords = 0.5 * projCoords + 0.5;
		
		float pixelDepth = texture2D(shadowDepthSampler, projCoords.xy).x;
		
		if( pixelDepth + shadowBias > shadowDepth) {
			gl_FragColor = vec4(1.0);
		} else {
			gl_FragColor = vec4(0.3);
		}
	}

	