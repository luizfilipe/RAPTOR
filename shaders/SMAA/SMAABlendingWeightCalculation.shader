  
    attribute vec3 position;
    attribute vec2 uv;
	
    uniform mat4 viewProjection;
	
	varying vec4 offset0;
	varying vec4 offset1;
	varying vec4 offset2;
	
    varying vec2 texcoord;
	varying vec2 pixcoord;
	
	#define SMAA_PIXEL_SIZE vec2(1.0 / 1024.0, 1.0 / 1024.0)
	#define SMAA_MAX_SEARCH_STEPS 32
	
    void main(void) {

	
        texcoord = uv;

		offset0 = 	texcoord.xyxy + SMAA_PIXEL_SIZE.xyxy * vec4(-0.25, -0.125,  1.25, -0.125);
		offset1 = 	texcoord.xyxy + SMAA_PIXEL_SIZE.xyxy * vec4(-0.125, -0.25, -0.125,  1.25);
		
		offset2 = 	vec4(offset0.xz, offset1.yw) + 
						vec4(-2.0, 2.0, -2.0, 2.0) *
						SMAA_PIXEL_SIZE.xxyy * float(SMAA_MAX_SEARCH_STEPS);
	
	
	

		pixcoord = texcoord / SMAA_PIXEL_SIZE;
	
		gl_Position = viewProjection *  vec4(position, 1.0);
    }
	

	// #raptorEngine - Split

	
	uniform sampler2D edgesTex;
	uniform sampler2D areaTex;
	uniform sampler2D searchTex;
	
    varying vec2 texcoord;
	varying vec2 pixcoord;
	varying vec4 offset[3];
	
	varying vec4 offset0;
	varying vec4 offset1;
	varying vec4 offset2;

	
	void main() {
		vec4 offset[3];
		offset[0] = offset0;
		offset[1] = offset1;
		offset[2] = offset2;
		
		vec4 weights = SMAABlendingWeightCalculationPS(	texcoord,
														pixcoord,
														offset,
														edgesTex, 
														areaTex, 
														searchTex,
														ivec4(0, 0, 0, 0) ); // 1X SMAA

														
		gl_FragColor = weights * 2.0;
		//gl_FragColor = vec4(pixcoord.x, 0.0, 0.0, 1.0);
		//gl_FragColor = vec4(SMAASampleLevelZero(edgesTex, texcoord).g, 0.0, 0.0, 1.0);
		
		
	}

