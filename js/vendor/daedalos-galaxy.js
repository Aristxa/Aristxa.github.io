/*!
 * Galaxy wallpaper from daedalOS by Dustin Brett
 * https://github.com/DustinBrett/daedalOS (components/system/Desktop/Wallpapers/Galaxy)
 * Bundled unmodified from the TypeScript source with esbuild.
 *
 * MIT License
 * 
 * Copyright (c) 2025 Dustin Brett
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
(()=>{var pt={faceOn:!1,speed:1},F={armWinding:3.5,barAxisRatio:.62,barRadius:.24,bulgeRadius:.13,diskAxisRatio:.94,diskScaleLength:.38,dustLaneOffset:-.35,maxRadius:1.25,orbitalSpeed:-.02,outerBreak:.92,outerScale:.09,patternSpeed:-.028,warpAmplitude:.055,warpStart:.6},k={azimuthDriftSpeed:.006,distance:2.07,elevation:.48,elevationFaceOn:1.35,elevationJitter:.05,farPlane:30,fieldOfView:50,mobileDistanceMul:1.2,mobileElevationAdd:.22,nearPlane:.05,parallaxAzimuth:.14,parallaxElevation:.09,parallaxPan:.055,screenShiftY:.1,smoothing:4.5},re={bulgeGlow:2600,diskGlow:18e3,dust:13e3,farStars:2800,globularClusters:110,h2Regions:150,haloStars:1500,nearStars:90,oldStars:46e3,openClusters:26,youngStars:7e3};var bt=new Float32Array(16),gt=new Float32Array(16),Oe=new Float32Array(16),Ut=(n,s,o)=>{let e=n;for(let l=0;l<4;l+=1)for(let t=0;t<4;t+=1){let g=0;for(let R=0;R<4;R+=1)g+=s[R*4+t]*o[l*4+R];e[l*4+t]=g}},Nt=(n,s,o,e,l)=>{let t=1/Math.tan(s/2),g=n;g.fill(0),g[0]=t/o,g[5]=t,g[10]=(l+e)/(e-l),g[11]=-1,g[14]=2*l*e/(e-l)},Dt=(n,s,o,e)=>{let l=Math.hypot(s,o,e)||1,t=s/l,g=o/l,R=e/l,v=-g,S=t,P=Math.hypot(v,S)||1;v/=P,S/=P;let U=g*0-R*S,N=R*v-t*0,L=t*S-g*v,A=n;A.fill(0),A[0]=v,A[1]=U,A[2]=t,A[4]=S,A[5]=N,A[6]=g,A[9]=L,A[10]=R,A[12]=-(v*s+S*o),A[13]=-(U*s+N*o+L*e),A[14]=-(t*s+g*o+R*e),A[15]=1},Mt=({azimuth:n,distance:s,elevation:o,panX:e=0,panY:l=0},t,g)=>{Nt(bt,k.fieldOfView*Math.PI/180,t/Math.max(g,1),k.nearPlane,k.farPlane),Dt(gt,s*Math.cos(o)*Math.cos(n),s*Math.cos(o)*Math.sin(n),s*Math.sin(o)),Ut(Oe,bt,gt);let R=k.screenShiftY+l;for(let v=0;v<4;v+=1)Oe[v*4]+=e*Oe[v*4+3],Oe[v*4+1]+=R*Oe[v*4+3];return Oe},xt=n=>n/(2*Math.tan(k.fieldOfView*Math.PI/360));var _e=36,nt=8,b=Math.PI*2,Bt=n=>{let s=n;return()=>{s=Math.trunc(s+1831565813);let o=s;return o=Math.imul(o^o>>>15,o|1),o^=o+Math.imul(o^o>>>7,o|61),((o^o>>>14)>>>0)/4294967296}},Z=(n,s,o)=>Math.min(Math.max(n,s),o),be=(n,s,o)=>{let e=Z((o-n)/(s-n),0,1);return e*e*(3-2*e)},I=(n,s,o)=>n+(s-n)*o,pe=[.8225,.1774,0,.0332,.9669,0,.0171,.0724,.9108],zt=n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4,Wt=n=>n<=.0031308?n*12.92:1.055*n**(1/2.4)-.055,Xe=2048,Et=n=>{let s=new Float32Array(Xe+1);for(let o=0;o<=Xe;o+=1)s[o]=n(o/Xe);return s},Qe=Et(zt),et=Et(Wt),Ie=(n,s)=>{let o=Z(s,0,1)*Xe,e=Math.trunc(o),l=n[Math.min(e+1,Xe)];return n[e]+(l-n[e])*(o-e)},Vt=(n,s)=>{let o=[0,0,0];return(e,l,t)=>{let g=Ie(Qe,e/255),R=Ie(Qe,l/255),v=Ie(Qe,t/255);n&&([g,R,v]=[pe[0]*g+pe[1]*R+pe[2]*v,pe[3]*g+pe[4]*R+pe[5]*v,pe[6]*g+pe[7]*R+pe[8]*v]);let S=n?s:1+(s-1)*.5,P=.2126*g+.7152*R+.0722*v;return g=Z(P+(g-P)*S,0,1),R=Z(P+(R-P)*S,0,1),v=Z(P+(v-P)*S,0,1),o[0]=Ie(et,g)*255,o[1]=Ie(et,R)*255,o[2]=Ie(et,v)*255,o}},Ht=n=>{let s=Z(n,1500,4e4)/100,o=255,e=255,l;return s>66?(o=329.698727446*(s-60)**-.1332047592,l=288.1221695283*(s-60)**-.0755148492):(l=99.4708025861*Math.log(s)-161.1195681661,e=s<=19?0:138.5177312231*Math.log(s-10)-305.0447927307),[Z(o,0,255),Z(l,0,255),Z(e,0,255)]},Ye=512,at=1500,Rt=(4e4-at)/Ye,At=(()=>{let n=new Float32Array((Ye+1)*3);for(let s=0;s<=Ye;s+=1){let[o,e,l]=Ht(at+Rt*s);n[s*3]=o,n[s*3+1]=e,n[s*3+2]=l}return n})(),vt=[0,0,0],$=n=>{let s=Z((n-at)/Rt,0,Ye),o=Math.trunc(s),e=Math.min(o+1,Ye)*3,l=s-o;for(let t=0;t<3;t+=1){let g=At[o*3+t];vt[t]=g+(At[e+t]-g)*l}return vt},Ue=_e/4,Tt=(n,s)=>s===0?n:Tt(s,n%s),de=n=>{let s=4096,o=new Float32Array(s*Ue),e=new Uint8Array(o.buffer),l=0;return{add:(t,g,R,v,S,P,U,N,L,A,V,ce)=>{if(l===s){s*=2;let ae=new Float32Array(s*Ue);ae.set(o),o=ae,e=new Uint8Array(o.buffer)}let C=l*Ue,K=l*_e+nt*4,[J,ie,ne]=n(L,A,V);o[C]=t,o[C+1]=g,o[C+2]=R,o[C+3]=v,o[C+4]=S,o[C+5]=P,o[C+6]=U,o[C+7]=N,e[K]=Z(Math.round(J),0,255),e[K+1]=Z(Math.round(ie),0,255),e[K+2]=Z(Math.round(ne),0,255),e[K+3]=Z(Math.round(ce),0,255),l+=1},build:t=>{let g=new ArrayBuffer(l*_e),R=new Uint32Array(g),v=new Uint32Array(o.buffer),S=Math.max(Math.round(l*.618034),1);for(;Tt(S,l)!==1;)S+=1;for(let P=0,U=0;P<l;P+=1){let N=U*Ue,L=P*Ue;for(let A=0;A<Ue;A+=1)R[L+A]=v[N+A];U=(U+S)%l}return{...t,count:l,data:g}}}},oe=n=>I(F.barAxisRatio,F.diskAxisRatio,be(F.barRadius*.6,F.barRadius*2.2,n)),le=n=>n*F.armWinding,ve=n=>F.orbitalSpeed/Math.max(n,.08)-F.patternSpeed,Ee=n=>.012+.032*n,tt=(n,s)=>{let o=0,e=!1;for(;!e;)o=-s*Math.log(1-n()),e=o>=.02&&o<=F.maxRadius&&(o<=F.outerBreak||n()<Math.exp(-(o-F.outerBreak)/F.outerScale));return o},He,yt=n=>{if(He!==void 0){let l=He;return He=void 0,l}let s=Math.max(n(),1e-9),o=b*n(),e=Math.sqrt(-2*Math.log(s));return He=e*Math.sin(o),e*Math.cos(o)},u=(n,s)=>yt(n)*s,Xt=Math.PI/2,St=Math.PI*.28,Ne=.6,qe=(n,s,o,e)=>{let l=n();if(l<e){let t=Ne+u(n,.045);return{phase:St+(t-Ne)*2.5,radius:t,widthMul:.5}}return l<e+o&&s>.3?{phase:(n()<.5?1:-1)*Xt,radius:s,widthMul:.7}:{phase:n()<.5?0:Math.PI,radius:s,widthMul:1}},wt=(n=1,s=!1,o=439041101)=>{let e=Bt(o);He=void 0;let l=i=>Math.round(i*n),t=i=>Vt(s,i),g=de(t(1.06));for(let i=0;i<l(re.farStars);i+=1){let a=e()*b,r=e()*2-1,c=Math.sqrt(1-r*r),f=7+e()*3,d=e(),[p,M,x]=[235,235,240];d<.1?[p,M,x]=$(3400+e()*1600):d<.22&&([p,M,x]=$(9e3+e()*12e3)),g.add(f*c,1,a,0,0,f*r,.025+e()**3*.045,e()*b,p,M,x,70+e()*180)}let R=de(t(1.06)),v=.22**-.5,S=1.6**-.5;for(let i=0;i<l(re.globularClusters);i+=1){let a=e()*b,r=e()*2-1,c=Math.sqrt(1-r*r),f=e()<.3,d=f?.08+e()**2*.3:(v-e()*(v-S))**-2,[p,M,x]=$(f?4300+e()*700:5e3+e()*1200);R.add(d*c,1,a,0,0,d*r*(f?.6:1),.012+e()*.012,e()*b,p,M,x,70+e()*60)}let P=.3**-.5,U=1.7**-.5;for(let i=0;i<l(re.haloStars);i+=1){let a=e()*b,r=e()*2-1,c=Math.sqrt(1-r*r),f=(P-e()*(P-U))**-2,[d,p,M]=$(4200+e()*1800);g.add(f*c,1,a,0,0,f*r*.6,.003+e()**2*.004,e()*b,d,p,M,10+e()*14)}let N=de(t(1.16));for(let i=0;i<l(re.diskGlow);i+=1){let a=tt(e,F.diskScaleLength+.04),r=a>.28&&e()<.4,{phase:c,radius:f,widthMul:d}=r?qe(e,a,.3,.06):{phase:e()*b,radius:a,widthMul:1},p=1-be(.05,.55,f),M=be(.62,1.05,f),x=I(r?150:172,255,p),y=I(r?184:196,228,p),T=I(r?248:240,188,p);N.add(f,oe(f),le(f)+(r?.03+u(e,.04):u(e,.1)),r?c+u(e,(.24+f*.1)*d):c,r?0:ve(f),u(e,Ee(f)*1.4),(.035+e()**2*.085)*I(1,.55,M)*(r?.85:1),e()*b,x,y,T,(8+e()*10)*I(.3,1,be(.02,.3,f))*I(1,.34,M)*(r?1.25:1))}let L=de(t(1.12));for(let i=0;i<l(re.bulgeGlow);i+=1){let a=e()<.25,r=u(e,a?.05:.16),c=u(e,a?.045:.085),[f,d,p]=a?[255,232,194]:[255,212,158];L.add(Math.hypot(r,c),1,Math.atan2(c,r),0,0,u(e,a?.04:.06),a?.03+e()*.07:.06+e()*.13,e()*b,f,d,p,a?3+e()*4:2+e()*3)}for(let i=0;i<l(200);i+=1){let a=e();L.add(Math.abs(u(e,.02)),1,e()*b,0,0,u(e,.015),.06+a**2*.42,e()*b,255,I(235,215,a),I(200,162,a),1.5+(1-a)*3.5)}let A=de(t(1.14));for(let i=0;i<l(re.oldStars);i+=1){let a=e()<.16,r=0,c=0,f=0,d=e()*b,p=1,M=0,x=60+e()*110;if(a)r=Math.abs(yt(e))*F.bulgeRadius,c=u(e,.35*Math.max(r,.03)),d=e()*b,M=3500+e()*1900,x=10+e()*16;else{let z=e()<.14;r=tt(e,F.diskScaleLength),p=oe(r),f=le(r)+u(e,.06),c=u(e,Ee(r)*(z?2.8:1)),M=z?3600+e()**2*2600:3800+e()**2*3600,z||(M+=be(.55,1.05,r)*900),x*=(z?.7:1)*I(.3,1,be(.06,.32,r))}let y=e()<.006,T=M;if(y){let z=e();z<.06?T=2200+e()*500:z<.58&&(T=3300+e()*900)}let[w,_,G]=$(T),E=y?.013+e()*.012:.0035+e()**2*.005;A.add(r,p,f,d,ve(r),c,E,e()*b,w,_,G,y?235:x),y&&N.add(r,p,f,d,ve(r),c,E*(3+e()*1.5),e()*b,w,_,G,4+e()*4)}let[V,ce,C]=$(5778);A.add(Ne,oe(Ne),le(Ne),St,ve(Ne),.002,.0045,e()*b,V,ce,C,110);let K=de(t(1)),J=l(re.dust),ie=0,ne=(i,a,r,c,f)=>{let d=.7+e()*.3,p=1-be(.85,1.05,i)*.35;K.add(i,oe(i),a,r,0,u(e,Ee(i)*.4),c,e()*b,142,190,255,f*d*p),ie+=1};for(;ie<J;){let i=.3+e()**1.3*.72;if(e()<.18)ne(i*(1+u(e,.015)),le(i)+F.dustLaneOffset*.2+u(e,.03),e()*b,.025+e()**1.5*.05,13+e()*16);else{let{phase:a,radius:r,widthMul:c}=qe(e,i,.22,.05),f=le(r)+F.dustLaneOffset*.2+u(e,.03),d=a+u(e,(.2+r*.08)*c);if(e()<.4&&ie+3<=J){let p=e()<.35;for(let M=-1;M<=1;M+=1)if(p){let x=M+1,y=x*(.011+e()*.007);ne(r+u(e,.004),f+y+u(e,.006),d+u(e,.015),(.02+e()**1.5*.036)*(1-x*.12),(21+e()*24)*(1-x*.16))}else{let x=M*(.008+e()*.01);ne(r+x,f+x*F.armWinding+u(e,.008),d+u(e,.02),.02+e()**1.5*.04,21+e()*27)}}else ne(r*(1+u(e,.015)),f,d,.025+e()**1.5*.05,24+e()*32)}}let ae=de(t(1.2)),H=(i,a,r,c,f=.5)=>{let[d,p,M]=$(I(12500+e()**2*17500,6600+e()*2600,f));ae.add(i,oe(i),a,r,0,u(e,Ee(i)*.4),(.004+e()**2*.008)*c,e()*b,d,p,M,(120+e()*135)*I(1,.4,be(.86,1.1,i)))},Q=.025;for(let i=0;i<l(re.youngStars);i+=1){let a=.24+e()*.82,{phase:r,radius:c,widthMul:f}=qe(e,a,.14,.04),d=e()*e();H(c,le(c)+Q+d*.075+u(e,.012+d*.045),r+u(e,(.24+c*.1)*f),1,d)}for(let i=0;i<l(300);i+=1){let a=1.02+e()**1.4*.22,[r,c,f]=$(9e3+e()**2*14e3);ae.add(a,oe(a),le(a)+u(e,.25),e()*b,ve(a),u(e,Ee(a)*.8),.003+e()**2*.004,e()*b,r,c,f,25+e()*35)}for(let i=0;i<l(120);i+=1){let a=.25+e()*.75,[r,c,f]=$(14e3+e()**2*16e3);ae.add(a,oe(a),le(a)+u(e,.4),e()*b,ve(a),u(e,Ee(a)*1.3),.003+e()**2*.005,e()*b,r,c,f,70+e()*90)}let j=de(t(1.28));for(let i=0;i<l(re.h2Regions);i+=1){let a=.3+e()*.72,{phase:r,radius:c,widthMul:f}=qe(e,a,.18,.05),d=r+u(e,.22*f),p=le(c)+.008+u(e,.04),M=I(1,.45,be(.86,1.06,c)),x=e()<.2,y=.007+e()*.007,T=x?5+Math.trunc(e()*3):3+Math.trunc(e()*5);for(let E=0;E<T;E+=1){let z=e(),We=(E+e()*.4)/T*b,Pe=x?Math.cos(We)*y:u(e,.012),Fe=x?Math.sin(We)*y/Math.max(c,.3):u(e,.035);j.add(c+Pe,oe(c),p+(x?u(e,.002):u(e,.01)),d+Fe,0,u(e,.008),x?.012+e()**2*.018:.016+e()**2*.036,e()*b,255,I(74,124,z),I(122,168,z),(26+e()*40)*M)}let w=1+Math.trunc(e()*2);for(let E=0;E<w;E+=1)j.add(c+u(e,.006),oe(c),p+u(e,.006),d+u(e,.025),0,u(e,.006),.032+e()**2*.05,e()*b,255,88,132,(5+e()*8)*M);let _=4+Math.trunc(e()*8);for(let E=0;E<_;E+=1)H(c+u(e,.01),p+u(e,.008),d+u(e,.03),1.25,e()*.2);let G=1+Math.trunc(e()*2);for(let E=0;E<G;E+=1)j.add(c+u(e,.014),oe(c),p+.015+u(e,.012),d+u(e,.04),0,u(e,.008),.014+e()**2*.03,e()*b,135,172,255,(12+e()*12)*M)}for(let i=0;i<l(70);i+=1){let a=Math.max(tt(e,F.diskScaleLength),.14);j.add(a,oe(a),le(a)+u(e,.3),e()*b,ve(a),u(e,Ee(a)*1.6),.0035+e()*.0035,e()*b,120,235,205,8+e()*10)}for(let i=0;i<l(re.openClusters);i+=1){let a=.3+e()*.72,r=le(a),c=e()*b,f=ve(a),d=u(e,Ee(a)*.7),p=5200+e()**2*9e3,M=5+Math.trunc(e()*8),x=e()<.25;for(let y=0;y<M;y+=1){let T=x&&y===0,[w,_,G]=$(T?3450+e()*300:p*(.75+e()*.5));ae.add(a+u(e,.005),oe(a),r+u(e,.005),c+u(e,.01),f,d+u(e,.004),(.0035+e()**2*.005)*(T?1.7:1),e()*b,w,_,G,T?170+e()*60:90+e()*110)}}let ue=de(t(1.08));for(let i=0;i<l(re.nearStars);i+=1){let a=e()*b,r=e()*2-1,c=Math.sqrt(1-r*r),f=1.05+e()*.35,d=e(),[p,M,x]=[240,238,245];d<.18?[p,M,x]=$(3200+e()*1500):d<.36&&([p,M,x]=$(1e4+e()*15e3)),ue.add(f*c,1,a,0,0,f*r,.003+e()**2*.004,e()*b,p,M,x,80+e()*80)}let B=de(t(1.08)),Ke=(i,a,r,c,f,d,p)=>{let M=Math.cos(d),x=Math.sin(d);for(let y=0;y<p;y+=1){let T=u(e,c),w=u(e,f),_=i+T*M-w*x,G=a+T*x+w*M,E=e()<.12;B.add(Math.hypot(_,G),1,Math.atan2(G,_),0,0,r+u(e,f*.9),E?.012+e()*.01:.02+e()*.045,e()*b,E?255:205,E?130:212,E?165:236,E?16+e()*12:7+e()*9)}},Re=e()*b,De=Re+.4+e()*.2,Te=1.3*Math.cos(Re),ge=1.3*Math.sin(Re),Be=1.55*Math.cos(De),ye=1.55*Math.sin(De),Me=e()*b;Ke(Te,ge,-.85,.1,.055,Me,32),Ke(Be,ye,-1.05,.07,.032,Math.atan2(ge-ye,Te-Be),18);for(let i=0;i<3;i+=1){let a=.09+u(e,.01),r=u(e,.012),c=Te+a*Math.cos(Me)-r*Math.sin(Me),f=ge+a*Math.sin(Me)+r*Math.cos(Me);B.add(Math.hypot(c,f),1,Math.atan2(f,c),0,0,-.85+u(e,.012),i===0?.016+e()*.008:.009+e()*.006,e()*b,255,120,150,i===0?26+e()*10:15+e()*8)}for(let i=0;i<l(26);i+=1){let a=e(),r=I(Te,Be,a)+u(e,.03),c=I(ge,ye,a)+u(e,.03);B.add(Math.hypot(r,c),1,Math.atan2(c,r),0,0,I(-.85,-1.05,a)+u(e,.03),.018+e()*.025,e()*b,205,216,238,1.6+e()*2)}let se=e()*b,me=.9+e()*.5,ze=e()*b;for(let i=0;i<l(240);i+=1){let a=ze+(e()-.5)*4.2,r=1.35+u(e,.06)+.12*Math.sin(a*2),c=r*Math.cos(a),f=r*Math.sin(a)*Math.cos(me),d=c*Math.cos(se)-f*Math.sin(se),p=c*Math.sin(se)+f*Math.cos(se),[M,x,y]=$(4700+e()*1100);B.add(Math.hypot(d,p),1,Math.atan2(p,d),0,0,r*Math.sin(a)*Math.sin(me)+u(e,.05),.01+e()*.007,e()*b,M,x,y,8+e()*10)}for(let i=0;i<l(30);i+=1){let a=ze+u(e,.045),r=1.35+u(e,.025)+.12*Math.sin(a*2),c=r*Math.cos(a),f=r*Math.sin(a)*Math.cos(me),d=c*Math.cos(se)-f*Math.sin(se),p=c*Math.sin(se)+f*Math.cos(se),[M,x,y]=$(4600+e()*1200);B.add(Math.hypot(d,p),1,Math.atan2(p,d),0,0,r*Math.sin(a)*Math.sin(me)+u(e,.02),.01+e()*.007,e()*b,M,x,y,12+e()*12)}for(let i=0;i<18;i+=1){let a=e()*b,r=(.25+e()*.75)*(e()<.5?-1:1),c=Math.sqrt(1-r*r),f=6.5+e()*2.5,d=[f*c*Math.cos(a),f*c*Math.sin(a),f*r],p=e()*b,M=Math.sin(p)*(e()*2-1),x=i===0,y=x||e()<.7;if(x){B.add(Math.hypot(d[0],d[1]),1,Math.atan2(d[1],d[0]),0,0,d[2],.11+e()*.03,e()*b,250,232,204,10+e()*4);for(let T=0;T<8;T+=1){let w=(T+e()*.3)/8*b,_=Math.cos(w)*(.17+e()*.04),G=Math.sin(w)*(.065+e()*.02),E=d[0]+_*Math.cos(p)-G*Math.sin(p),z=d[1]+_*Math.sin(p)+G*Math.cos(p);B.add(Math.hypot(E,z),1,Math.atan2(z,E),0,0,d[2]+_*M,.065+e()*.04,e()*b,226,224,238,3+e()*3)}for(let T=0;T<2;T+=1){let w=e()*b,_=.12+T*.09+e()*.03,G=d[0]+_*Math.cos(w),E=d[1]+_*Math.sin(w);B.add(Math.hypot(G,E),1,Math.atan2(E,G),0,0,d[2]+_*(e()-.5),.028+e()*.018,e()*b,240,228,210,3.5+e()*2)}}else{let T=1+Math.trunc(e()*2);for(let w=0;w<T;w+=1){let _=w*(.04+e()*.03),G=d[0]+_*Math.cos(p),E=d[1]+_*Math.sin(p);B.add(Math.hypot(G,E),1,Math.atan2(E,G),0,0,d[2]+_*M,.05+e()*.06,e()*b,y?245:205,y?228:215,y?205:240,3+e()*4)}}}let Le=e()*b,he=(.3+e()*.6)*(e()<.5?-1:1),ee=Math.sqrt(1-he*he),xe=7.5+e()*1.5;for(let i=0;i<5;i+=1){let a=xe*ee*Math.cos(Le)+u(e,.3),r=xe*ee*Math.sin(Le)+u(e,.3),c=e()<.75;B.add(Math.hypot(a,r),1,Math.atan2(r,a),0,0,xe*he+u(e,.3),.04+e()*.05,e()*b,c?243:210,c?226:216,c?206:238,2.5+e()*2)}for(let i=0;i<3;i+=1){let a=e()*b,r=(.35+e()*.6)*(e()<.5?-1:1),c=Math.sqrt(1-r*r),f=1.6+e()*.5;B.add(f*c,1,a,0,0,f*r,.045+e()*.03,e()*b,228,218,205,2+e()*1.5)}return[g.build({alpha:1,falloffK:4.5,maxPointSize:3.5,novaAmp:0,patternMul:0,sizeMul:1,spikeAmp:0,target:"background",twinkleAmp:.22}),R.build({alpha:.8,falloffK:3,maxPointSize:5,novaAmp:0,patternMul:0,sizeMul:1,spikeAmp:0,target:"background",twinkleAmp:0}),B.build({alpha:1,falloffK:3,maxPointSize:44,novaAmp:0,patternMul:0,sizeMul:1,spikeAmp:0,target:"background",twinkleAmp:0}),N.build({alpha:1,falloffK:3,maxPointSize:110,novaAmp:0,patternMul:1,sizeMul:.82,spikeAmp:0,target:"glow",twinkleAmp:0}),L.build({alpha:1,falloffK:3,maxPointSize:190,novaAmp:0,patternMul:1,sizeMul:.82,spikeAmp:0,target:"glow",twinkleAmp:0}),A.build({alpha:1,falloffK:4.5,maxPointSize:16,novaAmp:0,patternMul:1,sizeMul:1,spikeAmp:.3,target:"stars",twinkleAmp:.1}),K.build({alpha:1,falloffK:3,maxPointSize:84,novaAmp:0,patternMul:1,sizeMul:.82,spikeAmp:0,target:"dust",twinkleAmp:0}),ae.build({alpha:1,falloffK:4.5,maxPointSize:14,novaAmp:1,patternMul:1,sizeMul:1,spikeAmp:.3,target:"foreground",twinkleAmp:.12}),j.build({alpha:1,falloffK:3,maxPointSize:48,novaAmp:0,patternMul:1,sizeMul:.82,spikeAmp:0,target:"foreground",twinkleAmp:0}),ue.build({alpha:.6,falloffK:4.5,maxPointSize:9,novaAmp:0,patternMul:0,sizeMul:1,spikeAmp:0,target:"foreground",twinkleAmp:.2})]};var Yt=F.maxRadius.toFixed(2),Kt=(1/55).toFixed(6),jt=n=>`
attribute vec2 aCorner;
attribute vec4 aOrbit;
attribute vec4 aMotion;
attribute vec4 aColor;
uniform mat4 uViewProj;
uniform vec2 uViewport;
uniform float uTime;
uniform float uPatternRot;
uniform float uPointScale;
uniform float uAlpha;
uniform float uTwinkleAmp;
uniform float uMaxPoint;
uniform vec4 uWarp; // x: amplitude, y: cos(node), z: sin(node), w: start
${n?`uniform float uSpike;
uniform float uNova;
uniform float uSpikeGate; // sprite size (device px) where spikes begin
varying float vSpike;
varying float vNova;`:`uniform vec2 uDepthFade; // x: camera distance, y: 1 / depth range
uniform float uDustNear;`}
varying vec4 vColor;
varying vec2 vCoord;

void main() {
  float a = aOrbit.x;
  float phi = aOrbit.w + aMotion.x * uTime;
  float theta = aOrbit.z + uPatternRot;
  vec2 e = vec2(a * cos(phi), a * aOrbit.y * sin(phi));
  float sT = sin(theta);
  float cT = cos(theta);
  vec2 pos = vec2(cT * e.x - sT * e.y, sT * e.x + cT * e.y);
  // Integral-sign warp of the outer disk: height offset follows
  // sin(azimuth - node), growing towards the rim (Gaia DR2)
  float z = aMotion.y + uWarp.x * smoothstep(uWarp.w, ${Yt}, a) *
    (pos.y * uWarp.y - pos.x * uWarp.z) / max(a, 0.2);
  vec4 clip = uViewProj * vec4(pos, z, 1.0);
${n?`  // Supernova channel: each cycle a rolling hash window elects one star
  // of the layer to flare ~50x and decay over seconds
  float novaTick = uTime * ${Kt};
  float novaPhase = fract(novaTick);
  float novaPick = uNova * step(
    abs(fract(aMotion.w * 0.159155) - fract(floor(novaTick) * 0.618034)),
    0.00007);
  float nova = novaPick *
    smoothstep(0.0, 0.02, novaPhase) * exp(-novaPhase * 9.0);
  float sizePx = aMotion.z * (1.0 + nova * 3.0) * uPointScale /
    max(clip.w, 0.0001);`:"  float sizePx = aMotion.z * uPointScale / max(clip.w, 0.0001);"}
  float fade = clamp(sizePx, 0.0, 1.0);
  float twinkle = 1.0 + uTwinkleAmp *
    sin(uTime * (1.5 + fract(aMotion.w * 0.6366) * 2.5) + aMotion.w);
  float shownSize = clamp(sizePx, 1.0, uMaxPoint);

  // Sprites are instanced quads, not points: each corner is pushed out in
  // clip space by half the sprite size. Partly off-screen sprites then clip
  // per pixel instead of vanishing once their center leaves the viewport
  // (Metal and most mobile GL drivers cull points that way), and no driver
  // point-size limit can shrink the big glow sprites
  vCoord = aCorner;
  gl_Position = clip +
    vec4(aCorner * shownSize / uViewport * clip.w, 0.0, 0.0);
${n?`  // Only sprites big enough to read as saturated stars grow spikes; the
  // gate scales with resolution so hiDPI screens spike the same stars.
  // A supernova always spikes hard at peak, so the flare reads as a
  // dazzling star with a cross flare rather than a flat white ball
  vSpike = max(uSpike * clamp((shownSize / uSpikeGate - 1.0) * 1.08, 0.0, 1.0),
    uSpike * nova * 4.0);
  vNova = min(nova * 2.0, 1.0);
  vColor = vec4(aColor.rgb,
    aColor.a * uAlpha * twinkle * fade * fade * (1.0 + nova * 5.0));`:`  // Inclination asymmetry of extinction: dust on the near side of a tilted
  // disk blocks the light column behind it, while far-side dust is hidden
  // by the disk's own glow - the cue astronomers read to tell which edge
  // of a galaxy is closer. Near-side lanes darken more, far-side less.
  float nearness = clamp(0.5 + (uDepthFade.x - clip.w) * uDepthFade.y,
    0.0, 1.0);
  float dustBias = mix(1.0, mix(0.72, 1.28, nearness), uDustNear);

  vColor = vec4(aColor.rgb,
    aColor.a * uAlpha * twinkle * fade * fade * dustBias);`}
}
`,qt=n=>`
precision mediump float;
varying vec4 vColor;
varying vec2 vCoord;
${n?`varying float vSpike;
varying float vNova;`:""}
uniform vec3 uFalloff; // x: exponent, y: exp(-exponent), z: 1/(1-y)

void main() {
  vec2 p = vCoord;
  float r2 = dot(p, p);

  if (r2 > 1.0) discard;

  float falloff = (exp(-uFalloff.x * r2) - uFalloff.y) * uFalloff.z;
${n?`  // A supernova sharpens its profile (cubed falloff) so the flare shows a
  // compact saturated core with a steep skirt instead of a flat disc
  falloff = mix(falloff, falloff * falloff * falloff, vNova);
  // Four-point diffraction spikes along the screen axes, as telescope
  // spider vanes draw them on the saturated stars of NASA/ESA photographs
  float spikes = vSpike * (1.0 - r2) *
    (exp(-48.0 * p.x * p.x) + exp(-48.0 * p.y * p.y));`:""}
  // The R2 dither needs the integer pixel coordinate intact; GPUs that run
  // mediump at fp16 would collapse the fract, so the coordinate is read at
  // high precision wherever the hardware offers it
#ifdef GL_FRAGMENT_PRECISION_HIGH
  highp vec2 ditherCoord = gl_FragCoord.xy;
#else
  vec2 ditherCoord = gl_FragCoord.xy;
#endif
  float dither =
    fract(dot(ditherCoord, vec2(0.75487767, 0.56984029))) - 0.5;
  float weight =
    vColor.a * ${n?"(falloff + spikes)":"falloff"} * (1.0 + dither * 0.1);

  gl_FragColor = vec4(vColor.rgb * weight, weight);
}
`,_t=`
attribute vec2 aPos;
varying vec2 vUv;

void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`,$t=`
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 vUv;
uniform sampler2D uTex;
uniform float uTonemap;
uniform float uAberration;

void main() {
  vec3 color;

  if (uAberration > 0.0) {
    // Residual chromatic aberration of long-exposure optics: a slight
    // radial RGB split that grows toward the frame corners, felt on the
    // nebulous glow rather than seen on the stars
    vec2 shift = (vUv - 0.5) * uAberration;

    color = vec3(
      texture2D(uTex, vUv + shift).r,
      texture2D(uTex, vUv).g,
      texture2D(uTex, vUv - shift).b);
  } else {
    color = texture2D(uTex, vUv).rgb;
  }

  // Filmic shoulder for the HDR glow: exactly linear below the knee so the
  // tuned mid-tones pass through untouched, then an exponential rolloff
  // that compresses the core's stacked brightness into a warm gradient
  // instead of letting it clip to flat white
  vec3 over = max(color - 0.6, 0.0);
  vec3 shouldered = min(color, vec3(0.6)) + 0.4 * (1.0 - exp(-over * 2.5));
  // A per-channel rolloff bleaches every overexposed texel to the same
  // white. Scaling all channels by the brightest one's rolloff keeps the
  // bulge's golden hue through the gradient, as film does, so the plateau
  // reads as glowing Population II light and only the nucleus whites out
  float peak = max(max(color.r, color.g), color.b);
  float peakShouldered =
    min(peak, 0.6) + 0.4 * (1.0 - exp(-max(peak - 0.6, 0.0) * 2.5));
  vec3 hueKept = color * (peakShouldered / max(peak, 0.0001));

  gl_FragColor =
    vec4(mix(color, mix(shouldered, hueKept, 0.6), uTonemap), 1.0);
}
`,Zt=`
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 vUv;
uniform float uSeed;

void main() {
  // Multiplicative finishing pass. Sensor grain rides on the signal (the
  // shot noise of a long exposure), and a gentle optical vignette eases
  // the frame corners down the way real lens flat-fields fall off -
  // multiplying means pure black stays pure black, so the sky keeps its
  // full contrast while the corners deepen and frame the galaxy
  float noise = fract(
    sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + uSeed) * 43758.5453);
  float vignette = 1.0 - 0.28 * smoothstep(0.4, 0.9, length(vUv - 0.5));

  gl_FragColor = vec4(vec3(vignette * (1.0 + (noise - 0.5) * 0.07)), 1.0);
}
`,Jt=.003,Lt=[1,.72,.5,.32],$e=(()=>{let n=[];for(let s=0;s<8;s+=1){let o=s/8*Math.PI*2;n.push(1.45*Math.cos(o),1.45*Math.sin(o),-.5,1.45*Math.cos(o),1.45*Math.sin(o),.5)}return n})(),Pt=900,Qt=60,en=(n,s)=>{let o={alpha:!1,antialias:!1,depth:!1,powerPreference:s?"low-power":"high-performance",preserveDrawingBuffer:!1,stencil:!1},e=n.getContext("webgl2",o)||n.getContext("webgl",o);if(!e)throw new Error("Failed to getContext for Galaxy wallpaper");return e},Ft=(n,s,o)=>{let e=n.createShader(s);if(n.shaderSource(e,o),n.compileShader(e),!n.getShaderParameter(e,n.COMPILE_STATUS))throw new Error(n.getShaderInfoLog(e)||"Shader compile failed");return e},tn=()=>typeof navigator=="object"&&/android|iphone|ipad|mobi/i.test(navigator.userAgent),nn=()=>Math.trunc(Math.random()*2147483646)+1,rt,an=!1,rn=0;var ot=(n,s,o,e)=>{let l=n.createProgram();if(n.attachShader(l,Ft(n,n.VERTEX_SHADER,s)),n.attachShader(l,Ft(n,n.FRAGMENT_SHADER,o)),e.forEach((t,g)=>n.bindAttribLocation(l,g,t)),n.linkProgram(l),!n.getProgramParameter(l,n.LINK_STATUS))throw new Error(n.getProgramInfoLog(l)||"Program link failed");return l},Gt=(n,s)=>{let{faceOn:o,speed:e}={...pt,...s},l=tn(),t=en(n,l),g=!1;try{"drawingBufferColorSpace"in t&&(t.drawingBufferColorSpace="display-p3",g=t.drawingBufferColorSpace==="display-p3")}catch{}let R=l?.55:1,v=rt&&an===g&&rn===R?rt:wt(R,g,nn()),S=Math.random()*Math.PI*2;rt=void 0;let P=h=>{let m=ot(t,jt(h),qt(h),["aCorner","aOrbit","aMotion","aColor"]);return{program:m,uniforms:{alpha:t.getUniformLocation(m,"uAlpha"),depthFade:t.getUniformLocation(m,"uDepthFade"),dustNear:t.getUniformLocation(m,"uDustNear"),falloff:t.getUniformLocation(m,"uFalloff"),maxPoint:t.getUniformLocation(m,"uMaxPoint"),nova:t.getUniformLocation(m,"uNova"),patternRot:t.getUniformLocation(m,"uPatternRot"),pointScale:t.getUniformLocation(m,"uPointScale"),spike:t.getUniformLocation(m,"uSpike"),spikeGate:t.getUniformLocation(m,"uSpikeGate"),time:t.getUniformLocation(m,"uTime"),twinkleAmp:t.getUniformLocation(m,"uTwinkleAmp"),viewProj:t.getUniformLocation(m,"uViewProj"),viewport:t.getUniformLocation(m,"uViewport"),warp:t.getUniformLocation(m,"uWarp")}}},U=P(!0),N=P(!1),L=[U,N],A=ot(t,_t,$t,["aPos"]),V=ot(t,_t,Zt,["aPos"]),ce=t.getUniformLocation(V,"uSeed"),C={aberration:t.getUniformLocation(A,"uAberration"),tonemap:t.getUniformLocation(A,"uTonemap")},K,J=h=>{K!==h&&(t.useProgram(h),K=h)},ie=Math.random()*Math.PI*2,ne=Math.cos(ie),ae=Math.sin(ie);J(A),t.uniform1i(t.getUniformLocation(A,"uTex"),0);let H=t,Q=typeof H.createVertexArray=="function",j=Q?void 0:t.getExtension("OES_vertex_array_object")||void 0,ue=Q?void 0:t.getExtension("ANGLE_instanced_arrays")||void 0;if(!Q&&!ue)throw new Error("Instanced arrays unsupported for Galaxy wallpaper");let B=h=>{Q?H.vertexAttribDivisor(h,1):ue==null||ue.vertexAttribDivisorANGLE(h,1)},Ke=h=>{Q?H.drawArraysInstanced(t.TRIANGLE_STRIP,0,4,h):ue==null||ue.drawArraysInstancedANGLE(t.TRIANGLE_STRIP,0,4,h)},Re=[],De=h=>{if(Q){let m=H.createVertexArray();return H.bindVertexArray(m),h(),H.bindVertexArray(null),Re.push(m),()=>H.bindVertexArray(m)}if(j){let m=j.createVertexArrayOES();return j.bindVertexArrayOES(m),h(),j.bindVertexArrayOES(null),Re.push(m),()=>j.bindVertexArrayOES(m)}return h},Te=v.map(h=>{let m=t.createBuffer(),te=h;return t.bindBuffer(t.ARRAY_BUFFER,m),t.bufferData(t.ARRAY_BUFFER,h.data,t.STATIC_DRAW),te.data=new ArrayBuffer(0),m}),ge=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,ge),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),t.STATIC_DRAW);let Be=v.map((h,m)=>De(()=>{t.bindBuffer(t.ARRAY_BUFFER,ge),t.enableVertexAttribArray(0),t.vertexAttribPointer(0,2,t.FLOAT,!1,0,0),t.bindBuffer(t.ARRAY_BUFFER,Te[m]),t.enableVertexAttribArray(1),t.enableVertexAttribArray(2),t.enableVertexAttribArray(3),t.vertexAttribPointer(1,4,t.FLOAT,!1,_e,0),t.vertexAttribPointer(2,4,t.FLOAT,!1,_e,16),t.vertexAttribPointer(3,4,t.UNSIGNED_BYTE,!0,_e,nt*4),B(1),B(2),B(3)})),ye=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,ye),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),t.STATIC_DRAW);let Me=De(()=>{t.bindBuffer(t.ARRAY_BUFFER,ye),t.enableVertexAttribArray(0),t.disableVertexAttribArray(1),t.disableVertexAttribArray(2),t.disableVertexAttribArray(3),t.vertexAttribPointer(0,2,t.FLOAT,!1,0,0)}),se=(h,m)=>{let te=t.createTexture(),q=t.createFramebuffer();return t.bindTexture(t.TEXTURE_2D,te),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),{framebuffer:q,height:0,internalFormat:h,texture:te,type:m,width:0}},me=(h,m,te)=>{let q=h;q.width=m,q.height=te,t.bindTexture(t.TEXTURE_2D,q.texture),t.texImage2D(t.TEXTURE_2D,0,q.internalFormat,m,te,0,t.RGBA,q.type,null),t.bindFramebuffer(t.FRAMEBUFFER,q.framebuffer),t.framebufferTexture2D(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,q.texture,0)},ze=t.RGBA,Le=t.UNSIGNED_BYTE,he=!1;if(Q)(t.getExtension("EXT_color_buffer_float")||t.getExtension("EXT_color_buffer_half_float"))&&(ze=H.RGBA16F,Le=H.HALF_FLOAT,he=!0);else{let h=t.getExtension("OES_texture_half_float");h&&t.getExtension("EXT_color_buffer_half_float")&&t.getExtension("OES_texture_half_float_linear")&&(Le=h.HALF_FLOAT_OES,he=!0)}let ee=se(ze,Le),xe=se(t.RGBA,t.UNSIGNED_BYTE);me(ee,2,2);let i=t.checkFramebufferStatus(t.FRAMEBUFFER)===t.FRAMEBUFFER_COMPLETE;!i&&he&&(he=!1,ee.internalFormat=t.RGBA,ee.type=t.UNSIGNED_BYTE,me(ee,2,2),i=t.checkFramebufferStatus(t.FRAMEBUFFER)===t.FRAMEBUFFER_COMPLETE),t.bindFramebuffer(t.FRAMEBUFFER,null),t.disable(t.DEPTH_TEST),t.disable(t.DITHER),t.enable(t.BLEND);let{height:a,width:r}=n,c=!0,f=!1,d=0,p=0,M=0,x=1e3/60,y=0,T=0,w=0,_=1e3/60,G=1e3/60,E=0,z=0,We=0,Pe=0,Fe=0,it=n,Ct=k.distance*(l?k.mobileDistanceMul:1),Ot=o?k.elevationFaceOn:k.elevation+(l?k.mobileElevationAdd:0)+(Math.random()*2-1)*k.elevationJitter,st={background:[],dust:[],foreground:[],glow:[],stars:[]};v.forEach((h,m)=>st[h.target].push({binder:Be[m],falloffCut:Math.exp(-h.falloffK),layer:h,variant:h.spikeAmp>0||h.novaAmp>0?U:N}));let Ae=(h,m,te,q)=>{let Ve=Lt[w],je=Math.min(1/Ve,2.2),X=a/Pt*m,Ge=xt(a)*m;t.blendFunc(h==="dust"?t.ZERO:t.ONE,h==="dust"?t.ONE_MINUS_SRC_COLOR:t.ONE);for(let{binder:ke,falloffCut:Se,layer:Y,variant:we}of st[h]){let Ce=Math.floor(Y.count*Ve);if(Ce>0){let{uniforms:O}=we;J(we.program),ke(),t.uniform1f(O.pointScale,Ge*Y.sizeMul),t.uniform3f(O.falloff,Y.falloffK,Se,1/(1-Se)),t.uniform1f(O.alpha,Y.alpha*je),t.uniform1f(O.maxPoint,Math.max(Y.maxPointSize*X,2)),t.uniform2f(O.viewport,te,q),t.uniform1f(O.twinkleAmp,Y.twinkleAmp),O.spike&&t.uniform1f(O.spike,Y.spikeAmp),O.nova&&t.uniform1f(O.nova,Y.novaAmp),O.dustNear&&t.uniform1f(O.dustNear,h==="dust"?1:0),t.uniform4f(O.warp,F.warpAmplitude*Y.patternMul,ne,ae,F.warpStart),t.uniform1f(O.patternRot,Y.patternMul*F.patternSpeed*T),Ke(Ce)}}},lt=(h,m)=>{J(A),Me(),t.blendFunc(m?t.ONE:t.ZERO,m?t.ONE:t.SRC_COLOR),t.uniform1f(C.tonemap,m&&he?1:0),t.uniform1f(C.aberration,m?Jt:0),t.bindTexture(t.TEXTURE_2D,h.texture),t.drawArrays(t.TRIANGLES,0,3)},It=h=>{_+=(Math.min(h,G*4)-_)*.04,E+=1,!(E<90)&&(_>G*1.6&&w<Lt.length-1?(w+=1,E=0):_<G*1.12&&w>0&&(w-=1,E=0))},ct=h=>{if(f||!c)return;if(d=requestAnimationFrame(ct),M){let W=h-M;W>0&&W<90&&(x+=(W-x)*.05)}M=h,y+=1;let m=Math.max(1,Math.floor(1e3/x/Qt));if(y<m)return;y=0,G=x*m;let te=p?(h-p)/1e3:1/60;if(p=h,te<=0)return;let q=Math.min(te,.1);T+=q*e,It(te*1e3);let Ve=Math.min(q*k.smoothing,1);Pe+=(z-Pe)*Ve,Fe+=(We-Fe)*Ve;let je=Ct*(1+.025*Math.sin(T*.11)),X=Mt({azimuth:S+T*k.azimuthDriftSpeed+Pe*k.parallaxAzimuth,distance:je,elevation:Math.min(Math.max(Ot-Fe*k.parallaxElevation,.15),1.5),panX:-Pe*k.parallaxPan,panY:Fe*k.parallaxPan},r,a);for(let{program:W,uniforms:D}of L)J(W),t.uniformMatrix4fv(D.viewProj,!1,X),t.uniform1f(D.time,T),D.depthFade&&t.uniform2f(D.depthFade,je,.55),D.spikeGate&&t.uniform1f(D.spikeGate,Math.max(9*a/Pt,4));let Ge=r,ke=a,Se=0,Y=0;for(let W=0;W<$e.length;W+=3){let D=$e[W],fe=$e[W+1],Ze=$e[W+2],Je=X[3]*D+X[7]*fe+X[11]*Ze+X[15];if(Je<=.05){Ge=0,ke=0,Se=r,Y=a;break}let mt=((X[0]*D+X[4]*fe+X[8]*Ze+X[12])/Je*.5+.5)*r,ht=((X[1]*D+X[5]*fe+X[9]*Ze+X[13])/Je*.5+.5)*a;Ge=Math.min(Ge,mt),ke=Math.min(ke,ht),Se=Math.max(Se,mt),Y=Math.max(Y,ht)}let we=a*.08+16,Ce=Math.max(0,Math.floor(Ge-we)),O=Math.max(0,Math.floor(ke-we)),ft=Math.min(r-Ce,Math.ceil(Se+we)-Ce),dt=Math.min(a-O,Math.ceil(Y+we)-O);if(i){let W=Math.min(w>=2?.3:.45,620/a),D=Math.max(1,Math.ceil(r*W)),fe=Math.max(1,Math.ceil(a*W));(ee.width!==D||ee.height!==fe)&&(me(ee,D,fe),me(xe,D,fe)),t.viewport(0,0,D,fe),t.clearColor(0,0,0,0),t.bindFramebuffer(t.FRAMEBUFFER,ee.framebuffer),t.clear(t.COLOR_BUFFER_BIT),Ae("glow",W,D,fe),t.clearColor(1,1,1,1),t.bindFramebuffer(t.FRAMEBUFFER,xe.framebuffer),t.clear(t.COLOR_BUFFER_BIT),Ae("dust",W,D,fe),t.bindFramebuffer(t.FRAMEBUFFER,null)}t.viewport(0,0,r,a),t.clearColor(.0012,.0018,.005,1),t.clear(t.COLOR_BUFFER_BIT),Ae("background",1,r,a),i?(ft>0&&dt>0&&(t.enable(t.SCISSOR_TEST),t.scissor(Ce,O,ft,dt)),lt(ee,!0),Ae("stars",1,r,a),lt(xe,!1),t.disable(t.SCISSOR_TEST)):(Ae("glow",1,r,a),Ae("stars",1,r,a),Ae("dust",1,r,a)),Ae("foreground",1,r,a),J(V),Me(),t.blendFunc(t.ZERO,t.SRC_COLOR),t.uniform1f(ce,T*61.8%97),t.drawArrays(t.TRIANGLES,0,3)},ut=()=>{p=0,M=0,y=0,d=requestAnimationFrame(ct)};return ut(),{destroy:()=>{var h;f=!0,cancelAnimationFrame(d),!t.isContextLost()&&(Re.forEach(m=>{Q?H.deleteVertexArray(m):j==null||j.deleteVertexArrayOES(m)}),Te.forEach(m=>t.deleteBuffer(m)),t.deleteBuffer(ye),t.deleteBuffer(ge),[ee,xe].forEach(m=>{t.deleteFramebuffer(m.framebuffer),t.deleteTexture(m.texture)}),t.deleteProgram(U.program),t.deleteProgram(N.program),t.deleteProgram(A),t.deleteProgram(V),(h=t.getExtension("WEBGL_lose_context"))==null||h.loseContext())},resize:(h,m)=>{r=Math.max(1,Math.floor(h)),a=Math.max(1,Math.floor(m)),it.width=r,it.height=a},setTilt:(h,m)=>{z=Math.min(Math.max(h,-1),1),We=Math.min(Math.max(m,-1),1)},setVisible:h=>{c===h||f||(c=h,c?ut():cancelAnimationFrame(d))}}};var kt=({onTilt:n,onVisibility:s})=>{let o,e,l=0,t=0,g=0,R=0,v=0,S=(L,A)=>{let V=Date.now();V-v<16||(v=V,n(Math.tanh(L),Math.tanh(A)))},P=({beta:L,gamma:A,timeStamp:V})=>{var J,ie;if(L===null||A===null)return;if(o===void 0||e===void 0)o=L,e=A;else if(Math.abs(L-l)>25||Math.abs(A-t)>25)o+=L-l,e+=A-t;else{let ne=Math.min(Math.max((V-g)/1e3,.001),.1),ae=(Math.abs(L-l)+Math.abs(A-t))/ne;R+=(ae-R)*Math.min(ne*8,1);let H=Math.min(R/6,1),Q=Math.min(ne*(.3+(.02-.3)*H),1);o+=(L-o)*Q,e+=(A-e)*Q}l=L,t=A,g=V;let ce=(L-o)/18,C=(A-e)/18,K=(typeof((ie=(J=window.screen)==null?void 0:J.orientation)==null?void 0:ie.angle)=="number"?window.screen.orientation.angle:0)%360;K===90?S(ce,-C):K===180?S(-C,-ce):K===270?S(-ce,C):S(C,ce)},U=({buttons:L,clientX:A,clientY:V})=>{L===0&&S((A/window.innerWidth-.5)*2*.22,(V/window.innerHeight-.5)*2*.22)},N=()=>s(!document.hidden);return window.addEventListener("deviceorientation",P,{passive:!0}),window.addEventListener("pointermove",U,{passive:!0}),document.addEventListener("visibilitychange",N,{passive:!0}),()=>{window.removeEventListener("deviceorientation",P),window.removeEventListener("pointermove",U),document.removeEventListener("visibilitychange",N)}};window.DaedalGalaxy={createGalaxyRenderer:Gt,listenGalaxyInput:kt};})();
