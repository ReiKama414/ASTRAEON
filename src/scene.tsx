import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, useTexture } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { findBody, type Celestial } from './data'
import { useStore } from './store'
import { DreamlikeUniverseShowcase } from './DreamlikeUniverseShowcase'
import { EarthSystem } from './EarthSystem'

const texture = (name: string) => `/textures/${name}.jpg`

function CameraDirector({ body }: { body: Celestial }) {
  const { camera } = useThree()
  const controls = useRef<OrbitControlsImpl>(null)
  const mode = useStore(s => s.cameraMode)
  const autoTour = useStore(s => s.autoTour)
  const timeRate = useStore(s => s.timeRate)
  const stopTour = useStore(s => s.setAutoTour)
  const destination = useRef(new THREE.Vector3(0, 0, 10))
  const interacting = useRef(false)
  const keys = useRef(new Set<string>())
  const clock = useRef(0)
  const [small, setSmall] = useState(() => window.innerWidth < 760)
  useEffect(() => {
    const update = () => setSmall(window.innerWidth < 760)
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  useEffect(()=>{
    const down=(event:KeyboardEvent)=>{if(event.target instanceof HTMLInputElement)return;keys.current.add(event.key.toLowerCase())}
    const up=(event:KeyboardEvent)=>keys.current.delete(event.key.toLowerCase())
    window.addEventListener('keydown',down);window.addEventListener('keyup',up)
    return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up)}
  },[])
  useEffect(() => {
    const d = small ? 10.6 : body.kind === 'galaxy' || body.kind === 'overview' ? 10.8 : body.id === 'saturn' ? 10.8 : 10
    destination.current.set(mode==='surface' && body.id==='earth' ? (small?0:2) : 0, mode==='surface' && body.id==='earth' ? .4 : 0, mode==='surface' && body.id==='earth' ? (small?4.8:4.2) : d)
  }, [body, small, mode])
  useFrame((state, delta) => {
    const targetX = mode==='surface' && body.id==='earth' ? (small?0:2) : 0
    let targetPoint = new THREE.Vector3(targetX, mode === 'surface' && body.id === 'earth' ? 2.5 : 0, 0)
    if(mode==='follow' && body.kind==='solar-system'){
      const a=state.clock.elapsedTime*.22*timeRate+1.28*3
      targetPoint=new THREE.Vector3(Math.cos(a)*1.28,Math.sin(a)*1.28*.71,Math.sin(a)*.13).applyEuler(new THREE.Euler(-.29,0,-.12)).add(new THREE.Vector3(small?0:2,0,0))
      destination.current.copy(targetPoint).add(new THREE.Vector3(0,.45,3.2))
    }
    if(mode==='free-fly' && controls.current){
      targetPoint=controls.current.target.clone()
      const direction=new THREE.Vector3();camera.getWorldDirection(direction)
      const right=new THREE.Vector3().crossVectors(direction,camera.up).normalize()
      const travel=new THREE.Vector3()
      if(keys.current.has('w'))travel.add(direction)
      if(keys.current.has('s'))travel.sub(direction)
      if(keys.current.has('d'))travel.add(right)
      if(keys.current.has('a'))travel.sub(right)
      if(keys.current.has('e'))travel.y+=1
      if(keys.current.has('q'))travel.y-=1
      if(travel.lengthSq()>0){travel.normalize().multiplyScalar(delta*2.3);camera.position.add(travel);controls.current.target.add(travel);destination.current.copy(camera.position);targetPoint=controls.current.target.clone()}
    }
    controls.current?.target.lerp(targetPoint, 1 - Math.exp(-delta * 2.4))
    if (!interacting.current) {
      const drift=body.kind==='overview' ? new THREE.Vector3(Math.sin(state.clock.elapsedTime*.12)*.065,Math.sin(state.clock.elapsedTime*.18)*.045,0) : new THREE.Vector3()
      camera.position.lerp(destination.current.clone().add(drift), 1 - Math.exp(-delta * 1.8))
    }
    if (autoTour || mode === 'tour') {
      clock.current += delta
      const a = clock.current * 0.12
      const radius = small ? 10.6 : 10
      camera.position.set(Math.sin(a) * radius * 0.25, Math.sin(a * 0.7) * 0.65, Math.cos(a) * radius)
    }
    controls.current?.update()
  })
  return <OrbitControls ref={controls} enablePan={mode === 'free-fly'} enableZoom minDistance={mode==='surface'?3.3:body.kind === 'earth' ? 3.5 : 4.3} maxDistance={body.kind==='overview'?15:18} minAzimuthAngle={body.kind==='overview' ? -.42 : -Infinity} maxAzimuthAngle={body.kind==='overview' ? .42 : Infinity} minPolarAngle={body.kind==='overview' ? 1.2 : 0} maxPolarAngle={body.kind==='overview' ? 1.94 : Math.PI} rotateSpeed={0.5} zoomSpeed={0.7} enableDamping dampingFactor={0.07} onStart={() => { interacting.current=true; if (autoTour) stopTour(false) }} onEnd={() => { interacting.current=false; destination.current.copy(camera.position) }} />
}

