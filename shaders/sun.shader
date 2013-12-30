  
    attribute vec3 position;
	attribute vec2 uv;
	
	uniform mat4 projection;
	uniform mat4 worldView;
	uniform vec3 eye;
	
	varying vec2 v_uv;

    void main(void) {
		vec3 pos = vec3(1.0) * 10.;
		v_uv = uv ;
		gl_Position = projection * (vec4(pos + position.xzy + worldView[3].xyz, 1.0) );
    }
	
	// #raptorEngine - Split
	
    precision highp float;

	varying vec2 v_uv;
	
	uniform sampler2D texture;

	void main() {
		vec4 color = texture2D(texture, v_uv);
	
		gl_FragColor = vec4(color.xyz, length(color));
	}
	
	