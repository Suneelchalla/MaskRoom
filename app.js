"use strict";
/* ================= helpers ================= */
const $=s=>document.querySelector(s);
const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const buzz=()=>{try{navigator.vibrate&&navigator.vibrate(5)}catch{}};
const nz=o=>Object.values(o).some(v=>v!==0);
const ic=p=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const ICON={
 open:ic('<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="M21 16l-5-5-8 9"/>'),
 undo:ic('<path d="M9 7L4 12l5 5"/><path d="M4 12h10a6 6 0 0 1 6 6"/>'),
 redo:ic('<path d="M15 7l5 5-5 5"/><path d="M20 12H10a6 6 0 0 0-6 6"/>'),
 eye:ic('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
 looks:ic('<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>'),
 light:ic('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>'),
 color:ic('<path d="M12 3s6 6.3 6 11a6 6 0 0 1-12 0c0-4.7 6-11 6-11z"/>'),
 crv:ic('<path d="M3 21C10 21 8 3 21 3"/><path d="M3 3v18h18" opacity=".4"/>'),
 fx:ic('<circle cx="6" cy="6" r="1.2"/><circle cx="12" cy="6" r="1.2"/><circle cx="18" cy="6" r="1.2"/><circle cx="6" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18" cy="12" r="1.2"/><circle cx="6" cy="18" r="1.2"/><circle cx="12" cy="18" r="1.2"/><circle cx="18" cy="18" r="1.2"/>'),
 masks:ic('<circle cx="12" cy="12" r="9" stroke-dasharray="3 3"/><circle cx="12" cy="10" r="3"/><path d="M6.5 18c1-3 3-4 5.5-4s4.5 1 5.5 4"/>'),
 crop:ic('<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M2 6h14a2 2 0 0 1 2 2v14"/>'),
 frame:ic('<rect x="3" y="3" width="18" height="18" rx="3"/><rect x="7.5" y="7.5" width="9" height="9" rx="1.5"/>'),
 add:ic('<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>'),
 rotL:ic('<path d="M4 4v6h6"/><path d="M4.5 14a8 8 0 1 0 2-8L4 10"/>'),
 rotR:ic('<path d="M20 4v6h-6"/><path d="M19.5 14a8 8 0 1 1-2-8L20 10"/>'),
 flip:ic('<path d="M12 3v18"/><path d="M8 7L3 17h5z"/><path d="M16 7l5 10h-5z"/>'),
 reset:ic('<path d="M4 12a8 8 0 1 0 3-6.2"/><path d="M4 4v5h5"/>'),
 x:ic('<path d="M6 6l12 12M18 6L6 18"/>')
};
const LOGO=(s,id,rx=112)=>`<svg width="${s}" height="${s}" viewBox="0 0 512 512" aria-label="Maskroom"><defs><linearGradient id="bg${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a2d3a"/><stop offset="1" stop-color="#08090c"/></linearGradient><linearGradient id="ac${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7fd0ff"/><stop offset="1" stop-color="#b38cff"/></linearGradient></defs><rect width="512" height="512" rx="${rx}" fill="url(#bg${id})"/><circle cx="256" cy="256" r="118" fill="none" stroke="url(#ac${id})" stroke-width="26"/><path d="M256 138A118 118 0 0 0 256 374Z" fill="url(#ac${id})"/><path d="M372 120l7 18 18 7-18 7-7 18-7-18-18-7 18-7z" fill="#fff"/></svg>`;

/* ================= state ================= */
const zeroAdj=()=>({exposure:0,contrast:0,highlights:0,shadows:0,whites:0,blacks:0,temp:0,tint:0,vibrance:0,saturation:0,blur:0});
const flat=()=>[[0,0],[1,1]];
const fresh=()=>({G:zeroAdj(),hsl:Array(24).fill(0),
  bw:{on:false,v:Array(8).fill(0),th:35,ta:0},
  gr:{sh:{h:215,s:0,l:0},mi:{h:40,s:0,l:0},hi:{h:40,s:0,l:0}},
  crv:{rgb:flat(),r:flat(),g:flat(),b:flat()},
  fx:{clarity:0,texture:0,dehaze:0,sharpen:0,shrRad:1,shrDet:.5,shrMask:0,dnL:0,dnC:0,
      vignette:0,vigMid:.6,vigFeather:.6,vigRound:.5,grain:0,grSize:1,grRough:.5,fade:0,defr:0},
  look:{id:'none',amt:100},masks:[],items:[],
  geo:{rot:0,flip:false,angle:0,crop:{x:0,y:0,w:1,h:1},aspect:'free'},
  frame:{style:'none',size:6,color:'#ffffff',radius:0},
  logo:{on:false,useImg:false,text:'Your Brand',pos:'br',size:12,opacity:85}});
let S=fresh();
let SW=0,SH=0,MW=0,MH=0,srcCanvas=null,loaded=false,mid=0;
let tab='looks',colorMode='basic',grRange='sh',band=0,bwBand=0,overlayOn=true,brush='off',brushSize=56,comparing=false,fxGroup='detail';
let selM=-1,adding=false,pickMode=false,pickPts=[],pickMask=-1,pickLabel=1,busy=false;
let addMode='text',selItem=-1,crvCh='rgb',drawCol='#ffffff',drawW=1.2;
const cur={light:'exposure',color:'temp',fx:'clarity',frame:'size',brand:'size',mix:'0',mask:'exposure'};
let customLut=null,logoImg=null,thumbURL={},crvDirty=true;
const hist=[],redoS=[];
const selMask=()=>S.masks.find(m=>m.id===selM)||null;
const isLine=m=>m.type==='linear'||m.type==='tilt';
const selIt=()=>{const i=S.items[selItem];return i&&i.type!=='draw'?i:null};
const ensureSel=()=>{if(!S.masks.some(m=>m.id===selM))selM=S.masks.length?S.masks[S.masks.length-1].id:-1;if(selItem>=S.items.length)selItem=-1};
const snap=()=>({s:JSON.stringify(S,(k,v)=>k==='d'?undefined:v),bm:S.masks.map(m=>m.d)});
function updHist(){$('#bUndo').disabled=!hist.length;$('#bRedo').disabled=!redoS.length}
function pushHist(){hist.push(snap());if(hist.length>40)hist.shift();redoS.length=0;updHist()}
const commit=d=>{hist.push(d.pend);if(hist.length>40)hist.shift();redoS.length=0;updHist();d.moved=true};
function restore(h){S=JSON.parse(h.s);S.masks.forEach((m,i)=>{m.d=h.bm[i]||null});crvDirty=true;lutUploaded=null;ensureSel();renderPanel();updHist();redraw(true)}
function undo(){if(!hist.length)return;redoS.push(snap());restore(hist.pop())}
function redo(){if(!redoS.length)return;hist.push(snap());restore(redoS.pop())}
let tt;function toast(m,ms=2400,spin=false){const t=$('#toast');t.innerHTML=(spin?'<i class="spin"></i>':'')+m;t.classList.add('on');clearTimeout(tt);if(ms)tt=setTimeout(()=>t.classList.remove('on'),ms)}

/* ================= WebGL (multi-pass) ================= */
const wc=document.createElement('canvas');
const gl=wc.getContext('webgl',{preserveDrawingBuffer:true,premultipliedAlpha:false,antialias:false});
const VS=`attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}`;
const FS=`
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 v;
uniform sampler2D src,msk,lutT,crv;
uniform float pass;
uniform vec2 px,mpx,res;
uniform vec3 rad;
uniform vec4 uA,uB,uC,mg;
uniform float mkind,minv,mfeat,mwid,ublur,clar,texr,shrp,shrd,shrm,dehz,dnl,dnc,defr;
uniform float useHsl,bwOn,useGrade,useCrv,lutOn,lutAmt,lutN,fade;
uniform vec3 hsl[8];
uniform float hcen[8];
uniform float bwv[8];
uniform vec2 bwT;
uniform vec3 gS,gM,gH;
const vec3 LUMA=vec3(.2126,.7152,.0722);
float sq(float x){return x*x;}
vec3 adj(vec3 c,vec4 p,vec4 q,vec4 r){
  c=pow(c,vec3(2.2));
  c*=exp2(p.x*2.0);
  c*=vec3(1.0+q.z*.3,1.0,1.0-q.z*.3);
  c.g*=1.0-q.w*.2;
  float l=dot(c,LUMA);
  float sw=1.0-smoothstep(0.0,.5,l),hw=smoothstep(.4,1.0,l);
  c*=1.0+p.w*.8*sw+p.z*.6*hw;
  c*=1.0+q.x*.5*smoothstep(.55,1.0,l);
  c+=q.y*.06*(1.0-smoothstep(0.0,.2,l));
  c=pow(clamp(c,0.0,1.0),vec3(1.0/2.2));
  c=(c-.5)*(1.0+p.y)+.5;
  float g=dot(c,vec3(.299,.587,.114));
  c=mix(vec3(g),c,1.0+r.y);
  float s=max(c.r,max(c.g,c.b))-min(c.r,min(c.g,c.b));
  c=mix(vec3(g),c,1.0+r.x*(1.0-s));
  return clamp(c,0.0,1.0);
}
vec3 rgb2hsv(vec3 c){vec4 K=vec4(0.,-1./3.,2./3.,-1.);vec4 p=mix(vec4(c.bg,K.wz),vec4(c.gb,K.xy),step(c.b,c.g));vec4 q=mix(vec4(p.xyw,c.r),vec4(c.r,p.yzx),step(p.x,c.r));float d=q.x-min(q.w,q.y);float e=1e-10;return vec3(abs(q.z+(q.w-q.y)/(6.*d+e)),d/(q.x+e),q.x);}
vec3 hsv2rgb(vec3 c){vec4 K=vec4(1.,2./3.,1./3.,3.);vec3 p=abs(fract(c.xxx+K.xyz)*6.-K.www);return c.z*mix(K.xxx,clamp(p-K.xxx,0.,1.),c.y);}
vec3 denoise(vec3 c){
  float l=dot(c,LUMA);vec3 a=c;
  if(dnl>0.){
    float sg=.015+dnl*.1,r=1.+dnl*1.5,ws=1.;
    for(int i=0;i<8;i++){
      float t=float(i)*.785398;vec2 d=vec2(cos(t),sin(t))*px;
      vec3 s1=texture2D(src,v+d*r).rgb,s2=texture2D(src,v+d*r*2.).rgb;
      float w1=exp(-sq(dot(s1,LUMA)-l)/(sg*sg)),w2=exp(-sq(dot(s2,LUMA)-l)/(sg*sg));
      a+=s1*w1+s2*w2;ws+=w1+w2;
    }
    a/=ws;
  }
  if(dnc>0.){
    float la=dot(a,LUMA),cw=1.,rc=2.+dnc*5.;vec3 ch=a-la;
    for(int i=0;i<8;i++){
      float t=float(i)*.785398;vec2 d=vec2(cos(t),sin(t))*px*rc;
      vec3 s=texture2D(src,v+d).rgb;float ls=dot(s,LUMA);
      float w=exp(-sq(ls-l)/.03);
      ch+=(s-ls)*w;cw+=w;
    }
    a=la+ch/cw;
  }
  return clamp(a,0.,1.);
}
vec3 defringe(vec3 c){
  float l=dot(c,LUMA),mx=0.;
  for(int i=0;i<4;i++){
    float t=float(i)*1.570796+.785398;
    mx=max(mx,abs(dot(texture2D(src,v+vec2(cos(t),sin(t))*px*2.).rgb,LUMA)-l));
  }
  float e=smoothstep(.05,.22,mx);
  vec3 h=rgb2hsv(c);
  float pu=smoothstep(.68,.75,h.x)*(1.-smoothstep(.88,.95,h.x));
  h.y*=1.-e*pu*.85;
  return hsv2rgb(h);
}
vec3 disc(vec2 uv,float R){
  vec3 a=vec3(0.);
  for(int i=0;i<16;i++){
    float fi=float(i)+.5,r=sqrt(fi/16.)*R,t=fi*2.39996;
    a+=texture2D(src,uv+vec2(cos(t),sin(t))*px*r).rgb;
  }
  return a/16.;
}
vec3 hslMix(vec3 c){
  vec3 h=rgb2hsv(c);float dh=0.,ds=0.,dv=0.;
  for(int i=0;i<8;i++){
    float d=abs(h.x-hcen[i]);d=min(d,1.-d);
    float w=max(0.,1.-d*8.)*smoothstep(.03,.25,h.y);
    dh+=w*hsl[i].x;ds+=w*hsl[i].y;dv+=w*hsl[i].z;
  }
  h.x=fract(h.x+dh*.08+1.);h.y=clamp(h.y*(1.+ds),0.,1.);h.z=clamp(h.z*(1.+dv*.5),0.,1.);
  return hsv2rgb(h);
}
vec3 bw(vec3 c){
  vec3 h=rgb2hsv(c);float k=0.;
  for(int i=0;i<8;i++){float d=abs(h.x-hcen[i]);d=min(d,1.-d);k+=max(0.,1.-d*8.)*bwv[i];}
  k*=smoothstep(.02,.2,h.y);
  float l=clamp(dot(c,LUMA)*(1.+k*.9),0.,1.);
  vec3 t=hsv2rgb(vec3(bwT.x,1.,1.));
  return clamp(vec3(l)+(t-dot(t,LUMA))*bwT.y*.45*(1.-abs(l*2.-1.)*.4),0.,1.);
}
vec3 grade(vec3 c){
  float l=dot(c,LUMA);
  float ws=1.-smoothstep(0.,.55,l),wh=smoothstep(.45,1.,l),wm=clamp(1.-ws-wh,0.,1.);
  vec3 ts=hsv2rgb(vec3(gS.x,1.,1.));ts-=dot(ts,LUMA);
  vec3 tm=hsv2rgb(vec3(gM.x,1.,1.));tm-=dot(tm,LUMA);
  vec3 th=hsv2rgb(vec3(gH.x,1.,1.));th-=dot(th,LUMA);
  c+=ts*gS.y*ws*.5+tm*gM.y*wm*.5+th*gH.y*wh*.5;
  c+=(gS.z*ws+gM.z*wm+gH.z*wh)*.25;
  return clamp(c,0.,1.);
}
vec3 curves(vec3 c){
  c=clamp(c,0.,1.);
  return vec3(texture2D(crv,vec2((c.r*255.+.5)/256.,.5)).r,texture2D(crv,vec2((c.g*255.+.5)/256.,.5)).g,texture2D(crv,vec2((c.b*255.+.5)/256.,.5)).b);
}
vec3 lut(vec3 c){
  float s=lutN-1.0;c=clamp(c,0.,1.)*s;
  float b0=floor(c.b),b1=min(b0+1.,s),fb=c.b-b0,W=lutN*lutN;
  vec2 u0=vec2((b0*lutN+c.r+.5)/W,(c.g+.5)/lutN);
  vec2 u1=vec2((b1*lutN+c.r+.5)/W,(c.g+.5)/lutN);
  return mix(texture2D(lutT,u0).rgb,texture2D(lutT,u1).rgb,fb);
}
float soft(vec2 uv){
  float a=texture2D(msk,uv).r;
  if(mfeat<.5)return a;
  for(int i=0;i<8;i++){
    float t=float(i)*.785398;
    vec2 d=vec2(cos(t),sin(t))*mfeat*mpx;
    a+=texture2D(msk,uv+d).r+texture2D(msk,uv+d*.5).r*.5;
  }
  return a/13.0;
}
float maskVal(vec2 uv){
  float m;
  vec2 p=vec2(uv.x,1.-uv.y)*res;
  if(mkind<1.5)m=soft(uv);
  else if(mkind<2.5){vec2 a=mg.xy*res,b=mg.zw*res,d=b-a;float t=clamp(dot(p-a,d)/max(dot(d,d),1.),0.,1.);m=1.-smoothstep(0.,1.,t);}
  else if(mkind<3.5){vec2 q=(p-mg.xy*res)/max(mg.zw*res,vec2(1.));float f=clamp(mfeat,.02,1.);m=1.-smoothstep(1.-f,1.,length(q));}
  else{
    vec2 a=mg.xy*res,b=mg.zw*res,d=b-a;float len=max(length(d),1.);
    vec2 pr=vec2(-d.y,d.x)/len;float dist=abs(dot(p-a,pr)),hw=max(mwid*max(res.x,res.y),1.);
    m=smoothstep(hw,hw*2.5,dist);
  }
  return minv>.5?1.-m:m;
}
void main(){
  vec3 c=texture2D(src,v).rgb;
  if(pass>3.5){gl_FragColor=vec4(c,1.);return;}
  if(pass<.5){
    if(dnl>0.||dnc>0.)c=denoise(c);
    if(defr>.5)c=defringe(c);
    if(texr!=0.){
      vec3 bt=vec3(0.);
      for(int i=0;i<8;i++){float t=float(i)*.785398;bt+=texture2D(src,v+vec2(cos(t),sin(t))*px*rad.z).rgb;}
      bt/=8.;c=clamp(c+(c-bt)*texr*1.3,0.,1.);
    }
    if(shrp>0.||clar!=0.){
      vec3 bs=vec3(0.),bc=vec3(0.),bf=vec3(0.);
      for(int i=0;i<8;i++){
        float t=float(i)*.785398;vec2 d=vec2(cos(t),sin(t));
        bs+=texture2D(src,v+d*px*rad.x).rgb;
        bc+=texture2D(src,v+d*px*rad.y).rgb;
      }
      for(int i=0;i<4;i++){
        float t=float(i)*1.570796+.785398;
        bf+=texture2D(src,v+vec2(cos(t),sin(t))*px*rad.x*.5).rgb;
      }
      bs/=8.;bc/=8.;bf/=4.;
      float lm=dot(c,LUMA);
      if(shrp>0.){
        float em=mix(1.,smoothstep(.004,.04,abs(dot(c-bs,LUMA))),shrm);
        c+=((c-bs)+(c-bf)*shrd)*shrp*1.3*em;
      }
      c+=(c-bc)*clar*.9*clamp(1.-abs(lm-.5)*1.5,0.,1.);
      c=clamp(c,0.,1.);
    }
    if(dehz!=0.){
      float dk=min(min(c.r,c.g),c.b);
      if(dehz>0.){float t=dehz*.6*dk;c=(c-t)/(1.-t);}
      else c=mix(c,vec3(.78),-dehz*.35);
    }
    c=adj(c,uA,uB,uC);
  }else if(pass<1.5){
    float m=maskVal(v);
    vec3 s=c;
    if(ublur>.5&&m>.004)s=disc(v,ublur);
    c=mix(c,adj(s,uA,uB,uC),m);
  }else if(pass<2.5){
    if(useHsl>.5)c=hslMix(c);
    if(bwOn>.5)c=bw(c);
    if(useGrade>.5)c=grade(c);
    if(useCrv>.5)c=curves(c);
    if(lutOn>.5)c=mix(c,lut(c),lutAmt);
    c=c*(1.-fade*.25)+fade*.1;
  }else{
    float m=maskVal(v);
    c=mix(c,vec3(1.,.25,.35),m*.55);
  }
  gl_FragColor=vec4(clamp(c,0.,1.),1.);
}`;
let prog,imgTex,blank,lutTex,crvTex;const UL={};
const U=n=>(n in UL)?UL[n]:(UL[n]=gl.getUniformLocation(prog,n));
const fbo=[null,null],fboT=[null,null];let fW=0,fH=0;
function mk(){const t=gl.createTexture();gl.activeTexture(gl.TEXTURE7);gl.bindTexture(gl.TEXTURE_2D,t);
  for(const [k,v] of [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v);return t}
function px1(t){gl.activeTexture(gl.TEXTURE7);gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0,255]))}
function initGL(){
  const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o));return o};
  prog=gl.createProgram();gl.attachShader(prog,sh(gl.VERTEX_SHADER,VS));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(prog);gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const pl=gl.getAttribLocation(prog,'p');gl.enableVertexAttribArray(pl);gl.vertexAttribPointer(pl,2,gl.FLOAT,false,0,0);
  imgTex=mk();blank=mk();px1(blank);lutTex=mk();px1(lutTex);crvTex=mk();px1(crvTex);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,blank);
  gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,lutTex);
  gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,crvTex);
  gl.uniform1i(U('msk'),0);gl.uniform1i(U('lutT'),1);gl.uniform1i(U('crv'),2);gl.uniform1i(U('src'),3);
  gl.uniform1fv(U('hcen'),new Float32Array([0,30,60,120,180,240,270,300].map(x=>x/360)));
}
function ensureFBO(w,h){
  if(fW===w&&fH===h&&fbo[0])return;fW=w;fH=h;
  for(let i=0;i<2;i++){
    if(!fboT[i]){fboT[i]=mk();fbo[i]=gl.createFramebuffer()}
    gl.activeTexture(gl.TEXTURE7);gl.bindTexture(gl.TEXTURE_2D,fboT[i]);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
    gl.bindFramebuffer(gl.FRAMEBUFFER,fbo[i]);
    gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,fboT[i],0);
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);
}
const mtex=new Map();
function maskTex(m){
  let e=mtex.get(m.id);if(!e){e={t:mk(),r:null,v:-1};mtex.set(m.id,e)}
  if(e.r!==m.d||e.v!==m.v){
    gl.activeTexture(gl.TEXTURE7);gl.bindTexture(gl.TEXTURE_2D,e.t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.LUMINANCE,MW,MH,0,gl.LUMINANCE,gl.UNSIGNED_BYTE,m.d);
    e.r=m.d;e.v=m.v;
  }
  return e.t;
}
/* ---- curves ---- */
function curveFn(pts){
  const p=[...pts].sort((a,b)=>a[0]-b[0]),n=p.length,dx=[],m=[],t=[];
  for(let i=0;i<n-1;i++){dx[i]=Math.max(1e-4,p[i+1][0]-p[i][0]);m[i]=(p[i+1][1]-p[i][1])/dx[i]}
  t[0]=m[0];t[n-1]=m[n-2];
  for(let i=1;i<n-1;i++)t[i]=m[i-1]*m[i]<=0?0:(m[i-1]+m[i])/2;
  for(let i=0;i<n-1;i++){
    if(m[i]===0){t[i]=t[i+1]=0}
    else{const a=t[i]/m[i],b=t[i+1]/m[i],s=a*a+b*b;if(s>9){const k=3/Math.sqrt(s);t[i]=k*a*m[i];t[i+1]=k*b*m[i]}}
  }
  return x=>{
    if(x<=p[0][0])return p[0][1];if(x>=p[n-1][0])return p[n-1][1];
    let i=0;while(x>p[i+1][0])i++;
    const h=dx[i],s=(x-p[i][0])/h,s2=s*s,s3=s2*s;
    return clamp((2*s3-3*s2+1)*p[i][1]+(s3-2*s2+s)*h*t[i]+(-2*s3+3*s2)*p[i+1][1]+(s3-s2)*h*t[i+1]);
  };
}
const crvActive=()=>Object.values(S.crv).some(p=>p.length!==2||p[0][0]!==0||p[0][1]!==0||p[1][0]!==1||p[1][1]!==1);
function syncCrv(){
  if(!crvDirty)return;crvDirty=false;
  const fm=curveFn(S.crv.rgb),fr=curveFn(S.crv.r),fg=curveFn(S.crv.g),fb=curveFn(S.crv.b),d=new Uint8Array(1024);
  for(let i=0;i<256;i++){const m=fm(i/255);d[i*4]=fr(m)*255+.5;d[i*4+1]=fg(m)*255+.5;d[i*4+2]=fb(m)*255+.5;d[i*4+3]=255}
  gl.activeTexture(gl.TEXTURE7);gl.bindTexture(gl.TEXTURE_2D,crvTex);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,256,1,0,gl.RGBA,gl.UNSIGNED_BYTE,d);
}
/* ---- LUT looks ---- */
const P=o=>({gain:[1,1,1],con:1,gam:1,sat:1,sh:[0,0,0],hi:[0,0,0],fade:0,mono:false,tone:[1,1,1],...o});
const PRESETS=[
 {id:'vivid',name:'Vivid',g:P({con:1.1,sat:1.35,gam:.97})},
 {id:'golden',name:'Golden Hour',g:P({gain:[1.08,1,.86],sh:[.02,.01,-.015],hi:[.045,.02,-.03],con:1.06,sat:1.12})},
 {id:'teal',name:'Teal & Orange',g:P({sh:[-.035,.02,.055],hi:[.055,.02,-.05],con:1.12,sat:1.1})},
 {id:'kodak',name:'Kodak 200',g:P({gain:[1.05,1,.93],sh:[0,.015,.02],hi:[.03,.012,-.02],con:1.08,fade:.035})},
 {id:'matte',name:'Matte',g:P({con:.93,sat:.85,fade:.07})},
 {id:'moody',name:'Moody',g:P({gain:[.95,.98,1.04],sh:[-.01,.012,.04],con:1.2,sat:.8,gam:1.12})},
 {id:'cine',name:'Cinematic',g:P({sh:[-.02,.03,.06],hi:[.055,0,-.04],con:1.18,sat:.92,gam:1.04})},
 {id:'pastel',name:'Pastel',g:P({gain:[1.04,1.02,1.06],sat:.78,gam:.9,fade:.05,con:.94})},
 {id:'breeze',name:'Cool Breeze',g:P({gain:[.93,1,1.09],hi:[-.01,.012,.035],sat:1.05,con:1.05})},
 {id:'vintage',name:'Vintage',g:P({gain:[1.07,.98,.84],fade:.07,sat:.85,con:.95,sh:[.02,0,-.01]})},
 {id:'rose',name:'Rosé',g:P({gain:[1.07,.96,1.02],sh:[.02,-.01,.015],sat:1.06,fade:.03,gam:.96})},
 {id:'forest',name:'Forest',g:P({gain:[.96,1.03,.94],sh:[-.01,.03,0],hi:[0,.03,-.02],sat:1.1,con:1.06})},
 {id:'neon',name:'Neon',g:P({gain:[1.06,.94,1.1],sh:[.04,-.02,.08],hi:[.07,0,.02],con:1.15,sat:1.25})},
 {id:'lux',name:'Clean Bright',g:P({gam:.9,con:1.08,sat:1.08})},
 {id:'noir',name:'Noir B&W',g:P({mono:true,con:1.4,gam:1.06})},
 {id:'silver',name:'Silver B&W',g:P({mono:true,con:1.05,fade:.05,tone:[.98,1,1.03]})},
 {id:'sepia',name:'Sepia',g:P({mono:true,con:1.05,fade:.04,tone:[1.08,.93,.72]})}
];
function gradeRGB(r,g,b,p){
  let c=[r*p.gain[0],g*p.gain[1],b*p.gain[2]].map(x=>clamp((x-.5)*p.con+.5)).map(x=>Math.pow(x,p.gam));
  const l=.2126*c[0]+.7152*c[1]+.0722*c[2];
  c=p.mono?[l*p.tone[0],l*p.tone[1],l*p.tone[2]]:c.map(x=>l+(x-l)*p.sat);
  const sw=(1-l)*(1-l),hw=l*l;
  return c.map((x,i)=>clamp(p.fade+(x+p.sh[i]*sw+p.hi[i]*hw)*(1-p.fade)));
}
function buildLut(p,N){
  const d=new Uint8ClampedArray(N*N*N*4);
  for(let b=0;b<N;b++)for(let g=0;g<N;g++)for(let r=0;r<N;r++){
    const o=gradeRGB(r/(N-1),g/(N-1),b/(N-1),p),i=(g*N*N+b*N+r)*4;
    d[i]=o[0]*255;d[i+1]=o[1]*255;d[i+2]=o[2]*255;d[i+3]=255;
  }
  return new Uint8Array(d.buffer);
}
function parseCube(txt){
  let N=0;const v=[];
  for(const line of txt.split(/\r?\n/)){
    const t=line.trim();if(!t||t[0]==='#')continue;
    if(t.startsWith('LUT_3D_SIZE')){N=parseInt(t.split(/\s+/)[1]);continue}
    if(t.startsWith('LUT_1D_SIZE'))throw new Error('1D LUTs are not supported');
    if(!/^[-+.\d]/.test(t))continue;
    const q=t.split(/\s+/).map(Number);if(q.length>=3&&q.every(x=>!isNaN(x)))v.push(q[0],q[1],q[2]);
  }
  if(!N||v.length!==N*N*N*3)throw new Error('Invalid .cube file');
  const M=Math.min(N,33),d=new Uint8ClampedArray(M*M*M*4);
  for(let b=0;b<M;b++)for(let g=0;g<M;g++)for(let r=0;r<M;r++){
    const si=(Math.round(b*(N-1)/(M-1))*N*N+Math.round(g*(N-1)/(M-1))*N+Math.round(r*(N-1)/(M-1)))*3,i=(g*M*M+b*M+r)*4;
    d[i]=v[si]*255;d[i+1]=v[si+1]*255;d[i+2]=v[si+2]*255;d[i+3]=255;
  }
  return {N:M,data:new Uint8Array(d.buffer)};
}
let lutUploaded=null,lutNcur=25;const lutCache={};
function syncLut(){
  const id=S.look.id;if(id===lutUploaded)return;lutUploaded=id;if(id==='none')return;
  let d,N;
  if(id==='custom'&&customLut){d=customLut.data;N=customLut.N}
  else{const p=PRESETS.find(x=>x.id===id);if(!p)return;N=25;d=lutCache[id]||(lutCache[id]=buildLut(p.g,N))}
  gl.activeTexture(gl.TEXTURE7);gl.bindTexture(gl.TEXTURE_2D,lutTex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,N*N,N,0,gl.RGBA,gl.UNSIGNED_BYTE,d);lutNcur=N;
}
/* ---- passes ---- */
function setAdj(o){
  gl.uniform4f(U('uA'),o.exposure,o.contrast,o.highlights,o.shadows);
  gl.uniform4f(U('uB'),o.whites,o.blacks,o.temp,o.tint);
  gl.uniform4f(U('uC'),o.vibrance,o.saturation,0,0);
}
function passUniforms(p){
  const f=S.fx,mx=Math.max(SW,SH),t=p.t;
  gl.uniform1f(U('pass'),t);
  gl.uniform2f(U('px'),1/SW,1/SH);gl.uniform2f(U('mpx'),1/MW,1/MH);gl.uniform2f(U('res'),SW,SH);
  gl.uniform3f(U('rad'),mx*.0006*f.shrRad,mx*.004,mx*.0016);
  if(t===0){
    setAdj(S.G);
    gl.uniform1f(U('clar'),f.clarity);gl.uniform1f(U('texr'),f.texture);gl.uniform1f(U('shrp'),f.sharpen);
    gl.uniform1f(U('shrd'),f.shrDet);gl.uniform1f(U('shrm'),f.shrMask);gl.uniform1f(U('dehz'),f.dehaze);
    gl.uniform1f(U('dnl'),f.dnL);gl.uniform1f(U('dnc'),f.dnC);gl.uniform1f(U('defr'),f.defr?1:0);
  }else if(t===1||t===3){
    const m=p.m,g=m.g;
    if(t===1){setAdj(m.adj);gl.uniform1f(U('ublur'),(m.adj.blur||0)*mx*.012)}
    gl.uniform1f(U('mkind'),m.type==='linear'?2:m.type==='radial'?3:m.type==='tilt'?4:1);
    gl.uniform1f(U('minv'),m.inv?1:0);gl.uniform1f(U('mfeat'),m.f);
    gl.uniform1f(U('mwid'),m.type==='tilt'?g.w:0);
    gl.uniform4f(U('mg'),...(isLine(m)?[g.x0,g.y0,g.x1,g.y1]:m.type==='radial'?[g.cx,g.cy,g.rx,g.ry]:[0,0,0,0]));
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,m.d?maskTex(m):blank);
  }else if(t===2){
    gl.uniform1f(U('useHsl'),S.hsl.some(x=>x)?1:0);gl.uniform3fv(U('hsl'),new Float32Array(S.hsl));
    gl.uniform1f(U('bwOn'),S.bw.on?1:0);gl.uniform1fv(U('bwv'),new Float32Array(S.bw.v));gl.uniform2f(U('bwT'),S.bw.th/360,S.bw.ta);
    const gr=S.gr,gu=r=>[r.h/360,r.s,r.l];
    gl.uniform1f(U('useGrade'),[gr.sh,gr.mi,gr.hi].some(r=>r.s||r.l)?1:0);
    gl.uniform3f(U('gS'),...gu(gr.sh));gl.uniform3f(U('gM'),...gu(gr.mi));gl.uniform3f(U('gH'),...gu(gr.hi));
    gl.uniform1f(U('useCrv'),crvActive()?1:0);
    gl.uniform1f(U('lutOn'),S.look.id!=='none'?1:0);gl.uniform1f(U('lutAmt'),S.look.amt/100);gl.uniform1f(U('lutN'),lutNcur);
    gl.uniform1f(U('fade'),f.fade);
  }
}
function renderGL(full){
  const sc=full?1:Math.min(1,1280/Math.max(SW,SH)),w=Math.round(SW*sc),h=Math.round(SH*sc);
  if(wc.width!==w||wc.height!==h){wc.width=w;wc.height=h}
  ensureFBO(w,h);gl.viewport(0,0,w,h);syncLut();syncCrv();
  const sm=selMask();let ps;
  if(comparing)ps=[{t:4}];
  else{
    ps=[{t:0}];
    for(const m of S.masks)if(nz(m.adj))ps.push({t:1,m});
    ps.push({t:2});
    if(tab==='masks'&&overlayOn&&sm)ps.push({t:3,m:sm});
  }
  let st=imgTex,fi=0;
  ps.forEach((p,i)=>{
    const last=i===ps.length-1;
    gl.bindFramebuffer(gl.FRAMEBUFFER,last?null:fbo[fi]);
    gl.activeTexture(gl.TEXTURE3);gl.bindTexture(gl.TEXTURE_2D,st);
    passUniforms(p);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    if(!last){st=fboT[fi];fi^=1}
  });
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);
}

