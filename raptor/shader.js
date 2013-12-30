/**
 * 	Raptor Engine - Core
 * 	Copyright (c) 2013 RAPTORCODE STUDIOS
 * 	All rights reserved.
 *
 * 	Author: Kaj Dijksta
 *
 **/
 
 
/**
 * Shader Object
 * this class takes care of the shader management for you
 */
raptorjs.shader = function() {
	this.program;
	
	this.uniforms = [];
	this.attributes = [];
	
	this.url;
	
	this.samplerId = 0;
	
	this.libraryContent = false;
	this.librarys = [];
	
	this.pragmas = [];
	
	this.rawShader;
	
	this.samplerId = 0;
};
	
	
/**
 * Create shader object from source
 * @param {(String)} fileUrl of shader file.
**/
raptorjs.shader.prototype.createFomFile = function( fileUrl ){

	this.url = fileUrl;

	var programInfo = raptorjs.resources.getShaderProgram(this.url, this.pragmas, this.librarys);
	
	this.program = programInfo.program;
	
	var GLSL_TYPES = ['vec2','vec3', 'vec4','mat2','mat3', 'mat4', 'float', 'int', 'sampler2D', 'samplerCube', 'array'];

	var uniforms =  programInfo.rawData.split("uniform"); 
	var attributes = programInfo.rawData.split("attribute");
	
	//add attributes
	for(var c =0; c<attributes.length;c++) {
		var a = attributes[c];
		var u = a.split(';')[0];
		
		u = (u[0] == ' ') ? u.slice(1, u.length+1) : u;
		u = (u[0] == ' ') ? u.slice(1, u.length+1) : u;
		
		var attributeParts = u.split(" ");

		var type = attributeParts[0];
		var name = attributeParts[1];
		
		if(GLSL_TYPES.contains(type)) {
			
			this.addAttribute(name);
		}
	}
	
	//add uniforms
	for(var c =0; c<uniforms.length;c++) {
		var a = uniforms[c];
		var u = a.split(';')[0];
		
		u = (u[0] == ' ') ? u.slice(1, u.length+1) : u;
		u = (u[0] == ' ') ? u.slice(1, u.length+1) : u;
		
		var uniformParts = u.split(" ");
		var uniform = {};
		
		uniform.type = uniformParts[0];
		uniform.name = uniformParts[1];
		
		
		var array_Check = uniform.name.split("[");
		
		if(array_Check.length > 1 ){
			var arraySize = parseFloat(array_Check[1].split(']')[0]);
			
			uniform.arrayType = uniform.type;
			uniform.type = "array";
			uniform.size = arraySize;
			uniform.name = array_Check[0];
		}
		
		if(GLSL_TYPES.contains(uniform.type)) {
			this.addUniform(uniform);
		}
	}
	
	
	for(var c = 0; c<this.librarys.length; c++) {
		var lib = this.librarys[c];
		var uniforms = lib.uniforms;
		for(var b = 0; b<uniforms.length; b++) {
			var uniform = uniforms[b];
			//console.log(uniform.name, uniform.value);
			this.setUniform(uniform.name, uniform.value, true);
		}
		
		//this.setUniform(uniforms.name, uniforms.value);
		//console.log(uniforms);
	}
};


/**
 * create shader library object
 * @param {(String)} fileUrl of shader file.
**/
raptorjs.shader.prototype.createLibraryFomFile = function( fileUrl ){
	this.libraryContent =  raptorjs.resources.loadTextFileSynchronous(fileUrl);
};


/**
 * Add library to shader object
 * @param {(shaderObject)} shader.
 * @param {(int)} type (pixel shader = 0, vertex shader = 1).
**/
raptorjs.shader.prototype.addLibrary = function( shader, type ){
	var library = {};
	library.content = shader.libraryContent;
	library.type = type;
	library.uniforms = shader.uniforms;
	
	//this.pragmas = pragmas.concat(shader.pragmas);
	this.librarys.push(library);
};


/**
 * Define pragma's
 * @param {(String)} name.
 * @param {(string)} value.
**/
raptorjs.shader.prototype.definePragma = function(name, value) {
	var pragma = {};
	pragma.type = "define";
	pragma.name = name;
	pragma.value = value;
	
	this.pragmas.push(pragma);
};


/**
 * Contains
 * @param {(object)} obj.
**/
Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
};


/**
 * Between
 * @param {(string)} prefix.
 * @param {(string)} suffix.
**/
String.prototype.between = function(prefix, suffix) {
  s = this;
  var i = s.indexOf(prefix);
  if (i >= 0) {
    s = s.substring(i + prefix.length);
  }
  else {
    return '';
  }
  if (suffix) {
    i = s.indexOf(suffix);
    if (i >= 0) {
      s = s.substring(0, i);
    }
    else {
      return '';
    }
  }
  return s;
};
raptorjs.shader.prototype.getUniform = function(name) {
	var uniforms = this.uniforms;
	for(var c = 0; c < uniforms.length; c++) {
		var uniform = uniforms[c];
		if(uniform.name == name)
			return uniform;
	}
}

