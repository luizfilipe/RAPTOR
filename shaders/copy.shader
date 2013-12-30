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

	
	varying vec2 v_textureCoord;

	void main() {
		gl_FragColor =  texture2D(texture, v_textureCoord);
	}

	