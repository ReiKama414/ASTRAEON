import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { asset } from './asset'

const radius = 2.42
const earthVertex = `
varying vec2 vUv;
varying vec3 vWorldNormal;
varying vec3 vView;
void main(){
  vUv=uv;
  vec4 world=modelMatrix*vec4(position,1.);
  vWorldNormal=normalize(mat3(modelMatrix)*normal);
  vView=normalize(cameraPosition-world.xyz);
  gl_Position=projectionMatrix*viewMatrix*world;
}`
const earthFragment = `
uniform sampler2D uDay;
uniform sampler2D uNight;
uniform vec3 uSun;
varying vec2 vUv;
varying vec3 vWorldNormal;
varying vec3 vView;
void main(){
  vec3 normal=normalize(vWorldNormal);
  float light=dot(normal,normalize(uSun));
  float day=smoothstep(-.13,.22,light);
  vec3 albedo=texture2D(uDay,vUv).rgb;
  vec3 cities=texture2D(uNight,vUv).rgb;
  float diffuse=.1+.9*max(light,0.);
  vec3 dayColor=albedo*diffuse*1.58;
  float ocean=smoothstep(.035,.14,albedo.b-albedo.r)*smoothstep(.12,.32,albedo.b);
  vec3 halfWay=normalize(normalize(uSun)+normalize(vView));
  float specular=pow(max(dot(normal,halfWay),0.),88.)*ocean*day*.42;
  dayColor+=vec3(.55,.76,1.)*specular;
  vec3 nightColor=albedo*.045+cities*vec3(1.,.77,.48)*1.6;
  vec3 color=mix(nightColor,dayColor,day);
  gl_FragColor=vec4(color,1.);
}`
const cloudFragment = `
uniform sampler2D uCloud;
uniform vec3 uSun;
varying vec2 vUv;
varying vec3 vWorldNormal;
varying vec3 vView;
void main(){
  vec3 n=normalize(vWorldNormal);
  vec3 cloud=texture2D(uCloud,vUv).rgb;
  float density=smoothstep(.12,.82,dot(cloud,vec3(.333)));
  float lit=.16+.84*smoothstep(-.2,.35,dot(n,normalize(uSun)));
  float rim=pow(1.-max(dot(n,normalize(vView)),0.),3.);
  gl_FragColor=vec4(mix(vec3(.48,.66,.83),vec3(.96,.98,1.),lit),density*(.48*lit+.18*rim));
}`
const atmosphereFragment = `
uniform vec3 uSun;
varying vec2 vUv;
varying vec3 vWorldNormal;
varying vec3 vView;
void main(){
  vec3 n=normalize(vWorldNormal);
  float facing=max(dot(n,normalize(vView)),0.);
  float rim=pow(1.-facing,5.5);
  float sunSide=dot(n,normalize(uSun));
  vec3 color=mix(vec3(.025,.14,.48),vec3(.22,.72,1.),smoothstep(-.35,.45,sunSide));
  color=mix(color,vec3(1.,.53,.25),smoothstep(-.28,.02,sunSide)*(1.-smoothstep(.02,.4,sunSide))*.36);
  gl_FragColor=vec4(color,rim*(.18+.36*smoothstep(-.65,.55,sunSide)));
}`

function EarthGlow() {
  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `varying vec2 vUv;void main(){float r=length((vUv-.5)*2.);float a=exp(-pow(max(r-.64,0.)*4.8,2.))*(1.-smoothstep(.82,1.,r));gl_FragColor=vec4(vec3(.08,.37,.82),a*.11);}`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }), [])
  return <mesh position={[0,0,-.5]} scale={[7.8,7.8,1]} material={material}><planeGeometry args={[1,1]} /></mesh>
}

export function EarthSystem() {
  const { size } = useThree()
  const mobile = size.width < 760
  const [day, night, cloud] = useTexture(mobile
    ? [asset('textures/earth_daymap.jpg'),asset('textures/earth_nightmap.jpg'),asset('textures/earth_clouds.jpg')]
    : [asset('textures/earth_daymap_4k.jpg'),asset('textures/earth_nightmap_4k.jpg'),asset('textures/earth_clouds_4k.jpg')])
  day.colorSpace = THREE.SRGBColorSpace
  night.colorSpace = THREE.SRGBColorSpace
  cloud.colorSpace = THREE.SRGBColorSpace
  day.anisotropy = 8
  cloud.anisotropy = 8
  const sun = useMemo(() => new THREE.Vector3(-.68,.23,.42).normalize(), [])
  const groundMaterial = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uDay:{value:day},uNight:{value:night},uSun:{value:sun} },
    vertexShader:earthVertex,fragmentShader:earthFragment,
  }), [day,night,sun])
  const cloudMaterial = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {uCloud:{value:cloud},uSun:{value:sun}},vertexShader:earthVertex,
    fragmentShader:cloudFragment,transparent:true,depthWrite:false,
  }), [cloud,sun])
  const atmosphereMaterial = useMemo(() => new THREE.ShaderMaterial({
    uniforms:{uSun:{value:sun}},vertexShader:earthVertex,fragmentShader:atmosphereFragment,
    transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.FrontSide,
  }), [sun])
  const surface = useRef<THREE.Group>(null)
  const clouds = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (surface.current) surface.current.rotation.y += delta * .007
    if (clouds.current) clouds.current.rotation.y += delta * .009
  })
  return <group>
    <EarthGlow />
    <group ref={surface} rotation={[.12,-1.7,.04]}>
      <mesh material={groundMaterial}><sphereGeometry args={[radius,128,96]} /></mesh>
    </group>
    <group ref={clouds} rotation={[.12,-1.68,.04]}>
      <mesh material={cloudMaterial}><sphereGeometry args={[radius*1.008,128,96]} /></mesh>
    </group>
    <mesh material={atmosphereMaterial}><sphereGeometry args={[radius*1.015,128,96]} /></mesh>
  </group>
}
