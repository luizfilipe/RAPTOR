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

    varying vec2 v_textureCoord;

    void main(void) {
        v_textureCoord = uv;
		gl_Position = viewProjection * vec4(position, 1.0);
    }
	
	// #raptorEngine - Split
	
	precision highp float;

	uniform sampler2D texture;
	uniform float pixelSize;
	
	varying vec2 v_textureCoord;

	void main() {

		vec4 s1 = texture2D(texture, v_textureCoord + vec2(pixelSize, pixelSize));
		vec4 s2 = texture2D(texture, v_textureCoord + vec2(-pixelSize, pixelSize));
		vec4 s3 = texture2D(texture, v_textureCoord + vec2(pixelSize, -pixelSize));
		vec4 s4 = texture2D(texture, v_textureCoord + vec2(-pixelSize, -pixelSize));
		
		vec4 sum = (s1 + s2 + s3 + s4) * 0.25;
		
		gl_FragColor = texture2D(texture, v_textureCoord);
	}

	