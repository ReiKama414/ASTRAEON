import { Suspense, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { asset } from './asset'
import { EarthSystem } from './EarthSystem'

const planeVertex = `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`
const distantFragment = `
uniform sampler2D uMap;uniform float uTime;varying vec2 vUv;
void main(){
 vec2 uv=vUv;
 uv.x+=sin(uv.y*4.1+uTime*.025)*.0015;
 uv.y+=sin(uv.x*5.7-uTime*.018)*.0012;
 vec3 color=texture2D(uMap,uv).rgb;
 gl_FragColor=vec4(color*.88,1.);
}`
const veilFragment = `
uniform sampler2D uMap;uniform float uTime;uniform float uOpacity;uniform vec3 uTint;
varying vec2 vUv;
void main(){
 vec2 uv=vUv+vec2(sin(vUv.y*5.+uTime*.07)*.004,cos(vUv.x*4.-uTime*.05)*.004);
 vec4 gas=texture2D(uMap,uv);
 float soft=smoothstep(.01,.3,gas.a);
 gl_FragColor=vec4(gas.rgb*uTint,gas.a*soft*uOpacity);
}`
const cloudFragment = `
uniform float uTime;uniform vec3 uColor;varying vec2 vUv;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.03+vec2(7.7,12.4);a*=.5;}return v;}
void main(){
 vec2 p=(vUv-.5)*2.;p.x*=1.45;
 float n=fbm(p*3.2+vec2(uTime*.01,-uTime*.007));
 float filaments=smoothstep(.41,.74,n);
 float envelope=exp(-dot(p,p)*1.65);
 float alpha=filaments*envelope*.12;
 gl_FragColor=vec4(uColor*(.65+n*.5),alpha);
}`
const particleVertex = `
attribute float aSize;attribute float aPhase;varying vec3 vColor;varying float vPhase;
uniform float uTime;
void main(){
 vColor=color;vPhase=aPhase;
 vec3 p=position;
 p.x+=sin(uTime*.05+aPhase)*.035;p.y+=cos(uTime*.04+aPhase)*.035;
 vec4 mv=modelViewMatrix*vec4(p,1.);
 gl_PointSize=clamp(aSize*48./max(2.,-mv.z),1.,9.);
 gl_Position=projectionMatrix*mv;
}`
const particleFragment = `
varying vec3 vColor;varying float vPhase;uniform float uTime;
void main(){
 vec2 p=gl_PointCoord-.5;float r=length(p);
 float core=exp(-r*r*62.);
 float halo=exp(-r*r*12.)*.25;
 float sparkle=.88+.12*sin(uTime*.65+vPhase);
 gl_FragColor=vec4(vColor*sparkle,(core+halo)*smoothstep(.5,.34,r));
}`
const diskFragment = `
varying vec2 vUv;uniform float uTime;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.04+vec2(9.2,7.5);a*=.5;}return v;}
void main(){
 vec2 p=(vUv-.5)*2.;p.x*=1.12;p.y*=1.22;
 float r=length(p),a=atan(p.y,p.x);
 float turbulence=fbm(p*6.+uTime*.006);
 float spiral=pow(.5+.5*cos(a*3.-r*9.+turbulence*1.8),3.);
 float lane=pow(.5+.5*cos(a*3.-r*9.+turbulence*1.8+1.3),5.);
 float core=exp(-r*r*29.);
 float edge=1.-smoothstep(.45,1.,r);
 float density=max(0.,spiral*(.4+turbulence*.65)-lane*.22)*edge;
 vec3 color=mix(vec3(.07,.2,.45),vec3(.36,.17,.48),turbulence+r*.25);
 color+=vec3(.72,.53,.38)*core*.56;
 gl_FragColor=vec4(color,clamp(density*.62+core*.46,0.,.72));
}`

function random(i: number, salt: number) {
  const x = Math.sin(i*127.17+salt*78.233)*43758.5453
  return x-Math.floor(x)
}

function DistantNebula() {
  const map=useTexture(asset('showcase/nebula-distant.webp'))
  map.colorSpace=THREE.SRGBColorSpace
  const material=useMemo(()=>new THREE.ShaderMaterial({
    uniforms:{uMap:{value:map},uTime:{value:0}},vertexShader:planeVertex,fragmentShader:distantFragment,
    depthWrite:false,depthTest:false,
  }),[map])
  useFrame(({clock})=>{material.uniforms.uTime.value=clock.elapsedTime})
  return <mesh position={[0,0,-42]} scale={[96,48,1]} material={material} renderOrder={-10}><planeGeometry args={[1,1]}/></mesh>
}

function GasVeil({near=false}:{near?:boolean}) {
  const map=useTexture(asset('showcase/nebula-foreground.webp'))
  map.colorSpace=THREE.SRGBColorSpace
  const group=useRef<THREE.Group>(null)
  const material=useMemo(()=>new THREE.ShaderMaterial({
    uniforms:{uMap:{value:map},uTime:{value:0},uOpacity:{value:near?.24:.34},uTint:{value:new THREE.Color(near?'#a6c8f1':'#b9a6f2')}},
    vertexShader:planeVertex,fragmentShader:veilFragment,transparent:true,depthWrite:false,
    blending:THREE.NormalBlending,side:THREE.DoubleSide,
  }),[map,near])
  useFrame(({clock,pointer})=>{
    material.uniforms.uTime.value=clock.elapsedTime
    if(group.current){group.current.position.x=(near?4.4:4.8)+pointer.x*(near?.32:.15)+Math.sin(clock.elapsedTime*.08)*.1;group.current.position.y=(near?-.4:.5)+pointer.y*(near?.18:.08)}
  })
  return <group ref={group} position={[near?4.4:4.8,near?-.4:.5,near?-9:-21]}>
    <mesh scale={near?[24,12,1]:[47,23.5,1]} rotation={[0,0,near?-.16:.07]} material={material} renderOrder={near?4:0}><planeGeometry args={[1,1]}/></mesh>
  </group>
}

function FlowingGas() {
  const material=useMemo(()=>new THREE.ShaderMaterial({
    uniforms:{uTime:{value:0},uColor:{value:new THREE.Color('#6e8ddd')}},
    vertexShader:planeVertex,fragmentShader:cloudFragment,
    transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
  }),[])
  useFrame(({clock})=>{material.uniforms.uTime.value=clock.elapsedTime})
  return <mesh position={[4.6,-.5,-5.5]} rotation={[.18,.2,-.18]} scale={[18,10,1]} material={material} renderOrder={5}><planeGeometry args={[1,1]}/></mesh>
}

function StarField({mobile}:{mobile:boolean}) {
  const count=mobile?1100:2600
  const geometry=useMemo(()=>{
    const p=new Float32Array(count*3),c=new Float32Array(count*3),size=new Float32Array(count),phase=new Float32Array(count)
    const colors=['#c6e6ff','#aabdec','#fff4df','#d3a7ed'].map(v=>new THREE.Color(v))
    for(let i=0;i<count;i++){
      const depth=i%3
      const z=[-33,-16,-4][depth]
      const spread=[46,29,13][depth]
      p.set([(random(i,1)-.5)*spread*2,(random(i,2)-.5)*spread*.93,z+(random(i,3)-.5)*3],i*3)
      const col=colors[Math.floor(random(i,4)*colors.length)].clone().multiplyScalar(.28+random(i,5)*.65)
      c.set([col.r,col.g,col.b],i*3)
      size[i]=(random(i,6)>.992?3.1:.55)*(random(i,7)*.7+.7)
      phase[i]=random(i,8)*6.283
    }
    const g=new THREE.BufferGeometry()
    g.setAttribute('position',new THREE.BufferAttribute(p,3))
    g.setAttribute('color',new THREE.BufferAttribute(c,3))
    g.setAttribute('aSize',new THREE.BufferAttribute(size,1))
    g.setAttribute('aPhase',new THREE.BufferAttribute(phase,1))
    return g
  },[count])
  const material=useMemo(()=>new THREE.ShaderMaterial({
    uniforms:{uTime:{value:0}},vertexShader:particleVertex,fragmentShader:particleFragment,
    vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  }),[])
  useFrame(({clock})=>{material.uniforms.uTime.value=clock.elapsedTime})
  return <points geometry={geometry} material={material} frustumCulled={false} renderOrder={3}/>
}

function LuminousGalaxy({mobile}:{mobile:boolean}) {
  const group=useRef<THREE.Group>(null)
  const count=mobile?6500:15500
  const geometry=useMemo(()=>{
    const p=new Float32Array(count*3),c=new Float32Array(count*3),size=new Float32Array(count),phase=new Float32Array(count)
    const warm=new THREE.Color('#fff0cf'),blue=new THREE.Color('#9ebef2'),lilac=new THREE.Color('#c7a5e6')
    for(let i=0;i<count;i++){
      const r=Math.pow(random(i,1),.8)*3.1
      const a=(i%3)*Math.PI*2/3+r*1.5+(random(i,2)-.5)*(.18+r*.28)
      const scatter=random(i,4)<.23?(random(i,5)-.5)*.65:0
      p.set([Math.cos(a)*(r+scatter)*1.2,Math.sin(a)*(r+scatter)*.8,(random(i,3)-.5)*(.14+.4*Math.exp(-r))],i*3)
      const col=warm.clone().lerp(blue,Math.min(1,r*.58)).lerp(lilac,random(i,6)*.3)
      col.multiplyScalar(.42+random(i,7)*.62)
      c.set([col.r,col.g,col.b],i*3)
      size[i]=(r<.65?.82:.52)*(.65+random(i,8)*.9)
      phase[i]=random(i,9)*6.283
    }
    const g=new THREE.BufferGeometry()
    g.setAttribute('position',new THREE.BufferAttribute(p,3))
    g.setAttribute('color',new THREE.BufferAttribute(c,3))
    g.setAttribute('aSize',new THREE.BufferAttribute(size,1))
    g.setAttribute('aPhase',new THREE.BufferAttribute(phase,1))
    return g
  },[count])
  const stars=useMemo(()=>new THREE.ShaderMaterial({
    uniforms:{uTime:{value:0}},vertexShader:particleVertex,fragmentShader:particleFragment,
    vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  }),[])
  const gas=useMemo(()=>new THREE.ShaderMaterial({
    uniforms:{uTime:{value:0}},vertexShader:planeVertex,fragmentShader:diskFragment,
    transparent:true,depthWrite:false,blending:THREE.NormalBlending,side:THREE.DoubleSide,
  }),[])
  useFrame(({clock,pointer})=>{
    stars.uniforms.uTime.value=clock.elapsedTime;gas.uniforms.uTime.value=clock.elapsedTime
    if(group.current){group.current.rotation.z=-.26+clock.elapsedTime*.003;group.current.rotation.y=-.32+pointer.x*.035}
  })
  return <group ref={group} position={[mobile?1.35:3.4,.1,-2.2]} rotation={[.48,-.32,-.26]} scale={mobile?1.15:1.45}>
    <mesh position={[0,0,-.1]} scale={[8.5,6.1,1]} material={gas} renderOrder={1}><planeGeometry args={[1,1]}/></mesh>
    <points geometry={geometry} material={stars} frustumCulled={false} renderOrder={2}/>
  </group>
}

export function DreamlikeUniverseShowcase() {
  const {size}=useThree()
  const mobile=size.width<760
  const root=useRef<THREE.Group>(null)
  useFrame(({clock,pointer})=>{
    if(root.current){root.current.position.x=pointer.x*.045;root.current.position.y=Math.sin(clock.elapsedTime*.16)*.05+pointer.y*.035}
  })
  return <group ref={root}>
    <DistantNebula/>
    <GasVeil/>
    <LuminousGalaxy mobile={mobile}/>
    <StarField mobile={mobile}/>
    <Suspense fallback={null}><group position={[mobile?1.45:4.15,mobile?1.1:-.25,.65]} scale={mobile?.68:1.05}><EarthSystem/></group></Suspense>
    <GasVeil near/>
    <FlowingGas/>
  </group>
}
