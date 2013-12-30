
 
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
	
	uniform sampler2D infoSampler;
	uniform sampler2D randomSampler;
	uniform sampler2D diffuseSampler;

	uniform float screenWidth;
	uniform float screenHeight;
	
	uniform vec3 cameraPosition;
	uniform float test;
	
	uniform float far;

		
	uniform vec3 frustumWorldCorners[8];
	

	
	float Phong( vec3 N, vec3 V, vec3 L, float Exp )
	{
		mediump vec3 R = reflect(-L, N);		
		return pow( clamp( dot(V, R), 0.0, 1.0 ), Exp);	
	}
	
	vec3 decodeNormal(vec2 enc) {
		vec2 fenc = enc*4.0-2.0;
		float f = dot(fenc,fenc);
		float g = sqrt(1.0-f/4.0);
		vec3 n;
		n.xy = fenc*g;
		n.z = 1.0-f/2.0;
		return n;
	}
	
	vec3 constructPositionWorld( vec2 uv, float depth ) {
		return mix(
					mix(
						mix(frustumWorldCorners[0], frustumWorldCorners[1], uv.x), 
						mix(frustumWorldCorners[3], frustumWorldCorners[2], uv.x), 
						uv.y ), 		
					mix( 
						
						mix(frustumWorldCorners[7], frustumWorldCorners[6], uv.x), 
						mix(frustumWorldCorners[4], frustumWorldCorners[5], uv.x), 
						uv.y ), 
					depth ) + vec3( cameraPosition.y,cameraPosition.z, test);
	}


	
	float Ambiant_Occlusion( vec2 uv ) {
		
		mediump vec4 SSAO_params = vec4( 1.0, 0.075, 1.0, 2.0 );
		
		const mediump float step = 1.0 - 1.0 / 8.0;
		const mediump float fScale = 0.025; // 0.025
		
		mediump float n = 0.0;
		vec3 directions[8];

		directions[0] = normalize(vec3( 1.0, 1.0, 1.0))*fScale*(n+=step);
		directions[1] = normalize(vec3(-1.0,-1.0,-1.0))*fScale*(n+=step);
		directions[2] = normalize(vec3(-1.0,-1.0, 1.0))*fScale*(n+=step);
		directions[3] = normalize(vec3(-1.0, 1.0,-1.0))*fScale*(n+=step);
		directions[4] = normalize(vec3(-1.0, 1.0 ,1.0))*fScale*(n+=step);
		directions[5] = normalize(vec3( 1.0,-1.0,-1.0))*fScale*(n+=step);
		directions[6] = normalize(vec3( 1.0,-1.0, 1.0))*fScale*(n+=step);
		directions[7] = normalize(vec3( 1.0, 1.0,-1.0))*fScale*(n+=step);

		mediump vec3 randomSample = texture2D(randomSampler, vec2(screenWidth, screenHeight) * uv / 64.0).xyz;
		
		mediump float sceneDepth = texture2D(infoSampler, uv).z;  	  

		mediump float sceneDepthU = sceneDepth * far;  

		mediump vec3 vSampleScale = SSAO_params.zzw
					 * clamp( sceneDepthU / 5.3, 0.0, 1.0 ) // make area smaller if distance less than 5 meters
					 * ( 1.0 + sceneDepthU / 8.0 ); // make area bigger if distance more than 32 meters

		mediump float fDepthRangeScale = far / vSampleScale.z * 0.75;

		vSampleScale.xy *= 1.0 / sceneDepthU;
		vSampleScale.z  *= 2.0 / far;

		float fDepthTestSoftness = 64.0 / vSampleScale.z;

		// sample
		mediump vec4 sceneDeptF[2];    
		mediump vec4 vSkyAccess = vec4(0.0);
		mediump vec3 iSample;
		mediump vec4 vDistance;
		
		highp vec4 fRangeIsInvalid = vec4(0.0);

		float fHQScale = 0.3;
		vec4 vDistanceScaled;

		// Help Angle a bit
		// for(int i=0; i<1; i++)
		// {    
		
			iSample = reflect(directions[0], randomSample) * vSampleScale;		
			sceneDeptF[0].x = texture2D( infoSampler, uv.xy + iSample.xy ).z + iSample.z;  

			iSample.xyz *= fHQScale;
			sceneDeptF[1].x = texture2D( infoSampler, uv.xy + iSample.xy ).z + iSample.z;  

			iSample = reflect(directions[1], randomSample) * vSampleScale;		
			sceneDeptF[0].y = texture2D( infoSampler, uv.xy + iSample.xy ).z + iSample.z;  

			iSample.xyz *= fHQScale;
			sceneDeptF[1].y = texture2D( infoSampler, uv.xy + iSample.xy ).z + iSample.z;  


			iSample = reflect(directions[2], randomSample) * vSampleScale;		
			sceneDeptF[0].z = texture2D( infoSampler, uv.xy + iSample.xy ).z + iSample.z;  

			iSample.xyz *= fHQScale;
			sceneDeptF[1].z = texture2D( infoSampler, uv.xy + iSample.xy ).z + iSample.z;  


			iSample = reflect(directions[3], randomSample) * vSampleScale;		
			sceneDeptF[0].w = texture2D( infoSampler, uv.xy + iSample.xy ).z + iSample.z;  

			iSample.xyz *= fHQScale;
			sceneDeptF[1].w = texture2D( infoSampler, uv.xy + iSample.xy ).z + iSample.z;  

			float fDefVal = 0.45;

			// for(int s=0; s<2; s++)
			// {
			
				vDistance = sceneDepth - sceneDeptF[0]; 
				vDistanceScaled = vDistance * fDepthRangeScale;
				fRangeIsInvalid = (clamp( abs(vDistanceScaled), 0.0, 1.0 ) + clamp( vDistanceScaled, 0.0, 1.0 )) / 2.0;  
				vSkyAccess += mix(clamp((-vDistance)*fDepthTestSoftness, 0.0, 1.0), vec4(fDefVal), fRangeIsInvalid);
				
				vDistance = sceneDepth - sceneDeptF[1]; 
				vDistanceScaled = vDistance * fDepthRangeScale;
				fRangeIsInvalid = (clamp( abs(vDistanceScaled), 0.0, 1.0 ) + clamp( vDistanceScaled, 0.0, 1.0 )) / 2.0;  
				vSkyAccess += mix(clamp((-vDistance)*fDepthTestSoftness, 0.0, 1.0), vec4(fDefVal), fRangeIsInvalid);
				
			// }
			
			
			iSample = reflect(directions[4], randomSample) * vSampleScale;		
			sceneDeptF[0].x = texture2D( infoSampler, uv.xy + iSample.xy ).z + iSample.z;  

			iSample.xyz *= fHQScale;
			sceneDeptF[1].x = texture2D( infoSampler, uv.xy + iSample.xy ).z + iSample.z;  

			iSample = reflect(directions[5], randomSample) * vSampleScale;		
			sceneDeptF[0].y = texture2D( infoSampler, uv.xy + iSample.xy ).z + iSample.z;  

			iSample.xyz *= fHQScale;
			sceneDeptF[1].y = texture2D( infoSampler, uv.xy + iSample.xy ).z + iSample.z;  


			iSample = reflect(directions[6], randomSample) * vSampleScale;		
			sceneDeptF[0].z = texture2D( infoSampler, uv.xy + iSample.xy ).z + iSample.z;  

			iSample.xyz *= fHQScale;
			sceneDeptF[1].z = texture2D( infoSampler, uv.xy + iSample.xy ).z + iSample.z;  


			iSample = reflect(directions[7], randomSample) * vSampleScale;		
			sceneDeptF[0].w = texture2D( infoSampler, uv.xy + iSample.xy ).z + iSample.z;  

			iSample.xyz *= fHQScale;
			sceneDeptF[1].w = texture2D( infoSampler, uv.xy + iSample.xy ).z + iSample.z;  


			// for(int d=0; d<2; d++)
			// {
				vDistance = sceneDepth - sceneDeptF[0]; 
				vDistanceScaled = vDistance * fDepthRangeScale;
				fRangeIsInvalid = (clamp( abs(vDistanceScaled), 0.0, 1.0 ) + clamp( vDistanceScaled, 0.0, 1.0 )) / 2.0;  
				vSkyAccess += mix(clamp((-vDistance)*fDepthTestSoftness, 0.0, 1.0), vec4(fDefVal), fRangeIsInvalid);
				
				vDistance = sceneDepth - sceneDeptF[1]; 
				vDistanceScaled = vDistance * fDepthRangeScale;
				fRangeIsInvalid = (clamp( abs(vDistanceScaled), 0.0, 1.0 ) + clamp( vDistanceScaled, 0.0, 1.0 )) / 2.0;  
				vSkyAccess += mix(clamp((-vDistance)*fDepthTestSoftness, 0.0, 1.0), vec4(fDefVal), fRangeIsInvalid);
			// }
			
			
		// }

		float ambientOcclusion = dot( vSkyAccess, vec4( ( 1.0 / 16.0 ) * 2.0 ) ) - SSAO_params.y; // 0.075f
		ambientOcclusion = clamp(mix( 0.9, ambientOcclusion, SSAO_params.x ), 0.0, 1.0);
		
		return ambientOcclusion;
	}
	

	
	
    void main(void) {
	
		pass.ambiantOcclusion = Ambiant_Occlusion( v_uv );
		
		gl_FragColor = vec4(pass.ambiantOcclusion);
		
    }
	