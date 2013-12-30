  
    attribute vec3 position;
    attribute vec2 uv;
	
    uniform mat4 viewProjection;

    varying vec2 texcoord;
	varying vec4 offset[3];

	#define SMAA_PIXEL_SIZE vec2(1.0 / 1280.0, 1.0 / 720.0)
	
    void main(void) {

        texcoord = uv;

		offset[0] = uv.xyxy + SMAA_PIXEL_SIZE.xyxy * vec4(-1.0, 0.0, 0.0, -1.0);
		offset[1] = uv.xyxy + SMAA_PIXEL_SIZE.xyxy * vec4( 1.0, 0.0, 0.0,  1.0);
		offset[2] = uv.xyxy + SMAA_PIXEL_SIZE.xyxy * vec4(-2.0, 0.0, 0.0, -2.0);

		gl_Position = viewProjection *  vec4(position, 1.0);

    }
	

	// #raptorEngine - Split

	precision highp float;
	
	uniform sampler2D colorTex;

    varying vec2 texcoord;
	varying vec4 offset[3];


	
	void main() {


		gl_FragColor = 	SMAALumaEdgeDetectionPS( texcoord,
												offset,
												colorTex );
	}

