function sin(x){ return Math.sin(x); }
function asin(x){ return Math.asin(x); }
function cos(x){ return Math.cos(x); }
function tan(x){ return Math.tan(x);}
function atan2(x, y){ return Math.atan2(x, y);}
function floor(x){ return Math.floor(x); }
function round(x){ return Math.round(x); }
function abs(x){ return Math.abs(x); }
function exp(x){ return Math.exp(x); }
function min(x,y,z,w){ return Math.min(x,y,z,w); }
function max(x,y,z,w){ return Math.min(x,y,z,w); }
function pow(x){ return Math.pow(x); }
function sqrt(x){ return Math.sqrt(x); }
function acos(x){ return Math.acos(x); }

 
raptorjs.math = function(){

}

raptorjs.math.degToRad = function(degrees) {
	return degrees * Math.PI / 180;
}


raptorjs.math.isPowerOfTwo = function(x) {
    return (x & (x - 1)) == 0;
}

raptorjs.math.nextHighestPowerOfTwo = function(x) {
    --x;
    for (var i = 1; i > 32; i >>= 1) {
        x = x | x << i;
    }
    return x + 1;
}
/*

raptorjs.complex = function(real, imaginary) {
	return [real, imaginary];
}




raptorjs.complex.add = function(a, b) {
	var real = a[0] + b[0];
	var im = a[1] + b[1];
	
	return  raptorks.complex( real, im );
}




raptorjs.complex.mul = function(a, b) {
	var real = (a[0] * b[0]) - (a[1] * b[1]);
	var im = (a[1] * b[0]) + (a[0] * b[1]);
	
	return  raptorjs.complex( real, im );
}

raptorjs.complex.scale = function(v, s) {
	return raptorjs.complex( v[0] * s, v[1]*s );
}


raptorjs.complex.conj = function(v) {
	return raptorjs.complex( v[0], -v[1] );
} */




raptorjs.matrix3 = function(){

};
raptorjs.matrix3.toMatrix4 = function(m) {

	return [[m[0][0], m[1][0], m[2][0], 0],
			[m[0][1], m[1][1], m[2][1], 0],
			[m[0][2], m[1][2], m[2][2], 0],
			[0,		  0,	   0,		1]];
}
raptorjs.matrix3.identity = function(){
	return [[1, 0, 0],
			[0, 1, 0],
			[0, 0, 1]];
}

raptorjs.matrix3.inverse = function(m) {
  var t00 = m[1][1] * m[2][2] - m[1][2] * m[2][1];
  var t10 = m[0][1] * m[2][2] - m[0][2] * m[2][1];
  var t20 = m[0][1] * m[1][2] - m[0][2] * m[1][1];
  var d = 1.0 / (m[0][0] * t00 - m[1][0] * t10 + m[2][0] * t20);
  return [[d * t00, -d * t10, d * t20],
          [-d * (m[1][0] * m[2][2] - m[1][2] * m[2][0]),
            d * (m[0][0] * m[2][2] - m[0][2] * m[2][0]),
           -d * (m[0][0] * m[1][2] - m[0][2] * m[1][0])],
          [d * (m[1][0] * m[2][1] - m[1][1] * m[2][0]),
          -d * (m[0][0] * m[2][1] - m[0][1] * m[2][0]),
           d * (m[0][0] * m[1][1] - m[0][1] * m[1][0])]];
};

raptorjs.matrix3.transpose = function(m) {
	return [[m[0][0], m[0][1], m[0][2]],
			[m[1][0], m[1][1], m[1][2]],
			[m[2][0], m[2][1], m[2][2]] ];
};

raptorjs.matrix3.getMatrixElements = function(m) {
	return [m[0][0], m[1][0], m[2][0],
			m[1][1], m[1][2], m[1][2],
			m[2][0], m[2][1], m[2][2]];
};
raptorjs.matrix3.transformPoint = function(m, v) {
  var v0 = v[0];
  var v1 = v[1];
  var v2 = v[2];
  var m0 = m[0];
  var m1 = m[1];
  var m2 = m[2];
  var m3 = m[3];

  return [v0 * m0[0] + v1 * m1[0] + v2 * m2[0],
          v0 * m0[1] + v1 * m1[1] + v2 * m2[1],
          v0 * m0[2] + v1 * m1[2] + v2 * m2[2]];
};
raptorjs.matrix3.mul = function(a, b) {
  var a0 = a[0];
  var a1 = a[1];
  var a2 = a[2];
  var b0 = b[0];
  var b1 = b[1];
  var b2 = b[2];
  var a00 = a0[0];
  var a01 = a0[1];
  var a02 = a0[2];
  var a10 = a1[0];
  var a11 = a1[1];
  var a12 = a1[2];
  var a20 = a2[0];
  var a21 = a2[1];
  var a22 = a2[2];
  var b00 = b0[0];
  var b01 = b0[1];
  var b02 = b0[2];
  var b10 = b1[0];
  var b11 = b1[1];
  var b12 = b1[2];
  var b20 = b2[0];
  var b21 = b2[1];
  var b22 = b2[2];
  return [[a00 * b00 + a01 * b10 + a02 * b20,
           a00 * b01 + a01 * b11 + a02 * b21,
           a00 * b02 + a01 * b12 + a02 * b22],
          [a10 * b00 + a11 * b10 + a12 * b20,
           a10 * b01 + a11 * b11 + a12 * b21,
           a10 * b02 + a11 * b12 + a12 * b22],
          [a20 * b00 + a21 * b10 + a22 * b20,
           a20 * b01 + a21 * b11 + a22 * b21,
           a20 * b02 + a21 * b12 + a22 * b22]];
};

raptorjs.matrix4 = function(){

};

raptorjs.matrix4.identity = function(){
	return [[1, 0, 0, 0],
			[0, 1, 0, 0],
			[0, 0, 1, 0],
			[0, 0, 0, 1] ];
}

