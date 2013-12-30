	precision highp float;

    attribute float index;
	
    uniform mat4 worldViewProjection;

    varying vec2 v_uv;
	varying vec4 v_position;
	varying float P_index;

	uniform sampler2D positionSampler;
	uniform float pointScale;
	

	vec3 reposition( float index ) {
		vec3 gridPos;
		gridPos.x = mod(index, 64.0);
		gridPos.y = floor(index / 64.0);
		gridPos.z = floor(gridPos.y / 64.0);
		gridPos.y = mod( gridPos.y, 64.0);
		gridPos -= vec3(64.0/2.0);
		
		return gridPos;
	}
	
    void main(void) {
		vec3 gridPos;
		float pointRadius = 1.0;
		

		
		vec2 uvPosition;
		
		uvPosition.x = mod(index, 512.0) / 512.0;
		uvPosition.y = floor(index / 512.0) / 512.0;
	
		vec3 particlePosition = ( texture2D(positionSampler, uvPosition).xyz - .5 ) * 1000.;
	//	vec3 particlePosition = reposition( index );
		vec4 pos = worldViewProjection *  vec4( particlePosition, 1.0);

		v_position = pos;
		v_uv = uvPosition;
		P_index = index;
		
	    float dist = length(pos.xyz);
		gl_PointSize = pointRadius * (pointScale / dist);
		

		gl_Position = pos;
    }
	
	// #raptorEngine - Split
	
	precision mediump float;
		
	varying vec4 v_position;
	varying vec2 v_uv;
	varying float P_index;
	
	uniform vec3 eye;
	uniform sampler2D textureSampler;
	
	
    void main(void) {
		vec4 color = vec4(1.0, floor(P_index / 200000.0), floor(P_index / 20000.0) / 3.0, 1.0);
		vec3 lightDir =  vec3(0.577, 0.577, 0.577);
		vec4 light_specular = vec4(6.0);

		float Ns = 250.0;

		vec3 N;
		N.xy = gl_PointCoord * vec2(2.0, -2.0) + vec2(-1.0, 1.0);
		float mag = dot( N.xy, N.xy );
		
		if (mag > 1.0) discard;   // kill pixels outside circle
		N.z = sqrt(1.0-mag);

		// calculate lighting
		float diffuse = max(0.0, dot(lightDir, N));
		
		vec3 halfVector = normalize( eye + lightDir);
		float spec = max( pow(dot(N,halfVector), Ns), 0.); 
		vec4 S = light_specular * spec;
		
		gl_FragColor = vec4(0.0,0.0,0.0,1.0) + color * diffuse + S;
		//gl_FragColor = vec4(v_position.z/100.0, 0.0, 0.0, 1.0);
    }
	