/* ================= geometry + compose ================= */
const frameDims=()=>S.geo.rot%2?[SH,SW]:[SW,SH];
function autoScale(){
  const [Rw,Rh]=frameDims(),t=Math.abs(S.geo.angle*Math.PI/180),c=Math.cos(t),s=Math.sin(t);
  return Math.max(1,(Rw/2*c+Rh/2*s)/(Rw/2),(Rw/2*s+Rh/2*c)/(Rh/2));
}
function drawPhoto(ctx,cr,k){
  const [Rw,Rh]=frameDims(),cw=cr.w*Rw,ch=cr.h*Rh,ccx=(cr.x+cr.w/2-.5)*Rw,ccy=(cr.y+cr.h/2-.5)*Rh;
  ctx.save();ctx.scale(k,k);ctx.translate(cw/2-ccx,ch/2-ccy);
  ctx.rotate(S.geo.angle*Math.PI/180);const s=autoScale();ctx.scale(s,s);
  ctx.rotate(S.geo.rot*Math.PI/2);ctx.scale(S.geo.flip?-1:1,1);
  ctx.imageSmoothingQuality='high';ctx.drawImage(wc,-SW/2,-SH/2,SW,SH);ctx.restore();
}
function margins(pw,ph){
  const F=S.frame,u=Math.min(pw,ph)*F.size/100;
  switch(F.style){
    case 'border':case 'double':case 'blur':return [u,u,u,u];
    case 'polaroid':return [u,u,u*3.4,u];
    case 'film':return [u*2.2,u*.9,u*2.2,u*.9];
    case 'square':{const side=Math.max(pw,ph)+2*u,dx=(side-pw)/2,dy=(side-ph)/2;return [dy,dx,dy,dx]}
    default:return [0,0,0,0];
  }
}
function natural(){
  const [Rw,Rh]=frameDims(),c=S.geo.crop,pw=c.w*Rw,ph=c.h*Rh,m=margins(pw,ph);
  return {pw,ph,m,tw:pw+m[1]+m[3],th:ph+m[0]+m[2]};
}
function rr(c,x,y,w,h,r){r=Math.min(r,w/2,h/2);c.beginPath();if(r<=0){c.rect(x,y,w,h);return}
  c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
const lum=h=>{const n=parseInt(h.slice(1),16);return .299*(n>>16)+.587*((n>>8)&255)+.114*(n&255)};
const mkGrain=fn=>{const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d'),d=x.createImageData(256,256);
  for(let i=0;i<d.data.length;i+=4){const v=255*fn();d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}x.putImageData(d,0,0);return c};
const grainCv=mkGrain(()=>(Math.random()+Math.random()+Math.random())/3);
const grainRough=mkGrain(Math.random);
const tmpC=document.createElement('canvas');
function applyFx(t,w,h){
  const F=S.fx,v=F.vignette;
  if(v){
    const k=Math.hypot(w,h)/2/Math.SQRT2,r=F.vigRound,sx=(w/2)*(1-r)+k*r,sy=(h/2)*(1-r)+k*r;
    const st=clamp(F.vigMid-F.vigFeather*.5,0,.98),en=clamp(F.vigMid+F.vigFeather*.5,st+.02,1),col=v<0?'0,0,0':'255,255,255';
    t.save();t.translate(w/2,h/2);t.scale(sx,sy);
    const g=t.createRadialGradient(0,0,0,0,0,Math.SQRT2);
    g.addColorStop(st,`rgba(${col},0)`);g.addColorStop(en,`rgba(${col},${Math.abs(v)*.9})`);
    t.fillStyle=g;t.fillRect(-4,-4,8,8);t.restore();
  }
  if(F.grain>0){
    t.save();t.globalCompositeOperation='overlay';
    const sc=Math.max(1,w/900)*F.grSize;
    for(const [cvs,wt] of [[grainCv,1-F.grRough],[grainRough,F.grRough]]){
      if(wt<=0)continue;
      const pat=t.createPattern(cvs,'repeat');
      try{pat.setTransform(new DOMMatrix().scale(sc))}catch{}
      t.globalAlpha=F.grain*.7*wt;t.fillStyle=pat;t.fillRect(0,0,w,h);
    }
    t.restore();
  }
}
function drawLogo(ctx,x,y,w,h){
  const L=S.logo,m=Math.min(w,h),pad=m*.04;let lw,lh,txt=null;
  ctx.save();ctx.globalAlpha=L.opacity/100;
  if(L.useImg){if(!logoImg)return ctx.restore();lw=m*L.size/100*2.2;lh=lw*logoImg.height/logoImg.width}
  else{if(!L.text.trim())return ctx.restore();const fs=m*L.size/100*.6;ctx.font=`600 ${fs}px system-ui,sans-serif`;try{ctx.letterSpacing=(fs*.08)+'px'}catch{}
    lw=ctx.measureText(L.text).width;lh=fs;txt=fs}
  const px_=L.pos[1]==='l'?x+pad:L.pos[1]==='r'?x+w-pad-lw:x+(w-lw)/2;
  const py_=L.pos[0]==='t'?y+pad:L.pos[0]==='b'?y+h-pad-lh:y+(h-lh)/2;
  if(txt){ctx.fillStyle='#fff';ctx.textBaseline='top';ctx.shadowColor='rgba(0,0,0,.45)';ctx.shadowBlur=txt*.25;ctx.fillText(L.text,px_,py_)}
  else ctx.drawImage(logoImg,px_,py_,lw,lh);
  ctx.restore();
}
/* text / sticker / drawing items (coordinates normalised to the cropped photo) */
const FONTS=['system-ui,sans-serif','Georgia,serif','ui-monospace,Menlo,monospace','"Brush Script MT","Segoe Script",cursive','Impact,"Arial Black",sans-serif'];
const mctx=document.createElement('canvas').getContext('2d');
const fontOf=(it,fs)=>it.type==='sticker'?`${fs}px system-ui,"Apple Color Emoji","Noto Color Emoji",sans-serif`:`${it.font===4?800:600} ${fs}px ${FONTS[it.font]}`;
function itemBox(it,mn){const fs=it.size/100*mn;mctx.font=fontOf(it,100);return{w:mctx.measureText(it.text).width*fs/100,h:fs*1.2}}
function drawItems(ctx,x0,y0,pw,ph,ui){
  const mn=Math.min(pw,ph);
  S.items.forEach((it,i)=>{
    if(it.type==='draw'){
      ctx.save();ctx.strokeStyle=it.color;ctx.lineWidth=it.w/100*mn;ctx.lineCap=ctx.lineJoin='round';ctx.beginPath();
      it.pts.forEach(([x,y],j)=>{const X=x0+x*pw,Y=y0+y*ph;j?ctx.lineTo(X,Y):ctx.moveTo(X,Y)});
      if(it.pts.length===1){const [x,y]=it.pts[0];ctx.lineTo(x0+x*pw+.01,y0+y*ph)}
      ctx.stroke();ctx.restore();return;
    }
    const fs=it.size/100*mn,X=x0+it.x*pw,Y=y0+it.y*ph;
    ctx.save();ctx.font=fontOf(it,fs);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=it.color;
    if(it.type==='text'){ctx.shadowColor='rgba(0,0,0,.35)';ctx.shadowBlur=fs*.12}
    ctx.fillText(it.text,X,Y);ctx.restore();
    if(ui&&tab==='add'&&i===selItem){
      const b=itemBox(it,mn);ctx.save();ctx.strokeStyle='#0a84ff';ctx.lineWidth=Math.max(1.5,mn*.004);ctx.setLineDash([mn*.01,mn*.01]);
      ctx.strokeRect(X-b.w/2-fs*.1,Y-b.h/2,b.w+fs*.2,b.h);ctx.restore();
    }
  });
}
function compose(ctx,ow,oh,mode,ui){
  ctx.clearRect(0,0,ow,oh);
  if(mode==='raw'){ctx.drawImage(wc,0,0,ow,oh);return}
  if(mode==='crop'){drawPhoto(ctx,{x:0,y:0,w:1,h:1},ow/frameDims()[0]);return}
  const n=natural(),k=ow/n.tw,F=S.frame,st=F.style;
  const pwd=n.pw*k,phd=n.ph*k,x0=n.m[3]*k,y0=n.m[0]*k;
  const tw=Math.max(1,Math.round(pwd)),th=Math.max(1,Math.round(phd));
  if(tmpC.width!==tw||tmpC.height!==th){tmpC.width=tw;tmpC.height=th}
  const t=tmpC.getContext('2d');t.clearRect(0,0,tw,th);
  drawPhoto(t,S.geo.crop,tw/n.pw);
  if(!comparing)applyFx(t,tw,th);
  const fancy=st==='blur'||st==='square';
  if(fancy){
    ctx.save();try{ctx.filter=`blur(${Math.max(4,ow*.02)}px) brightness(.88)`}catch{}
    const sc=Math.max(ow/tw,oh/th)*1.15,dw=tw*sc,dh=th*sc;ctx.drawImage(tmpC,(ow-dw)/2,(oh-dh)/2,dw,dh);ctx.restore();
  }else if(st!=='none'){ctx.fillStyle=st==='film'?'#0e0e10':F.color;ctx.fillRect(0,0,ow,oh)}
  const rad=st==='none'?0:Math.min(pwd,phd)*F.radius/100*.5;
  ctx.save();rr(ctx,x0,y0,pwd,phd,rad);
  if(fancy||(st!=='none'&&rad>0)){ctx.shadowColor='rgba(0,0,0,.4)';ctx.shadowBlur=ow*.03;ctx.shadowOffsetY=ow*.008;ctx.fillStyle='#000';ctx.fill();ctx.shadowColor='transparent'}
  ctx.clip();ctx.drawImage(tmpC,x0,y0,pwd,phd);ctx.restore();
  const u=Math.min(n.pw,n.ph)*F.size/100*k;
  if(st==='double'){ctx.strokeStyle=lum(F.color)>150?'rgba(20,20,20,.85)':'rgba(255,255,255,.85)';ctx.lineWidth=Math.max(1,u*.05);ctx.strokeRect(u*.5,u*.5,ow-u,oh-u)}
  if(st==='film'&&u>2){
    ctx.fillStyle='#f3efe4';const hw=u*.9,hh=u*.7,step=u*1.8;
    for(let x=step*.4;x<ow-hw;x+=step){rr(ctx,x,n.m[0]*k/2-hh/2,hw,hh,hh*.25);ctx.fill();rr(ctx,x,oh-n.m[2]*k/2-hh/2,hw,hh,hh*.25);ctx.fill()}
  }
  if(S.logo.on)drawLogo(ctx,x0,y0,pwd,phd);
  drawItems(ctx,x0,y0,pwd,phd,ui);
}

/* ================= display ================= */
let raf=0,glDirty=true;
const cv=$('#cv'),stage=$('#stage');
const redraw=(g=false)=>{if(g)glDirty=true;if(!raf)raf=requestAnimationFrame(show)};
function show(){
  raf=0;if(!loaded)return;
  if(glDirty){renderGL(false);glDirty=false}
  const mode=tab==='crop'?'crop':tab==='masks'?'raw':'final';
  let tw,th;
  if(mode==='raw'){tw=SW;th=SH}else if(mode==='crop'){[tw,th]=frameDims()}else{const n=natural();tw=n.tw;th=n.th}
  const aw=stage.clientWidth-24,ah=stage.clientHeight-24;if(aw<=0||ah<=0)return;
  const f=Math.min(aw/tw,ah/th),cw=Math.max(8,tw*f),ch=Math.max(8,th*f),dpr=Math.min(devicePixelRatio||1,2.5);
  const bw=Math.round(cw*dpr),bh=Math.round(ch*dpr);
  if(cv.width!==bw||cv.height!==bh){cv.width=bw;cv.height=bh}
  cv.style.width=cw+'px';cv.style.height=ch+'px';
  const ctx=cv.getContext('2d');ctx.setTransform(1,0,0,1,0,0);compose(ctx,bw,bh,mode,true);
  if(mode==='crop')cropOverlay(ctx,bw,bh);
  if(mode==='raw')maskHandles(ctx,bw,bh);
}
new ResizeObserver(()=>redraw()).observe(stage);

/* ================= crop ================= */
const ASPECTS=[['free','Free'],['orig','Original'],['1:1','1:1'],['4:5','4:5'],['5:4','5:4'],['3:4','3:4'],['4:3','4:3'],['9:16','9:16'],['16:9','16:9'],['3:2','3:2'],['2:3','2:3']];
function aspectVal(){const k=S.geo.aspect,[Rw,Rh]=frameDims();if(k==='orig')return Rw/Rh;const [a,b]=k.split(':').map(Number);return a/b}
function setAspect(k){
  S.geo.aspect=k;if(k==='free')return;
  const [Rw,Rh]=frameDims(),a=aspectVal();let w=1,h=Rw/(a*Rh);if(h>1){h=1;w=a*Rh/Rw}
  S.geo.crop={x:(1-w)/2,y:(1-h)/2,w,h};
}
function rotate90(d){pushHist();S.geo.rot=(S.geo.rot+d+4)%4;S.geo.crop={x:0,y:0,w:1,h:1};if(S.geo.aspect!=='free')setAspect(S.geo.aspect);redraw()}
function cropOverlay(ctx,w,h){
  const c=S.geo.crop,x=c.x*w,y=c.y*h,rw=c.w*w,rh=c.h*h,d=w/cv.clientWidth;
  ctx.fillStyle='rgba(0,0,0,.6)';ctx.beginPath();ctx.rect(0,0,w,h);ctx.rect(x,y,rw,rh);ctx.fill('evenodd');
  ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=d;ctx.beginPath();
  for(let i=1;i<3;i++){ctx.moveTo(x+rw*i/3,y);ctx.lineTo(x+rw*i/3,y+rh);ctx.moveTo(x,y+rh*i/3);ctx.lineTo(x+rw,y+rh*i/3)}ctx.stroke();
  ctx.strokeStyle='#fff';ctx.lineWidth=1.2*d;ctx.strokeRect(x,y,rw,rh);
  ctx.lineWidth=3.5*d;const L=Math.min(22*d,rw/3,rh/3);ctx.beginPath();
  for(const [cx,cy,sx,sy] of [[x,y,1,1],[x+rw,y,-1,1],[x,y+rh,1,-1],[x+rw,y+rh,-1,-1]]){ctx.moveTo(cx+sx*L,cy);ctx.lineTo(cx,cy);ctx.lineTo(cx,cy+sy*L)}ctx.stroke();
}
function cropHit(u,v){
  const c=S.geo.crop,r=cv.getBoundingClientRect(),tx=32/r.width,ty=32/r.height,L=c.x,R=c.x+c.w,T=c.y,B=c.y+c.h;
  const nl=Math.abs(u-L)<tx,nr=Math.abs(u-R)<tx,nt=Math.abs(v-T)<ty,nb=Math.abs(v-B)<ty;
  const near=u>L-tx&&u<R+tx&&v>T-ty&&v<B+ty;
  if(near){
    if((nl||nr)&&(nt||nb))return(nt?'t':'b')+(nl?'l':'r');
    if(S.geo.aspect==='free'){if(nl)return'l';if(nr)return'r';if(nt)return't';if(nb)return'b'}
  }
  return(u>L&&u<R&&v>T&&v<B)?'move':null;
}
function cropUpdate(hd,s,du,dv){
  const [Rw,Rh]=frameDims();
  if(hd==='move')return{x:clamp(s.x+du,0,1-s.w),y:clamp(s.y+dv,0,1-s.h),w:s.w,h:s.h};
  if(S.geo.aspect!=='free'){
    const a=aspectVal(),dx=hd.includes('l')?-1:1,dy=hd.includes('t')?-1:1;
    const ax=dx<0?s.x+s.w:s.x,ay=dy<0?s.y+s.h:s.y,mx=(dx<0?s.x:s.x+s.w)+du,my=(dy<0?s.y:s.y+s.h)+dv,q=a*Rh/Rw;
    let W=Math.max(Math.max(0,dx*(mx-ax)),Math.max(0,dy*(my-ay))*q);
    W=Math.max(.06,Math.min(W,dx<0?ax:1-ax,(dy<0?ay:1-ay)*q));const H=W/q;
    return{x:dx<0?ax-W:ax,y:dy<0?ay-H:ay,w:W,h:H};
  }
  let L=s.x,R=s.x+s.w,T=s.y,B=s.y+s.h;
  if(hd.includes('l'))L=clamp(L+du,0,R-.06);
  if(hd.includes('r'))R=clamp(R+du,L+.06,1);
  if(hd.includes('t'))T=clamp(T+dv,0,B-.06);
  if(hd.includes('b'))B=clamp(B+dv,T+.06,1);
  return{x:L,y:T,w:R-L,h:B-T};
}

/* ================= mask geometry handles ================= */
function maskHandles(ctx,w,h){
  const m=selMask();if(tab!=='masks'||!m||(!isLine(m)&&m.type!=='radial'))return;
  const d=w/cv.clientWidth,g=m.g;ctx.save();ctx.lineWidth=1.5*d;ctx.strokeStyle='#fff';ctx.fillStyle='#0a84ff';
  const dot=(x,y)=>{ctx.beginPath();ctx.arc(x*w,y*h,9*d,0,7);ctx.fill();ctx.stroke()};
  if(isLine(m)){
    if(m.type==='tilt'){
      const dx=(g.x1-g.x0)*w,dy=(g.y1-g.y0)*h,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,off=g.w*Math.max(w,h),nx=-uy*off,ny=ux*off,big=Math.max(w,h)*2;
      ctx.save();ctx.setLineDash([6*d,6*d]);ctx.globalAlpha=.8;
      for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(g.x0*w-ux*big+nx*s,g.y0*h-uy*big+ny*s);ctx.lineTo(g.x1*w+ux*big+nx*s,g.y1*h+uy*big+ny*s);ctx.stroke()}
      ctx.restore();
    }
    ctx.beginPath();ctx.moveTo(g.x0*w,g.y0*h);ctx.lineTo(g.x1*w,g.y1*h);ctx.stroke();dot(g.x0,g.y0);dot(g.x1,g.y1);
  }
  else{ctx.beginPath();ctx.ellipse(g.cx*w,g.cy*h,g.rx*w,g.ry*h,0,0,7);ctx.stroke();dot(g.cx,g.cy);dot(g.cx+g.rx,g.cy);dot(g.cx,g.cy+g.ry)}
  ctx.restore();
}
function geoHit(m,u,v){
  const r=cv.getBoundingClientRect(),g=m.g,P2=(x,y)=>[x*r.width,y*r.height],p=P2(u,v),T=30;
  const near=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])<T;
  if(isLine(m)){
    const a=P2(g.x0,g.y0),b=P2(g.x1,g.y1);if(near(p,a))return'a';if(near(p,b))return'b';
    const dx=b[0]-a[0],dy=b[1]-a[1],t=clamp(((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1));
    return Math.hypot(a[0]+dx*t-p[0],a[1]+dy*t-p[1])<T?'move':null;
  }
  const c=P2(g.cx,g.cy),R=P2(g.cx+g.rx,g.cy),D=P2(g.cx,g.cy+g.ry);
  if(near(p,R))return'r';if(near(p,D))return'd';
  const dd=Math.hypot((p[0]-c[0])/(g.rx*r.width||1),(p[1]-c[1])/(g.ry*r.height||1));
  return dd<1.15?'move':null;
}
function geoUpdate(m,h,s,du,dv){
  const g={...s};
  if(isLine(m)){
    if(h==='a'||h==='move'){g.x0=clamp(s.x0+du);g.y0=clamp(s.y0+dv)}
    if(h==='b'||h==='move'){g.x1=clamp(s.x1+du);g.y1=clamp(s.y1+dv)}
    return g;
  }
  if(h==='move'){g.cx=clamp(s.cx+du);g.cy=clamp(s.cy+dv)}
  if(h==='r')g.rx=clamp(s.rx+du,.02,1.5);
  if(h==='d')g.ry=clamp(s.ry+dv,.02,1.5);
  return g;
}

