/**
 * Raptor Engine - Core
 * Copyright (c) 2013 RAPTORCODE STUDIOS
 * All rights reserved.
 *
 */
  
/**
 * Author: Kaj Dijksta
 */
 
    attribute vec3 position;
	
    uniform mat4 view;
	uniform mat4 viewProjection;
	uniform mat4 world;
	
	varying vec4 v_position;

    void main(void) {
		vec4 worldPosition = world * vec4(position, 1.0);
		
		v_position = view * worldPosition;
		
		gl_Position = viewProjection * worldPosition;
    }
	
	// #raptorEngine - Split
	
    precision highp float;

	varying vec4 v_position;
	
	uniform float far;
	uniform float near;
	
	float LinearDepthConstant = 1.0 / (far - near);

	#extension GL_OES_standard_derivatives : enable

	vec4 pack (float depth)
	{
		const vec4 bias = vec4(1.0 / 255.0,
					1.0 / 255.0,
					1.0 / 255.0,
					0.0);

		float r = depth;
		float g = fract(r * 255.0);
		float b = fract(g * 255.0);
		float a = fract(b * 255.0);
		vec4 color = vec4(r, g, b, a);
		
		return color - (color.yzww * bias);
	}
	
	

	vec4 EncodeFloatRGBA( float v ) {
		vec4 enc = vec4(1.0, 255.0, 65025.0, 160581375.0) * v;
		enc = fract(enc);
		enc -= enc.yzww * vec4(1.0/255.0,1.0/255.0,1.0/255.0,0.0);
		return enc;
	}
	
	vec2 packHalf (float depth)
	{
		const vec2 bias = vec2(1.0 / 255.0,
					0.0);
								
		vec2 colour = vec2(depth, fract(depth * 255.0));
		return colour - (colour.yy * bias);
	}

	vec2 ComputeMoments(float depth)  {
		vec2 moments;  
  
		moments.x = depth;  

		float dx = dFdx(depth);  
		float dy = dFdy(depth);  

		moments.y = depth*depth + 0.25 * (dx*dx + dy*dy); 
		
		return moments;  
	}
	
	float normalizeDepth(float depth) {
		return (depth - near) / (far - near);
	}
	
	
	
	vec4 DistributePrecision(vec2 Moments)  
	{  
		float g_DistributeFactor = 256.0;  
		float FactorInv = 1.0 / g_DistributeFactor;  
		// Split precision  
		vec2 IntPart;  
		vec2 FracPart = mod(Moments * g_DistributeFactor, IntPart);  
		// Compose outputs to make reconstruction cheap.  
		return vec4(IntPart * FactorInv, FracPart);  
	}  
	
	void main() {
		 float moment1 = length(v_position);
		 float moment2 = moment1 * moment1;
		 vec2 moments = vec2(moment1, moment2);
		//vec2 moments = ComputeMoments( length(v_position) );
		// vec4 pMoments = DistributePrecision(moments);
		
		// gl_FragColor = vec4(packHalf(moments.x), packHalf(moments.y));
		gl_FragColor = EncodeFloatRGBA(moment1 / far);
	}