raptorjs.matrix4.toRow = function(m){
	return [ [m[0][0], m[1][0],m[2][0],m[3][0]],
			 [m[0][1], m[1][1],m[2][1],m[3][1]],
			 [m[0][2], m[1][2],m[2][2],m[3][2]],
			 [m[0][3], m[1][3],m[2][3],m[3][3]] ];
}
raptorjs.matrix4.scale = function(m, v) {
  var v0 = v[0];
  var v1 = v[1];
  var v2 = v[2];

  var m0 = m[0];
  var m1 = m[1];
  var m2 = m[2];
  var m3 = m[3];

  m0.splice(0, 4, v0 * m0[0], v0 * m0[1], v0 * m0[2], v0 * m0[3]);
  m1.splice(0, 4, v1 * m1[0], v1 * m1[1], v1 * m1[2], v1 * m1[3]);
  m2.splice(0, 4, v2 * m2[0], v2 * m2[1], v2 * m2[2], v2 * m2[3]);

  return m;
};

raptorjs.matrix4.setTranslation = function(a, v) {
  a[3].splice(0, 4, v[0], v[1], v[2], 1);
  return a;
};

raptorjs.matrix4.toMatrix3 = function(m) {

	return [[m[0][0], m[0][1], m[0][2]],
			[m[1][0], m[1][1], m[1][2]],
			[m[2][0], m[2][1], m[2][2]] ];
}

raptorjs.matrix4.copyMatrix = function(m){
 var r = [];
  var mLength = m.length;
  for (var i = 0; i < mLength; ++i) {
    r[i] = [];
    for (var j = 0; j < m[i].length; j++) {
      r[i][j] = m[i][j];
    }
  }
  return r;
}
raptorjs.matrix4.transformPoint = function(m, v) {
  var v0 = v[0];
  var v1 = v[1];
  var v2 = v[2];
  var m0 = m[0];
  var m1 = m[1];
  var m2 = m[2];
  var m3 = m[3];

  var d = v0 * m0[3] + v1 * m1[3] + v2 * m2[3] + m3[3];
  return [(v0 * m0[0] + v1 * m1[0] + v2 * m2[0] + m3[0]) / d,
          (v0 * m0[1] + v1 * m1[1] + v2 * m2[1] + m3[1]) / d,
          (v0 * m0[2] + v1 * m1[2] + v2 * m2[2] + m3[2]) / d];
}
raptorjs.matrix4.transformDirection = function(m, v) {
  var v0 = v[0];
  var v1 = v[1];
  var v2 = v[2];
  var m0 = m[0];
  var m1 = m[1];
  var m2 = m[2];
  var m3 = m[3];

  return [v0 * m0[0] + v1 * m1[0] + v2 * m2[0],
          v0 * m0[1] + v1 * m1[1] + v2 * m2[1],
          v0 * m0[2] + v1 * m1[2] + v2 * m2[2]];
};
raptorjs.matrix4.transpose = function(m) {
	return [[m[0][0], m[0][1], m[0][2], m[0][3]],
			[m[1][0], m[1][1], m[1][2], m[1][3]],
			[m[2][0], m[2][1], m[2][2], m[2][3]],
			[m[3][0], m[3][1], m[3][2], m[3][3]] ]
};

raptorjs.matrix4.transpose = function(m){
	return [ [m[0][0], m[1][0],m[2][0],m[3][0]],
			 [m[0][1], m[1][1],m[2][1],m[3][1]],
			 [m[0][2], m[1][2],m[2][2],m[3][2]],
			 [m[0][3], m[1][3],m[2][3],m[3][3]] ];
}
raptorjs.matrix4.orthonormalize = function(m) {
  var r = [];
  var mLength = m.length;
  for (var i = 0; i < mLength; ++i) {
    var v = m[i];
    for (var j = 0; j < i; ++j) {
      v = o3djs.math.subVector(v, o3djs.math.mulScalarVector(
          o3djs.math.dot(r[j], m[i]), r[j]));
    }
    r[i] = o3djs.math.normalize(v);
  }
  return r;
};


raptorjs.matrix4.rotationX = function(a) {
  var x = Math.cos(a);
  var y = Math.sin(a);

  return [  [1, 0, 0, 0],
			[0, x, y, 0],
			[0, -y, x, 0],
			[0, 0, 0, 1] ];
};
raptorjs.matrix4.perspective = function(angle, aspect, near, far) {
  var f = Math.tan(0.5 * (Math.PI - angle));
  var range = near - far;

  return [
    [f / aspect, 0, 0, 0],
    [0, f, 0, 0],
    [0, 0, far / range, -1],
    [0, 0, near * far / range, 0]
  ];
}

raptorjs.matrix4.orthographic = function(left, right, bottom, top, near, far) {
  return raptorjs.matrix4.transpose( [	[2 / (right - left), 0, 0, 0],
			[0, 2 / (top - bottom), 0, 0],
			[0, 0, 1 / (near - far), 0],
			[(left + right) / (left - right),
			 (bottom + top) / (bottom - top),
			 near / (near - far), 1] ]);
};


raptorjs.matrix4.frustum = function(left, right, bottom, top, near, far) {
  var dx = (right - left);
  var dy = (top - bottom);
  var dz = (near - far);
  return [
    [2 * near / dx, 0, 0, 0],
    [0, 2 * near / dy, 0, 0],
    [(left + right) / dx, (top + bottom) / dy, far / dz, -1],
    [0, 0, near * far / dz, 0]];
};


raptorjs.matrix4.rotationX = function(angle) {
  var c = Math.cos(angle);
  var s = Math.sin(angle);

  return [
    [1, 0, 0, 0],
    [0, c, s, 0],
    [0, -s, c, 0],
    [0, 0, 0, 1]
  ];
};