function SpaceDust({ count = 550 }: { count?: number }) {
  const points = useMemo(() => {
    const values = new Float32Array(count * 3)
    for (let i=0; i<count; i++) {
      const a = i * 2.399963
      const r = Math.sqrt((i + .5) / count)
      values[i*3] = Math.cos(a) * r * 8
      values[i*3+1] = Math.sin(a) * r * 5
      values[i*3+2] = -3 - (i % 17) * .15
    }
    return values
  }, [count])
  return <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[points,3]} /></bufferGeometry><pointsMaterial size={0.018} color="#7ca4cf" transparent opacity={0.56} sizeAttenuation depthWrite={false} /></points>
}

const atmosphereVertex = `varying vec3 vNormal; varying vec3 vEye; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.0); vNormal=normalize(normalMatrix*normal); vEye=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }`
const atmosphereFragment = `varying vec3 vNormal; varying vec3 vEye; uniform vec3 glowColor; void main(){ float rim=pow(1.0-max(dot(normalize(vNormal),normalize(vEye)),0.0),3.0); gl_FragColor=vec4(glowColor,rim*0.48); }`

function Atmosphere({ radius, color }: { radius:number; color:string }) {
  const uniforms = useMemo(() => ({ glowColor:{ value:new THREE.Color(color) } }), [color])
  return <mesh scale={radius * 1.035}><sphereGeometry args={[1,64,48]} /><shaderMaterial vertexShader={atmosphereVertex} fragmentShader={atmosphereFragment} uniforms={uniforms} transparent depthWrite={false} side={THREE.FrontSide} blending={THREE.AdditiveBlending} /></mesh>
}

function Sun() {
  const glow = useRef<THREE.Mesh>(null)
  useFrame(({clock}) => { if(glow.current) glow.current.rotation.y = clock.elapsedTime * .065 })
  const uniforms = useMemo(() => ({ uTime:{value:0} }), [])
  useFrame((_,d) => { uniforms.uTime.value += d })
  return <group>
    <pointLight color="#ffb46f" intensity={23} distance={23} decay={1.5} />
    <mesh><sphereGeometry args={[2.05,96,64]} /><shaderMaterial uniforms={uniforms} vertexShader={`varying vec3 v; void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`} fragmentShader={`varying vec3 v;uniform float uTime;float h(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}void main(){vec3 p=normalize(v)*14.;float n=h(floor(p))+h(floor(p*2.4))*.22;float f=sin(p.y*4.+uTime*.8+sin(p.x*3.))*.08;vec3 c=mix(vec3(.88,.22,.035),vec3(1.,.76,.26),clamp(n+f,.0,1.));gl_FragColor=vec4(c,1.);}`} /></mesh>
    <mesh ref={glow} scale={2.22}><sphereGeometry args={[1,64,48]} /><meshBasicMaterial color="#ff8b3d" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
    <Atmosphere radius={2.15} color="#ff8a42" />
  </group>
}

