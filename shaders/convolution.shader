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

	uniform sampler2D image;
	uniform vec2 imageIncrement;
	
	uniform float far;
	

	varying vec2 v_textureCoord;

	void main() {
	
		float MSAA1X[13];
		//MSAA1X[0] = 0.004433048175243747;
		//MSAA1X[1] = 0.054005582622414484;
		//MSAA1X[2] = 0.2420362293761143;
		//MSAA1X[3] = 0.3990502796524549;
		//MSAA1X[4] = 0.2420362293761143;
		//MSAA1X[5] = 0.054005582622414484;
		//MSAA1X[6] = 0.004433048175243747;
	
		
		MSAA1X[0] = 0.0022181958546457665; 
		MSAA1X[1] = 0.008773134791588384; 
		MSAA1X[2] = 0.027023157602879527; 
		MSAA1X[3] = 0.06482518513852684; 
		MSAA1X[4] = 0.12110939007484814; 
		MSAA1X[5] = 0.17621312278855084; 
		MSAA1X[6] = 0.19967562749792112; 
		MSAA1X[7] = 0.17621312278855084; 
		MSAA1X[8] = 0.12110939007484814; 
		MSAA1X[9] = 0.06482518513852684; 
		MSAA1X[10] = 0.027023157602879527; 
		MSAA1X[11] = 0.008773134791588384; 
		MSAA1X[12] = 0.0022181958546457665;

		vec2 imageCoordTmp = v_textureCoord - vec2(imageIncrement * 6.0);
		
		 vec4 sum = vec4(0.0);

		
		for (int i = 0; i < 12; ++i) {
			sum += texture2D(image, imageCoordTmp) * MSAA1X[i];
			imageCoordTmp += imageIncrement;
		}
		
		gl_FragColor = sum;
	}

	