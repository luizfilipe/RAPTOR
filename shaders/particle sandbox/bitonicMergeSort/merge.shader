    attribute vec3 position;
    attribute vec2 uv;

	uniform mat4 worldViewProjection;

	varying vec2 v_uv;

	void main() {
		vec4 worldPosition = worldViewProjection * vec4(position, 1.0);
		v_uv = uv;
		gl_Position = worldPosition;
	}


	// #raptorEngine - Split

	#ifdef GL_ES
		precision highp float;
	#endif

	varying vec2 v_uv;

	uniform float TwoStage;
	uniform float Pass_mod_Stage;
	uniform float TwoStage_PmS_1;

	uniform float Width;
	uniform float Height;
	uniform float Pass;

	uniform sampler2D Data;

	void main() {
		vec2 OwnPos = v_uv;
		vec4 self = texture2D(Data, OwnPos.xy);
		
		OwnPos *= Width;
		
		float i = floor(OwnPos.x) + floor(OwnPos.y) * Width; 
		float j = floor(mod(i, TwoStage));

		float compare;

		if ( (j < Pass_mod_Stage) || (j > TwoStage_PmS_1) ) {
			compare = 0.0;
		} else {
			if ( mod((j + Pass_mod_Stage) / Pass, 2.0) < 1.0)
				compare = 1.0;
			else
				compare = -1.0;
		}
		
		// get the partner
		float adr = i + compare * Pass;
		vec4 partner = texture2D(Data, vec2( floor( mod(adr, Width) ) / Width, floor(adr / Width) / Width ) );

		// on the left its a < operation, on the right its a >= operation
		gl_FragColor = (self.x * compare < partner.x * compare) ? self : partner;
		//gl_FragColor = partner;
	}