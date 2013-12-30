/**
 * Raptor Engine - Core
 * Copyright (c) 2010 RAPTORCODE STUDIOS
 * All rights reserved.
 */
  
/**
 * Author: Kaj Dijksta
 */
 
    attribute vec3 position;
    attribute vec2 uv;
	
    uniform mat4 viewProjection;

    varying vec2 v_textureCoord;

    void main(void) {
        v_textureCoord = uv;
		gl_Position = viewProjection * vec4(position, 1.0);
    }
	
	// #raptorEngine - Split
	
	precision highp float;

	uniform sampler2D volumeTexture;

	varying vec2 v_textureCoord;
	
	vec2 uvFromUvw(vec3 uvw) {
		const float volumeSize = 36.0;
		const float textureSIZE = 216.0;
		const float layerPerDim = 216.0 / 36.0;
		
		float layer = floor(uvw.z);
		
		vec2 layerPointer = vec2(mod(layer, layerPerDim), floor(layer / layerPerDim)) * layerPerDim;
		
		uvw.xy += layerPointer;
		
		vec2 uv = uvw.xy / volumeSize;
		
		return uv;
	}
	
	vec4 texture3D(sampler2D sample, vec3 uvw){
		vec2 uv = uvFromUvw(uvw);
		return texture2D(sample, uv);
	}
	
	vec3 uvwFromUv( vec2 uv ) {
		const float volumeSize = 36.0;
		const float textureSIZE = 216.0;
		const float layerPerDim = 216.0 / 36.0;
		
		
		
		vec2 layer = floor(uv * layerPerDim);
		vec2 layerPointer = layer / layerPerDim;
		
		vec3 uvw;
		
		uvw.xy = uv - layerPointer;
		
		uvw.z  = ( layerPointer.x + (layerPointer.y * layerPerDim) ) / layerPerDim;
		
		
		return uvw * volumeSize;
	}
	
	
	void main() {
		vec2 uv = v_textureCoord;
	
		vec3 globalThreadId = uvwFromUv( uv );



		vec4 BC[8];
	
        BC[0] = texture3D(volumeTexture, globalThreadId); //BC_z_z_z
        BC[1] = texture3D(volumeTexture, globalThreadId + vec3(0.0,0.0,-1.0) ); //BC_z_z_m1
        BC[2] = texture3D(volumeTexture, globalThreadId + vec3(0.0,-1.0,0.0) ); //BC_z_m1_z
        BC[3] = texture3D(volumeTexture, globalThreadId + vec3(-1.0,0.0,0.0) ); //BC_m1_z_z
        BC[4] = texture3D(volumeTexture, globalThreadId + vec3(-1.0,-1.0,0.0) ); //BC_m1_m1_z
        BC[5] = texture3D(volumeTexture, globalThreadId + vec3(-1.0,0.0,-1.0) ); //BC_m1_z_m1
        BC[6] = texture3D(volumeTexture, globalThreadId + vec3(0.0,-1.0,-1.0) ); //BC_z_m1_m1
        BC[7] = texture3D(volumeTexture, globalThreadId + vec3(-1.0,-1.0,-1.0) ); //BC_m1_m1_m1
	
	
        vec4 GVReflectanceColor = vec4(0.0);

		GVReflectanceColor =      vec4(BC[7] + BC[5] + BC[4] + BC[3])*0.25;

		GVReflectanceColor =      vec4(BC[6] + BC[1] + BC[2] + BC[0])*0.25;                    

		GVReflectanceColor =      vec4(BC[2] + BC[4] + BC[6] + BC[7])*0.25;

		GVReflectanceColor =      vec4(BC[0] + BC[3] + BC[1] + BC[5])*0.25;

		GVReflectanceColor =      vec4(BC[1] + BC[5] + BC[6] + BC[7])*0.25;

		GVReflectanceColor =      vec4(BC[0] + BC[3] + BC[2] + BC[4])*0.25;

	
		vec2 vuv = uvFromUvw(globalThreadId);
		//gl_FragColor = vec4(vuv, 0.0, 1.0);
		 gl_FragColor = GVReflectanceColor * 10.;
	}

	