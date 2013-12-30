

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
	
	uniform sampler2D diffuseSampler;

	mediump float GetLuminance( mediump vec3 color )
	{
		return dot( color, vec3( 0.2126, 0.7152, 0.0722 ) );
	}

    void main(void) {
		
		vec4 HDRParams2 = vec4(1.0); // ., ., contrast, blend
		
		vec3 SampleOffsets[ 16 ];
		
		SampleOffsets[0] = vec3(-0.055664, -0.00371090, -0.0654297);
		SampleOffsets[1] = vec3(0.0173828, 0.0111328, 0.0064453);
		SampleOffsets[2] = vec3(0.0001953, 0.008203100000000001, -0.0060547); 
		SampleOffsets[3] = vec3(0.0220703, -0.035937500000000004, -0.00625);
		SampleOffsets[4] = vec3(0.0242188, 0.012695300000000001, -0.025);
		SampleOffsets[5] = vec3(0.0070313, -0.0025391000000000003, 0.014843799999999999);
		SampleOffsets[6] = vec3(-0.007812, 0.0013672, -0.0314453); 
		SampleOffsets[7] = vec3(0.0117188, -0.0140625, -0.019921900000000003); 
		SampleOffsets[8] = vec3(-0.025195, -0.055859400000000003, 0.008203100000000001);
		SampleOffsets[9] = vec3(0.0308594, 0.019335900000000003, 0.0324219); 
		SampleOffsets[10] = vec3(0.0173828, -0.0140625, 0.003125); 
		SampleOffsets[11] = vec3(0.0179688, -0.0044922, 0.004687500000000001);
		SampleOffsets[12] = vec3(-0.014648, -0.020117200000000002, -0.0029297000000000004);
		SampleOffsets[13] = vec3(-0.030078, 0.0234375, 0.0539063); 
		SampleOffsets[14] = vec3(0.0228516, 0.0154297, -0.0119141);
		SampleOffsets[15] = vec3(-0.011914, -0.00039060000000000006, -0.006640600000000001); 

		const int iSampleCount = 8; //9

		mediump float fRecipSampleCount = 1.0 / float(iSampleCount);

		mediump vec2 vLumInfo = vec2(0.0, 64.0); 
		
		for(int i=0; i<8; i++)
		{
			mediump vec3 currentTexture = texture2D(diffuseSampler, v_uv.xy + SampleOffsets[i].xy).rgb * HDRParams2.y;

			mediump float fLum = GetLuminance(currentTexture.rgb);

			vLumInfo.x += fLum;
			vLumInfo.y = min(vLumInfo.y, fLum);
		} 

		vec4 color;

		color.xy = min(vLumInfo.xy * vec2(fRecipSampleCount, 1.0), 64.0);
		color.xy = min(vLumInfo.xy * vec2(fRecipSampleCount, 1.0), 64.0);

		gl_FragColor = color;
    }
	