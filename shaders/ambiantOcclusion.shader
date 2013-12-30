/**
* Raptor Engine - Core
* Copyright (c) 2013 RAPTORCODE STUDIOS
* All rights reserved.
* Obfuscated by Shader closure (A product of Raptorcode)
*/

/**
* Author: Kaj Dijksta
*/



attribute vec2 uv; 
attribute vec3 position; 
uniform mat4 viewProjection; 
varying vec2 v_uv; 
void main ( void ) {
  v_uv = uv;
  gl_Position = viewProjection *vec4 ( position , 1.0 );
  }
// #raptorEngine - Split

#ifndef AMBIANT_ONLY
#define AMBIANT_ONLY 0
#endif

precision highp float; 
varying vec2 v_uv; 
uniform sampler2D infoSampler; 
uniform sampler2D randomSampler; 
uniform sampler2D diffuseSampler; 
uniform float screenWidth; 
uniform float screenHeight; 
uniform vec3 cameraPosition; 
uniform float test; 
uniform float far; 
uniform mat3 viewMatrix3; 
uniform float type; 
uniform vec3 scale[ 32 ]; 
uniform vec4 kernelRad[ 8 ]; 
struct fragmentPass { highp vec2 uv; mediump vec4 diffuse; mediump vec3 normal; mediump vec3 positionWorld; mediump float ambiantOcclusion; highp float far; highp float depth; highp float depthNorm; }; 
float function_0 ( vec3 var_0 , vec3 var_1 , vec3 var_2 , float var_3 )
{
  mediump vec3 var_4 = reflect ( -var_2 , var_0 );
  return pow ( clamp ( dot ( var_1 , var_4 ) , 0.0 , 1.0 ) , var_3 );
  }

float function_1 ( vec2 var_0 ) {
  mediump vec4 var_1 = vec4 (.6 , 0.075 , 1.0 , 1.0 );
  const mediump float var_2 = 1.0 -1.0 /8.0;
  const mediump float var_3 = 0.025;
  mediump float var_4 = 0.0;
  mediump vec3 var_5[8];
  var_5[0] = normalize ( vec3 ( 1.0 , 1.0 , 1.0 ) ) *var_3 *( var_4 += var_2 );
  var_5[1] = normalize ( vec3 ( -1.0 , -1.0 , -1.0 ) ) *var_3 *( var_4 += var_2 );
  var_5[2] = normalize ( vec3 ( -1.0 , -1.0 , 1.0 ) ) *var_3 *( var_4 += var_2 );
  var_5[3] = normalize ( vec3 ( -1.0 , 1.0 , -1.0 ) ) *var_3 *( var_4 += var_2 );
  var_5[4] = normalize ( vec3 ( -1.0 , 1.0 , 1.0 ) ) *var_3 *( var_4 += var_2 );
  var_5[5] = normalize ( vec3 ( 1.0 , -1.0 , -1.0 ) ) *var_3 *( var_4 += var_2 );
  var_5[6] = normalize ( vec3 ( 1.0 , -1.0 , 1.0 ) ) *var_3 *( var_4 += var_2 );
  var_5[7] = normalize ( vec3 ( 1.0 , 1.0 , -1.0 ) ) *var_3 *( var_4 += var_2 );
  mediump vec3 var_6 = texture2D ( randomSampler , vec2 ( screenWidth , screenHeight ) *var_0 /4.0 ).xyz *2.0 -1.0;
  mediump float var_7 = texture2D ( infoSampler , var_0 ).x;
  mediump float var_8 = var_7 *far;
  mediump vec3 var_9 = var_1.zzw *clamp ( var_8 /5.3 , 0.0 , 1.0 ) *( 1.0 +var_8 /8.0 );
  mediump float var_10 = far /var_9.z *0.75;
  var_9.xy *= 1.0 /var_8;
  var_9.z *= 2.0 /far;
  float var_11 = 64.0 /var_9.z;
  mediump vec4 var_12[2];
  mediump vec4 var_13 = vec4 ( 0.0 );
  mediump vec3 var_14;
  mediump vec4 var_15;
  highp vec4 var_16 = vec4 ( 0.0 );
  const float var_17 = 0.2;
  vec4 var_18;
  var_14 = reflect ( var_5[0] , var_6 ) *var_9;
  var_12[0].x = texture2D ( infoSampler , var_0.xy +var_14.xy ).x +var_14.z;
  var_14.xyz *= var_17;
  var_12[1].x = texture2D ( infoSampler , var_0.xy +var_14.xy ).x +var_14.z;
  var_14 = reflect ( var_5[1] , var_6 ) *var_9;
  var_12[0].y = texture2D ( infoSampler , var_0.xy +var_14.xy ).x +var_14.z;
  var_14.xyz *= var_17;
  var_12[1].y = texture2D ( infoSampler , var_0.xy +var_14.xy ).x +var_14.z;
  var_14 = reflect ( var_5[2] , var_6 ) *var_9;
  var_12[0].z = texture2D ( infoSampler , var_0.xy +var_14.xy ).x +var_14.z;
  var_14.xyz *= var_17;
  var_12[1].z = texture2D ( infoSampler , var_0.xy +var_14.xy ).x +var_14.z;
  var_14 = reflect ( var_5[3] , var_6 ) *var_9;
  var_12[0].w = texture2D ( infoSampler , var_0.xy +var_14.xy ).x +var_14.z;
  var_14.xyz *= var_17;
  var_12[1].w = texture2D ( infoSampler , var_0.xy +var_14.xy ).x +var_14.z;
  const float var_19 = 0.001;
  var_15 = var_7 -var_12[0];
  var_18 = var_15 *var_10;
  var_16 = ( clamp ( abs ( var_18 ) , 0.0 , 1.0 ) +clamp ( var_18 , 0.0 , 1.0 ) ) /2.0;
  var_13 += mix ( clamp ( ( -var_15 ) *var_11 , 0.0 , 1.0 ) , vec4 ( var_19 ) , var_16 );
  var_15 = var_7 -var_12[1];
  var_18 = var_15 *var_10;
  var_16 = ( clamp ( abs ( var_18 ) , 0.0 , 1.0 ) +clamp ( var_18 , 0.0 , 1.0 ) ) /2.0;
  var_13 += mix ( clamp ( ( -var_15 ) *var_11 , 0.0 , 1.0 ) , vec4 ( var_19 ) , var_16 );
  float var_20 = dot ( var_13 , vec4 ( ( 1.0 /16.0 ) *2.0 ) ) -var_1.y;
  var_20 = clamp ( mix ( 0.9 , var_20 , var_1.x ) , 0.0 , 1.0 );
  return var_20;
  }

