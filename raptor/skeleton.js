
	raptorjs.skeleton = function() {
		this.root;
		this.bones = [];
	}
	
	raptorjs.skeleton.prototype.getBoneByName = function(name){
		var bones = this.bones;
		for(var c = 0; c<bones.length; c++) {
			var bone = bones[c];
			if(bone.name == name) {
				return bones[c];
			}
		}
				
		return false;
	}