function Ring() {
  const map = useTexture('/textures/saturn_ring.png')
  const mat = useMemo(() => new THREE.ShaderMaterial({ transparent:true, side:THREE.DoubleSide, depthWrite:false, uniforms:{ ringMap:{value:map} }, vertexShader:`varying float vRadius; void main(){vRadius=length(position.xy);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`, fragmentShader:`uniform sampler2D ringMap;varying float vRadius;void main(){float t=clamp((vRadius-2.14)/(3.25-2.14),0.,1.);vec4 c=texture2D(ringMap,vec2(t,.5));gl_FragColor=vec4(c.rgb,c.a*.82);}` }), [map])
  return <mesh rotation={[-Math.PI / 2.65,0,0]}><ringGeometry args={[2.14,3.25,128]} /><primitive object={mat} attach="material" /></mesh>
}

function Planet({ body }: { body: Celestial }) {
  const map = useTexture(texture(body.texture!))
  map.colorSpace=THREE.SRGBColorSpace
  return <group>
    <mesh rotation={[.1,-.8,.04]}><sphereGeometry args={[body.radius,96,64]} /><meshStandardMaterial map={map} roughness={body.kind === 'gas' ? .98 : .82} /></mesh>
    {(body.kind === 'ice' || body.id === 'venus') && <Atmosphere radius={body.radius} color={body.color} />}
    {body.id === 'saturn' && <Ring />}
  </group>
}

const solarOrbits = [
  ['mercury',.68,.052,.42],['venus',.96,.085,.27],['earth',1.28,.09,.22],['mars',1.58,.07,.17],
  ['jupiter',2.02,.19,.10],['saturn',2.48,.15,.075],['uranus',2.91,.12,.053],['neptune',3.33,.12,.039],
] as const

function OrbitPath({ radius }: { radius:number }) {
  const points=useMemo(()=>Array.from({length:129},(_,i)=>{
    const a=i/128*Math.PI*2
    return new THREE.Vector3(Math.cos(a)*radius,Math.sin(a)*radius*.71,0)
  }),[radius])
  const coords=useMemo(()=>new Float32Array(points.flatMap(p=>[p.x,p.y,p.z])),[points])
  return <line><bufferGeometry><bufferAttribute attach="attributes-position" args={[coords,3]} /></bufferGeometry><lineBasicMaterial color="#6683a6" transparent opacity={.28} /></line>
}

function MiniPlanet({ id, orbitalRadius, radius, speed }: { id:string; orbitalRadius:number; radius:number; speed:number }) {
  const body=findBody(id)
  const map=useTexture(texture(body.texture!))
  const group=useRef<THREE.Group>(null)
  const rate=useStore(s=>s.timeRate)
  const select=useStore(s=>s.select)
  map.colorSpace=THREE.SRGBColorSpace
  useFrame(({clock})=>{
    if(!group.current)return
    const a=clock.elapsedTime*speed*rate + orbitalRadius*3
    group.current.position.set(Math.cos(a)*orbitalRadius,Math.sin(a)*orbitalRadius*.71,Math.sin(a)*.13)
  })
  return <group ref={group} onClick={e=>{e.stopPropagation();select(id)}}>
    <mesh><sphereGeometry args={[radius,24,16]} /><meshStandardMaterial map={map} roughness={.85} /></mesh>
    <mesh visible={false}><sphereGeometry args={[Math.max(radius,.12),12,8]} /><meshBasicMaterial /></mesh>
  </group>
}

function SolarOverview() {
  const showOrbits=useStore(s=>s.showOrbits)
  return <group rotation={[-.29,0,-.12]}>
    <pointLight color="#ffd099" intensity={30} distance={9} decay={1.8} />
    <mesh><sphereGeometry args={[.31,32,24]} /><meshBasicMaterial color="#ffbe77" /></mesh>
    <mesh scale={.42}><sphereGeometry args={[1,32,24]} /><meshBasicMaterial color="#ff9d53" transparent opacity={.15} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
    {solarOrbits.map(([id,r,size,speed])=><group key={id}>{showOrbits&&<OrbitPath radius={r}/>}<MiniPlanet id={id} orbitalRadius={r} radius={size} speed={speed}/></group>)}
  </group>
}

