	
	raptorjs.bone = function() {
		this.name;
		
		this.parent;
		
		this.children = [];
		
		this.transformation;
		this.offsetmatrix;
		this.finalTransformation;
	}

	raptorjs.bone.prototype.addChild = function(bone){
		this.children.push(bone);
	}