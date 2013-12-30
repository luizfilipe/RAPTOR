  
    attribute vec3 position;
    attribute vec2 uv;
	
    uniform mat4 viewProjection;
	
	varying vec4 offset[2];
    varying vec2 texcoord;
	varying vec2 pixcoord;

#define SMAA_PIXEL_SIZE vec2(1.0 / 1280.0, 1.0 / 720.0)
	
    void main(void) {

        texcoord = uv;
		
		offset[0] = texcoord.xyxy + SMAA_PIXEL_SIZE.xyxy * vec4(-1.0, 0.0, 0.0, -1.0);
		offset[1] = texcoord.xyxy + SMAA_PIXEL_SIZE.xyxy * vec4( 1.0, 0.0, 0.0,  1.0);
	
		pixcoord = texcoord / SMAA_PIXEL_SIZE;
	
		gl_Position = viewProjection *  vec4(position, 1.0);
    }
	

	// #raptorEngine - Split

	
	uniform sampler2D colorTex;
	uniform sampler2D blendTex;
	
	uniform float test;

    varying vec2 texcoord;
	varying vec4 offset[2];

	void main() {
		vec4 weights = vec4(0.0, 0.0, 0.0, 0.0);
		//if(texcoord.y >= .50)
		gl_FragColor =  SMAANeighborhoodBlendingPS(	texcoord,
													offset,
													colorTex,
													blendTex );
		//else									
		//gl_FragColor =  texture2D(blendTex, texcoord);
	}

