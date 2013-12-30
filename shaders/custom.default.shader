	
	
/*
void light_pass(inout fragmentPass pass, inout lightObject light)
{
	light.normalDotLight = clamp( light.normalDotLight, 0.0, 1.0);

	mediump vec3 cDiffuse = vec3(light.normalDotLight);                                             // 1 alu
			
	vec3 vHalf = normalize( light.position.xyz + normalize(pass.eye.xyz);                                   // 4 alu
	float NdotH = clamp( dot( pass.normal.xyz, vHalf.xyz), 0.0, 1.0 );                                     // 1 alu                    

	float fSelfShadow = clamp( light.normalDotLight * 4.0, 0.0, 1.0 );

	vec3 cSpecular = vec3(0.0);

	cSpecular = vec3(pow( NdotH, pass.specularPower));                                                           // 3 alu    

	cDiffuse *=  light.diffuse;                                                                     // 1 alu
	cSpecular *=  light.specular * fSelfShadow;                                                     // 1 alu

	
	vec3 cK = vec3(light.falloff * light.filter);  // pLight.fOcclShadow *                              // 2 alu 

	pass.diffuseAcc.xyz += cDiffuse.xyz * cK.xyz;  
	pass.specularAcc.xyz += cSpecular.xyz * cK.xyz;
 
}

		
	*/
	void light_pass(inout fragmentPass pass, inout lightObject light)
	{
		light.normalDotLight = clamp( light.normalDotLight, 0.0, 1.0);
		
		mediump vec3 diffuse = vec3(light.normalDotLight);
		mediump float fSelfShadow = clamp( light.normalDotLight * 4.0, 0.0, 1.0 );

		
		vec3 surfaceToLight = normalize(light.position.xyz);
		vec3 surfaceToView = normalize(pass.eye.xyz - v_worldPosition.xyz);
		vec3 halfVector = normalize(surfaceToLight + surfaceToView);
			
		
		// vec3 halfVector = normalize( light.position.xyz + pass.eye.xyz );
		float NdotH = clamp( dot(pass.normal, halfVector), 0.0, 1.0 );  
		
		mediump vec3 specular = vec3( pow( NdotH, pass.specularPower) );
		
		diffuse  *=  light.diffuse;   
		specular *=  light.specular * fSelfShadow;                                                  
	  
		mediump vec3 intensity = light.falloff * light.filter;                             

		pass.diffuseAcc.xyz += diffuse.xyz * intensity;  
		pass.specularAcc.xyz += specular.xyz * intensity;
	}
	


	
	vec3 compose( inout fragmentPass pass )
	{  
		mediump vec3 diffuse = ( pass.ambientAcc.xyz + pass.diffuseAcc.xyz ) * pass.diffuseMap.xyz; 
		mediump vec3 specular = pass.specularAcc.xyz * pass.specularMap.xyz;       // * pass.specularMap.xyz
		
		vec3 finalImage = vec3(0.0);

		finalImage.xyz += diffuse;
		finalImage.xyz += specular * pass.shadowOcclusion;

		return finalImage;
	}
