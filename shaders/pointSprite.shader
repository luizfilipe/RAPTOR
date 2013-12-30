	precision mediump float;

    attribute vec4 position;
	
    uniform mat4 worldView;

	varying vec4 v_position;

	uniform float pointScale;

	
    void main() {

		const float pointRadius = 10.0;

		vec4 pos =   worldView * position;

		
	    float dist = length(pos.xyz);
		gl_PointSize = pointRadius * (pointScale / dist);
		
		gl_Position = pos;
    }
	
	// #raptorEngine - Split
	
	precision mediump float;

	uniform vec3 eye;
	
    void main() {
		vec4 color = vec4(1.0);
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
		
		vec4 total = color * diffuse + S;
		
		gl_FragColor = vec4(total.xyz, .4);
		
		// gl_FragColor = vec4(v_position.z/100.0, 0.0, 0.0, 1.0);
    }
	