function Galaxy({ andromeda = false, overview = false }: { andromeda?:boolean; overview?:boolean }) {
  const ref = useRef<THREE.Points>(null)
  const { positions, colors } = useMemo(() => {
    const count = overview ? 11500 : 18500
    const positions = new Float32Array(count*3), colors = new Float32Array(count*3)
    const core = new THREE.Color(andromeda ? '#f6d7a8' : '#fff3df')
    const arm = new THREE.Color(andromeda ? '#a9c3e7' : '#7da9ff')
    for(let i=0;i<count;i++){
      const t=i/count, r=Math.pow(t,.62)*3.25, branch=i%4
      const jitter=Math.sin(i*127.1)*.22 + Math.sin(i*42.21)*.12
      const a=branch*Math.PI/2+r*2.05+jitter
      const x=Math.cos(a)*r, y=Math.sin(a)*r*.61
      positions.set([x,y,(Math.sin(i*78.2)*.12 + (1-t)*Math.sin(i*.71)*.38)],i*3)
      const col=core.clone().lerp(arm,Math.min(1,t*1.3)); col.multiplyScalar(.55+Math.abs(Math.sin(i*17.6))*.45)
      colors.set([col.r,col.g,col.b],i*3)
    }
    return {positions,colors}
  }, [andromeda,overview])
  useFrame((_,d)=>{if(ref.current) ref.current.rotation.z+=d*.018})
  return <group rotation={[-.42,0,andromeda?.45:0]}>
    <points ref={ref}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]} /><bufferAttribute attach="attributes-color" args={[colors,3]} /></bufferGeometry><pointsMaterial size={overview?.028:.024} transparent opacity={.86} vertexColors sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} /></points>
    <mesh><planeGeometry args={[2.9,2.9]} /><shaderMaterial transparent depthWrite={false} blending={THREE.AdditiveBlending} uniforms={{ glow:{value:new THREE.Color(andromeda?'#ffd8a1':'#b9c7ff')} }} vertexShader={`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`} fragmentShader={`varying vec2 vUv;uniform vec3 glow;void main(){vec2 q=(vUv-.5)*2.;float v=exp(-dot(q,q)*8.);gl_FragColor=vec4(glow*v,v*.39);}`} /></mesh>
    {overview && <group position={[-3.1,1.55,-1.2]} scale={.32}><Galaxy andromeda /></group>}
  </group>
}

const constellationMaps: Record<string,{stars:[number,number,number][];edges:[number,number][]}> = {
  orion:{stars:[[-1.8,1.65,-.6],[-.8,.5,0],[.05,.34,.2],[.85,.17,-.1],[1.75,1.3,-.5],[1.4,-1.25,.1],[-1.1,-1.6,.2],[-.25,-.65,.1]],edges:[[0,1],[1,2],[2,3],[3,4],[1,6],[3,5],[2,7]]},
  cassiopeia:{stars:[[-2,-.7,.1],[-1.05,1.15,-.2],[-.15,-.3,.2],[.95,1.1,-.1],[2,-.4,.1]],edges:[[0,1],[1,2],[2,3],[3,4]]},
  cygnus:{stars:[[0,1.9,.1],[0,.65,-.1],[0,-.45,.2],[0,-1.7,-.2],[-1.65,.25,.1],[1.65,.25,-.1]],edges:[[0,1],[1,2],[2,3],[4,1],[1,5]]},
}
function Constellation({ id }: { id:string }) {
  const {stars,edges}=constellationMaps[id]
  const coords = useMemo(() => new Float32Array(stars.flat()), [stars])
  const segments = useMemo(() => {
    return new Float32Array(edges.flatMap(([a,b])=>[...stars[a],...stars[b]]))
  },[stars,edges])
  return <group>
    <lineSegments><bufferGeometry><bufferAttribute attach="attributes-position" args={[segments,3]} /></bufferGeometry><lineBasicMaterial color="#5c9fdb" transparent opacity={.56} /></lineSegments>
    <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[coords,3]} /></bufferGeometry><pointsMaterial color="#d6eeff" size={.16} sizeAttenuation transparent /></points>
    {stars.map((p,i)=><mesh key={i} position={p} scale={i===0?.085:.055}><sphereGeometry args={[1,16,12]} /><meshBasicMaterial color={i===0?'#ffc797':'#e3f5ff'} /></mesh>)}
  </group>
}

