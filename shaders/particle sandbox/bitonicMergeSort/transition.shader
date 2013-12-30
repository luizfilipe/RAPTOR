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

	uniform float Height;
	uniform float Width;
	uniform float Odd;
	
	uniform sampler2D Data;


	void main() {
		vec2 OwnPos = v_uv;

		// get self
		vec4 self = texture2D(Data, OwnPos.xy);
		float i = floor(OwnPos.x) + floor(OwnPos.y) * Width; 
		bool selfisodd = bool(mod(i,2.0));

		float compare;

		// invert the compare if we're on the "odd" sorting pass
		if (selfisodd)
		// self is odd -> compare with right key
		compare = Odd;
		else
		// self is even -> compare with left key
		compare = -Odd;

		// correct the special case that the "odd" pass copies the first and the last key
		if ( (Odd > 0.0) && ((i==0.0) || (i==((Width*Height)-1.0))) ) 
		// must copy -> compare with self
		compare = 0.0;

		// get the partner
		float adr = i + compare;
		vec4 partner = texture2D(Data, vec2( floor(mod(adr,Width)), floor(adr / Width)) );

		// on the left its a < operation, on the right its a >= operation
		gl_FragColor = (self.x*compare < partner.x*compare) ? self : partner;
		
	}