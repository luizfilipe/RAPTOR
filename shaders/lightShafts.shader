
	precision mediump float;

	attribute vec3 position;

	uniform mat4 worldViewProjection;
	uniform mat4 view;
	
	varying vec2 v_uv;
	varying vec4 v_worldPosition;
	varying vec4 v_screenProj;


	void main(void) {
		v_worldPosition = vec4(position, 1.0);
		v_screenProj = worldViewProjection * v_worldPosition;
		gl_Position = v_screenProj;
	}

	// #raptorEngine - Split

	precision mediump float;
	
	varying vec4 v_screenProj;
	varying vec4 v_worldPosition;
	varying vec2 v_uv;
	
	uniform float far;
	
	uniform mat4 lightViewProjection;
	uniform sampler2D depthMap;
	uniform float shadowBias;
	
	
	
	float DecodeFloatRGBA( vec4 rgba ) {
		return dot( rgba, vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 160581375.0) );
	}
	
	void main() {
		
		vec4 projCoords = lightViewProjection *  v_worldPosition;
		
		projCoords.xy /= projCoords.w;
		projCoords = 0.5 * projCoords + 0.5;

		float sampleDepth = DecodeFloatRGBA( texture2D(depthMap, projCoords.xy) ) * far;
		float shadowDepth = length( vec3(400.0, 1800.0, 650.0) - v_worldPosition.xyz );
		
		if( shadowDepth < sampleDepth + .0001 )
			gl_FragColor = vec4(0.0,0.0, 0.0, 0.0);
		else
			gl_FragColor = vec4(0.4,0.0, 0.0, 1.0);

	}

