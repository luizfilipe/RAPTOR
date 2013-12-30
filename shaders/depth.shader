  
    attribute vec3 position;
	
    uniform mat4 view;
	uniform mat4 worldViewProjection;
	uniform mat4 world;
	

	varying vec4 v_position;


    void main(void) {
		vec4 worldPosition = world * vec4(position, 1.0);
		
		v_position = view * worldPosition;
		
		gl_Position = v_position;
    }
	
	// #raptorEngine - Split
	
    precision highp float;

	varying vec4 v_position;
	
	uniform float far;
	uniform float near;
	
	#extension GL_OES_standard_derivatives : enable

	
	vec4 pack (float depth)
	{
		const vec4 bias = vec4(1.0 / 255.0,
					1.0 / 255.0,
					1.0 / 255.0,
					0.0);

		float r = depth;
		float g = fract(r * 255.0);
		float b = fract(g * 255.0);
		float a = fract(b * 255.0);
		vec4 colour = vec4(r, g, b, a);
		
		return colour - (colour.yzww * bias);
	}
	
	void main() {
		float depth = (v_position.xyz/v_position.w).z;
		
		float moment1 = depth;
		float moment2 = depth * depth;
	
		float dx = dFdx(depth);
		float dy = dFdy(depth);
		
		moment2 += 0.25*(dx*dx+dy*dy);
		
		gl_FragColor = pack(depth);
	}
	
	