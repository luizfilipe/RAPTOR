
var a = raptorjs.vector3(-1,0,0);
var b = raptorjs.vector3(1,0,0);

var c = raptorjs.add( a, b );


var a = raptorjs.matrix3.identity();
var b = raptorjs.matrix3.identity();

var c = raptorjs.matrix3.rotateX(a, raptorjs.math.degToRad(90) );

var total = raptorjs.matrix3.mul(b, c);


var inverse = raptorjs.matrix3.inverse(total);
var transpose = raptorjs.matrix3.transpose(total);

var transformedVector = raptorjs.matrix3.transformPoint(inverse, vector);