function Nebula({ blue=false }: { blue?:boolean }) {
  const {positions,colors}=useMemo(()=>{
    const count=12500, positions=new Float32Array(count*3), colors=new Float32Array(count*3)
    const palette=(blue?['#81d0f4','#817dcf','#c59abc','#7be3df']:['#ff9b9e','#9274df','#6bc8e9','#e8b890']).map(c=>new THREE.Color(c))
    for(let i=0;i<count;i++){
      const u=i*.618033, a=u*Math.PI*2, band=Math.sin(i*.003)*.75
      const r=Math.sqrt(i/count)*3.25 + Math.sin(i*.092)*.17
      positions.set([Math.cos(a)*r*.92+band,Math.sin(a)*r*.62,Math.sin(i*.21)*.95],i*3)
      const c=palette[Math.floor(i/135)%4].clone().multiplyScalar(.35+Math.abs(Math.sin(i*2.4))*.4)
      colors.set([c.r,c.g,c.b],i*3)
    }
    return {positions,colors}
  },[blue])
  const group=useRef<THREE.Group>(null)
  useFrame((_,d)=>{if(group.current) group.current.rotation.y+=d*.025})
  return <group ref={group} rotation={[.2,0,-.25]}>
    <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]} /><bufferAttribute attach="attributes-color" args={[colors,3]} /></bufferGeometry><pointsMaterial vertexColors transparent opacity={.7} size={.065} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} /></points>
    <mesh scale={[1.85,.85,.55]}><sphereGeometry args={[1,32,24]} /><meshBasicMaterial color="#765da5" transparent opacity={.055} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
  </group>
}

function BlackHole() {
  const disk=useRef<THREE.Group>(null)
  const uniforms=useMemo(()=>({uTime:{value:0}}),[])
  useFrame((_,d)=>{if(disk.current)disk.current.rotation.z+=d*.075;uniforms.uTime.value+=d})
  return <group>
    <mesh scale={3.85}><planeGeometry args={[1,1]} /><shaderMaterial transparent depthWrite={false} uniforms={uniforms} vertexShader={`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`} fragmentShader={`varying vec2 vUv;uniform float uTime;float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){vec2 p=vUv*2.-1.;float r=length(p);float a=atan(p.y,p.x);vec2 q=p+normalize(p)*(.08/max(r,.18));float s=step(.997,h(floor(q*105.+vec2(uTime*.01,0.))));float lens=exp(-pow((r-.39)*15.,2.));vec3 c=vec3(.6,.75,1.)*s*.75+vec3(1.,.44,.14)*lens*.23;float alpha=max(s*.9,lens*.36);gl_FragColor=vec4(c,alpha);}`} /></mesh>
    <group ref={disk} rotation={[1.12,0,.12]}>
      {[0,1,2,3,4,5].map(i=><mesh key={i} rotation={[0,0,i*.47]}><torusGeometry args={[1.48+i*.145,.06+i*.018,10,160]} /><meshBasicMaterial color={i<2?'#fff0b5':i<4?'#ff9b4e':'#bd5432'} transparent opacity={.72-i*.06} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>)}
    </group>
    <mesh><sphereGeometry args={[.88,64,48]} /><meshBasicMaterial color="#010108" /></mesh>
    <mesh><torusGeometry args={[.94,.065,16,96]} /><meshBasicMaterial color="#ffb36a" blending={THREE.AdditiveBlending} /></mesh>
  </group>
}

