	mediump float Phong(mediump vec3 R, mediump vec3 L, mediump float Exp)
	{	
		mediump float fNormFactor = Exp * ONE_OVER_TWO_PI + ONE_OVER_TWO_PI;
		return fNormFactor *  pow(clamp(dot(L, R),0.0, 1.0), Exp);
	}
	
	mediump float Phong(mediump vec3 N, mediump vec3 V, mediump vec3 L, mediump float Exp)
	{
		mediump vec3 R = reflect(-V, N);
		return Phong(R, L, Exp);
	}
	
	vec3 ShiftVectorOpt(vec3 V, vec3 N, float shiftAmount)
	{
		return (V + shiftAmount * N);
	}
	

	float Blinn(vec3 N, vec3 V, vec3 L, float Exp)
	{ 
		vec3 H = normalize( V + L );
		return pow( clamp( dot(N, H), 0.0, 1.0 ) ,  Exp);
	}
	

	mediump float GetAttenuation(mediump vec3 L, mediump float invRadius)
	{
	  mediump vec3 vDist = L * invRadius;
	  mediump float fFallOff = clamp(1.0 - dot(vDist, vDist), 0.0, 1.0);

	  return fFallOff;
	}
	
	mediump vec4 EncodeRGBECorrected( in mediump vec3 color )
	{  
	  mediump float fMaxChannel = max( color.x, max( color.y, color.z ) ) ;    
	  mediump float fExp = ceil( log2( fMaxChannel ) );
	  
	  mediump vec4 ret = vec4(0.0);
	  ret.xyz = color.xyz / exp2( fExp );  
	  ret.w = ( fExp + 128.0 ) / 256.0;
	  
	  return ret;
	}
	
	
	float ComputeTextureLOD(in vec2 uv, in vec2 texDim)
	{
		uv *= texDim;
		vec2 ddx_ = dFdx(uv);
		vec2 ddy_ = dFdy(uv);
		vec2 mag = abs(ddx_) + abs(ddy_);
		
		float lod = log2(max(mag.x, mag.y));
		return lod;
	}