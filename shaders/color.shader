
	precision mediump float;

	attribute vec3 position;

	uniform mat4 worldViewProjection;
	uniform mat4 world;
	
	varying vec2 v_uv;
	varying vec4 v_worldPosition;

	void main(void) {
		
		gl_Position = worldViewProjection * world * vec4(position, 1.0);

	}

	// #raptorEngine - Split

	precision mediump float;

	
	void main() {
		gl_FragColor = vec4(1.0);
	}

