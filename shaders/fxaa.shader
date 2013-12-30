/**
 * Raptor Engine - Core
 * Copyright (c) 2010 RAPTORCODE STUDIOS
 * All rights reserved.
 */
  
/**
 * Author: Kaj Dijksta
 */
 
    attribute vec3 position;
    attribute vec2 uv;
	
    uniform mat4 viewProjection;

    varying vec2 v_texCoord;

    void main(void) {
        v_texCoord = uv;
		gl_Position = viewProjection * vec4(position, 1.0);
    }
	
	// #raptorEngine - Split
	
precision highp float;


varying vec2 v_texCoord;

uniform vec2 screenSizeInv;

uniform float edgeTreshold;
uniform float edgeTresholdMin;
uniform float subpixQuality;

uniform sampler2D test;
uniform sampler2D colorSampler;

	
vec4 FxaaTexOff(vec2 p, ivec2 o, vec2 r){
	return texture2D(test, p + (vec2(o) * r));
}

vec4 FxaaTexTop(vec2 p) {
	return  texture2D(test, p);
}

vec4 FxaaPixelShader(	vec2 pos, 
						vec2 rcpFrame ){ 
    vec2 posM;
    posM.x = pos.x;
    posM.y = pos.y;
	vec4 rgbyM = FxaaTexTop(posM);
	
	float lumaM = rgbyM.w;
	
	float lumaS = FxaaTexOff(posM, ivec2( 0, 1), rcpFrame.xy).w;
	float lumaE = FxaaTexOff(posM, ivec2( 1, 0), rcpFrame.xy).w;
	float lumaN = FxaaTexOff(posM, ivec2( 0,-1), rcpFrame.xy).w;
	float lumaW = FxaaTexOff(posM, ivec2(-1, 0), rcpFrame.xy).w;
	
    float maxSM = max(lumaS, lumaM);
    float minSM = min(lumaS, lumaM);
    float maxESM = max(lumaE, maxSM); 
    float minESM = min(lumaE, minSM); 
    float maxWN = max(lumaN, lumaW);
    float minWN = min(lumaN, lumaW);
    float rangeMax = max(maxWN, maxESM);
    float rangeMin = min(minWN, minESM);
    float rangeMaxScaled = rangeMax * edgeTreshold;
    float range = rangeMax - rangeMin;
    float rangeMaxClamped = max(edgeTresholdMin, rangeMaxScaled);
    bool earlyExit = (range < rangeMaxClamped);
	
	if(earlyExit) {
		return rgbyM;
	} else {
	
	float lumaNE = FxaaTexOff(posM, ivec2(1, -1), rcpFrame.xy).w;
	float lumaSW = FxaaTexOff(posM, ivec2(-1, 1), rcpFrame.xy).w;
	float lumaSE = FxaaTexOff(posM, ivec2(-1, -1), rcpFrame.xy).w;
	float lumaNW = FxaaTexOff(posM, ivec2(1, 1), rcpFrame.xy).w;
	
    float lumaNS = lumaN + lumaS;
    float lumaWE = lumaW + lumaE;
    float subpixRcpRange = 1.0/range;
    float subpixNSWE = lumaNS + lumaWE;
    float edgeHorz1 = (-2.0 * lumaM) + lumaNS;
    float edgeVert1 = (-2.0 * lumaM) + lumaWE;
	

	
	
    float lumaNESE = lumaNE + lumaSE;
    float lumaNWNE = lumaNW + lumaNE;
    float edgeHorz2 = (-2.0 * lumaE) + lumaNESE;
    float edgeVert2 = (-2.0 * lumaN) + lumaNWNE;
	
	
    float lumaNWSW = lumaNW + lumaSW;
    float lumaSWSE = lumaSW + lumaSE;
    float edgeHorz4 = (abs(edgeHorz1) * 2.0) + abs(edgeHorz2);
    float edgeVert4 = (abs(edgeVert1) * 2.0) + abs(edgeVert2);
    float edgeHorz3 = (-2.0 * lumaW) + lumaNWSW;
    float edgeVert3 = (-2.0 * lumaS) + lumaSWSE;
    float edgeHorz = abs(edgeHorz3) + edgeHorz4;
    float edgeVert = abs(edgeVert3) + edgeVert4;
	
	
    float subpixNWSWNESE = lumaNWSW + lumaNESE; 
    float lengthSign = rcpFrame.x;
    bool horzSpan = (edgeHorz >= edgeVert);
    float subpixA = subpixNSWE * 2.0 + subpixNWSWNESE; 
	
	if(horzSpan) {
		lumaN = lumaW; 
		lumaS = lumaE;
	} else {
		lengthSign = rcpFrame.y;
	}
	
	float subpixB = (subpixA * (1.0/12.0)) - lumaM;
	
	
    float gradientN = lumaN - lumaM;
    float gradientS = lumaS - lumaM;
    float lumaNN = lumaN + lumaM;
    float lumaSS = lumaS + lumaM;
    float pairN = (abs(gradientN) >= abs(gradientS))? 1.0 : 0.0;
    float gradient = max(abs(gradientN), abs(gradientS));
    if(pairN == 1.0){
		lengthSign = -lengthSign;
	}
	
	float subpixC = clamp(abs(subpixB) * subpixRcpRange, 0.0, 1.0);
	
	
    vec2 posB;
    posB.x = posM.x;
    posB.y = posM.y;
    vec2 offNP;
	
	if(horzSpan) {
		offNP.x = rcpFrame.x;
		offNP.y = 0.0 ;
		posB.y += lengthSign * 0.5;
	} else {
		offNP.x = 0.0 ;
		offNP.y = rcpFrame.y;
		posB.x += lengthSign * 0.5;
	}
	

	vec2 posN;
    posN.x = posB.x - offNP.x;
    posN.y = posB.y - offNP.y;
    vec2 posP;
    posP.x = posB.x + offNP.x;
    posP.y = posB.y + offNP.y;
    float subpixD = ((-2.0)*subpixC) + 3.0;
    float lumaEndN = FxaaTexTop(posN).w;
    float subpixE = subpixC * subpixC;
    float lumaEndP = FxaaTexTop(posP).w;
	
	if(pairN != 1.0) { 
		lumaNN = lumaSS; 
	}
	
    float gradientScaled = gradient * 1.0/4.0;
    float lumaMM = lumaM - lumaNN * 0.5;
    float subpixF = subpixD * subpixE;
    bool lumaMLTZero = lumaMM < 0.0;
	
	
	
	
	lumaEndN -= lumaNN * 0.5;
    lumaEndP -= lumaNN * 0.5;
    bool doneN = abs(lumaEndN) >= gradientScaled;
    bool doneP = abs(lumaEndP) >= gradientScaled;
    if(!doneN) posN.x -= offNP.x * 1.5;
    if(!doneN) posN.y -= offNP.y * 1.5;
    bool doneNP = (!doneN) || (!doneP);
    if(!doneP) posP.x += offNP.x * 1.5;
    if(!doneP) posP.y += offNP.y * 1.5;
	
    if(doneNP) {

        if(!doneN) lumaEndN = FxaaTexTop( posN.xy).w;
        if(!doneP) lumaEndP = FxaaTexTop( posP.xy).w;
        if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;
        if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;
        doneN = abs(lumaEndN) >= gradientScaled;
        doneP = abs(lumaEndP) >= gradientScaled;
        if(!doneN) posN.x -= offNP.x * 2.0;
        if(!doneN) posN.y -= offNP.y * 2.0;
        doneNP = (!doneN) || (!doneP);
        if(!doneP) posP.x += offNP.x * 2.0;
        if(!doneP) posP.y += offNP.y * 2.0;
        if(doneNP) {

            if(!doneN) lumaEndN = FxaaTexTop( posN.xy).w;
            if(!doneP) lumaEndP = FxaaTexTop( posP.xy).w;
            if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;
            if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;
            doneN = abs(lumaEndN) >= gradientScaled;
            doneP = abs(lumaEndP) >= gradientScaled;
            if(!doneN) posN.x -= offNP.x * 2.0;
            if(!doneN) posN.y -= offNP.y * 2.0;
            doneNP = (!doneN) || (!doneP);
            if(!doneP) posP.x += offNP.x * 2.0;
            if(!doneP) posP.y += offNP.y * 2.0;
            if(doneNP) {

                if(!doneN) lumaEndN = FxaaTexTop( posN.xy).w;
                if(!doneP) lumaEndP = FxaaTexTop( posP.xy).w;
                if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;
                if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;
                doneN = abs(lumaEndN) >= gradientScaled;
                doneP = abs(lumaEndP) >= gradientScaled;
                if(!doneN) posN.x -= offNP.x * 4.0;
                if(!doneN) posN.y -= offNP.y * 4.0;
                doneNP = (!doneN) || (!doneP);
                if(!doneP) posP.x += offNP.x * 4.0;
                if(!doneP) posP.y += offNP.y * 4.0;
                if(doneNP) {

                    if(!doneN) lumaEndN = FxaaTexTop(posN.xy).w;
                    if(!doneP) lumaEndP = FxaaTexTop( posP.xy).w;
                    if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;
                    if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;
                    doneN = abs(lumaEndN) >= gradientScaled;
                    doneP = abs(lumaEndP) >= gradientScaled;
                    if(!doneN) posN.x -= offNP.x * 2.0;
                    if(!doneN) posN.y -= offNP.y * 2.0;
                    if(!doneP) posP.x += offNP.x * 2.0; 
                    if(!doneP) posP.y += offNP.y * 2.0; } } } }

	
	
    float dstN = posM.x - posN.x;
    float dstP = posP.x - posM.x;
    if(!horzSpan) dstN = posM.y - posN.y;
    if(!horzSpan) dstP = posP.y - posM.y;

	
    bool goodSpanN = (lumaEndN < 0.0) != lumaMLTZero;
    float spanLength = (dstP + dstN);
    bool goodSpanP = (lumaEndP < 0.0) != lumaMLTZero;
    float spanLengthRcp = 1.0/spanLength;
	
	bool directionN = dstN < dstP;
    float dst = min(dstN, dstP);
    bool goodSpan = directionN ? goodSpanN : goodSpanP;
    float subpixG = subpixF * subpixF;
    float pixelOffset = (dst * (-spanLengthRcp)) + 0.5;
    float subpixH = subpixG * subpixQuality;
	
    float pixelOffsetGood = goodSpan ? pixelOffset : 0.0;
    float pixelOffsetSubpix = max(pixelOffsetGood, subpixH);
    if(!horzSpan) posM.x += pixelOffsetSubpix * lengthSign;
    if( horzSpan) posM.y += pixelOffsetSubpix * lengthSign;
    return FxaaTexTop(posM); 
	
	}
	//return vec4(0.0);
}


void main() {
	//vec4 occlusion = texture2D(occlusionSampler, v_texCoord);
	//vec4 color = texture2D(colorSampler, v_texCoord);
	
	
	//gl_FragColor = color - occlusion;
	//gl_FragColor = FxaaPixelShader(	v_texCoord, screenSizeInv ) - occlusion; 
	
		//if(v_texCoord.x<.5)
			gl_FragColor = FxaaPixelShader(	v_texCoord, screenSizeInv ); 
		//else
			//gl_FragColor = texture2D(test, v_texCoord); 
		
		//gl_FragColor = color - occlusion; 
}



	