	
	void light_pass(inout fragmentPass pass, inout lightObject light)
	{
		light.normalDotLight = clamp( light.normalDotLight, 0.0, 1.0);
		
		mediump vec3 diffuse = vec3(light.normalDotLight);
		mediump float fSelfShadow = clamp( light.normalDotLight * 4.0, 0.0, 1.0 );

		vec3 halfVector = normalize( light.position.xyz + pass.eye.xyz);
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
		mediump vec3 diffuse = ( pass.ambientAcc.xyz + pass.diffuseAcc.xyz ) * pass.diffuseMap.xyz * 1000.; 
		mediump vec3 specular = pass.specularAcc.xyz * pass.specularMap.xyz;       
		
		vec3 finalImage = vec3(0.0);

		finalImage.xyz += diffuse;
		finalImage.xyz += specular;

		return finalImage;
	}
