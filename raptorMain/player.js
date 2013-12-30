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

/**
 * Player object
**/
raptorjs.player = function ()
{
	this.position = [0,450,0];

	this.velocity = raptorjs.vector3( 0.1, -0.1, 0.1 );
	
	this.yaw = 0;
	this.pitch = 0;
	this.roll = 0;
	this.strafe = false;
	
	this.right = false;
	this.left = false;
	this.backward = false;
	this.forward = false;
	this.up = false;;
	this.down = false;;
	
	this.moveSpeed = 4.;
	this.bounceSpeed = 0.2;
	this.gravity = 1.32;
	
	this.direction;

	this.damping = 0.6;
} 


/**
 * update object
**/
raptorjs.player.prototype.update = function() {
	
	var vector3 = raptorjs.vector3;
	var matrix4 = raptorjs.matrix4;

	
	if(raptorjs.camera.mode == "orbit") {
		var orientation = raptorjs.matrix4.rotationY(raptorjs.math.degToRad(this.yaw-180));
		var groundHeight = this.groundHeight;
		
		if(this.position[1] < groundHeight) {
			if(this.forward)
				this.velocity[1] = 20;
			else 
				this.velocity[1] *= -this.damping;
				
			if(this.velocity[1] <= 0.2)
				this.velocity[1] = 0;
				
				this.position[1] = groundHeight - 0.01;
			
		} else {
			this.velocity[1] -= this.gravity;
		}
		
		if(Math.abs(this.velocity[0]) <= .2)
			this.velocity[0] = 0;
		if(Math.abs(this.velocity[2]) <= .2)
			this.velocity[2] = 0;
			
			
		var leftVector = raptorjs.vector3(-1,0,0); 
		var rightVector = raptorjs.vector3(1,0,0);
		var forwardVector = raptorjs.vector3(0,0,1);
		var backwardVector = raptorjs.vector3(0,0,-1);
		var totalVector = raptorjs.vector3(0,0,0);

		var forward = raptorjs.matrix4.transformDirection(orientation, forwardVector);

		if(this.forward) {
			totalVector = raptors.vector3.add(totalVector, forward);
		}
		
		if(this.backward) {
			var backward = matrix4.transformDirection(orientation, backwardVector);
			totalVector = raptors.vector3.add(totalVector, backward);
		}
		
		
		if(this.strafe) 
		{
			if(this.left) {
				
				var left = matrix4.transformDirection(orientation, leftVector);
				totalVector = vector3.add(totalVector, left);
			}
			
			if(this.right) {
				var right = matrix4.transformDirection(orientation, rightVector);
				totalVector = vector3.add(totalVector, right);
			}
		} else {
				if(this.left)
				{
					this.yaw+=7;
					//totalVector = raptorjs.math.add(totalVector, forward);//walk roundings
				}

				if(this.right)
				{
					this.yaw-=7;
					//totalVector = raptorjs.math.add(totalVector, forward);
				}
		}
		
		
		if(totalVector[0]+totalVector[1]+totalVector[2] != 0) {
			var normalizedTotal = math.normalize(totalVector);
			totalVector = vector3.mulScalarVector(this.moveSpeed, normalizedTotal);
			this.position = vector3.add(totalVector, this.position);
			
			this.smoothTransition();
		} 
		
		//intergration position
		//this.positionTransform.identity();
		this.position = raptorjs.math.add(this.position, vector3.mulScalarVector(raptorjs.elapsedTime*.3, this.velocity));
		//this.positionTransform.translate(this.position);
		
		//update camera
		raptorjs.mainCamera.center[0] = this.position[0];
		raptorjs.mainCamera.center[1] = this.groundHeight;
		raptorjs.mainCamera.center[2] = this.position[2];

		//update rotation
		//this.transform.identity();
		//this.transform.rotateY(toRad(this.yaw));
	} else {

		var direction = vector3.normalize(vector3.sub(raptorjs.mainCamera.eye, raptorjs.mainCamera.center));
		
		direction[1] = 0;
		
		var totalVector = [0,0,0];
		var leftVector = [1,0,0]; 
		var rightVector = [-1,0,0];
		var downVector = [0,-1,0];
		var upVector = [0,1,0];
		
		
		var orientation = raptorjs.matrix4.rotationY(raptorjs.math.degToRad(raptorjs.mainCamera.yaw-180));
		
		if(this.forward) {
			totalVector = vector3.add(totalVector,vector3.negativeVector(direction));
		}
		
		if(this.backward) {
			totalVector = vector3.add(totalVector, direction);
		}

		if(this.left) {
			
			var left = matrix4.transformDirection(orientation, leftVector);
			totalVector = vector3.add(totalVector, left);
		}
		
		if(this.right) {
			var right = matrix4.transformDirection(orientation, rightVector);
			totalVector = vector3.add(totalVector, right);
		}
	
		if(this.down) {
			var down = matrix4.transformDirection(orientation, downVector);
			totalVector = vector3.add(totalVector, down);
		}
		
		if(this.up) {
			var up = matrix4.transformDirection(orientation, upVector);
			totalVector = vector3.add(totalVector, up);
		}
		
		this.direction = totalVector;
		
		totalVector = vector3.mulScalarVector(this.moveSpeed, totalVector);
		
		raptorjs.mainCamera.center = vector3.add(totalVector, raptorjs.mainCamera.center);
	}
}

