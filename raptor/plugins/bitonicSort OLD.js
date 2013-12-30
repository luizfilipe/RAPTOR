    var numStages = 0;

    var globalThreads  = this.width / 2;
    var localThreads = 256;
    
    
    for ( var temp = this.width; temp > 1; temp >>= 1 ) {
        ++numStages;
    }
	console.log(numStages);
   for ( var stage = 0; stage < numStages; ++stage )
    {
        /* stage of the algorithm */
		console.log('stage');
		console.log(stage);
		var HalfStrideMHalf  = (1 << passOfStage) / 2;
        /* Every stage has stage+1 passes. */
        for ( var passOfStage = 0; passOfStage < stage + 1; ++passOfStage ) {

			var sameDirectionBlockWidth  = 1 << passOfStage;
            console.log(passOfStage, sameDirectionBlockWidth, HalfStrideMHalf);
			
			
        }
   }

   
   
   	/*
	for(var stage = 0; stage < Math.logBase(this.width, 2) + 1; ++stage ) {
		var numStrides = Math.pow(2, stage);
		
		console.log(stage, numStrides );
		
		var stride = numStrides;
		var dir = 1.0;
		
		for(var c = 0; c<Math.logBase(numStrides, 2); ++c ) {
			
			console.log(stride, dir);
			
			stride /= 2;
			dir *= -1.0;
		}
		console.log('merge');	
		console.log('next stride');
	}
*/




	var logFieldsize = Math.logBase(this.width, 2);
	var fieldsize = this.width;
	var nstages = logFieldsize + logFieldsize;
	var nlists = ( nstages * ( nstages - 1 ) ) / 2;
	var width = fieldsize/2;
	console.log("createDisplaylists", "creating ", nlists," display lists for bitonic sort");
	
	
	//bitonicSortLists = glGenLists(nlists);
	
	//currentBitonicSortList = bitonicSortLists;
	// the lowest column is replaced by a special shader that combines the last two cols
	// the first stage has already been computed by the pack (upload) routine
	var stride = 2;
	for (var s = 2; s <= nstages; ++s) {
		console.log("log" , "stage ", s , ":");
		// stage s has 2^s columns to process (row 0 is internal in special shader)
		
		for (var c = ( s - 1 ); c > 0; --c) {
			//glNewList(currentBitonicSortList++,GL_COMPILE);
			
			if (c < logFieldsize) {
				// quads for row sort
				console.log("row","[row ", c ,"] ");
				
				var rc;
				var m,rx0,rx1,rxt0,rxt1,rv0,rv1;
				
				for (var r=0; r < ( 1 << (logFieldsize - 1)); r += (1<<c)) {
					console.log("row","quad ", r);
					// select type of compare to do
					
					if ( (( r >> ( c-1 )) % 2) != (( r >> ( s - 1 )) % 2)) {
						// do a greater-equal compare
						m = -1.0;			
					} else {
						// do a less-than compare
						m = 1.0;
					}

					// sorting parameters
					// compare the two inputs which index differs only in bit c
					// i.e. toggle bit c
					rc = ( 1 << ( c - 1 ) );
				
					// # texture: packed data
					// # texcoord[0]: texposx texposy search_dir comp_op
					// # texcoord[1]: texdistx 1/stride stride fragheight
				
					// displacement (cannot store glProgramLocalParameter4fARB
					// in dsplist, so use texcoord instead)
					/*  render !!
					glMultiTexCoord4fARB(GL_TEXTURE1_ARB,
							 float(rc),
							 float(stride),
							 float(fieldsize),
							 float(stride/2)-0.5f);
					*/
					var properties = {};
					properties.SearchDir = m;
					properties.CompOp = rc;
					//properties.Distance
					properties.Stride = stride;
					properties.fieldsize = fieldsize;
					properties.HalfStrideMHalf = (stride/2)-0.5;
					
					this.rowProperties.push(properties);
					
					
					rx0 = (r);
					rx1 = (r+(1<<c));
					rxt0 = rx0;
					rxt1 = rx1;
					rv0 = ((rxt0 / (fieldsize)) * 2.0) - 1.0;
					rv1 = ((rxt1 / (fieldsize)) * 2.0) - 1.0;
				
					// always need to flip top-bottom in texcoords3
					/*
					glMultiTexCoord4fARB(GL_TEXTURE0_ARB,rxt0,0.0f,1.0f,m);
					glVertex2f(rv0,-1.0f);	
					glMultiTexCoord4fARB(GL_TEXTURE0_ARB,rxt1,0.0f,-1.0f,-m);
					glVertex2f(rv1,-1.0f);	
					glMultiTexCoord4fARB(GL_TEXTURE0_ARB,rxt1,float(height),-1.0f,-m);
					glVertex2f(rv1,1.0f);	
					glMultiTexCoord4fARB(GL_TEXTURE0_ARB,rxt0,float(height),1.0f,m);
					glVertex2f(rv0,1.0f);	
					*/
					//console.log("row","stride=",stride," rc=",rc," m=",m," (",rx0,",",rx1,") {",rxt0,",",rxt1,"} [",rv0,",",rv1,"]");
				}
			
			} else {
			
				// quads for column sort
				//console.log("col","[col "<<c<<"] ");
				var rc;
				var m,ry0,ry1,ryt0,ryt1,rv0,rv1;
				
				for (var r=0; r<(1<<(logFieldsize)); r+=(1<<(c-logFieldsize+1))) {
				   console.log("col","quad ", r);
					
					// select type of compare to do
					if ( ((r>>(c-logFieldsize))%2) != ((r>>(s-logFieldsize))%2) ) {
						// do a greater-equal compare
						m = -1.0;			
					} else {
						// do a less-than compare
						m = 1.0;
					}

					// sorting parameters
					// compare the two inputs which index differs only in bit c
					// i.e. toggle bit c
					rc = (1<<(c-1));
				
					// # texture: packed data
					// # texcoord[0]: texposx texposy search_dir comp_op
					// # texcoord[1]: texdisty 1/stride stride fragheight
				
					// displacement (cannot store glProgramLocalParameter4fARB
					// in dsplist, so use texcoord instead)
					//glMultiTexCoord4fARB(GL_TEXTURE1_ARB,
					//		 float(rc>>(logFieldsize-1)),
					//		 float(stride),
					//		 float(fieldsize),
					//		 float(stride/2)-0.5f); 
					
					ry0 = r;
					ry1 = r + (1<<(c-logFieldsize+1));
					ryt0 = ry0;
					ryt1 = ry1;
					rv0 = -((1.0-(ryt0/(fieldsize)))*2.0)+1.0;
					rv1 = -((1.0-(ryt1/(fieldsize)))*2.0)+1.0;
				
					// always need to flip top-bottom in texcoords
					// quads are only half in width because of packing !
					// console.log(0.0,ryt1,-1.0,-m);
					// console.log(-1.0,rv1);	
					// console.log((width/2),ryt1,-1.0,-m);
					// console.log(0.0,rv1);	
					// console.log((width/2),ryt0,1.0,m);
					// console.log(0.0,rv0);	
					// console.log(0.0,ryt0,1.0,m);
					// console.log(-1.0,rv0);	
					
					//console.log("col","stride=",stride," rc=",(rc>>(logFieldsize-1))," m=",m," (",ry0,",",ry1,") {",ryt0,",",ryt1,"} [",rv0,",",rv1,"]");
				}
				
			}
		
			//glEnd();
			//glEndList();
		
		} // for all columns

		if (s>=logFieldsize) {
			stride *= 2;
		}

	} // for all stages
	
	console.log(this.rowProperties);