raptorjs.matrix4.rotationY = function(a) {
  var x = Math.cos(a);
  var y = Math.sin(a);

  return [	[x, 0, -y, 0],
			[0, 1, 0, 0],
			[y, 0, x, 0],
			[0, 0, 0, 1] ];
};

raptorjs.matrix4.rotationZ = function(angle) {
  var c = Math.cos(angle);
  var s = Math.sin(angle);

  return [
    [c, s, 0, 0],
    [-s, c, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ];
};


raptorjs.matrix4.rotateX = function(m, angle) {
  var m0 = m[0];
  var m1 = m[1];
  var m2 = m[2];
  var m3 = m[3];
  var m10 = m1[0];
  var m11 = m1[1];
  var m12 = m1[2];
  var m13 = m1[3];
  var m20 = m2[0];
  var m21 = m2[1];
  var m22 = m2[2];
  var m23 = m2[3];
  var c = Math.cos(angle);
  var s = Math.sin(angle);

  m1.splice(0, 4, c * m10 + s * m20,
                  c * m11 + s * m21,
                  c * m12 + s * m22,
                  c * m13 + s * m23);
  m2.splice(0, 4, c * m20 - s * m10,
                  c * m21 - s * m11,
                  c * m22 - s * m12,
                  c * m23 - s * m13);

  return m;
};

raptorjs.matrix4.rotateY = function(m, angle) {
  var m0 = m[0];
  var m1 = m[1];
  var m2 = m[2];
  var m3 = m[3];
  var m00 = m0[0];
  var m01 = m0[1];
  var m02 = m0[2];
  var m03 = m0[3];
  var m20 = m2[0];
  var m21 = m2[1];
  var m22 = m2[2];
  var m23 = m2[3];
  var c = Math.cos(angle);
  var s = Math.sin(angle);

  m0.splice(0, 4, c * m00 - s * m20,
                  c * m01 - s * m21,
                  c * m02 - s * m22,
                  c * m03 - s * m23);
  m2.splice(0, 4, c * m20 + s * m00,
                  c * m21 + s * m01,
                  c * m22 + s * m02,
                  c * m23 + s * m03);

  return m;
};

raptorjs.matrix4.rotateZ = function(m, angle) {
  var m0 = m[0];
  var m1 = m[1];
  var m2 = m[2];
  var m3 = m[3];
  var m00 = m0[0];
  var m01 = m0[1];
  var m02 = m0[2];
  var m03 = m0[3];
  var m20 = m2[0];
  var m21 = m2[1];
  var m22 = m2[2];
  var m23 = m2[3];
  var c = Math.cos(angle);
  var s = Math.sin(angle);

  m0.splice(0, 4, c * m00 - s * m20,
                  c * m01 - s * m21,
                  c * m02 - s * m22,
                  c * m03 - s * m23);
  m2.splice(0, 4, c * m20 + s * m00,
                  c * m21 + s * m01,
                  c * m22 + s * m02,
                  c * m23 + s * m03);

  return m;
};


raptorjs.matrix4.rotateZYX = function(m, v) {
  var sinX = Math.sin(v[0]);
  var cosX = Math.cos(v[0]);
  var sinY = Math.sin(v[1]);
  var cosY = Math.cos(v[1]);
  var sinZ = Math.sin(v[2]);
  var cosZ = Math.cos(v[2]);

  var cosZSinY = cosZ * sinY;
  var sinZSinY = sinZ * sinY;

  var r00 = cosZ * cosY;
  var r01 = sinZ * cosY;
  var r02 = -sinY;
  var r10 = cosZSinY * sinX - sinZ * cosX;
  var r11 = sinZSinY * sinX + cosZ * cosX;
  var r12 = cosY * sinX;
  var r20 = cosZSinY * cosX + sinZ * sinX;
  var r21 = sinZSinY * cosX - cosZ * sinX;
  var r22 = cosY * cosX;

  var m0 = m[0];
  var m1 = m[1];
  var m2 = m[2];
  var m3 = m[3];

  var m00 = m0[0];
  var m01 = m0[1];
  var m02 = m0[2];
  var m03 = m0[3];
  var m10 = m1[0];
  var m11 = m1[1];
  var m12 = m1[2];
  var m13 = m1[3];
  var m20 = m2[0];
  var m21 = m2[1];
  var m22 = m2[2];
  var m23 = m2[3];
  var m30 = m3[0];
  var m31 = m3[1];
  var m32 = m3[2];
  var m33 = m3[3];

  m0.splice(0, 4,
      r00 * m00 + r01 * m10 + r02 * m20,
      r00 * m01 + r01 * m11 + r02 * m21,
      r00 * m02 + r01 * m12 + r02 * m22,
      r00 * m03 + r01 * m13 + r02 * m23);

  m1.splice(0, 4,
      r10 * m00 + r11 * m10 + r12 * m20,
      r10 * m01 + r11 * m11 + r12 * m21,
      r10 * m02 + r11 * m12 + r12 * m22,
      r10 * m03 + r11 * m13 + r12 * m23);

  m2.splice(0, 4,
      r20 * m00 + r21 * m10 + r22 * m20,
      r20 * m01 + r21 * m11 + r22 * m21,
      r20 * m02 + r21 * m12 + r22 * m22,
      r20 * m03 + r21 * m13 + r22 * m23);

  return m;
};

raptorjs.matrix4.getMatrixElements = function(m) {
  var r = [];
  var mLength = m.length;
  var k = 0;
  for (var i = 0; i < mLength; i++) {
    for (var j = 0; j < m[i].length; j++) {
      r[k++] = m[i][j];
    }
  }
  return r;
};


raptorjs.matrix4.transformDirection = function(m, v) {
  var v0 = v[0];
  var v1 = v[1];
  var v2 = v[2];
  var m0 = m[0];
  var m1 = m[1];
  var m2 = m[2];
  var m3 = m[3];

  return [v0 * m0[0] + v1 * m1[0] + v2 * m2[0],
          v0 * m0[1] + v1 * m1[1] + v2 * m2[1],
          v0 * m0[2] + v1 * m1[2] + v2 * m2[2]];
};


raptorjs.matrix4.translate = function(m, v) {
  var v0 = v[0];
  var v1 = v[1];
  var v2 = v[2];
  var m0 = m[0];
  var m1 = m[1];
  var m2 = m[2];
  var m3 = m[3];
  var m00 = m0[0];
  var m01 = m0[1];
  var m02 = m0[2];
  var m03 = m0[3];
  var m10 = m1[0];
  var m11 = m1[1];
  var m12 = m1[2];
  var m13 = m1[3];
  var m20 = m2[0];
  var m21 = m2[1];
  var m22 = m2[2];
  var m23 = m2[3];
  var m30 = m3[0];
  var m31 = m3[1];
  var m32 = m3[2];
  var m33 = m3[3];

  m3.splice(0, 4, m00 * v0 + m10 * v1 + m20 * v2 + m30,
                  m01 * v0 + m11 * v1 + m21 * v2 + m31,
                  m02 * v0 + m12 * v1 + m22 * v2 + m32,
                  m03 * v0 + m13 * v1 + m23 * v2 + m33);

  return m;
}


raptorjs.matrix4.inverse = function(m) {
  var tmp_0 = m[2][2] * m[3][3];
  var tmp_1 = m[3][2] * m[2][3];
  var tmp_2 = m[1][2] * m[3][3];
  var tmp_3 = m[3][2] * m[1][3];
  var tmp_4 = m[1][2] * m[2][3];
  var tmp_5 = m[2][2] * m[1][3];
  var tmp_6 = m[0][2] * m[3][3];
  var tmp_7 = m[3][2] * m[0][3];
  var tmp_8 = m[0][2] * m[2][3];
  var tmp_9 = m[2][2] * m[0][3];
  var tmp_10 = m[0][2] * m[1][3];
  var tmp_11 = m[1][2] * m[0][3];
  var tmp_12 = m[2][0] * m[3][1];
  var tmp_13 = m[3][0] * m[2][1];
  var tmp_14 = m[1][0] * m[3][1];
  var tmp_15 = m[3][0] * m[1][1];
  var tmp_16 = m[1][0] * m[2][1];
  var tmp_17 = m[2][0] * m[1][1];
  var tmp_18 = m[0][0] * m[3][1];
  var tmp_19 = m[3][0] * m[0][1];
  var tmp_20 = m[0][0] * m[2][1];
  var tmp_21 = m[2][0] * m[0][1];
  var tmp_22 = m[0][0] * m[1][1];
  var tmp_23 = m[1][0] * m[0][1];

  var t0 = (tmp_0 * m[1][1] + tmp_3 * m[2][1] + tmp_4 * m[3][1]) -
      (tmp_1 * m[1][1] + tmp_2 * m[2][1] + tmp_5 * m[3][1]);
  var t1 = (tmp_1 * m[0][1] + tmp_6 * m[2][1] + tmp_9 * m[3][1]) -
      (tmp_0 * m[0][1] + tmp_7 * m[2][1] + tmp_8 * m[3][1]);
  var t2 = (tmp_2 * m[0][1] + tmp_7 * m[1][1] + tmp_10 * m[3][1]) -
      (tmp_3 * m[0][1] + tmp_6 * m[1][1] + tmp_11 * m[3][1]);
  var t3 = (tmp_5 * m[0][1] + tmp_8 * m[1][1] + tmp_11 * m[2][1]) -
      (tmp_4 * m[0][1] + tmp_9 * m[1][1] + tmp_10 * m[2][1]);

  var d = 1.0 / (m[0][0] * t0 + m[1][0] * t1 + m[2][0] * t2 + m[3][0] * t3);

  var row0 = [d * t0, d * t1, d * t2, d * t3];
  var row1 = [d * ((tmp_1 * m[1][0] + tmp_2 * m[2][0] + tmp_5 * m[3][0]) -
          (tmp_0 * m[1][0] + tmp_3 * m[2][0] + tmp_4 * m[3][0])),
       d * ((tmp_0 * m[0][0] + tmp_7 * m[2][0] + tmp_8 * m[3][0]) -
          (tmp_1 * m[0][0] + tmp_6 * m[2][0] + tmp_9 * m[3][0])),
       d * ((tmp_3 * m[0][0] + tmp_6 * m[1][0] + tmp_11 * m[3][0]) -
          (tmp_2 * m[0][0] + tmp_7 * m[1][0] + tmp_10 * m[3][0])),
       d * ((tmp_4 * m[0][0] + tmp_9 * m[1][0] + tmp_10 * m[2][0]) -
          (tmp_5 * m[0][0] + tmp_8 * m[1][0] + tmp_11 * m[2][0]))];
  var row2 =[d * ((tmp_12 * m[1][3] + tmp_15 * m[2][3] + tmp_16 * m[3][3]) -
          (tmp_13 * m[1][3] + tmp_14 * m[2][3] + tmp_17 * m[3][3])),
       d * ((tmp_13 * m[0][3] + tmp_18 * m[2][3] + tmp_21 * m[3][3]) -
          (tmp_12 * m[0][3] + tmp_19 * m[2][3] + tmp_20 * m[3][3])),
       d * ((tmp_14 * m[0][3] + tmp_19 * m[1][3] + tmp_22 * m[3][3]) -
          (tmp_15 * m[0][3] + tmp_18 * m[1][3] + tmp_23 * m[3][3])),
       d * ((tmp_17 * m[0][3] + tmp_20 * m[1][3] + tmp_23 * m[2][3]) -
          (tmp_16 * m[0][3] + tmp_21 * m[1][3] + tmp_22 * m[2][3]))];
  var row3 = [d * ((tmp_14 * m[2][2] + tmp_17 * m[3][2] + tmp_13 * m[1][2]) -
          (tmp_16 * m[3][2] + tmp_12 * m[1][2] + tmp_15 * m[2][2])),
       d * ((tmp_20 * m[3][2] + tmp_12 * m[0][2] + tmp_19 * m[2][2]) -
          (tmp_18 * m[2][2] + tmp_21 * m[3][2] + tmp_13 * m[0][2])),
       d * ((tmp_18 * m[1][2] + tmp_23 * m[3][2] + tmp_15 * m[0][2]) -
          (tmp_22 * m[3][2] + tmp_14 * m[0][2] + tmp_19 * m[1][2])),
       d * ((tmp_22 * m[2][2] + tmp_16 * m[0][2] + tmp_21 * m[1][2]) -
          (tmp_20 * m[1][2] + tmp_23 * m[2][2] + tmp_17 * m[0][2]))];
  return [row0, row1, row2, row3];
}


raptorjs.matrix4.lookAt = function(eye, target, up) {
	var vz = raptorjs.vector3.normalize(
		raptorjs.vector3.sub(eye, target).slice(0, 3)).concat(0);
		
	var vx = raptorjs.vector3.normalize(
		raptorjs.vector3.cross(up, vz)).concat(0);
	  
	var vy = raptorjs.vector3.cross(vz, vx).concat(0);

	return raptorjs.matrix4.inverse([vx, vy, vz, eye.concat(1)]);
};
/*
raptorjs.matrix4.fromArray = function(array) {

	var matrix = [];

	matrix[0] = [array[0], array[1], array[2], array[3]];
	matrix[1] = [array[4], array[5], array[6], array[7]];
	matrix[2] = [array[8], array[9], array[10], array[11]];
	matrix[3] = [array[12], array[13], array[14], array[15]];
	
	return matrix;
}
*/
raptorjs.matrix4.fromArray = function(a) {

	var matrix = [];

	matrix[0] = [a[0], a[4], a[8], a[12]];
	matrix[1] = [a[1], a[5], a[9], a[13]];
	matrix[2] = [a[2], a[6], a[10], a[14]];
	matrix[3] = [a[3], a[7], a[11], a[15]];
	
	return matrix;
}




raptorjs.matrix4.composition = function(a, b) {
var a0 = a[0];
  var a1 = a[1];
  var a2 = a[2];
  var a3 = a[3];
  var b0 = b[0];
  var b1 = b[1];
  var b2 = b[2];
  var b3 = b[3];
  var a00 = a0[0];
  var a01 = a0[1];
  var a02 = a0[2];
  var a03 = a0[3];
  var a10 = a1[0];
  var a11 = a1[1];
  var a12 = a1[2];
  var a13 = a1[3];
  var a20 = a2[0];
  var a21 = a2[1];
  var a22 = a2[2];
  var a23 = a2[3];
  var a30 = a3[0];
  var a31 = a3[1];
  var a32 = a3[2];
  var a33 = a3[3];
  var b00 = b0[0];
  var b01 = b0[1];
  var b02 = b0[2];
  var b03 = b0[3];
  var b10 = b1[0];
  var b11 = b1[1];
  var b12 = b1[2];
  var b13 = b1[3];
  var b20 = b2[0];
  var b21 = b2[1];
  var b22 = b2[2];
  var b23 = b2[3];
  var b30 = b3[0];
  var b31 = b3[1];
  var b32 = b3[2];
  var b33 = b3[3];
  return [[a00 * b00 + a10 * b01 + a20 * b02 + a30 * b03,
           a01 * b00 + a11 * b01 + a21 * b02 + a31 * b03,
           a02 * b00 + a12 * b01 + a22 * b02 + a32 * b03,
           a03 * b00 + a13 * b01 + a23 * b02 + a33 * b03],
          [a00 * b10 + a10 * b11 + a20 * b12 + a30 * b13,
           a01 * b10 + a11 * b11 + a21 * b12 + a31 * b13,
           a02 * b10 + a12 * b11 + a22 * b12 + a32 * b13,
           a03 * b10 + a13 * b11 + a23 * b12 + a33 * b13],
          [a00 * b20 + a10 * b21 + a20 * b22 + a30 * b23,
           a01 * b20 + a11 * b21 + a21 * b22 + a31 * b23,
           a02 * b20 + a12 * b21 + a22 * b22 + a32 * b23,
           a03 * b20 + a13 * b21 + a23 * b22 + a33 * b23],
          [a00 * b30 + a10 * b31 + a20 * b32 + a30 * b33,
           a01 * b30 + a11 * b31 + a21 * b32 + a31 * b33,
           a02 * b30 + a12 * b31 + a22 * b32 + a32 * b33,
           a03 * b30 + a13 * b31 + a23 * b32 + a33 * b33]];
}
raptorjs.matrix4.mul = function(a, b) {
  var a0 = a[0];
  var a1 = a[1];
  var a2 = a[2];
  var a3 = a[3];
  var b0 = b[0];
  var b1 = b[1];
  var b2 = b[2];
  var b3 = b[3];
  var a00 = a0[0];
  var a01 = a0[1];
  var a02 = a0[2];
  var a03 = a0[3];
  var a10 = a1[0];
  var a11 = a1[1];
  var a12 = a1[2];
  var a13 = a1[3];
  var a20 = a2[0];
  var a21 = a2[1];
  var a22 = a2[2];
  var a23 = a2[3];
  var a30 = a3[0];
  var a31 = a3[1];
  var a32 = a3[2];
  var a33 = a3[3];
  var b00 = b0[0];
  var b01 = b0[1];
  var b02 = b0[2];
  var b03 = b0[3];
  var b10 = b1[0];
  var b11 = b1[1];
  var b12 = b1[2];
  var b13 = b1[3];
  var b20 = b2[0];
  var b21 = b2[1];
  var b22 = b2[2];
  var b23 = b2[3];
  var b30 = b3[0];
  var b31 = b3[1];
  var b32 = b3[2];
  var b33 = b3[3];
  return [[a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30,
           a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31,
           a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32,
           a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33],
          [a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30,
           a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31,
           a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32,
           a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33],
          [a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30,
           a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31,
           a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32,
           a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33],
          [a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30,
           a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31,
           a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32,
           a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33]];
}

raptorjs.vector2 = function(x,y){
	return [x, y];
};

raptorjs.vector2.unit = function(a) {
	var length = raptorjs.vector2.size(a);
	return [a[0]/length, a[1]/length];
}

raptorjs.vector2.size  = function(a){
	var a1 = a[0];
	var a2 = a[1];

	var x = a1*a1;
	var y = a2*a2;

	return Math.sqrt( x + y );
}



raptorjs.vector2.interpolate = function(a,b,c) {
	var a = this.scale(a,c);
	var b = this.scale(b,1-c);
	return this.add(a, b);
}

raptorjs.vector2.scale  = function(v,c){
	var x = v[0] * c;
	var y = v[1] * c;
	return [x,y];
}



raptorjs.vector2.dot  = function(a,b){
	var a1 = a[0];
	var a2 = a[1];
	
	var b1 = b[0];
	var b2 = b[1];
	
	var x = a1*b1;
	var y = a2*b2;

	return x+y;
}

raptorjs.vector2.add  = function(a,b){
	var a1 = a[0];
	var a2 = a[1];
	
	var b1 = b[0];
	var b2 = b[1];

	var x = a1+b1;
	var y = a2+b2;
	
	return [ x, y ];
}

raptorjs.vector2.sub  = function(a,b){
	var a1 = a[0];
	var a2 = a[1];
	
	var b1 = b[0];
	var b2 = b[1];

	var x = a1-b1;
	var y = a2-b2;

	return [ x, y ];
}

raptorjs.vector3 = function(x,y,z){
	return [x, y, z];
};

raptorjs.vector3.negativeVector = function(v){
	return raptorjs.vector3(-v[0], -v[1], -v[2])
}

raptorjs.vector3.dot  = function(a,b){
	var a1 = a[0];
	var a2 = a[1];
	var a3 = a[2];
	
	var b1 = b[0];
	var b2 = b[1];
	var b3 = b[2];
	
	var x = a1*b1;
	var y = a2*b2;
	var z = a3*b3;
	
	return x+y+z;
};


raptorjs.vector3.unit = function(a) {
	var length = raptorjs.vector3.size(a);
	return [a[0]/length, a[1]/length, a[2]/length];
}


raptorjs.vector3.interpolate = function(a,b,c) {
	var a = this.scale(a,c);
	var b = this.scale(b,1-c);
	
	return this.add(a, b);
}

raptorjs.vector3.scale  = function(v,c){
	var x = v[0] * c;
	var y = v[1] * c;
	var z = v[2] * c;
	return [x,y,z];
}


raptorjs.vector3.add  = function(a,b){
	var a1 = a[0];
	var a2 = a[1];
	var a3 = a[2];
	
	var b1 = b[0];
	var b2 = b[1];
	var b3 = b[2];

	var x = a1+b1;
	var y = a2+b2;
	var z = a3+b3;
	
	x = (x=="NAN")?0:x;
	y = (y=="NAN")?0:y;
	z = (z=="NAN")?0:z;
	
	return [ x, y, z ];
};

raptorjs.vector3.sub  = function(a,b){
	var a1 = a[0];
	var a2 = a[1];
	var a3 = a[2];
	
	var b1 = b[0];
	var b2 = b[1];
	var b3 = b[2];

	var x = a1-b1;
	var y = a2-b2;
	var z = a3-b3;
	
	x = (x=="NAN")?0:x;
	y = (y=="NAN")?0:y;
	z = (z=="NAN")?0:z;
	
	return [ x, y, z ];
};

raptorjs.vector3.normalize  = function(a){
	var length = this.size(a);
	
	if(length == 0)
		return raptorjs.vector3(0,0,0);
	
	var a1 = a[0];
	var a2 = a[1];
	var a3 = a[2];
	
	var b1 = a1 / length;
	var b2 = a2 / length;
	var b3 = a3 / length;
	
	

	return [ b1, b2, b3 ];
};

raptorjs.vector3.mulScalarVector = function(k, v) {
  var r = [];
  var vLength = v.length;
  for (var i = 0; i < vLength; ++i) {
    r[i] = k * v[i];
  }
  return r;
};

raptorjs.vector3.size  = function(a){
	var a1 = a[0];
	var a2 = a[1];
	var a3 = a[2];

	var x = a1*a1;
	var y = a2*a2;
	var z = a3*a3;

	return Math.sqrt( x + y + z );
}

raptorjs.vector3.cross = function(a, b) {
	var x1 = a[1] * b[2];
	var x2 = a[2] * b[1];
	var y1 = a[2] * b[0];
	var y2 = a[0] * b[2];
	var z1 = a[0] * b[1];
	var z2 = a[1] * b[0];
	
	var x = x1 - x2;
	var y = y1 - y2;
	var z = z1 - z2;
	
	return [x,y,z];
};


raptorjs.vector4 = function(){

};

raptorjs.vector4.mulScalarVector = function(k, v) {
  var r = [];
  var vLength = v.length;
  for (var i = 0; i < vLength; ++i) {
    r[i] = k * v[i];
  }
  return r;
};

raptorjs.vector4.dot  = function(a,b){
	var a1 = a[0];
	var a2 = a[1];
	var a3 = a[2];
	var a4 = a[3];
	
	var b1 = b[0];
	var b2 = b[1];
	var b3 = b[2];
	var b4 = b[3];
	
	var x = a1*b1;
	var y = a2*b2;
	var z = a3*b3;
	var w = a3*b3;
	
	return x+y+z+w;
}

raptorjs.vector4.add  = function(a,b){
	var a1 = a[0];
	var a2 = a[1];
	var a3 = a[2];
	var a4 = a[3];
	
	var b1 = b[0];
	var b2 = b[1];
	var b3 = b[2];
	var b4 = b[3];
	
	
	var x = a1+b1;
	var y = a2+b2;
	var z = a3+b3;
	var w = a3+b3;
	
	return [ x, y, z, w ];
}

raptorjs.vector4.sub  = function(a,b){
	var a1 = a[0];
	var a2 = a[1];
	var a3 = a[1];
	
	var b1 = b[0];
	var b2 = b[1];
	var b3 = b[1];
	
	var x = a1-b1;
	var y = a2-b2;
	var z = a3-b3;
	var w = a3-b3;
	
	x = (x=="NAN")?0:x;
	y = (y=="NAN")?0:y;
	z = (z=="NAN")?0:z;
	w = (w=="NAN")?0:w;
	
	return [ x, y, z, w ];
}

raptorjs.vector4.toVector3  = function(a){

	var x = a[0];
	var y = a[1];
	var z = a[2];

	return raptorjs.vector3( x, y, z );
}



raptorjs.quaternion = function(x,y,z,w) {
	return [x,y,z,w];
}

raptorjs.quaternion.fromEuler = function( v ) {
	var c = Math.PI / 360;
	
	var x = v[0] * c;
	var y = v[1] * c;
	var z = v[2] * c;

	c1 = Math.cos( y  ),
	s1 = Math.sin( y  ),
	c2 = Math.cos( -z ),
	s2 = Math.sin( -z ),
	c3 = Math.cos( x  ),
	s3 = Math.sin( x  ),

	c1c2 = c1 * c2,
	s1s2 = s1 * s2;
	
	var w = c1c2 * c3  - s1s2 * s3;
	var x = c1c2 * s3  + s1s2 * c3;
	var y = s1 * c2 * c3 + c1 * s2 * s3;
	var z = c1 * s2 * c3 - s1 * c2 * s3;

	return [x,y,z,w];
}/*
raptorjs.quaternion.toMatrix = function(q) {
    var sqw = q[3]*q[3];
    var sqx = q[0]*q[0];
    var sqy = q[1]*q[1];
    var sqz = q[2]*q[2];

    // invs (inverse square length) is only required if quaternion is not already normalised
    var invs = 1 / (sqx + sqy + sqz + sqw)
    var m00 = ( sqx - sqy - sqz + sqw)*invs ; // since sqw + sqx + sqy + sqz =1/invs*invs
    var m11 = (-sqx + sqy - sqz + sqw)*invs ;
    var m22 = (-sqx - sqy + sqz + sqw)*invs ;
    
    var tmp1 = q[0]*q[1];
    var tmp2 = q[2]*q[3];
    var m10 = 2.0 * (tmp1 + tmp2)*invs ;
    var m01 = 2.0 * (tmp1 - tmp2)*invs ;
    
    tmp1 = q[0]*q[2];
    tmp2 = q[1]*q[3];
    var m20 = 2.0 * (tmp1 - tmp2)*invs ;
    var m02 = 2.0 * (tmp1 + tmp2)*invs ;
    tmp1 = q[1]*q[2];
    tmp2 = q[0]*q[3];
    var m21 = 2.0 * (tmp1 + tmp2)*invs ;
    var m12 = 2.0 * (tmp1 - tmp2)*invs ;
    
	return [ [m00,m01,m01,0],
			 [m10,m11,m12,0],
			 [m20,m21,m22,0],
			 [0,  0,  0,  1] ];
}
*/

raptorjs.quaternion.toMatrix = function(q) {
	var x = q[0];
	var y = q[1];
	var z = q[2];
	var w = q[3];

	var resMatrix = raptorjs.matrix4.identity();
	
	resMatrix[0][0] = 1.0 - 2.0 * (y * y + z * z);
	resMatrix[0][1] = 2.0 * (x * y - z * w);
	resMatrix[0][2] = 2.0 * (x * z + y * w);
	resMatrix[1][0] = 2.0 * (x * y + z * w);
	resMatrix[1][1] = 1.0 - 2.0 * (x * x + z * z);
	resMatrix[1][2] = 2.0 * (y * z - x * w);
	resMatrix[2][0] = 2.0 * (x * z - y * w);
	resMatrix[2][1] = 2.0 * (y * z + x * w);
	resMatrix[2][2] = 1.0 - 2.0 * (x * x + y * y);
		
		
	resMatrix[0][3] = 0; 
	resMatrix[1][3] = 0;
	resMatrix[2][3] = 0;
	
	resMatrix[3][0] = 0;
	resMatrix[3][1] = 0;
	resMatrix[3][2] = 0;
	
	resMatrix[3][3] = 1;
	
	return  resMatrix;
}
	
raptorjs.quaternion.fromAxisAngle = function(axis) {
	var halfAngle = angle / 2;
	var s = Math.sin( halfAngle );

	var x = axis[0] * s;
	var y = axis[1] * s;
	var z = axis[2] * s;
	var w = Math.cos( halfAngle );
	
	return [x,y,z,w];
}
/*
raptorjs.quaternion.fromRotationMatrix = function(m) {
	var absQ = Math.pow(m.determinant(), 1.0 / 3.0);
	var w = Math.sqrt( Math.max( 0, absQ + m.n11 + m.n22 + m.n33 ) ) / 2;
	var x = Math.sqrt( Math.max( 0, absQ + m.n11 - m.n22 - m.n33 ) ) / 2;
	var y = Math.sqrt( Math.max( 0, absQ - m.n11 + m.n22 - m.n33 ) ) / 2;
	var z = Math.sqrt( Math.max( 0, absQ - m.n11 - m.n22 + m.n33 ) ) / 2;
	
	x = copySign( this[0], ( m.n32 - m.n23 ) );
	y = copySign( this[1], ( m.n13 - m.n31 ) );
	z = copySign( this[2], ( m.n21 - m.n12 ) );
	
	return [x,y,z,w];
}
*/
raptorjs.quaternion.calculateW = function(q) {
	var x = q[0];
	var y = q[1];
	var z = q[2];
	var w = q[3];
	
	return -Math.sqrt( Math.abs( 1.0 - x * x - y * y - z * z ) );
}

raptorjs.quaternion.inverse = function(q) {
	return [-a[0], -a[1], -a[2], a[3]];
}

raptorjs.quaternion.length = function(q) {
	var x = q[0];
	var y = q[1];
	var z = q[2];
	var w = q[3];
	
	return Math.sqrt( x * x + y * y + z * z + w * w );
}

raptorjs.quaternion.normalize = function(q) {
	var x = q[0];
	var y = q[1];
	var z = q[2];
	var w = q[3];
	
	var l = Math.sqrt( x * x + y * y + z * z + w * w );

	x = x / l;
	y = y / l;
	z = z / l;
	w = w / l;
	
	return [x,y,z,w];
}
raptorjs.quaternion.multiply = function(q1, q2) {

	x =  q1[0] * q2[3] + q1[1] * q2[2] - q1[2] * q2[1] + q1[3] * q2[0];
	y = -q1[0] * q2[2] + q1[1] * q2[3] + q1[2] * q2[0] + q1[3] * q2[1];
	z =  q1[0] * q2[1] - q1[1] * q2[0] + q1[2] * q2[3] + q1[3] * q2[2];
	w = -q1[0] * q2[0] - q1[1] * q2[1] - q1[2] * q2[2] + q1[3] * q2[3];
	
	return [x,y,z,w];
}
//var quaternion = raptorjs.quaternion(0,0,0,0);

//raptorjs.quaternion.slerp(quatornionA, quatornionB, quaternion, 1)

//https://github.com/joelburget/assimp/blob/master/include/aiQuaternion.h
raptorjs.quaternion.slerp = function(qA, qB, pFactor) {

	var cosom = qA[0] * qB[0] + qA[1] * qB[1] + qA[2] * qB[2] + qA[3] * qB[3];

	var end = qB;
	if( cosom < 0.0 )
	{
		cosom = -cosom;
		end[0] = -end[0];   
		end[1] = -end[1];
		end[2] = -end[2];
		end[3] = -end[3];
	} 

	var sclp, sclq;
	if( (1.0 - cosom) > 0.0001) {
		var omega, sinom;
		omega = acos( cosom );
		sinom = sin( omega);
		sclp  = sin( (1.0 - pFactor) * omega) / sinom;
		sclq  = sin( pFactor * omega) / sinom;
	} else {
		sclp = 1.0 - pFactor;
		sclq = pFactor;
	}

	var output = [];
	output[0] = sclp * qA[0] + sclq * end[0];
	output[1] = sclp * qA[1] + sclq * end[1];
	output[2] = sclp * qA[2] + sclq * end[2];
	output[3] = sclp * qA[3] + sclq * end[3];
	
	return output;
}

raptorjs.quaternion.fromMatrix3 = function(pRotMatrix) {
   var t = 1 + pRotMatrix[0][0] + pRotMatrix[1][1] + pRotMatrix[2][2];

	// large enough
	if( t > 0.001)
	{
			var s = sqrt( t) * 2.0;
			x = (pRotMatrix[2][1] - pRotMatrix[1][2]) / s;
			y = (pRotMatrix[0][2] - pRotMatrix[2][0]) / s;
			z = (pRotMatrix[1][0] - pRotMatrix[0][1]) / s;
			w = 0.25 * s;
	} // else we have to check several cases
	else if( pRotMatrix[0][0] > pRotMatrix[1][1] && pRotMatrix[0][0] > pRotMatrix[2][2] )  
	{        
// Column 0: 
			var s = sqrt( 1.0 + pRotMatrix[0][0] - pRotMatrix[1][1] - pRotMatrix[2][2]) * 2.0;
			x = 0.25 * s;
			y = (pRotMatrix[1][0] + pRotMatrix[0][1]) / s;
			z = (pRotMatrix[0][2] + pRotMatrix[2][0]) / s;
			w = (pRotMatrix[2][1] - pRotMatrix[1][2]) / s;
	} 
	else if( pRotMatrix[1][1] > pRotMatrix[2][2]) 
	{ 
// Column 1: 
			var s = sqrt( 1.0 + pRotMatrix[1][1] - pRotMatrix[0][0] - pRotMatrix[2][2]) * 2.0;
			x = (pRotMatrix[1][0] + pRotMatrix[0][1]) / s;
			y = 0.25 * s;
			z = (pRotMatrix[2][1] + pRotMatrix[1][2]) / s;
			w = (pRotMatrix[0][2] - pRotMatrix[2][0]) / s;
	} else 
	{ 
// Column 2:
			var s = sqrt( 1.0 + pRotMatrix[2][2] - pRotMatrix[0][0] - pRotMatrix[1][1]) * 2.0;
			x = (pRotMatrix[0][2] + pRotMatrix[2][0]) / s;
			y = (pRotMatrix[2][1] + pRotMatrix[1][2]) / s;
			z = 0.25 * s;
			w = (pRotMatrix[1][0] - pRotMatrix[0][1]) / s;
	}
	
	return [x,y,z,w];
}