function Fantasy({ volcanic=false }: { volcanic?:boolean }) {
  const uniforms=useMemo(()=>({uTime:{value:0}}),[])
  useFrame((_,d)=>{uniforms.uTime.value+=d})
  if(volcanic)return <group>
    <mesh><sphereGeometry args={[2.04,128,96]} /><shaderMaterial uniforms={uniforms} vertexShader={`varying vec3 v;uniform float uTime;void main(){v=position;vec3 p=normalize(position);float b=sin(p.x*18.+sin(p.y*7.))*sin(p.z*15.+uTime*.05);vec3 displaced=position+normal*b*.025;gl_Position=projectionMatrix*modelViewMatrix*vec4(displaced,1.);}`} fragmentShader={`varying vec3 v;uniform float uTime;void main(){vec3 p=normalize(v);p+=.14*sin(p.yzx*7.+uTime*.035);float f=sin(p.x*12.+sin(p.y*6.))*sin(p.y*11.+sin(p.z*8.))*sin(p.z*10.+sin(p.x*7.));float fissure=1.-smoothstep(.012,.10,abs(f));float rock=.55+.4*sin(p.x*29.)*sin(p.y*24.)*sin(p.z*23.);vec3 base=mix(vec3(.025,.018,.02),vec3(.11,.055,.041),rock);vec3 lava=mix(vec3(.9,.15,.025),vec3(1.,.67,.12),fissure);gl_FragColor=vec4(mix(base,lava,fissure*.95),1.);}`} /></mesh>
    <Atmosphere radius={2.04} color="#ff6e3a" />
    <Embers />
  </group>
  return <group>
    <mesh><sphereGeometry args={[2.06,96,64]} /><shaderMaterial uniforms={uniforms} vertexShader={`varying vec3 v;void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`} fragmentShader={`varying vec3 v;uniform float uTime;void main(){vec3 p=normalize(v);float wave=sin(p.y*19.+sin(p.x*13.+uTime*.26)*2.5+uTime*.22);float tracer=pow(max(0.,sin(p.x*28.+p.y*13.+uTime*.34)),8.);vec3 deep=vec3(.015,.2,.32),bright=vec3(.09,.7,.83);vec3 c=mix(deep,bright,.5+.5*wave)+tracer*vec3(.24,.8,.9)*.42;gl_FragColor=vec4(c,1.);}`} /></mesh>
    <Atmosphere radius={2.06} color="#59e7f6" />
    <mesh rotation={[.62,.18,.4]}><torusGeometry args={[2.16,.012,6,180,Math.PI*1.4]} /><meshBasicMaterial color="#83f2f0" transparent opacity={.46} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
    <mesh rotation={[-.55,.8,-.2]}><torusGeometry args={[2.21,.008,6,180,Math.PI*1.1]} /><meshBasicMaterial color="#b384f7" transparent opacity={.33} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
  </group>
}

function Embers() {
  const positions=useMemo(()=>{
    const arr=new Float32Array(340*3)
    for(let i=0;i<340;i++){
      const a=i*2.399963, z=1-2*(i+.5)/340, r=Math.sqrt(1-z*z)*(2.13+Math.abs(Math.sin(i*78.7))*.24)
      arr.set([Math.cos(a)*r,Math.sin(a)*r,z*2.2],i*3)
    }
    return arr
  },[])
  return <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]} /></bufferGeometry><pointsMaterial color="#ff8f40" size={.023} transparent opacity={.75} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} /></points>
}

function CelestialObject({ body }: { body: Celestial }) {
  const group=useRef<THREE.Group>(null)
  const { size }=useThree()
  const rate=useStore(s=>s.timeRate)
  const setInfoOpen=useStore(s=>s.setInfoOpen)
  useFrame((_,d)=>{if(group.current && !['galaxy','overview','constellation','solar-system','earth'].includes(body.kind))group.current.rotation.y += d*.012*rate})
  return <group ref={group} position={[size.width<760?0:2,size.width<760?.9:0,0]} onClick={()=>setInfoOpen(true)}>
    {body.kind==='solar-system'?<SolarOverview/>:body.kind==='sun'?<Sun/>:body.kind==='earth'?<EarthSystem/>:body.texture?<Planet body={body}/>:body.kind==='galaxy'?<Galaxy andromeda={body.id==='andromeda'}/>:body.kind==='constellation'?<Constellation id={body.id}/>:body.kind==='nebula'?<Nebula blue={body.id==='orion-nebula'}/>:body.kind==='blackhole'?<BlackHole/>:<Fantasy volcanic={body.id==='ignis'}/>}
  </group>
}

