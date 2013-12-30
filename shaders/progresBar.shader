
	precision mediump float;


	attribute vec3 position;
	attribute vec2 uv;

	uniform mat4 worldViewProjection;
	uniform mat4 world;
	
	varying vec2 v_uv;
	varying vec4 v_worldPosition;

	void main(void) {

		//v_worldPosition = world * vec4(position, 1.0);
		
		gl_Position = worldViewProjection * world * vec4(position, 1.0);
		
		v_uv = uv;
	}

	// #raptorEngine - Split

	precision mediump float;

	varying vec2 v_uv;
	
	uniform float deltaTime;
	
	void main() {
		
		
		const float numberOfBlocks = 20.0;
		float x = v_uv.x;
		
		float s =  (  sin( deltaTime + x * 3.) );
		 
		float b = pow(s, 30.0);
		
		if(b > .6) {
			gl_FragColor =  b * vec4(38.0/256.0, 104.0/256.0, 158.0/256.0, 1.0) + (1.0 - b) * vec4(6.0/256.0, 23.0/256.0, 38.0/256.0, 1.0);
		} else {
			
			//if( mod( v_uv.x , .022)  < .008 )
			//	gl_FragColor = vec4(vec3( 0.0 ), 1.0);
			//else
			gl_FragColor = vec4(6.0/256.0, 23.0/256.0, 38.0/256.0, 1.0);
		}
		
		gl_FragColor =  b * vec4(38.0/256.0, 104.0/256.0, 158.0/256.0, 1.0) + (1.0 - b) * vec4(6.0/256.0, 23.0/256.0, 38.0/256.0, 1.0);
	}