/* ================= pointer ================= */
const ring=$('#ring');let drag=null,stroke=null,drawing=null;
const uv=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height]};
const toPhoto=(u,v)=>{const n=natural();return[(u*n.tw-n.m[3])/n.pw,(v*n.th-n.m[0])/n.ph]};
function hitItem(x,y){
  const n=natural(),mn=Math.min(n.pw,n.ph),slop=mn*.03;
  for(let i=S.items.length-1;i>=0;i--){
    const it=S.items[i];if(it.type==='draw')continue;const b=itemBox(it,mn);
    if(Math.abs(x-it.x)*n.pw<b.w/2+slop&&Math.abs(y-it.y)*n.ph<b.h/2+slop)return i;
  }
  return -1;
}
function stamp(d,cx,cy,rad,add){
  const x0=Math.max(0,Math.floor(cx-rad)),x1=Math.min(MW-1,Math.ceil(cx+rad)),y0=Math.max(0,Math.floor(cy-rad)),y1=Math.min(MH-1,Math.ceil(cy+rad));
  for(let j=y0;j<=y1;j++)for(let i=x0;i<=x1;i++){
    const dd=Math.hypot(i-cx,j-cy);if(dd>rad)continue;
    const val=Math.round(255*Math.min(1,(rad-dd)/(rad*.4+.001))),idx=j*MW+i;
    if(add){if(val>d[idx])d[idx]=val}else{const t=255-val;if(t<d[idx])d[idx]=t}
  }
}
function strokeTo(e){
  const r=cv.getBoundingClientRect(),m=stroke.m,x=(e.clientX-r.left)/r.width*MW,y=(e.clientY-r.top)/r.height*MH,rad=brushSize/2*MW/r.width,add=brush==='add';
  if(stroke.x==null)stamp(m.d,x,y,rad,add);
  else{const dx=x-stroke.x,dy=y-stroke.y,n=Math.max(1,Math.ceil(Math.hypot(dx,dy)/(rad*.35)));for(let i=1;i<=n;i++)stamp(m.d,stroke.x+dx*i/n,stroke.y+dy*i/n,rad,add)}
  stroke.x=x;stroke.y=y;m.v++;redraw(true);
}
function moveRing(e){ring.style.width=ring.style.height=brushSize+'px';ring.style.left=e.clientX+'px';ring.style.top=e.clientY+'px';ring.style.display='block'}
cv.addEventListener('pointerdown',e=>{
  if(!loaded)return;const [u,v]=uv(e);
  if(tab==='crop'){
    const h=cropHit(u,v);if(h){drag={k:'crop',h,u,v,s:{...S.geo.crop},pend:snap(),moved:false};cv.setPointerCapture(e.pointerId)}
  }else if(tab==='masks'){
    if(pickMode){samPoint(u,v);return}
    const m=selMask();if(!m)return;
    if(isLine(m)||m.type==='radial'){
      const h=geoHit(m,u,v);if(h){drag={k:'geo',h,m,u,v,s:{...m.g},pend:snap(),moved:false};cv.setPointerCapture(e.pointerId)}
    }else if(brush!=='off'){
      pushHist();m.d=m.d?m.d.slice():new Uint8Array(MW*MH);
      stroke={x:null,y:null,m};cv.setPointerCapture(e.pointerId);moveRing(e);strokeTo(e);
    }
  }else if(tab==='add'){
    const [x,y]=toPhoto(u,v);
    if(addMode==='draw'){
      pushHist();drawing={type:'draw',pts:[[x,y]],color:drawCol,w:drawW};S.items.push(drawing);cv.setPointerCapture(e.pointerId);redraw();
    }else if(addMode!=='logo'){
      const i=hitItem(x,y);
      if(i>=0){selItem=i;const it=S.items[i];drag={k:'item',it,x,y,ox:it.x,oy:it.y,pend:snap(),moved:false};cv.setPointerCapture(e.pointerId);renderPanel()}
      else{selItem=-1;renderPanel()}
      redraw();
    }
  }
});
cv.addEventListener('pointermove',e=>{
  if(drag){
    const [u,v]=uv(e);
    if(drag.k==='crop'){
      const du=u-drag.u,dv=v-drag.v;if(!drag.moved&&Math.abs(du)+Math.abs(dv)>.002)commit(drag);
      S.geo.crop=cropUpdate(drag.h,drag.s,du,dv);redraw();
    }else if(drag.k==='geo'){
      const du=u-drag.u,dv=v-drag.v;if(!drag.moved&&Math.abs(du)+Math.abs(dv)>.002)commit(drag);
      drag.m.g=geoUpdate(drag.m,drag.h,drag.s,du,dv);redraw(true);
    }else if(drag.k==='item'){
      const [x,y]=toPhoto(u,v);if(!drag.moved&&Math.hypot(x-drag.x,y-drag.y)>.004)commit(drag);
      drag.it.x=drag.ox+(x-drag.x);drag.it.y=drag.oy+(y-drag.y);redraw();
    }
  }else if(stroke){moveRing(e);strokeTo(e)}
  else if(drawing){const [x,y]=toPhoto(...uv(e));drawing.pts.push([x,y]);redraw()}
});
const endDrag=()=>{drag=null;drawing=null;if(stroke){stroke=null;ring.style.display='none';renderPanel()}};
cv.addEventListener('pointerup',endDrag);cv.addEventListener('pointercancel',endDrag);

