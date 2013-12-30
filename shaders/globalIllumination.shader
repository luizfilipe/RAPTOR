/**
 * Raptor Engine - Core
 * Copyright (c) 2010 RAPTORCODE STUDIOS
 * All rights reserved.
 */
  
/**
 * Author: Kaj Dijksta
 */
 
    attribute vec2 index;

	uniform sampler2D shadowDepthNormalSampler;	// [depth, depth*depth, packed normal]
	
	mediump vec3 decodeNormal( mediump vec2 enc ) {
		mediump vec2 fenc = enc * 4.0 - 2.0;
		mediump float f = dot(fenc, fenc);
		mediump float g = sqrt(1.0 - f / 4.0);
		mediump vec3 n;
		n.xy = fenc * g;
		n.z = 1.0 - f / 2.0;
		return n;
	}
		
	vec4 initializeLPV(int vertexID)
	{
		float RSM_RES_M_1 = 256.0;
		float RSMWidth = 256.0;
		float g_fluxWeight = 1.0;
		
		float LPV3DWidth = 32.0;
		float LPV3DHeight = 32.0;
		float LPV3DDepth = 32.0;
		
		bool g_useFluxWeight = true;
		bool outside = false;

		// read the attributres for this virtual point light (VPL)
		int x = mod(vertexID, RSM_RES_M_1);
		int y = int( float(vertexID) / RSMWidth); 
		
		if(y>=RSMHeight) outside = true;
		
		vec3 uvw = vec3(x,y,0);

		vec3 normal = decodeNormal( texture2D(shadowDepthNormalSampler, uvw.xy).zw ); // g_txRSMNormal.Load(uvw).rgb;
		vec4 color  = texture2D(shadowColorSampler, uvw.xy); // maybe packed
		float depthSample = texture2D(shadowDepthNormalSampler, uvw.xy).x; // g_txRSMDepth.Load(uvw).x;
		
		// decode the normal:
		normal = normal * vec3(2.0,2.0,2.0) - 1.0;
		normal = normalize(normal);

		// implement later..
		// vec4 color = g_txRSMColor.Load(uvw);

		// unproject the depth to get the view space position of the texel
		vec2 normalizedInputPos = vec2( float(x) / RSMWidth, float(y) / RSMHeight );
	   
		
		vec2 inputPos = vec2((normalizedInputPos.x * 2.0) - 1.0,
							 (( 1.0 - normalizedInputPos.y ) * 2.0 ) - 1.0 );
								

		vec4 vProjectedPos = vec4(inputPos.x, inputPos.y, depthSample, 1.0);
		vec4 viewSpacePos = vProjectedPos * g_InverseProjection;
		viewSpacePos.xyz = viewSpacePos.xyz / viewSpacePos.w; 
		
		// if(g_useFluxWeight) 
		//	output.fluxWeight = viewSpacePos.z * viewSpacePos.z * g_fluxWeight; // g_fluxWeight is ((2 * tan_Fov_X_half)/RSMWidth) * ((2 * tan_Fov_Y_half)/RSMHeight)
		//else
		//	output.fluxWeight = 1.0;

		if(viewSpacePos.z >= far) outside=true;

		vec3 LPVSpacePos = ( vec4(viewSpacePos.xyz, 1.0) * g_ViewToLPV ).xyz;

		//displace the position half a cell size along its normal
		LPVSpacePos += normal / vec3(LPV3DWidth, LPV3DHeight, LPV3DDepth) * displacement;

		if(LPVSpacePos.x<0.0 || LPVSpacePos.x>=1.0) outside = true;
		if(LPVSpacePos.y<0.0 || LPVSpacePos.y>=1.0) outside = true;
		if(LPVSpacePos.z<0.0 || LPVSpacePos.z>=1.0) outside = true;

		vec4 pos = vec4(LPVSpacePos.x,LPVSpacePos.y, LPVSpacePos.z, 1.0);

		// output.color = color.rgb;
		// output.normal = normal;

		// if(outside) kill the vertex
		if(outside) pos.x = LPV3DWidth * 2.0;

		return pos;
	}

    void main(void) {
		gl_Position = initializeLPV(int(index.x));
		gl_PointSize = 100.0;
    }
	
	// #raptorEngine - Split
	
	precision highp float;

	void main() {
		gl_FragColor = vec4(1.0);
	}

	