/**
 * Get uniform by name
 * @param {(string)} name.
**/
raptorjs.shader.prototype.getUniformByName = function(name) {
	var uniforms = this.uniforms;
	for(var c = 0; c < uniforms.length; c++) {
		var uniform = uniforms[c];
		if(uniform.name == name)
			return uniform.uniformLocation;
	}
	
	return false;
	
	console.log("could not locate buffer :"+name);
};

/**
 * number padding
 * @param {(int)} number.
**/
function pad2(number) {
    return (number < 10 ? '0' : '') + number
}


/**
 * Update uniform variable
 * @param {(uniformObject)} uniform.
**/
raptorjs.shader.prototype.updateUniform = function(uniform) {
	var uniformLocation = uniform.uniformLocation;
	var value = uniform.value;

	switch(uniform.type) {
		case "sampler2D":

			var sampler = value;
			var texture = sampler.texture;
			var type = sampler.type;
			var glTexture = texture.glTexture;
			
			gl.activeTexture(gl.TEXTURE0 + sampler.id );

			//if transparent
			if (!sampler.useAlpha) {
				gl.disable(gl.BLEND);
				gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
				gl.enable(gl.DEPTH_TEST);
			} else {
				gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
				gl.enable(gl.BLEND);
				gl.disable(gl.DEPTH_TEST);
			}

			gl.disable(gl.BLEND);
			gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
			gl.enable(gl.DEPTH_TEST);
	
			//gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
			//gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
			//gl.enable(gl.BLEND); 	

			gl.bindTexture(gl.TEXTURE_2D, glTexture);
			gl.uniform1i(uniformLocation, sampler.id);

		break;
		case "samplerCube":
		
		
			gl.bindTexture(gl.TEXTURE_2D, null);
			var sampler = value;
			var texture = sampler.texture;

			gl.activeTexture(gl.TEXTURE0 + sampler.id );

			//if transparent
			if (!sampler.useAlpha) {
				gl.disable(gl.BLEND);
				gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
				gl.enable(gl.DEPTH_TEST);
			} else {
				gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
				gl.enable(gl.BLEND);
				gl.disable(gl.DEPTH_TEST);
			}

			gl.disable(gl.BLEND);
			gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
			gl.enable(gl.DEPTH_TEST);
	
			//gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
			//gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
			//gl.enable(gl.BLEND); 	

			gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
			gl.uniform1i(uniformLocation, sampler.id);
			
			
		
		break;
		
		case "float":
			gl.uniform1f(uniformLocation, value);
		break;
		case "vec2":
			gl.uniform2f(uniformLocation, parseFloat(value[0]), parseFloat(value[1]) );
		break;
		case "vec3":
		
			gl.uniform3f(uniformLocation, parseFloat(value[0]), parseFloat(value[1]), parseFloat(value[2])  );
		break;
		case "vec4":
			gl.uniform4f(uniformLocation, parseFloat(value[0]), parseFloat(value[1]), parseFloat(value[2]), parseFloat(value[3]));
		break;
		case "mat2":
			gl.uniformMatrix2fv(uniformLocation, false, raptorjs.matrix2.getMatrixElements(value));
		break;
		case "mat3":
			gl.uniformMatrix3fv(uniformLocation, false, raptorjs.matrix3.getMatrixElements(value));
		break;
		case "mat4":
			gl.uniformMatrix4fv(uniformLocation, false, raptorjs.matrix4.getMatrixElements(value));
		break;
		case "int":
		
		break;
		case "ivec2":
		
		break;
		case "array":
			var arrayType = uniform.arrayType;
			//console.log(arrayType);
			switch(arrayType) {
				case "float":
					gl.uniform1fv(uniformLocation, value );
				break;
				case "vec2":
					gl.uniform2fv(uniformLocation, value );
				break;
				case "vec3":
					var flat = [];

					for(var c = 0; c<value.length; c++) {
						var v = value[c];
						flat.push(v[0], v[1], v[2]);
					}
				
					gl.uniform3fv( uniformLocation, flat );
				break;
				case "vec4":
				
					var flat = [];

					for(var c = 0; c<value.length; c++) {
						var v = value[c];
						flat.push(v[0], v[1], v[2], v[3]);
					}
				
					gl.uniform4fv( uniformLocation, flat );
				break;
			}
		break;
	} 
}


/**
 * Chech if object is array
 * @param {(obj)} object.
**/
function isArray(obj) {
    return obj.constructor == Array;
}