/* ================= UI components ================= */
function chips(items,val,on,mods){
  const r=el('div','hrow');
  for(const [k,l] of items){const b=el('button','chip',l);b.setAttribute('aria-pressed',String(k)===String(val));b.dataset.k=k;if(mods&&mods(k))b.classList.add('mod');b.onclick=()=>{buzz();on(k)};r.append(b)}
  return r;
}
function seg(items,val,on){
  const r=el('div','seg');
  for(const [k,l] of items){const b=el('button','',l);b.setAttribute('aria-pressed',k===val);b.onclick=()=>{buzz();on(k)};r.append(b)}
  return r;
}
const swRow=(list,val,on)=>{const r=el('div','hrow');for(const c of list){const b=el('button','sw'+(val===c?' on':''));b.style.background=c;b.setAttribute('aria-label',c);b.onclick=()=>{buzz();on(c)};r.append(b)}return r};
function slider({label,min,max,step=.01,get,set,def=0,fmt=v=>Math.round(v*100),center=0,after,glr=true,nohist=false,cls=''}){
  const w=el('div','sl',`<div class="slh"><span>${label}</span><button class="rs" aria-label="Reset">↺</button><output></output></div><input type="range">`);
  const i=w.querySelector('input'),o=w.querySelector('output'),rs=w.querySelector('.rs');
  i.min=min;i.max=max;i.step=step;if(cls)i.className=cls;let pending=null;
  const paint=()=>{const v=+i.value,p=x=>(x-min)/(max-min)*100,a=p(center),b=p(v);
    i.style.setProperty('--s',Math.min(a,b)+'%');i.style.setProperty('--e',Math.max(a,b)+'%');o.textContent=fmt(v);rs.classList.toggle('on',Math.abs(v-def)>1e-6)};
  i.value=get();paint();
  i.addEventListener('pointerdown',()=>{if(!nohist)pending=snap()});
  i.oninput=()=>{if(pending){hist.push(pending);if(hist.length>40)hist.shift();redoS.length=0;updHist();pending=null}
    set(+i.value);paint();after&&after();redraw(glr)};
  const reset=()=>{if(!nohist)pushHist();i.value=def;set(def);paint();after&&after();redraw(glr)};
rs.onclick=reset;
let lt=0,lx=0,dbl=false;
i.addEventListener('pointerdown',e=>{
  const n=Date.now();
  if(n-lt<350&&Math.abs(e.clientX-lx)<30){lt=0;dbl=true;pending=null}
  else{lt=n;lx=e.clientX;dbl=false}
});
i.addEventListener('pointerup',()=>{if(dbl){dbl=false;setTimeout(reset,0)}});
i.addEventListener('dblclick',()=>reset());
  return w;
}
function adjBlock(p,getO,defs,ck){
  const key=cur[ck],row=chips(defs,key,k=>{cur[ck]=k;renderPanel()},k=>getO()[k]!==0);
  p.append(row,slider({label:defs.find(d=>d[0]===key)[1],min:-1,max:1,get:()=>getO()[key],set:v=>getO()[key]=v,
    after:()=>row.querySelector(`[data-k="${key}"]`).classList.toggle('mod',getO()[key]!==0)}));
}

