

    attribute vec2 uv;
    attribute vec3 position;
	
    uniform mat4 viewProjection;

    varying vec2 v_uv;

    void main(void) {
        v_uv = uv;
		
		gl_Position = viewProjection *  vec4(position, 1.0);
    }
	
	// #raptorEngine - Split
	
	precision highp float;

    varying vec2 v_uv;
	
	uniform vec4 ElapsedTime;

	uniform sampler2D prevAdaptedLumSampler;
	uniform sampler2D currentLuminanceSampler;

    void main(void) {
 
		mediump vec4 vAdaptedLum = texture2D(prevAdaptedLumSampler, vec2(0.5));
		mediump vec4 vCurrentLum = texture2D(currentLuminanceSampler, vec2(0.5));

		//if( vCurrentLum.x * ElapsedTime.w != 0.0 )
		//	vCurrentLum=1.0;

		//if( vAdaptedLum.x * ElapsedTime.w != 0.0 )
		//	vAdaptedLum=1.0;

		mediump vec4 vNewAdaptation = max(vec4(0.0), vAdaptedLum + (vCurrentLum - vAdaptedLum) *  ElapsedTime.yzzz);

		gl_FragColor = vNewAdaptation;
		
    }
	