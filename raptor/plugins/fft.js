
raptorjs.fft = function(){
	this.M_PI = 1; //??
	this.pi2 = 2 * this.M_PI;
	this.N = 64;
	
	
	var c = [];
	var reversed;
	
	//T(0)
	//pi2(2 * M_PI)

	c[0] = c[1] = 0;

	log_2_N = Math.log(this.N) / Math.log(2);

	reversed = [this.N];		// prep bit reversals
	for (var i = 0; i < this.N; i++) reversed[i] = this.reverse(i);

	var pow2 = 1;
	//T = raptorjs.complex.createArray(log_2_N);		// prep T
	T = [log_2_N];
	
	for (var i = 0; i < log_2_N; i++) {
	
		//T[i] = raptorjs.complex.createArray(pow2); 
		T[i] = [pow2];
		for (var j = 0; j < pow2; j++) {
			T[i][j] = this.t(j, pow2 * 2);
		}
		
		pow2 *= 2;
	}

	c[0] = [this.N];
	c[1] = [this.N];
	
	this.c = c;
	this.reversed = reversed;
	which = 0;
}

raptorjs.fft.prototype.t = function(x, N) {
	return raptorjs.complex( Math.cos(this.pi2 * x / N), Math.sin(this.pi2 * x / N) );
}

raptorjs.fft.prototype.reverse = function(i) {
	var res = 0;
	for (var j = 0; j < log_2_N; j++) {
		res = (res << 1) + (i & 1);
		i >>= 1;
	}
	return res;
}

raptorjs.fft.prototype.perform = function(input, output, stride, offset) {
	var c = this.c;
	var reversed = this.reversed;
	
    for (var i = 0; i < this.N; i++) c[which][i] = input[reversed[i] * stride + offset];
 
    var loops       = this.N>>1;
    var size        = 1<<1;
    var size_over_2 = 1;
    var w_          = 0;
    for (var i = 1; i <= log_2_N; i++) {
        which ^= 1;
        for (var j = 0; j < loops; j++) {
            for (var k = 0; k < size_over_2; k++) {
                c[which][size * j + k] =  c[which^1][size * j + k] +
                              c[which^1][size * j + size_over_2 + k] * T[w_][k];
            }
 
            for (var k = size_over_2; k < size; k++) {
                c[which][size * j + k] =  c[which^1][size * j - size_over_2 + k] -
                              c[which^1][size * j + k] * T[w_][k - size_over_2];
            }
        }
        loops       >>= 1;
        size        <<= 1;
        size_over_2 <<= 1;
        w_++;
    }
 
    for (var i = 0; i < this.N; i++) output[i * stride + offset] = c[which][i];
}