/* ================= panels ================= */
const LIGHT=[['exposure','Exposure'],['contrast','Contrast'],['highlights','Highlights'],['shadows','Shadows'],['whites','Whites'],['blacks','Blacks']];
const COLOR=[['temp','Temp'],['tint','Tint'],['vibrance','Vibrance'],['saturation','Saturation']];
/* Effects groups: [label, [[key,label,min,max,default],...]] */
const FXG={
 detail:['Detail',[['clarity','Clarity',-1,1,0],['texture','Texture',-1,1,0],['dehaze','Dehaze',-1,1,0]]],
 sharpen:['Sharpen',[['sharpen','Amount',0,1,0],['shrRad','Radius',.5,3,1],['shrDet','Detail',0,1,.5],['shrMask','Masking',0,1,0]]],
 denoise:['Denoise',[['dnL','Luminance',0,1,0],['dnC','Color',0,1,0]]],
 vignette:['Vignette',[['vignette','Amount',-1,1,0],['vigMid','Midpoint',0,1,.6],['vigFeather','Feather',0,1,.6],['vigRound','Roundness',0,1,.5]]],
 grain:['Grain',[['grain','Amount',0,1,0],['grSize','Size',.5,3,1],['grRough','Roughness',0,1,.5]]],
 finish:['Finish',[['fade','Fade',0,1,0]]]
};
const FXGL=new Set(['clarity','texture','dehaze','sharpen','shrRad','shrDet','shrMask','dnL','dnC','fade']);
const BANDS=[['Red','#ff453a'],['Orange','#ff9f0a'],['Yellow','#ffd60a'],['Green','#30d158'],['Aqua','#64d2ff'],['Blue','#0a84ff'],['Purple','#bf5af2'],['Magenta','#ff375f']];
const FRAMES=[['none','None'],['border','Border'],['polaroid','Polaroid'],['double','Double'],['film','Film'],['blur','Blur'],['square','Square']];
const SWATCH=['#ffffff','#f6f1e7','#d9c8a9','#b7c4a8','#f0cfd0','#8e8e93','#2c2c2e','#0b0b0b','#14213d','#c9a227'];
const TCOL=['#ffffff','#000000','#ff453a','#ff9f0a','#ffd60a','#30d158','#64d2ff','#0a84ff','#bf5af2','#ff375f'];
const STICKERS=['❤️','⭐','✨','🔥','😍','😎','🌈','☀️','🌙','🎉','🎈','💫','🌸','🍀','🦋','👑','💎','📍','✈️','☕','🎵','💯','👍','🙌'];

