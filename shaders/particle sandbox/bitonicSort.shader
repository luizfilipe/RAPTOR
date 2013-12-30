attribute vec4 position;
attribute vec2 texCoord0;

uniform mat4 worldViewProjection;

varying vec2 v_texCoord;



void main() {
	v_texCoord = texCoord0;
	gl_Position =  worldViewProjection * position;
}

// #o3d SplitMarker
uniform sampler2D sampler;

varying vec2 v_texCoord;

uniform float size;
uniform float stage;
uniform float pass;


void main() {
	vec4 self = texture2D(sampler, v_texCoord);	//get this pixel data
	
	//calculate index of this pixel
	float i = floor(v_texCoord.r * size);	
	float sortdir;
	
	//sorting direction - ascending or descending
	if (mod(floor(i/(stage*2.0)),2.0) < 1.0) {
		sortdir = 1.0;
	} else {
		sortdir = -1.0;
	}
	
	float partnerdir;		
	
	//position of partner pixel - left or right
	if(mod(floor(i/pass),2.0)<1.0) {
		partnerdir = 1.0;
	} else {
		partnerdir = -1.0;
	}
	
	vec4 partner = texture2D(sampler, vec2(v_texCoord.r + (partnerdir*pass) / size, v_texCoord.g));		

	//compare with partner pixel and swap
	if( partnerdir * sortdir * self.x > partnerdir * sortdir * partner.x ) {
		gl_FragColor = self;
	} else {
		gl_FragColor = partner;	
	}
}

// #o3d MatrixLoadOrder RowMajor
