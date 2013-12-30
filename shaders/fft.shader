  
    attribute vec3 position;
	attribute vec2 uv;
	
	uniform mat4 worldViewProjection;

	varying vec2 v_uv;

    void main(void) {
		v_uv = uv ;
		gl_Position = worldViewProjection * vec4(position, 1.0);
    }
	
	// #raptorEngine - Split
	
    precision highp float;

	varying vec2 v_uv;
	
	uniform sampler2D ButterflyTexture;
	uniform sampler2D SourceImgTexture;

	void main() {

		vec4 IndicesAndWeights = texture2D(ButterflyTexture, vec2(v_uv.x, ButterflyPassNumber));

		vec2 Indices = IndicesAndWeights.rg;
		vec2 Weights = IndicesAndWeights.ba;

		vec2 a1, b1;

		a1 = texture2D(SourceImgTexture, vec2(Indices.x, v_uv.y)).xy;
		b1 = texture2D(SourceImgTexture, vec2(Indices.y, v_uv.y)).xy;//g_samLinear

		vec2 res;

		res.r = Weights.r * b1.r - Weights.g * b1.g;
		res.g = Weights.g * b1.r + Weights.r * b1.g;

		a1 = a1 + res;
	
		gl_FragColor = vec4(a1.xy, 0.0, 1.0);
	}
	
	