function panelLooks(){
  const p=el('div','col'),row=el('div','hrow');
  const items=[{id:'none',name:'Original'},...PRESETS];if(customLut)items.push({id:'custom',name:customLut.name});
  for(const it of items){
    const b=el('button','th'+(S.look.id===it.id?' on':''),`<img alt="" src="${thumbURL[it.id]||thumbURL.none||''}"><span>${it.name}</span>`);
    b.onclick=()=>{buzz();pushHist();S.look.id=it.id;if(it.id!=='none'&&S.look.amt===0)S.look.amt=100;renderPanel();redraw(true)};row.append(b);
  }
  const imp=el('button','th','<div class="imp">+</div><span>Import .cube</span>');imp.onclick=()=>$('#fLut').click();row.append(imp);
  p.append(row,slider({label:'Intensity',min:0,max:100,step:1,get:()=>S.look.amt,set:v=>S.look.amt=v,def:100,fmt:v=>Math.round(v),center:0}));
  return p;
}
function panelLight(){const p=el('div','col');adjBlock(p,()=>S.G,LIGHT,'light');return p}
function mixer(p){
  const dots=el('div','dots');
  BANDS.forEach(([n,c],i)=>{const b=el('button','dot'+(i===band?' on':''));b.style.background=c;b.setAttribute('aria-label',n);
    if(S.hsl.slice(i*3,i*3+3).some(x=>x))b.classList.add('mod');b.onclick=()=>{buzz();band=i;renderPanel()};dots.append(b)});
  const names=['Hue','Saturation','Luminance'],k=+cur.mix;
  p.append(dots,chips([['0','Hue'],['1','Saturation'],['2','Luminance']],cur.mix,v=>{cur.mix=v;renderPanel()}),
    slider({label:`${BANDS[band][0]} ${names[k]}`,min:-1,max:1,get:()=>S.hsl[band*3+k],set:v=>S.hsl[band*3+k]=v}));
}
function gradePanel(p){
  const R=S.gr[grRange],dh={sh:215,mi:40,hi:40}[grRange];
  p.append(seg([['sh','Shadows'],['mi','Midtones'],['hi','Highlights']],grRange,k=>{grRange=k;renderPanel()}),
    slider({label:'Hue',min:0,max:360,step:1,get:()=>R.h,set:v=>R.h=v,def:dh,fmt:v=>Math.round(v)+'°',center:0,cls:'hue'}),
    slider({label:'Saturation',min:0,max:1,get:()=>R.s,set:v=>R.s=v,def:0,center:0}),
    slider({label:'Luminance',min:-1,max:1,get:()=>R.l,set:v=>R.l=v}));
}
function bwPanel(p){
  const B=S.bw;
  p.append(seg([['off','Off'],['on','Black & white']],B.on?'on':'off',k=>{pushHist();B.on=k==='on';renderPanel();redraw(true)}));
  if(!B.on)return;
  const dots=el('div','dots');
  BANDS.forEach(([n,c],i)=>{const b=el('button','dot'+(i===bwBand?' on':''));b.style.background=c;b.setAttribute('aria-label',n);
    if(B.v[i])b.classList.add('mod');b.onclick=()=>{buzz();bwBand=i;renderPanel()};dots.append(b)});
  p.append(dots,
    slider({label:`${BANDS[bwBand][0]} brightness`,min:-1,max:1,get:()=>B.v[bwBand],set:v=>B.v[bwBand]=v}),
    slider({label:'Tone hue',min:0,max:360,step:1,get:()=>B.th,set:v=>B.th=v,def:35,fmt:v=>Math.round(v)+'°',cls:'hue'}),
    slider({label:'Tone amount',min:0,max:1,get:()=>B.ta,set:v=>B.ta=v,def:0,center:0}));
}
function panelColor(){
  const p=el('div','col');
  p.append(seg([['basic','Basic'],['mix','Mixer'],['grade','Grading'],['bw','B&W']],colorMode,k=>{colorMode=k;renderPanel(true)}));
  if(colorMode==='basic')adjBlock(p,()=>S.G,COLOR,'color');
  else if(colorMode==='mix')mixer(p);
  else if(colorMode==='grade')gradePanel(p);
  else bwPanel(p);
  return p;
}
function panelCurves(){
  const p=el('div','col');
  p.append(chips([['rgb','RGB'],['r','Red'],['g','Green'],['b','Blue']],crvCh,k=>{crvCh=k;renderPanel()}));
  const c=el('canvas','crvc');p.append(c);
  const rs=el('button','btn','Reset this curve');rs.onclick=()=>{pushHist();S.crv[crvCh]=flat();crvDirty=true;renderPanel();redraw(true)};p.append(rs);
  requestAnimationFrame(()=>curveUI(c));
  return p;
}
function curveUI(c){
  const dpr=Math.min(devicePixelRatio||1,2),W=c.clientWidth,H=c.clientHeight;if(!W)return;c.width=W*dpr;c.height=H*dpr;
  const g=c.getContext('2d'),col={rgb:'#ffffff',r:'#ff453a',g:'#30d158',b:'#0a84ff'}[crvCh];
  const X=x=>x*c.width,Y=y=>(1-y)*c.height;
  const draw=()=>{
    g.clearRect(0,0,c.width,c.height);g.fillStyle='rgba(255,255,255,.06)';g.fillRect(0,0,c.width,c.height);
    g.strokeStyle='rgba(255,255,255,.12)';g.lineWidth=dpr;g.beginPath();
    for(let i=1;i<4;i++){g.moveTo(X(i/4),0);g.lineTo(X(i/4),c.height);g.moveTo(0,Y(i/4));g.lineTo(c.width,Y(i/4))}g.stroke();
    const f=curveFn(S.crv[crvCh]);g.strokeStyle=col;g.lineWidth=2*dpr;g.beginPath();
    for(let i=0;i<=100;i++){const x=i/100;i?g.lineTo(X(x),Y(f(x))):g.moveTo(X(x),Y(f(x)))}g.stroke();
    for(const [x,y] of S.crv[crvCh]){g.fillStyle='#fff';g.beginPath();g.arc(X(x),Y(y),6*dpr,0,7);g.fill();g.strokeStyle=col;g.lineWidth=2*dpr;g.stroke()}
  };
  draw();
  let dg=null,last=0,lastIdx=-1;
  const pos=e=>{const r=c.getBoundingClientRect();return[clamp((e.clientX-r.left)/r.width),clamp(1-(e.clientY-r.top)/r.height)]};
  c.onpointerdown=e=>{
    const [x,y]=pos(e),pts=S.crv[crvCh],r=c.getBoundingClientRect(),now=Date.now();
    let idx=-1,best=22;pts.forEach((q,i)=>{const d=Math.hypot((q[0]-x)*r.width,(q[1]-y)*r.height);if(d<best){best=d;idx=i}});
    pushHist();
    if(idx>0&&idx<pts.length-1&&idx===lastIdx&&now-last<320){pts.splice(idx,1);crvDirty=true;lastIdx=-1;draw();redraw(true);return}
    if(idx<0){pts.push([x,y]);pts.sort((a,b)=>a[0]-b[0]);idx=pts.findIndex(q=>q[0]===x&&q[1]===y);crvDirty=true;redraw(true)}
    dg=idx;lastIdx=idx;last=now;c.setPointerCapture(e.pointerId);draw();
  };
  c.onpointermove=e=>{
    if(dg==null)return;const [x,y]=pos(e),pts=S.crv[crvCh],n=pts.length;
    const lo=dg===0?0:pts[dg-1][0]+.02,hi=dg===n-1?1:pts[dg+1][0]-.02;
    pts[dg]=[dg===0?0:dg===n-1?1:clamp(x,lo,hi),y];crvDirty=true;draw();redraw(true);
  };
  c.onpointerup=c.onpointercancel=()=>{dg=null};
}
function panelFx(){
  const p=el('div','col'),F=S.fx;
  p.append(chips(Object.entries(FXG).map(([k,g])=>[k,g[0]]),fxGroup,k=>{fxGroup=k;renderPanel();panel.scrollTop=0},
    k=>FXG[k][1].some(q=>F[q[0]]!==q[4])||(k==='finish'&&F.defr)));
  for(const [key,label,min,max,def] of FXG[fxGroup][1])
    p.append(slider({label,min,max,get:()=>F[key],set:v=>F[key]=v,def,center:min<0?0:min,glr:FXGL.has(key),
      fmt:(key==='shrRad'||key==='grSize')?v=>v.toFixed(1):undefined}));
  if(fxGroup==='finish'){
    const b=el('button','btn','Remove purple fringing');b.setAttribute('aria-pressed',!!F.defr);
    b.onclick=()=>{pushHist();F.defr=F.defr?0:1;renderPanel();redraw(true)};p.append(b);
  }
  return p;
}
/* ---- masks panel ---- */
const MK_NAMES={subject:'Subject',people:'People',sky:'Sky',plants:'Plants',water:'Water',buildings:'Buildings',mountains:'Mountains',ground:'Ground',object:'Object',linear:'Linear',radial:'Radial',tilt:'Tilt-shift',brush:'Brush'};
function panelMasks(){
  const p=el('div','col');
  if(pickMode){
    p.append(el('p','hint','Tap the object on the photo. Tap more spots to refine.'),
      seg([['1','Add'],['0','Subtract']],String(pickLabel),k=>{pickLabel=+k;renderPanel()}));
    const d=el('button','btn pri','Done');d.onclick=()=>{pickMode=false;pickPts=[];pickMask=-1;renderPanel()};p.append(d);return p;
  }
  const row=el('div','hrow');
  for(const m of S.masks){const b=el('button','chip',m.name);b.setAttribute('aria-pressed',m.id===selM);if(nz(m.adj))b.classList.add('mod');
    b.onclick=()=>{selM=m.id;adding=false;renderPanel();redraw(true)};row.append(b)}
  const nw=el('button','chip','＋ New mask');nw.onclick=()=>{adding=true;renderPanel()};row.append(nw);p.append(row);
  const m=selMask();
  if(adding||!m){
    const grid=el('div','pal');
    for(const k of Object.keys(MK_NAMES)){const b=el('button','btn',k==='object'?'Tap object':MK_NAMES[k]);b.onclick=()=>addMask(k);grid.append(b)}
    p.append(grid);
    if(!m)p.append(el('p','hint','AI masks download a model the first time (about 10–40 MB), then work offline.'));
    return p;
  }
  const r=el('div','row');
  const inv=el('button','btn','Invert');inv.setAttribute('aria-pressed',m.inv);inv.onclick=()=>{pushHist();m.inv=!m.inv;renderPanel();redraw(true)};
  const ov=el('button','btn','Overlay');ov.setAttribute('aria-pressed',overlayOn);ov.onclick=()=>{overlayOn=!overlayOn;renderPanel();redraw(true)};
  const del=el('button','btn','Delete');del.onclick=()=>{pushHist();S.masks=S.masks.filter(x=>x!==m);ensureSel();renderPanel();redraw(true)};
  r.append(inv,ov,del);p.append(r);
  adjBlock(p,()=>m.adj,[...LIGHT,...COLOR],'mask');
  p.append(slider({label:'Blur',min:0,max:1,get:()=>m.adj.blur||0,set:v=>m.adj.blur=v,def:0,center:0}));
  if(m.type==='tilt')p.append(el('p','hint','Drag the dots to move or rotate the focus line. The area outside the dashed band is blurred.'),
    slider({label:'Band width',min:.02,max:.4,step:.005,get:()=>m.g.w,set:v=>m.g.w=v,def:.1,center:.02,fmt:v=>Math.round(v*100)}));
  else if(m.type==='linear'||m.type==='radial')p.append(el('p','hint','Drag the blue dots on the photo to move or resize. Pink shows the edited area.'));
  else p.append(seg([['off','Brush off'],['add','Add'],['erase','Erase']],brush,k=>{brush=k;renderPanel()}),
    slider({label:'Brush size',min:16,max:160,step:1,get:()=>brushSize,set:v=>brushSize=v,def:56,fmt:v=>Math.round(v),center:16,glr:false,nohist:true}));
  if(m.type==='radial')p.append(slider({label:'Feather',min:.02,max:1,step:.01,get:()=>m.f,set:v=>m.f=v,def:.5,center:.02,fmt:v=>Math.round(v*100)}));
  else if(!isLine(m))p.append(slider({label:'Edge softness',min:0,max:20,step:1,get:()=>m.f,set:v=>m.f=v,def:2,fmt:v=>v,center:0}));
  return p;
}
async function addMask(type){
  if(busy||!loaded)return;
  if(type==='object'){adding=false;pickMode=true;pickPts=[];pickMask=-1;renderPanel();toast('Tap the object you want to select');return}
  const m={id:++mid,type,name:'',adj:zeroAdj(),inv:false,f:2,d:null,v:0,g:null};
  busy=true;
  try{
    if(type==='subject')m.d=await getSubject();
    else if(CATS[type]){m.d=await getCategory(type);if(!m.d){toast(`No ${MK_NAMES[type].toLowerCase()} found in this photo`);return}}
    else if(type==='brush'){m.d=new Uint8Array(MW*MH);brush='add'}
    else if(type==='linear')m.g={x0:.5,y0:.25,x1:.5,y1:.65};
    else if(type==='tilt'){m.g={x0:.08,y0:.5,x1:.92,y1:.5,w:.1};m.adj.blur=.5}
    else if(type==='radial'){m.g={cx:.5,cy:.5,rx:.28,ry:.28*SW/SH};m.f=.5}
  }catch(e){console.error(e);toast('Could not run the AI model. Check your connection and retry.',4500);return}
  finally{busy=false}
  const n=S.masks.filter(x=>x.type===type).length+1;m.name=MK_NAMES[type]+(n>1?' '+n:'');
  pushHist();S.masks.push(m);selM=m.id;adding=false;overlayOn=true;renderPanel();redraw(true);toast('Mask added. Adjust it below.');
}
/* ---- crop / frame / add panels ---- */
function panelCrop(){
  const p=el('div','col');
  p.append(chips(ASPECTS,S.geo.aspect,k=>{pushHist();setAspect(k);renderPanel();redraw()}));
  const r=el('div','row'),mkb=(i,l,fn)=>{const b=el('button','btn',i+l);b.onclick=()=>{buzz();fn()};return b};
  r.append(mkb(ICON.rotL,'',()=>rotate90(-1)),mkb(ICON.rotR,'',()=>rotate90(1)),mkb(ICON.flip,'',()=>{pushHist();S.geo.flip=!S.geo.flip;redraw()}),
    mkb(ICON.reset,'Reset',()=>{pushHist();S.geo=fresh().geo;renderPanel();redraw()}));
  p.append(r,slider({label:'Straighten',min:-45,max:45,step:.1,get:()=>S.geo.angle,set:v=>S.geo.angle=v,fmt:v=>v.toFixed(1)+'°',glr:false}));
  return p;
}
function panelFrame(){
  const p=el('div','col'),F=S.frame;
  p.append(chips(FRAMES,F.style,k=>{pushHist();F.style=k;if(k!=='none'&&F.size===0)F.size=6;renderPanel();redraw()}));
  if(['border','polaroid','double'].includes(F.style))p.append(swRow(SWATCH,F.color,c=>{pushHist();F.color=c;renderPanel();redraw()}));
  if(F.style!=='none'){
    const key=cur.frame;
    p.append(chips([['size','Size'],['radius','Corners']],key,k=>{cur.frame=k;renderPanel()}),
      slider({label:key==='size'?'Frame size':'Corner radius',min:0,max:key==='size'?25:20,step:.5,get:()=>F[key],set:v=>F[key]=v,def:key==='size'?6:0,fmt:v=>v.toFixed(1),center:0,glr:false}));
  }
  return p;
}
function itemEditor(p,it){
  if(it.type==='text')p.append(chips(['Sans','Serif','Mono','Script','Impact'].map((l,i)=>[i,l]),it.font,k=>{pushHist();it.font=+k;renderPanel();redraw()}),
    swRow(TCOL,it.color,c=>{pushHist();it.color=c;renderPanel();redraw()}));
  p.append(slider({label:'Size',min:2,max:60,step:.5,get:()=>it.size,set:v=>it.size=v,def:it.type==='text'?10:16,fmt:v=>v.toFixed(0),center:2,glr:false}));
  const del=el('button','btn','Delete');del.onclick=()=>{pushHist();S.items.splice(selItem,1);selItem=-1;renderPanel();redraw()};p.append(del);
}
function panelAdd(){
  const p=el('div','col');
  p.append(seg([['text','Text'],['sticker','Stickers'],['draw','Draw'],['logo','Logo']],addMode,k=>{addMode=k;selItem=-1;renderPanel(true);redraw()}));
  const it=selIt();
  if(addMode==='text'){
    const row=el('div','row'),i=el('input','txt');i.placeholder='Type text';i.maxLength=60;i.value=it&&it.type==='text'?it.text:'';
    const add=el('button','btn pri',it&&it.type==='text'?'Update':'Add');add.style.flex='0 0 auto';
    add.onclick=()=>{const t=i.value.trim();if(!t)return;pushHist();
      if(it&&it.type==='text')it.text=t;else{S.items.push({type:'text',text:t,x:.5,y:.5,size:10,color:'#ffffff',font:0});selItem=S.items.length-1}
      renderPanel();redraw()};
    row.append(i,add);p.append(row);
    if(it&&it.type==='text')itemEditor(p,it);else p.append(el('p','hint','Add text, then drag it on the photo.'));
  }else if(addMode==='sticker'){
    const row=el('div','hrow');
    for(const s of STICKERS){const b=el('button','stk',s);b.onclick=()=>{buzz();pushHist();S.items.push({type:'sticker',text:s,x:.5,y:.5,size:16,color:'#ffffff'});selItem=S.items.length-1;renderPanel();redraw()};row.append(b)}
    p.append(row);if(it&&it.type==='sticker')itemEditor(p,it);
  }else if(addMode==='draw'){
    p.append(swRow(TCOL,drawCol,c=>{drawCol=c;renderPanel()}),
      slider({label:'Brush',min:.3,max:6,step:.1,get:()=>drawW,set:v=>drawW=v,def:1.2,fmt:v=>v.toFixed(1),center:.3,glr:false,nohist:true}));
    const u=el('button','btn','Undo last stroke');u.onclick=()=>{for(let i=S.items.length-1;i>=0;i--)if(S.items[i].type==='draw'){pushHist();S.items.splice(i,1);redraw();break}};p.append(u);
  }else logoPanel(p);
  return p;
}
function logoPanel(p){
  const L=S.logo;
  p.append(seg([['off','Off'],['text','Text'],['img','Image']],!L.on?'off':L.useImg?'img':'text',k=>{
    pushHist();L.on=k!=='off';L.useImg=k==='img';if(k==='img'&&!logoImg)$('#fLogo').click();renderPanel();redraw()}));
  if(L.on&&!L.useImg){const i=el('input','txt');i.value=L.text;i.placeholder='Your name or brand';i.maxLength=40;i.oninput=()=>{L.text=i.value;redraw()};p.append(i)}
  if(L.on&&L.useImg){const b=el('button','btn',ICON.open+(logoImg?'Change logo':'Choose logo'));b.onclick=()=>$('#fLogo').click();p.append(b)}
  if(L.on){
    p.append(chips([['tl','Top left'],['tr','Top right'],['bl','Bottom left'],['br','Bottom right'],['cc','Center']],L.pos,k=>{pushHist();L.pos=k;renderPanel();redraw()}),
      chips([['size','Size'],['opacity','Opacity']],cur.brand,k=>{cur.brand=k;renderPanel()}),
      slider({label:cur.brand==='size'?'Size':'Opacity',min:cur.brand==='size'?4:10,max:cur.brand==='size'?40:100,step:1,get:()=>L[cur.brand],set:v=>L[cur.brand]=v,def:cur.brand==='size'?12:85,fmt:v=>Math.round(v),center:cur.brand==='size'?4:10,glr:false}));
  }
}
const BUILD={looks:panelLooks,light:panelLight,color:panelColor,crv:panelCurves,fx:panelFx,masks:panelMasks,crop:panelCrop,frame:panelFrame,add:panelAdd};
const panel=$('#panel');
function renderPanel(reset){
  const old=panel.querySelector('.hrow'),sl=old?old.scrollLeft:0,st=panel.scrollTop;
  panel.innerHTML='';panel.append(BUILD[tab]());
  if(!reset){const nw=panel.querySelector('.hrow');if(nw)nw.scrollLeft=sl;panel.scrollTop=st}
}
const TABS=[['looks','Looks'],['light','Light'],['color','Color'],['crv','Curves'],['fx','Effects'],['masks','Masks'],['crop','Crop'],['frame','Frames'],['add','Add']];
for(const [id,l] of TABS){const b=el('button','',ICON[id]+`<span>${l}</span>`);b.id='tab_'+id;b.setAttribute('role','tab');b.setAttribute('aria-selected',id===tab);b.onclick=()=>{buzz();setTab(id)};$('#tabs').append(b)}
function setTab(id){
  const ch=id!==tab;tab=id;if(ch){pickMode=false;pickPts=[];adding=false;selItem=-1}
  for(const [i] of TABS)$('#tab_'+i).setAttribute('aria-selected',i===id);
  $('#tab_'+id).scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'});
  ring.style.display='none';renderPanel(ch);redraw(true);
}

