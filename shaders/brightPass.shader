

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
	
	uniform float brightLevel;
	uniform float brightOffset;
	uniform float brightThreshold;
	
	uniform sampler2D luminanceSampler;
	uniform sampler2D diffuseSampler;

	mediump float EyeAdaption( mediump float fSceneLuminance )
	{
		float hdreyeadaptationbase = 0.25;
		float hdreyeadaptationfactor = 0.5;
		
		mediump float ret = mix(hdreyeadaptationbase, fSceneLuminance, hdreyeadaptationfactor);

		return ret;
	}
	
    void main(void) {

		vec4 sample = texture2D(diffuseSampler, v_uv.xy);

		float fAdaptedLum = texture2D(luminanceSampler, vec2(0.5, 0.5)).x;

		// float brightLevel = .7;
		// float brightOffset = 0.3;
		// float brightThreshold = .7;

		float fAdaptedLumDest = EyeAdaption(fAdaptedLum);

		sample.rgb *= brightLevel / (fAdaptedLumDest + 0.000001);
		sample.rgb -= brightThreshold;
		sample.rgb = max(sample.rgb, vec3(0.0) );
		sample.rgb /= (vec3(brightOffset) + sample.rgb);

		gl_FragColor = sample;
		
    }
	