function SceneContent({ body }: { body: Celestial }) {
  const quality=useThree(s=>s.performance.current)
  return <>
    <AdaptiveDpr />
    <color attach="background" args={['#030711']} />
    <ambientLight intensity={body.kind==='earth'?.08:.68} color="#92b6e9" />
    <directionalLight position={[-5,2.2,5]} intensity={body.kind==='sun'||body.kind==='earth'?0:3.2} color="#fff2db" />
    <pointLight position={[5,-2,1]} intensity={.7} color={body.color} />
    {body.kind!=='overview'&&<><Stars radius={85} depth={65} count={quality<.7?1300:2300} factor={2} saturation={.5} fade speed={.12} /><SpaceDust count={quality<.7?350:650} /></>}
    <Suspense fallback={null}>{body.kind==='overview'?<DreamlikeUniverseShowcase/>:<CelestialObject key={body.id} body={body}/>}</Suspense>
    <CameraDirector body={body} />
    <EffectComposer enableNormalPass={false}><Bloom luminanceThreshold={1.05} intensity={.33} mipmapBlur /></EffectComposer>
  </>
}

function AdaptiveDpr() {
  const setDpr=useThree(s=>s.setDpr)
  const gl=useThree(s=>s.gl)
  const average=useRef({ frames:0, seconds:0, goodSeconds:0, dpr:Math.min(window.devicePixelRatio || 1,window.innerWidth<760?1.25:1.75) })
  useFrame((_,delta)=>{
    const sample=average.current
    sample.frames++
    sample.seconds+=Math.min(delta,.12)
    if(sample.seconds<3)return
    const frameMs=sample.seconds/sample.frames*1000
    gl.domElement.dataset.frameMs=frameMs.toFixed(1)
    const mobile=window.innerWidth<760
    if(frameMs>(mobile?43:24) && sample.dpr>1){sample.dpr=Math.max(1,sample.dpr-.15);setDpr(sample.dpr);sample.goodSeconds=0}
    else if(frameMs<(mobile?25:17)){sample.goodSeconds+=sample.seconds;if(sample.goodSeconds>30){sample.dpr=Math.min(mobile?1.25:1.75,sample.dpr+.1);setDpr(sample.dpr);sample.goodSeconds=0}}
    else sample.goodSeconds=0
    sample.frames=0;sample.seconds=0
  })
  return null
}

export function UniverseCanvas() {
  const selectedId=useStore(s=>s.selectedId)
  const [failed,setFailed]=useState(false)
  const body=findBody(selectedId)
  if(failed)return <div className="webgl-fallback"><div className="fallback-orb" style={{background:body.color}} /><p>3D 場景暫時無法載入。天體資料與導覽仍可使用。</p><button onClick={()=>setFailed(false)}>重新嘗試</button></div>
  return <Canvas key={failed?'retry':'canvas'} className="universe-canvas" camera={{position:[0,0,10],fov:43,near:.01,far:250}} dpr={[1,window.innerWidth<760?1.25:1.75]} gl={{ antialias:false, powerPreference:'high-performance' }} onCreated={({gl})=>{gl.outputColorSpace=THREE.SRGBColorSpace;const webgl2=typeof WebGL2RenderingContext!=='undefined'&&gl.getContext() instanceof WebGL2RenderingContext;gl.domElement.dataset.renderer=webgl2?'webgl2':'unsupported';if(!webgl2)setFailed(true);gl.domElement.addEventListener('webglcontextlost',()=>setFailed(true),{once:true})}} onError={()=>setFailed(true)} performance={{min:.5,max:1,debounce:350}}>
    <SceneContent body={body} />
  </Canvas>
}
