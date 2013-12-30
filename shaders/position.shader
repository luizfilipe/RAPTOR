    attribute vec3 position;
    attribute vec2 uv;

	uniform mat4 worldViewProjection;

	varying vec2 v_uv;

	void main() {
		vec4 worldPosition = worldViewProjection * vec4(position, 1.0);
		v_uv = uv;
		gl_Position = worldPosition;
	}


	// #raptorEngine - Split

	#ifdef GL_ES
		precision highp float;
	#endif

	varying vec2 v_uv;

	uniform float width;
	uniform float numCells;
	uniform float mode;

	uniform sampler2D positionSampler;
	uniform sampler2D velocitySampler;

	uniform sampler2D randomSampler;
	
	float indexFromUv( vec2 uv ) {
		float index = floor( ( uv.x + ( uv.y * width ) ) * width );
		return index;
	}

	vec3 reposition( float index ) {
		vec3 gridPos;
		gridPos.x = mod(index, numCells - 1.0 );
		gridPos.y = floor(index / numCells - 1.0 );
		gridPos.z = floor(gridPos.y / numCells - 1.0 );
		gridPos.y = mod( gridPos.y, numCells - 1.0 );

		return gridPos;
	}

	vec3 randomizePosition( float index ) {
		vec3 gridPos;
		gridPos.x = cos(index * 2.0 ) * 2.0 + mod(index, 64.0);
		gridPos.y = floor(index / 64.0);
		gridPos.z =  tan(index * 2.0 ) * 2.0 +  floor(gridPos.y / 64.0);
		gridPos.y = mod( gridPos.y, 64.0);
		
		return gridPos;
	}

	void main() {
		vec3 position;
		
		if(mode > 0.9) {
			float index = indexFromUv( v_uv );
			// position = (randomizePosition( index ) * 2.0);
			
			position = ( texture2D(randomSampler, v_uv).xyz )
		} else {
			position = texture2D(positionSampler, v_uv).xyz;
			// vec3 velocity = texture2D(velocitySampler, v_uv).xyz;
			
			// intergrate
			position -= vec3(0.0, .001, 0.0);
		}
		
		gl_FragColor = vec4(position, 1.0);  
	}