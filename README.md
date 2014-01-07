## RaptorEngine - a Open Source 3D Graphics Engine Based On Webgl 


_______________________________________________________________________________
Copyright (c) 2013-2014 Raptorcode

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
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
________________________________________________________________________________

   
### Summary

RaptorEngine is a scene-oriented, elegant performance oriented 3D engine written in Javascript designed to make it easier and more intuitive for developers to produce games and demos utilizing 3D hardware in the Web browser. The class library abstracts all the details of using the underlying system library Webgl (Opengl-ES). With a fully intergrated Render engine Raptorengine delivers an advanced render pipeline that enables advanced graphics and lighting techniques out of the box. 


### Features 

-   Diffuse Mapping
-   Specular Mapping
-   bump Mapping
-   offset Mapping (parallax)
-   Alpha Mapping
-   Ambient mapping
-   Gloss mapping
-   Spherical projected shadow mapping
-   PSSM (parallel split shadow mapping)
-   Variance Shadow mapping
-   Screen Space Ambient Occlusion
-   Modular custom shading system
-   Texture Mapping
-   CubeTexture Mapping
-   Shader Validation



###Shading and Lighting

At the Heart of Raptor engine lies 1 uber shader, Where all possible material shading types are being 
processed ( shadow occlusion and all the different maps and bones etc.). Every material is rendered
using the same Ubershader, The data is being structured here in a universal way. The lighting is done in a "Custom shader", This is a very tiny shader that only calculates the lighting. If you want pong lightning you can just use the default Custom shader "custom.default.shader" in the shader folder, If you want a different lighting type you can write one yourself. 

The ubershader you can find in "https://github.com/kajdijkstra/RAPTOR/blob/master/shaders/colorInfo.shader"

The Custom shader here: https://github.com/kajdijkstra/RAPTOR/blob/master/shaders/custom.default.shader


Because different maps often get lost when being exported with 3ds max, I have have made the engine such that
it searches for maps trough the use of the prefix in the filename of the texture, So for example:

-  Texture_diff.png	// Diffuse
-  Texture_spec.png	// Specular
-  Texture_ddn.png	// Normal
-  Texture_glo.png	// gloss


Animations, Bones, transformations, hierarchies, Scenes and other Data structures are all preserved in Raptor engine. 


### Importer


The Assimp data structure is deeply embedded into the Raptorengine pipeline, First one needs to convert the 
specified 3d format to json using the AssimpToJson executable one can find at:

https://github.com/kajdijkstra/RAPTOR/tree/master/assimp 

With the command line:

assimp2json.exe myScene.DAE myScene.json

One can easily convert almost any 3d data type to the preferred Assimp data type, Assimp 
currently supports 41 different file formats for reading, including COLLADA (.dae), 
3DS, DirectX X, Wavefront OBJ and Blender 3D (.blend)



	
	
	
	

#### Working list (Things now being worked on):

	Skeleton
	Skeleton Animation
	Add code examples
	Make readme
	


	
