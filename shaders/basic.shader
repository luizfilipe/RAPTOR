
	precision mediump float;


	attribute vec3 position;
	attribute vec2 uv;

	uniform mat4 worldViewProjection;
	uniform mat4 world;
	
	varying vec2 v_uv;
	varying vec4 v_worldPosition;

	void main(void) {

		//v_worldPosition = world * vec4(position, 1.0);
		v_uv = uv;
		gl_Position = worldViewProjection * world * vec4(position, 1.0);
		gl_PointSize  = 10.0;
		
		
	}

	// #raptorEngine - Split

	precision mediump float;

	varying vec2 v_uv;
	
	void main() {


		gl_FragColor = vec4(v_uv, 0.0, 1.0);
	}

