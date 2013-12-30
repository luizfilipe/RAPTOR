  
	attribute vec3 normal;
    attribute vec3 position;

	uniform mat4 worldViewProjection;

	varying vec2 v_uv;
	varying vec3 v_normal;
	
    void main(void) {
		v_normal = normal;
		gl_Position = worldViewProjection * vec4(position, 1.0);
    }
	
	// #raptorEngine - Split
	
    precision highp float;

	varying vec2 v_uv;
	varying vec3 v_normal;
	
	uniform samplerCube texture;
	uniform vec4 eye;

	void main() {
	// vec4(150.0 / 255.0, 189.0 / 255.0, 205.0 / 255.0, 1.0);
	
		vec3 norm = normalize(v_normal);
		vec3 worldEye = normalize(eye.xyz);
		
		vec3 lookup = normalize(reflect(worldEye, norm));
		vec4 color = textureCube(texture, norm);

	
		gl_FragColor = vec4(150.0 / 255.0, 189.0 / 255.0, 205.0 / 255.0, 1.0);
	}
	
	