float function_2 ( vec2 var_0 , float var_1 , vec3 var_2 )
{
  const mediump float var_3 = 0.4;
  const mediump int var_4 = 16;
  const mediump float var_5 = 0.05;
  const mediump float var_6 = var_3 /( float ( var_4 ) /2.0 );
  const mediump float var_7 = 1000.0;
  mediump float var_8 = 2.8 *( 1.0 +sqrt ( var_5 ) ) /var_7;
  const mediump float var_9 = 1.0 -2.8;
  mediump vec3 var_10 = texture2D ( randomSampler , vec2 ( screenWidth , screenHeight ) *var_0 /4.0 ).xyz *2.0 -1.0;
  mediump vec4 var_11 = vec4 ( var_7 /var_1 );
  mediump vec4 var_12 = vec4 ( 0.0 );
  for ( int var_13 = 0; var_13 < var_4 /4; var_13 ++)
  {
      mediump vec4 var_14 = vec4 ( 0.0 );
      mediump vec4 var_15 = vec4 ( 0.0 );
      mediump vec4 var_16 = vec4 ( 0.0 );
      for ( int var_17 = 0; var_17 < 4; ++var_17 )
      {
          mediump vec3 var_18 = reflect ( scale[4 *var_13 +var_17] , var_10 );
          var_16[var_17] = dot ( var_18 , var_2 );
          var_18 = ( var_16[var_17] >= 0.0 ) ? var_18 : -var_18;
          var_14[var_17] = texture2D ( infoSampler , var_0.xy +var_18.xy ).x;
          var_15[var_17] = var_18.z;
          }
      var_14 = var_14 *var_11;
      mediump vec4 var_19 = clamp ( var_7 +var_15 *( 2.0 *var_7 ) -var_14 , 0.0 , 1.0 );
      var_19 *= clamp ( var_8 *var_14 +var_9 , 0.0 , 1.0 );
      var_19 *= ( abs ( var_16 ) *kernelRad[var_13] );
      var_12 += var_19;
      }
  var_12 *= var_6;
  lowp float var_20 = 1.0 -dot ( vec4 ( 1.0 ) , var_12 );
  return var_20;
  }

