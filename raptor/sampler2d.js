/*
 * Copyright 2013, Raptorcode Studios Inc, 
 * Author, Kaj Dijkstra.
 * All rights reserved.
 *
 */
 

/**
 * light
**/
raptorjs.sampler2D = function() {

	this.texture;
	
	this.id = ++samplerId;
	
	this.FLIP_Y = true;
	
	this.MIN_FILTER = gl.LINEAR;
	this.MAG_FILTER = gl.LINEAR;
	
	this.WRAP_S = gl.REPEAT;
	this.WRAP_T = gl.REPEAT;
	
	this.datatype = gl.RGB;
	this.format = gl.RGB;
	this.internalFormat = gl.RGB;
	
	this.type;
	this.alpha = 1.0;
	
	this.binded = false;
	this.anisotropic = true;
	this.useAlpha = false;
}


/**
 * bind sampler to shader
 * @param {(shader)} shader
**/
raptorjs.sampler2D.prototype.bind = function(shader) {
	var texture = this.texture;
	var data = this.texture.data;
	var type = texture.dataType;
	
	this.type = type;
	


	if (type  == "framebuffer" ) {
	
		this.texture.glTexture =  this.texture.data;
		type = texture.type;
		
	} else {
	
		var mips = [];
		var width = texture.width;
		var height = texture.height;
		
		if(!this.binded) 
			this.id = shader.samplerId++;
			

		//gl.activeTexture(gl.TEXTURE0 + this.id);

		gl.enable ( gl.BLEND ) ;
		gl.bindTexture(gl.TEXTURE_2D,  texture.glTexture );
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, this.FLIP_Y);
		
		//serialize texture data type
		switch( type ) {
			case "float":
				gl.texImage2D(gl.TEXTURE_2D, 0, this.format, width, height, 0, this.internalFormat, gl.FLOAT, data);
			break;
			case "int":
				gl.texImage2D(gl.TEXTURE_2D, 0, this.format, width, height, 0, this.internalFormat, gl.UNSIGNED_BYTE, data);
			break;
			case "depth":
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);
			break;
			case "image":
				gl.texImage2D(gl.TEXTURE_2D, 0, this.format, this.internalFormat, gl.UNSIGNED_BYTE, data);
			break;
			case "canvas":
				gl.texImage2D(gl.TEXTURE_2D, 0, this.format, width, height, 0, this.internalFormat, this.UNSIGNED_BYTE, data);
			break;
			case "COMPRESSED_RGBA":

				//var textureCompression = raptorjs.extensions.textureCompression;
				var mipmaps = texture.mipmaps;
				
				var width = mipmaps[0].width;
				var height = mipmaps[0].height;
				
				for(var i = 0; i < mipmaps.length; i++) {
					var mipmap = mipmaps[i];
					
					gl.compressedTexImage2D(gl.TEXTURE_2D, i, mipmap.internalFormat, mipmap.width, mipmap.height, 0, mipmap.byteArray);
				}
			
			break;
		}
		
		
		if(this.anisotropic) {

			var extension = raptorjs.extensions.anisotropic;
			gl.texParameteri( gl.TEXTURE_2D, extension.TEXTURE_MAX_ANISOTROPY_EXT, this.anisotropic );

		}
		
		
		if (isPowerOfTwo(width) && isPowerOfTwo(height) ) {
		
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);// mipmaps > 1 ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR 
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.WRAP_S);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.WRAP_T);
			
			//if(type != "COMPRESSED_RGBA")
				gl.generateMipmap(gl.TEXTURE_2D);
			
		} else {

			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			
		}
		gl.bindTexture(gl.TEXTURE_2D, null);
		this.binded = true;
	}
}
