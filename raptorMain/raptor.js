/*
-----------------------------------------------------------------------------
This source file is part of Raptor Engine
For the latest info, see http://www.raptorEngine.com

Copyright (c) 2012-2013 Raptorcode

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
-----------------------------------------------------------------------------


Author: Kaj Dijksta

*/

	var raptorjs = raptorjs || {};
	var gl;
	
	//core vars
	raptorjs.math;
	raptorjs.resourceManager;
	raptorjs.events;
	raptorjs.mainCamera;
	raptorjs.mainPlayer;
	raptorjs.testAnimationManager;
	raptorjs.client = {};
	raptorjs.elapsed = 0;
	raptorjs.timeNow = 0.01;
	raptorjs.extensions = {};
	raptorjs.canvas;
	raptorjs.engine;
	raptorjs.resources;
    raptorjs.lastTime = 0;
	
	//plugin related vars
	raptorjs.seaInstance;
	raptorjs.skyInstance;
	raptorjs.grayImage;
	raptorjs.sunLight;
	raptorjs.errorTexture;
	raptorjs.errorCubeSampler;
	raptorjs.planet;
	raptorjs.oceanInstance;
	raptorjs.pointSprite;
	raptorjs.skyInstance;
	raptorjs.sandbox;
	
	/**
	 * Application
	 */
	raptorjs.application = function ( ) {
	
		raptorjs.system.ready = false;
	
		//allocate Objects
		raptorjs.mainPlayer = raptorjs.createObject("player");
		raptorjs.events = raptorjs.createObject("eventManager");
		raptorjs.scene = raptorjs.createObject("sceneNode");
		raptorjs.mainCamera = raptorjs.createObject("camera");
		
		raptorjs.mainCamera.update();
		raptorjs.mainPlayer.update();
			
		//raptorjs.testAnimationManager = raptorjs.createObject("animationManager");
		raptorjs.resources = raptorjs.createObject("resourceManager");
		
		//set camera and scene
		raptorjs.system.setCamera( raptorjs.mainCamera );
		raptorjs.system.setScene( raptorjs.scene );


		raptorjs.resources.finishCallback = function( ) {	
			document.getElementById('controls').style.visibility="hidden";
			raptorjs.createErrorTexture();
			raptorjs.system.setup();
			
			raptorjs.logo = raptorjs.createObject("logo");
			raptorjs.logo.create();
			raptorjs.logo.update();

			typedText();

			var sceneManager = raptorjs.createObject("sceneManager");

			sceneManager.createScene("Sponza", "scene.json");//testt

			raptorjs.system.createDeferredBuffers();
			
		 //	raptorjs.skyInstance = raptorjs.createObject("sky");
			//raptorjs.oceanInstance = raptorjs.createObject("seaShore");
			
			tick();	
		}
		
		//animateLoadingBar();
		
		raptorjs.resources.addTexture("media/textures/white.png", 'white');
		raptorjs.resources.addTexture("media/textures/height1.png", 'water_bump');//height1.png water_bump.png
		raptorjs.resources.addTexture("media/textures/norm1.png", 'water_bump_norm');
		
		raptorjs.resources.addTexture("media/textures/bigNoise.png", 'noise');
		
		raptorjs.resources.addTexture("media/textures/cubeMap/posx.jpg", 'posx');
		raptorjs.resources.addTexture("media/textures/cubeMap/posy.jpg", 'posy');
		raptorjs.resources.addTexture("media/textures/cubeMap/posz.jpg", 'posz');
		
		raptorjs.resources.addTexture("media/textures/cubeMap/negx.jpg", 'negx');
		raptorjs.resources.addTexture("media/textures/cubeMap/negy.jpg", 'negy');
		raptorjs.resources.addTexture("media/textures/cubeMap/negz.jpg", 'negz');
		
		//raptorjs.resources.addTexture("media/textures/random.png", 'random');
		//raptorjs.resources.addTexture("media/textures/ssao.png", 'ssao');
		//raptorjs.resources.addTexture("media/textures/rotrandom.png", 'rotrandom');
		//raptorjs.resources.addTexture("media/textures/Unigine01.png", 'unigine');
		//raptorjs.resources.addTexture("media/textures/noise.png", 'noise');
		//raptorjs.resources.addTexture("media/textures/SMAA/AreaTex.png", 'AreaTex');
		//raptorjs.resources.addTexture("media/textures/SMAA/SearchTex.png", 'SearchTex');
		
		//raptorjs.resources.addTexture("media/textures/ssao.png", 'ssao');
		//raptorjs.resources.addTexture("media/textures/randomRotation.png", 'randomRotation');
		raptorjs.resources.addTexture("media/textures/sky.png", 'sky');
		raptorjs.resources.addTexture("media/textures/sponza/sun.png", 'sun');
		raptorjs.resources.addTexture("media/textures/lichen1_normal.png", 'lichen1_normal');
		raptorjs.resources.addTexture("media/textures/rock_bump6.png", 'black');
		raptorjs.resources.load();
    }
	
	raptorjs.logo;

	
	var loadingPointer = 0;
	var textArray = ['Downloading Models'];
	var loadingTexts = ['', '.', '..', '...'];
	var loadTo = 0;
	var loadingProgress = 0;
	
	
	function typedText() {
		if(document.getElementById('loadingBlock')) {
			document.getElementById('loadingBlock').children[0].innerHTML = textArray[0]+loadingTexts[loadingPointer++];
			
			if(loadingPointer == 4)
				loadingPointer = 0;
		
		
			
			setTimeout(function(){typedText() },500);
		}
	}
	
	
	function animateLoadingBar() {
	

		if(loadingProgress < loadTo && document.getElementById('innerBar')) {
			document.getElementById('innerBar').style.width=loadingProgress+'%';
			loadingProgress+=.03;
		}
		
		setTimeout(function(){animateLoadingBar() },20);
	}
	
	function updateLoadingBar(totalNumberOfFiles, currentFile) {
		if(loadTo < 50)
		loadTo = (currentFile / totalNumberOfFiles) * 50;
	}
	
	function updateLoadingBarTexture(totalNumberOfFiles, currentFile) {
	
		loadTo = 50 +  ( (currentFile / totalNumberOfFiles) * 50 );
		console.log(totalNumberOfFiles, currentFile,loadTo);
	}
	
	/**
	 * Rendercallback gets called every frame
	 */
    raptorjs.renderCallback = function ( ) {

	
		if(raptorjs.system.ready) {
	
	
		raptorjs.mainPlayer.update();
		raptorjs.mainCamera.update();
	
			raptorjs.system.updateBuffers();
			
			//var rootBone = raptorjs.system.skeletons[0].root;
			//raptorjs.system.updateBones(rootBone,rootBone.transformation);	
			//raptorjs.lightshafts.update();
			
			//raptorjs.skyInstance.update();
			
		
			
		} else {
		raptorjs.logo.update();	
		}
	//	raptorjs.oceanInstance.render();

		//raptorjs.oceanInstance.pipeline();
		//raptorjs.planet.update();
		//raptorjs.oceanInstance.drawQuad(raptorjs.ocean.shader, null);

    }
	
	
	/**
	 * Initialize raptor framework
	 */
	raptorjs.initialize =  function () {
        var canvas = document.getElementById("raptorEngine");

		raptorjs.system = raptorjs.createObject("renderSystem");
		raptorjs.system.setGraphicsLibrary("WebGL_1.0");
        raptorjs.system.initializeWebgl(canvas);
		
		raptorjs.application();
    }

	
	/**
	 * create raptorjs object
	 * @param {string} name of class
	 */
	raptorjs.createObject = function(className) {
		var instance =  raptorjs[className];
		var object = new instance;
		return object;
		if (typeof instance != 'function') {
			throw 'raptorjs doesnt seem to contain the namespace: ' + className
		} else {
			return object;
		}
	};

	window.unload = function( ) {
		
	}

	
	/**
	 * load url
	 * @param {string} url 
	 */
	raptorjs.loadTextFileSynchronous = function(url) {
		var request;
		console.log('abc');
		if (window.XMLHttpRequest) {
			request = new XMLHttpRequest();
			if (request.overrideMimeType) {
			  request.overrideMimeType('text/plain');
			}
		} else if (window.ActiveXObject) {
			request = new ActiveXObject('MSXML2.XMLHTTP.3.0');
		} else {
			throw 'XMLHttpRequest is disabled';
		}
		
		request.open('GET', url, false);
		request.send(null);
		
		if (request.readyState != 4) {
			throw error;
		}
		
		return request.responseText;
			return shaders;
	}
	
	
	/**
	 * Deprecated
	 */
	raptorjs.clone = function (obj) {
		var cloneObject = raptorjs.createObject(obj._className);
		for(var el in obj) {
			cloneObject[el] = obj[el];
		}
		return cloneObject;
	}
	
	
	/**
	 * Tick
	 */
    function tick() {
        requestAnimFrame(tick);
		raptorjs.system.smoothTimeEvolution();
        raptorjs.renderCallback();
    }
	
	
	/**
	 * Benchmark a function
	 */
	function benchmarkFunction(funct, times) {
		var date1 = new Date(); 
		var milliseconds1 = date1.getTime(); 
		var j = 0;
		
		for (i = 0; i < times; i++) { 
			funct();
		}
		
		var date2 = new Date(); 
		var milliseconds2 = date2.getTime(); 

		var difference = milliseconds2 - milliseconds1; 
		console.log(difference, 'millisec'); //, funct
	}
	raptorjs.lastTimeCheck = 0;
	
	/*
	 *	Create error texture
	 */
	raptorjs.createErrorTexture = function() {
		var dataArray = [];
		var width = 512;
		var height = 512;
		
		for( var y = 0; y < height; y++ )
		{
			for( var x = 0; x < width; x++ )
			{
				dataArray.push(x / width);
				dataArray.push( y / width);

				dataArray.push(  x / x / width);
				dataArray.push(  y * x / width); 
			}
		}
		
		var text = raptorjs.textureFromArray(dataArray, width, height, true);
		var sampler = raptorjs.createObject("sampler2D");
		sampler.datatype = gl.RGBA;
		sampler.format = gl.RGBA;
		sampler.internalFormat = gl.RGBA;
		sampler.texture = text;

		raptorjs.errorTexture = sampler;
		
		var positiveX = raptorjs.resources.getTexture("posx"); 
		var positiveY = raptorjs.resources.getTexture("posy"); 
		var positiveZ = raptorjs.resources.getTexture("posx"); 
		
		var negativeX = raptorjs.resources.getTexture("negx"); 
		var negativeY = raptorjs.resources.getTexture("negy"); 
		var negativeZ = raptorjs.resources.getTexture("negx"); 
		
		var sampler = raptorjs.createObject("sampler3D");
		sampler.addFace(positiveX, gl.TEXTURE_CUBE_MAP_POSITIVE_X);
		sampler.addFace(negativeX, gl.TEXTURE_CUBE_MAP_NEGATIVE_X);
		sampler.addFace(positiveY, gl.TEXTURE_CUBE_MAP_POSITIVE_Y);
		sampler.addFace(negativeY, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y);
		sampler.addFace(positiveZ, gl.TEXTURE_CUBE_MAP_POSITIVE_Z);
		sampler.addFace(negativeZ, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z);

		raptorjs.errorCubeSampler = sampler;
	}
	
	raptorjs.setLoadingText = function ( message ) {
		
		var date2 = new Date(); 
		var milliseconds1 = raptorjs.lastTimeCheck;
		var milliseconds2 = date2.getTime(); 
		var difference = milliseconds2 - milliseconds1; 
		
		//console.log(" time : ", difference, message);
	
		raptorjs.lastTimeCheck =  new Date().getTime();
		//$(".loadingScreen").text(message);
		
	}
	
	
	function removeElementById(id)
	{
		return (elem=document.getElementById(id)).parentNode.removeChild(elem);
	}
	
	