float function_3 ( vec2 var_0 , float var_1 , vec3 var_2 )
{
  const mediump vec4 var_3 = vec4 ( 1. , 0.075 , 1.0 , 2.0 );
  const int var_4 = 8;
  const mediump float var_5 = 0.6;
  const mediump float var_6 = 1.0 /var_5;
  const mediump float var_7 = 2.5;
  const mediump float var_8 = var_3.x;
  vec3 var_9[16];
  var_9[0] = vec3 ( -0.055664 , -0.00371090 , -0.0654297 );
  var_9[1] = vec3 ( 0.0173828 , 0.0111328 , 0.0064453 );
  var_9[2] = vec3 ( 0.0001953 , 0.008203100000000001 , -0.0060547 );
  var_9[3] = vec3 ( 0.0220703 , -0.035937500000000004 , -0.00625 );
  var_9[4] = vec3 ( 0.0242188 , 0.012695300000000001 , -0.025 );
  var_9[5] = vec3 ( 0.0070313 , -0.0025391000000000003 , 0.014843799999999999 );
  var_9[6] = vec3 ( -0.007812 , 0.0013672 , -0.0314453 );
  var_9[7] = vec3 ( 0.0117188 , -0.0140625 , -0.019921900000000003 );
  var_9[8] = vec3 ( -0.025195 , -0.055859400000000003 , 0.008203100000000001 );
  var_9[9] = vec3 ( 0.0308594 , 0.019335900000000003 , 0.0324219 );
  var_9[10] = vec3 ( 0.0173828 , -0.0140625 , 0.003125 );
  var_9[11] = vec3 ( 0.0179688 , -0.0044922 , 0.004687500000000001 );
  var_9[12] = vec3 ( -0.014648 , -0.020117200000000002 , -0.0029297000000000004 );
  var_9[13] = vec3 ( -0.030078 , 0.0234375 , 0.0539063 );
  var_9[14] = vec3 ( 0.0228516 , 0.0154297 , -0.0119141 );
  var_9[15] = vec3 ( -0.011914 , -0.00039060000000000006 , -0.006640600000000001 );
  mediump vec3 var_10 = texture2D ( randomSampler , vec2 ( screenWidth , screenHeight ) *var_0 /4.0 ).xyz *2.0 -1.0;
  mediump vec4 var_11 = vec4 ( 1.0 /var_1 );
  mediump vec4 var_12 = vec4 ( 0.0 );
  for ( int var_13 = 0; var_13 < var_4; var_13 += 4 )
  {
      mediump vec4 var_14 = vec4 ( 0.0 );
      mediump vec4 var_15 = vec4 ( 0.0 );
      mediump vec4 var_16;
      mediump vec4 var_17;
      for ( int var_18 = 0; var_18 < 4; ++var_18 )
      {
          mediump vec3 var_19 = reflect ( var_9[var_13 +var_18] , var_10 );
          float var_20 = dot ( var_19 , var_2 );
          var_19 = ( var_20 >= 0.0 ) ? var_19 : -var_19;
          var_14[var_18] = texture2D ( infoSampler , ( var_0 +var_19.xy ) ).x;
          var_15[var_18] = var_19.z;
          }
      var_14 = var_14 *var_11;
      mediump vec4 var_21 = ( 1.0 +var_15 *2. -var_14 ) *var_6;
      var_16 = clamp ( var_7 *var_21 , 0.0 , 1.0 );
      var_17 = clamp ( 1.0 /var_21 , 0.0 , 1.0 );
      var_12 += var_16 *var_17;
      }
  var_12 *= var_8 /float ( var_4 );
  mediump float var_22 = dot ( vec4 ( 1.0 ) , var_12 );
  return 1.0 -var_22;
  }

mediump vec3 function_4 ( mediump vec2 var_0 ) {
  mediump vec2 var_1 = var_0 *4.0 -2.0;
  mediump float var_2 = dot ( var_1 , var_1 );
  mediump float var_3 = sqrt ( 1.0 -var_2 /4.0 );
  mediump vec3 var_4;
  var_4.xy = var_1 *var_3;
  var_4.z = 1.0 -var_2 /2.0;
  return var_4;
  }

void main ( void ) {
  vec4 var_0 = texture2D ( infoSampler , v_uv );
  float var_1 = var_0.x;
  float var_2 = var_1 /far;
  vec3 var_3 = function_4 ( var_0.yz );
  float var_4;
  #if SSAO_TYPE == 0
  var_4 = function_1 ( v_uv );
  #elif SSAO_TYPE == 1
  var_4 = function_3 ( v_uv , var_1 , var_3 );
  #elif SSAO_TYPE == 2
  var_4 = function_2 ( v_uv , var_1 , var_3 );
  #endif
  gl_FragColor = vec4 ( var_4 , var_4 , var_4 , 1.0 );
  }