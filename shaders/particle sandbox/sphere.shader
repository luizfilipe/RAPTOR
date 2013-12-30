  precision mediump float;
  
    attribute vec3 position;
	attribute vec4 normal;
	
    uniform mat4 worldViewProjection;
	uniform sampler2D positionSampler;
	
	varying vec3 v_normal;

    void main(void) {
		vec3 localPosition = position;
		
		float sphereIndex = normal.w;
		
		vec2 uvPosition;
		
		uvPosition.x = mod(sphereIndex, 128.0) / 128.0;
		uvPosition.y = floor(sphereIndex / 128.0) / 128.0;
		
		vec3 localSphereVertex = texture2D(positionSampler, uvPosition).xyz;		
		vec4 sphereLocal = vec4(localSphereVertex + localPosition, 1.0);
		vec4 worldPosition = worldViewProjection *  sphereLocal;
		
		v_normal = normal.xyz;
		gl_Position = worldPosition;
    }
	
	// #raptorEngine - Split
	
	precision mediump float;

	varying vec3 v_normal;
	
    void main(void) {

		vec4 color =  vec4(v_normal, 1.2);

        gl_FragColor =  color;
    }