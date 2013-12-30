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


uniform sampler2D velocitySampler;
uniform sampler2D positionSampler;

uniform sampler2D cellStart;
uniform sampler2D cellEnd;

uniform sampler2D sortedKeys;

uniform float mode;
uniform float numCells;
uniform float width;

vec3 getCellPos( vec3 particle ) {
	const vec3 cellSize = vec3(2.0, 2.0, 2.0); // 2 * radius;
	
    vec3 gridPos;
    gridPos.x = ( floor( particle.x  / cellSize.x ) );
    gridPos.y = ( floor( particle.y  / cellSize.y ) );
    gridPos.z = ( floor( particle.z  / cellSize.z ) );

    return gridPos;
}

float mad(float a, float b, float c) {
	return (a) * (b) + (c);
}

float getCellHash( vec3 gridPos ) {
	vec3 gridSize = vec3( numCells, numCells, numCells );
	
	gridPos.x =  mod( gridPos.x, (gridSize.x) );
	gridPos.y =  mod( gridPos.y, (gridSize.y ) );
	gridPos.z =  mod( gridPos.z, (gridSize.z ) );
	
	return mad( mad(gridPos.z, gridSize.y, gridPos.y), gridSize.x, gridPos.x );
}

vec2 uvFromIndex( float index ) {
	vec2 uv;
	uv.x = mod(index, width );
	uv.y = floor(index / width );
	
	return uv / width;
}


vec3 collideSpheres(vec3 posA,
					vec3 posB,
					vec3 velA,
					vec3 velB,
					float radiusA,
					float radiusB,
					float spring,
					float damping,
					float shear,
					float attraction ) {
					

		vec3  relPos = vec3(posB.x - posA.x, posB.y - posA.y, posB.z - posA.z);
		float dist = sqrt(relPos.x * relPos.x + relPos.y * relPos.y + relPos.z * relPos.z);
		float collideDist = radiusA + radiusB;

		vec3 force = vec3(0.0, 0.0, 0.0);
		
		if(dist < collideDist){
			if(dist > .2){
			
			
				vec4 norm = vec4(relPos.x / dist, relPos.y / dist, relPos.z / dist, 0.0);

				//Relative velocity
				vec4 relVel = vec4(velB.x - velA.x, velB.y - velA.y, velB.z - velA.z, 0.0);

				//Relative tangential velocity
				float relVelDotNorm = relVel.x * norm.x + relVel.y * norm.y + relVel.z * norm.z;
				vec4 tanVel = vec4(relVel.x - relVelDotNorm * norm.x, relVel.y - relVelDotNorm * norm.y, relVel.z - relVelDotNorm * norm.z, 0.0);

				//Spring force (potential)
				float springFactor = -spring * (collideDist - dist);
				force = vec3(	springFactor * norm.x + damping * relVel.x + shear * tanVel.x + attraction * relPos.x,
								springFactor * norm.y + damping * relVel.y + shear * tanVel.y + attraction * relPos.y,
								springFactor * norm.z + damping * relVel.z + shear * tanVel.z + attraction * relPos.z );
			
				//force = vec3(0.0, 1.0, 0.0);
				//force.y = 0.3;
			}
		}

		return force;
}


void main() {

	vec3 velocity = texture2D(velocitySampler, v_uv).xyz;
	vec3 position = texture2D(positionSampler, v_uv).xyz;
	
	float particleId = getCellHash( position );
	
	float test = 0.0;
	float boundaryDamping = -0.75;
	vec3 force = vec3(0.0, 0.0, 0.0);

	if(mode <= 0.4) {
		velocity.y -= .008;
		
		float particleRadius = 1.0;
		float size = 64.0 * 2.0;
		
		if(position.x < - particleRadius) {
			velocity.x *= boundaryDamping;
		}
		if(position.x > size - particleRadius) {
			velocity.x *= boundaryDamping;
		}
		
		if(position.y < -particleRadius ) {
			velocity.y *= boundaryDamping;
		}
		if(position.y > size - particleRadius) {
			velocity.y *= boundaryDamping;
		}
	
		if(position.z < -particleRadius) {
			velocity.z *= boundaryDamping;
		}
		if(position.z > size - particleRadius) {
			velocity.z *= boundaryDamping;
		}
	
		vec3 cellPosition = getCellPos( position );
		float myHash = getCellHash( position );
		
		for(int z = -1; z <= 1; z++)
			for(int y = -1; y <= 1; y++)
				for(int x = -1; x <= 1; x++) {
					vec3 partnerCellPosition = cellPosition + vec3( x ,y ,x );
					
					//if( mod(partnerCellPosition.x, width) == 0.0)
					//	continue;
						
					//if( mod(partnerCellPosition.y, width) == 0.0)
					//	continue;
						
					//if( mod(partnerCellPosition.z, width) == 0.0)
					//	continue;
						
					
					float partnerCellHash = getCellHash( partnerCellPosition );
					vec2 partnerUv = uvFromIndex( partnerCellHash );
					
					float cellStartIndex = texture2D( cellStart, partnerUv ).x;
					
					if(cellStartIndex == 0.0)
						continue;

					float cellEndIndex = texture2D( cellEnd, partnerUv ).x;
					float numOfParticles = cellEndIndex - cellStartIndex;
					
					for(int p = 0; p < 3; p++) {
					
						if( numOfParticles > float( p ) )
							continue;
		
						vec2  sortedUv = uvFromIndex( cellStartIndex + float( p ) );
						
						float particleBId = texture2D( sortedKeys, sortedUv ).y;
						
						if(particleId == particleBId)
							continue;
							
						vec2  particleUv =  uvFromIndex( particleBId );
						
						vec3 partnerParticleVel = texture2D(velocitySampler, particleUv).xyz;
						vec3 partnerParticlePos = texture2D(positionSampler, particleUv).xyz;
						
						force += collideSpheres( position,
												 partnerParticlePos,
												 velocity,
												 partnerParticleVel,
												 2.,
												 2.,
												 0.4,
												 1.0,
												 0.2,
												 0.0012 );
							
					}
				
		}

			
		force += collideSpheres( position,
									vec3(15.0),
									velocity,
									vec3(0.0),
									1.0,
									1.0,
									0.4,
									1.0,
									0.2,
									0.0012 );
									
		velocity += force;
	
	} else {

		
		vec3 tornadoPos = vec3(0.0, position.y, 0.0);

		float distanceFromCenter = length(tornadoPos - position.xyz);
		float widthOfVortex = 50.;
		
		float circulation = max(1000.0 - (5.0 * widthOfVortex), 0.0);
		vec3 centerline = vec3((position.x - tornadoPos.x), 70.0, ( position.z - tornadoPos.z  * 2.0 ) );
		
		float r_xy = sqrt(centerline.x * 2. +  centerline.z * 2.);
		float speed = circulation / (2. * 3.14159 * r_xy);
		
		vec3 newVelocity = normalize(tornadoPos - position.xyz);// * speed;
		
		
		newVelocity.y += 10.0 / distanceFromCenter;
		
		float centerScalair = sin(distanceFromCenter)+1.0;
	 
		velocity.x = newVelocity.z* .0001;
		velocity.y = newVelocity.y * .0001;
		velocity.z = -newVelocity.x* .0001;
		
		//velocity.x = cos(position.z*position.y+sin(position.z))*.06;
		//velocity.y = cos(position.x*position.z+sin(position.z))*.06;
		//velocity.z = tan(position.x*position.y) * .0001;
		//velocity.z = .1;
	}
	
	gl_FragColor = vec4(velocity, 1.0);  
}


