/**
 * Raptor Engine - Core
 * Copyright (c) 2010 RAPTORCODE STUDIOS
 * All rights reserved.
 */
  
/**
 * Author: Kaj Dijksta
 */
 


    attribute vec3 uv;

	uniform sampler2D pointMapPositionsSampler;	// [depth, depth*depth, packed normal]
	
	uniform mat4 viewProjection;
	

    void main() {

		gl_PointSize = 3.0;
		float vertexID = uv.x;
		float width = 512.0;
		
		float x = mod( vertexID, width );
		float y = floor( vertexID / width ); 
		
		vec2 textureCoord = vec2(x, y) / width;
		
		
		vec4 pointLightWorldPos = texture2D(pointMapPositionsSampler, textureCoord);

		
		gl_Position = vec4(pointLightWorldPos.xy, 0.0, 1.0) * viewProjection;
    }
	
	// #raptorEngine - Split
	
	precision highp float;

	varying vec3 v_normal;
	varying vec3 v_position;
	
	void main() {
		gl_FragColor = vec4(1.0);
	}

	