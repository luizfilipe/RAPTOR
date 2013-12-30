  
    attribute vec3 position;
    attribute vec2 uv;
	attribute vec3 normal;
	
    uniform mat4 worldViewProjection;


    varying vec2 v_textureCoord;
    varying vec3 v_normal;
	varying vec3 v_position;
	
    void main(void) {
        v_textureCoord = uv;
		vec4 worldPosition = worldViewProjection *  vec4(position, 1.0);
		
		v_position = worldPosition.xyz;
		
		gl_Position = worldPosition;
    }
	
	// #raptorEngine - Split
	
	precision mediump float;

    varying vec2 v_textureCoord;
	varying vec3 v_position;
	
	uniform sampler2D textureSampler;

	uniform vec3 g_LightPosition;
	uniform vec3 g_CameraPosition;
	
	uniform vec3 g_AtmosphereBrightColor;
	uniform vec3 g_AtmosphereDarkColor;
	
	// primitive simulation of non-uniform atmospheric fog
	vec3 CalculateFogColor(vec3 pixel_to_light_vector, vec3 pixel_to_eye_vector)
	{
		return mix(g_AtmosphereDarkColor, g_AtmosphereBrightColor, 0.5 * dot(pixel_to_light_vector , -pixel_to_eye_vector) + 0.5);
	}
	
    void main(void) {

		vec4 color;
		vec2 uv = v_textureCoord;
		vec3 acolor;
		vec3 pixel_to_light_vector = normalize( g_LightPosition - v_position );
		vec3 pixel_to_eye_vector = normalize( g_CameraPosition - v_position );


		
		color = texture2D( textureSampler, vec2(uv.x, pow(uv.y, 2.0)) );
		acolor = CalculateFogColor(pixel_to_light_vector, pixel_to_eye_vector);
		color.rgb = mix( color.rgb, acolor, pow( clamp(uv.y, 0.0, 1.0), 10.0) );
		color.a = 1.0;

        gl_FragColor =  color;
    }
	