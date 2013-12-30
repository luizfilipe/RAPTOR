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

	uniform sampler2D PackedData;

	void main() {
		vec2 OwnPos = v_uv;
		
	    vec4 self = texture2D(PackedData, OwnPos);
	   
	    vec2 adr = vec2 ( 0.0, (SearchDir < 0.0) ? -Distance : Distance);

	    vec4 partner = texture2D( PackedData, OwnPos + adr );
	   
	    vec4 keys = CompOp * vec4( self.x, self.y, partner.x, partner.y);
	   
	    vec4 result;
	    result.xz = (keys.x < keys.z) ? self.xz : partner.xz;
		result.yw = (keys.y < keys.w) ? self.yw : partner.yw;

		gl_FragColor = result;  
	}