/* ================= AI: subject, scene classes, tap-to-select ================= */
const TF_URL='https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2';
const CATS={people:['person'],sky:['sky'],plants:['tree','grass','plant','flower','palm','bush'],water:['water','sea','river','lake','waterfall','pool'],
  buildings:['building','house','skyscraper','tower','hovel'],mountains:['mountain','hill','rock'],ground:['road','earth','sand','field','path','floor','sidewalk']};
let tf=null,rm=null,segPipe=null,segRes=null,sam=null,samEmb=null;
const dlcb=p=>{if(p.status==='progress')toast(`Downloading AI model… ${Math.round(p.progress)}%`,0,true)};
async function loadTF(){if(!tf){toast('Loading AI library…',0,true);tf=await import(TF_URL);tf.env.allowLocalModels=false}return tf}
async function srcURL(){const c=document.createElement('canvas');c.width=MW;c.height=MH;c.getContext('2d').drawImage(srcCanvas,0,0,MW,MH);
  return URL.createObjectURL(await new Promise(r=>c.toBlob(r,'image/jpeg',.92)))}
function toArr(m){const ch=m.channels||1,a=new Uint8Array(MW*MH);for(let i=0;i<a.length;i++)a[i]=m.data[i*ch];return a}
async function getSubject(){
  const t=await loadTF();
  if(!rm){
    const model=await t.AutoModel.from_pretrained('briaai/RMBG-1.4',{config:{model_type:'custom'},progress_callback:dlcb});
    const proc=await t.AutoProcessor.from_pretrained('briaai/RMBG-1.4',{config:{do_normalize:true,do_pad:false,do_rescale:true,do_resize:true,
      image_mean:[.5,.5,.5],feature_extractor_type:'ImageFeatureExtractor',image_std:[1,1,1],resample:2,rescale_factor:1/255,size:{width:1024,height:1024}}});
    rm={model,proc};
  }
  toast('Finding the subject…',0,true);
  const url=await srcURL();
  try{
    const image=await t.RawImage.fromURL(url),{pixel_values}=await rm.proc(image),{output}=await rm.model({input:pixel_values});
    return toArr(await t.RawImage.fromTensor(output[0].mul(255).to('uint8')).resize(MW,MH));
  }finally{URL.revokeObjectURL(url)}
}
async function runSeg(){
  if(segRes)return segRes;
  const t=await loadTF();
  if(!segPipe)segPipe=await t.pipeline('image-segmentation','Xenova/segformer-b0-finetuned-ade-512-512',{progress_callback:dlcb});
  toast('Analysing the scene…',0,true);
  const url=await srcURL();
  try{
    const out=await segPipe(url),res=[];
    for(const o of out){let m=o.mask;if(m.width!==MW||m.height!==MH)m=await m.resize(MW,MH);res.push({label:o.label,data:toArr(m)})}
    segRes=res;return res;
  }finally{URL.revokeObjectURL(url)}
}
async function getCategory(type){
  const res=await runSeg(),keys=CATS[type],arr=new Uint8Array(MW*MH);let any=false;
  for(const r of res){
    const l=r.label.toLowerCase().split(',')[0].trim();
    if(keys.includes(l)){any=true;for(let i=0;i<arr.length;i++)if(r.data[i]>arr[i])arr[i]=r.data[i]}
  }
  if(!any)return null;
  let n=0;for(let i=0;i<arr.length;i+=7)if(arr[i]>127)n++;
  return n>arr.length/7*.002?arr:null;
}
async function loadSam(){
  const t=await loadTF();
  if(!sam){
    const model=await t.SamModel.from_pretrained('Xenova/slimsam-77-uniform',{progress_callback:dlcb});
    const proc=await t.AutoProcessor.from_pretrained('Xenova/slimsam-77-uniform');
    sam={model,proc};
  }
  if(!samEmb){
    toast('Preparing the image…',0,true);
    const url=await srcURL();
    try{const img=await t.RawImage.fromURL(url),inp=await sam.proc(img);samEmb={img,inp,emb:await sam.model.get_image_embeddings(inp)}}
    finally{URL.revokeObjectURL(url)}
  }
}
async function samPoint(u,v){
  if(busy)return;busy=true;
  try{
    const t=await loadTF();await loadSam();toast('Selecting…',0,true);
    const {img,inp,emb}=samEmb,[rh,rw]=inp.reshaped_input_sizes[0];
    pickPts.push({x:u*img.width,y:v*img.height,l:pickLabel});
    const n=pickPts.length,pts=new Float32Array(n*2),lab=new BigInt64Array(n);
    pickPts.forEach((q,i)=>{pts[i*2]=q.x*rw/img.width;pts[i*2+1]=q.y*rh/img.height;lab[i]=BigInt(q.l)});
    const out=await sam.model({...emb,input_points:new t.Tensor('float32',pts,[1,1,n,2]),input_labels:new t.Tensor('int64',lab,[1,1,n])});
    const masks=await sam.proc.post_process_masks(out.pred_masks,inp.original_sizes,inp.reshaped_input_sizes);
    const sc=out.iou_scores.data;let b=0;for(let i=1;i<sc.length;i++)if(sc[i]>sc[b])b=i;
    const mk=masks[0],H=mk.dims[2],W=mk.dims[3],dd=mk.data,arr=new Uint8Array(MW*MH);
    for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)arr[y*MW+x]=dd[b*H*W+Math.floor(y*H/MH)*W+Math.floor(x*W/MW)]?255:0;
    pushHist();
    let m=S.masks.find(x=>x.id===pickMask);
    if(m){m.d=arr;m.v++}
    else{const c=S.masks.filter(x=>x.type==='object').length+1;
      m={id:++mid,type:'object',name:'Object'+(c>1?' '+c:''),adj:zeroAdj(),inv:false,f:2,d:arr,v:0,g:null};S.masks.push(m);pickMask=m.id}
    selM=m.id;overlayOn=true;renderPanel();redraw(true);toast('Tap again to refine, or press Done');
  }catch(e){console.error(e);pickPts.pop();toast('Object select failed. Check your connection and retry.',4500)}
  finally{busy=false}
}

