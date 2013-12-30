
	attribute vec3 position;

	uniform mat4 worldViewProjection;
	uniform mat4 world;
	

	void main(void) {

		vec4 worldPosition = world * vec4(position, 1.0);
		
		gl_Position = worldViewProjection * worldPosition;

	}

	// #raptorEngine - Split


	void main() {

		gl_FragColor = vec4(1.0);
	}

