  

    attribute float index;
	
    uniform mat4 worldViewProjection;

    varying vec2 v_uv;
	varying vec3 v_position;
	varying float P_index;

	uniform sampler2D positionSampler;
	uniform float pointScale;
	
    void main(void) {
		vec3 gridPos;
		float pointRadius = 1.0;
		
		
		gridPos.x = mod(index, 64.0);
		gridPos.y = floor(index/64.0);
		gridPos.z =  floor(gridPos.y/64.0);
		gridPos.y = mod( gridPos.y, 64.0);
		
		vec2 uvPosition;
		
		uvPosition.x = mod(index, 512.0) / 512.0;
		uvPosition.y = floor(index / 512.0) / 512.0;
	
		vec3 particlePosition = texture2D(positionSampler, uvPosition).xyz;

		vec4 pos = worldViewProjection *  vec4( particlePosition, 1.0);
		
		v_position = pos.xyz;
		v_uv = uvPosition;
		P_index = index;
		
	    float dist = length(pos.xyz);
		gl_PointSize = pointRadius * (pointScale / dist);
		

		gl_Position = pos;
    }
	
	// #raptorEngine - Split
	
	precision mediump float;
	
	
	uniform sampler2D textureSampler;
	varying vec3 v_position;
	varying vec2 v_uv;
	varying float P_index;
	
	uniform vec3 eye;
	
	
	
    void main(void) {
	
	vec3 Color = vec3(1.0, 1.0, 0.0);
	vec3 lightDir = vec3(0.0, 1.0, 1.0);
	vec4 light_specular = vec4(6.0);
	vec4 mat_specular = vec4(1.0); 
	float Ns = 250.0;

    // calculate normal from texture coordinates
    vec3 N;
    N.xy = gl_PointCoord* 2.0 - vec2(1.0);    
    float mag = dot(N.xy, N.xy);
    if (mag > 1.0) discard;   // kill pixels outside circle
    N.z = sqrt(1.0-mag);

    // calculate lighting
    float diffuse = max(0.0, dot(lightDir, N));
 

    vec3 halfVector = normalize( eye + lightDir);
    float spec = max( pow(dot(N,halfVector), Ns), 0.); 
    vec4 S = light_specular*mat_specular* spec;
  
    gl_FragColor = vec4(Color,1) * diffuse + S;
	
			

    }
	