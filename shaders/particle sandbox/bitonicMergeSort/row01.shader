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

	uniform float SearchDir;
	uniform float Distance;
	uniform float CompOp;
	uniform float Stride;
	uniform float HalfStrideMHalf;
	
	uniform sampler2D PackedData;

	void main() {
		// get self
		vec2 OwnPos = v_uv;
		
	    vec4 self = texture2D(PackedData, OwnPos);
	
	    // restore sign of search direction and assemble vector to partner
	    vec2 adr = vec2 ( (SearchDir < 0.0) ? -Distance : Distance , 0.0);
	
	    // get the partner
	    vec4 partner = texture2D(PackedData, OwnPos + adr);
	
	    // switch ascending/descending sort for every other row
	    // by modifying comparison flag
	    float compare = CompOp * -(mod(floor(v_uv.y), Stride) - HalfStrideMHalf);
	
	    // x and y are the keys of the two items
	    // --> multiply with comparison flag
	    vec4 keys = compare * vec4( self.x, self.y, partner.x, partner.y);
	
	    // compare the keys and store accordingly
	    // z and w are the indices
	    // --> just copy them accordingly
	    vec4 result;
	    result.xz = (keys.x < keys.z) ? self.xz : partner.xz;
	    result.yw = (keys.y < keys.w) ? self.yw : partner.yw;
	
	    // do pass 0
	    compare *= adr.x;
	    gl_FragColor = (result.x*compare < result.y*compare) ? result : result.yxwz;
	}