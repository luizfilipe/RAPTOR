	precision highp float;
	
    attribute vec3 uv;
	
    varying vec2 data;
	varying float sortedIndex;
	
	uniform sampler2D sortedKeysArray;
	uniform float width;
	uniform float dir;
	
	float indexFromUv( vec2 uv ) {
		float index = ( uv.x + ( uv.y * width ) ) * width;
		return index;
	}
	
	vec2 uvFromIndex( float index ) {
		vec2 uv;
		uv.x = mod(index, width );
		uv.y = floor(index / width );
		
		return uv / width;
	}

    void main(void) {
		sortedIndex = indexFromUv(uv.xy);
		
		float hash = texture2D( sortedKeysArray, uv.xy ).x;
		vec2 uvFromHash = uvFromIndex( hash );
		
		uvFromHash *= 2.0;
		uvFromHash -= 1.0;
		
		vec4 pos = vec4( uvFromHash.x, uvFromHash.y, dir * (hash / 262144.0), 1.0 );
		
		gl_PointSize = 1.0;
		gl_Position  = pos;
    }
	
	// #raptorEngine - Split
	
	precision highp float;

	varying float sortedIndex;
	
    void main(void) {
        gl_FragColor =  vec4( sortedIndex, 0.0, 0.0, 1.0 );
    }