/* ================= open photo (incl. RAW preview) ================= */
function jpegEnd(b,s){
  let i=s+2;
  while(i<b.length-1){
    if(b[i]!==0xFF){i++;continue}
    const m=b[i+1];
    if(m===0xFF){i++;continue}
    if(m===0xD8||m===0x01||(m>=0xD0&&m<=0xD7)){i+=2;continue}
    if(m===0xD9)return i+2;
    const len=(b[i+2]<<8)|b[i+3];i+=2+len;
    if(m===0xDA){while(i<b.length-1){if(b[i]===0xFF&&b[i+1]!==0&&!(b[i+1]>=0xD0&&b[i+1]<=0xD7))break;i++}}
  }
  return -1;
}
async function rawPreview(file){
  const b=new Uint8Array(await file.arrayBuffer()),c=[];
  for(let i=0;i<b.length-3&&c.length<12;i++){
    if(b[i]===0xFF&&b[i+1]===0xD8&&b[i+2]===0xFF){const e=jpegEnd(b,i);if(e>0&&e-i>30000){c.push([i,e]);i=e-1}}
  }
  let best=null;
  for(const [s,e] of c){
    try{const bm=await createImageBitmap(new Blob([b.subarray(s,e)],{type:'image/jpeg'}));
      if(!best||bm.width*bm.height>best.width*best.height){best&&best.close&&best.close();best=bm}else bm.close&&bm.close()}catch{}
  }
  if(!best)throw new Error('No preview found in this RAW file');
  return best;
}
async function openFile(file){
  try{
    toast('Opening…',0,true);
    const raw=/\.(dng|cr2|cr3|nef|arw|orf|rw2|raf|pef|srw)$/i.test(file.name);
    const bmp=raw?await rawPreview(file):await createImageBitmap(file);
    const mt=Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE),3000),k=Math.min(1,mt/Math.max(bmp.width,bmp.height));
    SW=Math.round(bmp.width*k);SH=Math.round(bmp.height*k);
    srcCanvas=document.createElement('canvas');srcCanvas.width=SW;srcCanvas.height=SH;
    srcCanvas.getContext('2d').drawImage(bmp,0,0,SW,SH);bmp.close&&bmp.close();
    gl.activeTexture(gl.TEXTURE7);gl.bindTexture(gl.TEXTURE_2D,imgTex);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,srcCanvas);
    const mk2=Math.min(1,1024/Math.max(SW,SH));MW=Math.round(SW*mk2);MH=Math.round(SH*mk2);
    S=fresh();hist.length=0;redoS.length=0;brush='off';lutUploaded=null;crvDirty=true;
    selM=-1;adding=false;pickMode=false;pickPts=[];pickMask=-1;segRes=null;samEmb=null;selItem=-1;updHist();
    makeThumbs();loaded=true;document.body.classList.remove('empty');
    setTab('looks');redraw(true);
    toast(raw?'RAW opened from its embedded preview. Use Crop to rotate if needed.':'Ready. Try a look, or add a mask.',raw?4500:2400);
  }catch(e){console.error(e);toast(raw0(e),4000)}
}
const raw0=e=>e&&/RAW/.test(e.message||'')?e.message:'Could not open that image.';
function makeThumbs(){
  const s=88,t=document.createElement('canvas');t.width=t.height=s;const x=t.getContext('2d'),k=Math.max(s/SW,s/SH);
  x.drawImage(srcCanvas,(s-SW*k)/2,(s-SH*k)/2,SW*k,SH*k);const base=x.getImageData(0,0,s,s);thumbURL={none:t.toDataURL('image/jpeg',.8)};
  for(const p of PRESETS){
    const c=document.createElement('canvas');c.width=c.height=s;const cx=c.getContext('2d'),im=new ImageData(new Uint8ClampedArray(base.data),s,s),d=im.data;
    for(let i=0;i<d.length;i+=4){const o=gradeRGB(d[i]/255,d[i+1]/255,d[i+2]/255,p.g);d[i]=o[0]*255;d[i+1]=o[1]*255;d[i+2]=o[2]*255}
    cx.putImageData(im,0,0);thumbURL[p.id]=c.toDataURL('image/jpeg',.8);
  }
}

/* ================= export ================= */
const EX={fmt:'jpeg',q:92,size:'max'};
function outSize(){
  const n=natural();let ow=Math.round(n.tw),oh=Math.round(n.th),lim=EX.size==='max'?Infinity:+EX.size,l=Math.max(ow,oh);
  if(l>lim){const s=lim/l;ow=Math.round(ow*s);oh=Math.round(oh*s)}return[ow,oh];
}
function openExport(){
  const card=$('#card');card.innerHTML='';
  const top=el('div','top','<h3>Export</h3>');const x=el('button','ib',ICON.x);x.onclick=()=>$('#modal').classList.remove('on');top.append(x);
  const info=el('p','hint');const [w,h]=outSize();info.textContent=`${w} × ${h} px`;
  card.append(top,
    seg([['jpeg','JPEG'],['png','PNG'],['webp','WebP']],EX.fmt,k=>{EX.fmt=k;openExport()}),
    seg([['max','Original'],['2048','2048 px'],['1080','1080 px']],EX.size,k=>{EX.size=k;openExport()}));
  if(EX.fmt!=='png')card.append(slider({label:'Quality',min:60,max:100,step:1,get:()=>EX.q,set:v=>EX.q=v,def:92,fmt:v=>Math.round(v),center:60,glr:false,nohist:true}));
  card.append(info);
  const r=el('div','row'),sv=el('button','btn pri','Save to device');sv.onclick=()=>doExport(false);r.append(sv);
  if(navigator.canShare){const sh=el('button','btn','Share…');sh.onclick=()=>doExport(true);r.append(sh)}
  card.append(r);$('#modal').classList.add('on');
}
async function doExport(share){
  $('#modal').classList.remove('on');toast('Rendering full resolution…',0,true);
  await new Promise(r=>setTimeout(r,40));
  try{
    const [ow,oh]=outSize(),was=comparing;comparing=false;
    renderGL(true);const out=document.createElement('canvas');out.width=ow;out.height=oh;compose(out.getContext('2d'),ow,oh,'final',false);
    comparing=was;redraw(true);
    const type={jpeg:'image/jpeg',png:'image/png',webp:'image/webp'}[EX.fmt],ext={jpeg:'jpg',png:'png',webp:'webp'}[EX.fmt];
    const blob=await new Promise(r=>out.toBlob(r,type,EX.q/100));if(!blob)throw new Error('encode failed');
    const file=new File([blob],`maskroom-${Date.now()}.${ext}`,{type});
    if(share&&navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:'Maskroom'});toast('Shared');return}catch(e){if(e.name==='AbortError'){toast('Cancelled');return}}}
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000);toast('Saved to your downloads');
  }catch(e){console.error(e);redraw(true);toast('Export failed. Try a smaller size.',4000)}
}

/* ================= wiring ================= */
$('#bOpen').innerHTML=ICON.open;$('#bUndo').innerHTML=ICON.undo;$('#bRedo').innerHTML=ICON.redo;$('#bCmp').innerHTML=ICON.eye;
$('#hlogo').innerHTML=LOGO(28,'h');$('#wlogo').innerHTML=LOGO(104,'w',24);
$('#bUndo').onclick=undo;$('#bRedo').onclick=redo;$('#bExport').onclick=openExport;
$('#modal').onclick=e=>{if(e.target.id==='modal')$('#modal').classList.remove('on')};
const pick=()=>$('#file').click();
$('#bStart').onclick=pick;
$('#bOpen').onclick=()=>{if(hist.length&&!confirm('Open another photo? Current edits will be discarded.'))return;pick()};
$('#file').onchange=e=>{const f=e.target.files[0];e.target.value='';if(f)openFile(f)};
$('#fLut').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;
  try{const c=parseCube(await f.text());customLut={...c,name:f.name.replace(/\.[^.]+$/,'').slice(0,14)};pushHist();S.look.id='custom';S.look.amt=100;lutUploaded=null;renderPanel(true);redraw(true);toast('LUT loaded')}
  catch(err){toast(err.message,3500)}};
$('#fLogo').onchange=e=>{const f=e.target.files[0];e.target.value='';if(!f)return;const im=new Image();
  im.onload=()=>{logoImg=im;S.logo.on=true;S.logo.useImg=true;renderPanel();redraw()};im.src=URL.createObjectURL(f)};
const bc=$('#bCmp'),setC=v=>{if(!loaded)return;comparing=v;redraw(true)};
bc.addEventListener('pointerdown',e=>{e.preventDefault();setC(true)});
for(const ev of['pointerup','pointerleave','pointercancel'])bc.addEventListener(ev,()=>setC(false));
bc.addEventListener('contextmenu',e=>e.preventDefault());
let dip=null;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();dip=e;$('#bInstall').hidden=false});
$('#bInstall').onclick=async()=>{if(!dip)return;dip.prompt();await dip.userChoice;dip=null;$('#bInstall').hidden=true};
addEventListener('appinstalled',()=>{$('#bInstall').hidden=true;toast('Maskroom installed')});
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
try{initGL()}catch(e){console.error(e);document.body.innerHTML='<p style="padding:24px">Sorry, this browser does not support WebGL.</p>'}
renderPanel(true);
