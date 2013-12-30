
	raptorjs.animationManager = function() {
		this.animations = [];
		this.activeAnimation; 
	}
	
	raptorjs.animationManager.prototype.addAnimation = function( animation ) {
		this.animations.push(animation);
	}
	
	raptorjs.animationManager.prototype.animationByName = function( name ) {
		for(var c = 0; c<this.animations.length;c++)
			if(this.animations[c].name == name)
				return this.animations[c];
	}
	
	raptorjs.animationManager.prototype.setAnimation = function( name ) {
		var animation = this.animationByName( name );
		
		if(animation) {
			this.activeAnimation = animation;
		} else {
			console.log("animation" + name + " does not exist");
		}
	}
	
	raptorjs.animationManager.prototype.getChannelByBoneName = function( boneName ) {
		var animation = this.activeAnimation;
		var channels = animation.channels;
		//console.log(channels);
		for(var c = 0; c<channels.length;c++) {
			if(channels[c].name == boneName)
				return channels[c];
		}
	}