/**
 * Set uniform variable
 * @param {(String)} name.
 * @param {(String)} value.
 * @param {(boolean)} noError.
**/
raptorjs.shader.prototype.setUniform = function(name, value, noError) {
	a = 0;
	var uniforms = this.uniforms;
	for(var c = 0; c < uniforms.length; c++) {
		if(uniforms[c].name == name) {
			if(uniforms[c].type == "sampler2D") {
			
				value.bind(this);
				
			}
			
			if(uniforms[c].type == "samplerCube") {
			
				value.bind(this);
				
			}
			
			uniforms[c].value = value;
			a++;
		}
	}
	
	if(this.libraryContent) {
		var uniform = {};
		
		uniform.name = name;
		uniform.value = value;
		
		uniforms.push(uniform)
		a++;
	}
	
	if(a == 0 && !noError)
		console.log('uniform '+name+' not found in shader ', this.url, this);
}


/**
 * Add uniform variable
 * @param {(String)} name.
 * @param {(String)} value.
 * @param {(boolean)} noError.
**/
raptorjs.shader.prototype.addUniform = function(uniform) {       
	var exist = this.getUniformByName(uniform.name);
	gl.useProgram(this.program);
	
	if(!exist) {
		uniform.uniformLocation = gl.getUniformLocation(this.program, uniform.name);
		uniform.value = this.createEmptyValue(uniform);
		uniform.objectType = 'uniform';
		
		if(uniform.type == "sampler2D") {
			var sampler = uniform.value;
			
			if(!sampler.binded) {
			
			}
			sampler.bind(this);
		}

		if(uniform.type == "samplerCube") {
			var sampler = uniform.value;
			
			sampler.bind(this);
		}
		
		
		if(uniform.uniformLocation)
			this.uniforms.push(uniform);
			
	}
}


/**
 * Create a empty object based on the type of the uniform object
 * @param {(String)} uniform type.
**/
raptorjs.shader.prototype.createEmptyValue = function(uniform) {
	switch(uniform.type) {
		case "sampler2D":
			return raptorjs.errorTexture;
		break;
		case "samplerCube":
			return raptorjs.errorCubeSampler;
		break;
		case "float":
			return 0.0;
		break;
		case "vec2":
			return raptorjs.vector2(0,0);
		break;
		case "vec3":
			return raptorjs.vector3(0,0,0);
		break;
		case "vec4":
			return raptorjs.vector4(0,0,0,0);
		break;
		case "mat2":
			return raptorjs.matrix2.identity();
		break;
		case "mat3":
			return raptorjs.matrix3.identity();
		break;
		case "mat4":
			return raptorjs.matrix4.identity();
		break;
		case "int":
			return 0;
		break;
		case "ivec2":
		
		break;
		case "array":
			/*
			var arrayType = uniform.arrayType;
			switch(arrayType) {
			
				case "vec2":
					//gl.uniform2fv(uniformLocation, value );
				break;
				case "vec3":
					//gl.uniform3fv(uniformLocation, value );
				break;
				case "vec4":
					//gl.uniform4fv(uniformLocation, value );
				break;
			}
			*/
		break;
	} 
}

/**
 * Update shader
**/
raptorjs.shader.prototype.update = function() {
	gl.useProgram(this.program);

	var uniforms = this.uniforms;
	for(var c = 0; c < uniforms.length; c++) {
		var uniform = uniforms[c];
		this.updateUniform(uniform);
	}
}


/**
 * Get Attribute by name
 * @param {(String)} name.
**/
raptorjs.shader.prototype.getAttributeByName = function(name) {
	var attributes = this.attributes;
	for(var c = 0; c < attributes.length; c++) {
		var attribute = attributes[c];
		if(attribute.name == name)
			return attribute.uniformLocation;
	}

	console.log("could not locate buffer :"+name);
}


/**
 * add attribute to shader.
 * @param {(String)} name.
**/
raptorjs.shader.prototype.addAttribute = function( name ) {
	var attr = {};
	gl.useProgram(this.program);
	//console.log('gl.getAttribLocation()', this.program, name);
	
	attr.name = name;
	attr.uniformLocation = gl.getAttribLocation(this.program, name);
	
	gl.enableVertexAttribArray(attr.uniformLocation);
	
	if(typeof(attr.uniformLocation)!='number')
		console.log("attribute '"+name+"' Does not exist in shader ",this);

	this.attributes.push( attr );
}


/**
 * add string to string at a particular index
 * @param {(String)} src.
 * @param {(int)} index.
 * @param {(String)} str.
**/
function insertAt(src, index, str) {
    return src.substr(0, index) + str + src.substr(index)
}

var ttt= 0;
var samplerId = 0;