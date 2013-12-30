  
    attribute vec3 position;
	attribute vec2 uv;
	
	uniform mat4 worldViewProjection;

	varying vec2 v_uv;

    void main(void) {
		v_uv = uv ;
		gl_Position = worldViewProjection * vec4(position, 1.0);
    }
	
	// #raptorEngine - Split
	
    precision highp float;

	varying vec2 v_uv;
	
	uniform sampler2D texture;

	void main() {
		gl_FragColor = texture2D(texture, v_uv);
	}
	
	