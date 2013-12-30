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

	precision highp float;

varying vec2 v_uv;

uniform sampler2D positionSampler;
uniform float width;
uniform float numCells;
 
float indexFromUv( vec2 uv ) {
	float index = ( uv.x + ( uv.y * width ) ) * width;
	return index;
}

vec3 getCellPos( vec3 particle ) {
	const vec3 cellSize = vec3(2.0, 2.0, 2.0);
	
    vec3 gridPos;
    gridPos.x = ( floor( particle.x  / cellSize.x ) );
    gridPos.y = ( floor( particle.y  / cellSize.y ) );
    gridPos.z = ( floor( particle.z  / cellSize.z ) );

    return gridPos;
}


float mad(float a, float b, float c) {
	return (a) * (b) + (c);
}

float getHash( vec3 gridPos ) {
	
	gridPos.x =  mod( gridPos.x, numCells);
	gridPos.y =  mod( gridPos.y, numCells);
	gridPos.z =  mod( gridPos.z, numCells);
	
	return mad( mad(gridPos.z, numCells, gridPos.y), numCells, gridPos.x );
}

void main() {
	float particleIndex = indexFromUv( v_uv );
	
	vec3 position = texture2D(positionSampler, v_uv).xyz;
	vec3 cellPosition = getCellPos(position);
	
	float cellHash = getHash(cellPosition);
	
	gl_FragColor = vec4(cellHash, particleIndex, 0.0, 1.0);  
}