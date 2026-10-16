import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { ArrowDownRight, ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, Compass, Expand, Heart, Info, Menu, Pause, Play, Search, Settings2, SlidersHorizontal, Sparkles, X } from 'lucide-react'
import { bodies, categories, findBody, type Category } from './data'
import { useStore } from './store'

const UniverseCanvas = lazy(() => import('./scene').then(module => ({ default: module.UniverseCanvas })))

const planetOrder = ['sun','mercury','venus','earth','mars','jupiter','saturn','uranus','neptune']

function Brand() {
  return <div className="brand" aria-label="ASTRAEON 宇宙觀測台">
    <span className="brand-mark"><span /></span>
    <span className="brand-type">ASTRAEON <small>UNIVERSE ATLAS</small></span>
  </div>
}

function Navigation({ active, onNavigate }: { active:Category; onNavigate:(category:Category)=>void }) {
  return <nav className="category-nav" aria-label="探索分類">
    <div className="nav-caption">EXPLORE <span>—</span></div>
    {categories.map((item,index)=><button key={item.id} className={`nav-link ${active===item.id?'active':''}`} aria-label={item.label} title={item.label} onClick={()=>onNavigate(item.id)}>
      <span className="nav-index">0{index+1}</span><span>{item.label}</span><span className="nav-dot" />
    </button>)}
  </nav>
}

function SearchDialog({ onClose }: { onClose:()=>void }) {
  const select=useStore(s=>s.select)
  const [query,setQuery]=useState('')
  const results=useMemo(()=>bodies.filter(b=>`${b.name} ${b.en} ${b.subtitle} ${b.category}`.toLowerCase().includes(query.toLowerCase())).slice(0,10),[query])
  useEffect(()=>{const esc=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()};window.addEventListener('keydown',esc);return()=>window.removeEventListener('keydown',esc)},[onClose])
  return <div className="dialog-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
    <div className="search-dialog" role="dialog" aria-modal="true" aria-label="搜尋天體">
      <div className="dialog-title"><span>探索資料庫</span><button className="icon-button" onClick={onClose} aria-label="關閉搜尋"><X size={18}/></button></div>
      <label className="search-field"><Search size={19}/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜尋行星、星系、星雲..." /></label>
      <div className="search-hint">{query ? `${results.length} 個搜尋結果` : '探索熱門天體'}</div>
      <div className="search-results">{results.length ? results.map(body=><button key={body.id} onClick={()=>{select(body.id);onClose()}}>
        <span className="result-orb" style={{background:body.color}}/><span className="result-name">{body.name}<small>{body.en}</small></span><span className="result-type">{body.reality==='fictional'?'幻想':'真實'}</span><ArrowRight size={17}/>
      </button>):<div className="empty-results">沒有找到相符天體。試試「地球」或「銀河」。</div>}</div>
    </div>
  </div>
}

function InfoPanel({ onClose }: { onClose:()=>void }) {
  const body=findBody(useStore(s=>s.selectedId))
  const favorites=useStore(s=>s.favorites)
  const toggleFavorite=useStore(s=>s.toggleFavorite)
  const cameraMode=useStore(s=>s.cameraMode)
  const setCameraMode=useStore(s=>s.setCameraMode)
  return <aside className="info-panel" aria-label={`${body.name}詳細資訊`}>
    <div className="info-panel-top"><span className="micro-label"><BookOpen size={13}/> CELESTIAL ARCHIVE</span><button className="icon-button" aria-label="關閉資訊" onClick={onClose}><X size={18}/></button></div>
    <div className="info-hero"><span className="info-icon" style={{background:body.color,boxShadow:`0 0 45px ${body.color}55`}}/><div><span className="eyebrow">{body.category.toUpperCase()}</span><h2>{body.name}</h2><span className="latin">{body.en}</span></div></div>
    <div className="reality-pill">{body.reality==='fictional'?<Sparkles size={13}/>:<Check size={13}/>} {body.reality==='fictional'?'原創幻想世界':'真實天體 · 視覺比例示意'}</div>
    <p className="info-description">{body.description}</p>
    <div className="stat-grid"><div><span>距離</span><strong>{body.distance}</strong></div><div><span>直徑</span><strong>{body.diameter}</strong></div><div><span>溫度</span><strong>{body.temperature}</strong></div><div><span>特徵</span><strong>{body.fact}</strong></div></div>
    {body.source && <a className="source-link" href={body.source} target="_blank" rel="noreferrer">查看資料來源 <ArrowRight size={14}/></a>}
    {body.id==='earth'&&<button className="surface-button" onClick={()=>{setCameraMode(cameraMode==='surface'?'orbit':'surface');onClose()}}><Compass size={16}/>{cameraMode==='surface'?'返回軌道視角':'進入近地視角'}</button>}
    <button className="save-button" onClick={()=>toggleFavorite(body.id)}><Heart size={16} fill={favorites.includes(body.id)?'currentColor':'none'}/>{favorites.includes(body.id)?'已收藏':'加入收藏'}</button>
  </aside>
}

function SolarStrip({ selectedId, onSelect }: { selectedId:string; onSelect:(id:string)=>void }) {
  return <div className="solar-strip" role="group" aria-label="太陽系天體">
    {planetOrder.map(id=>{const body=findBody(id);return <button key={id} onClick={()=>onSelect(id)} className={`solar-item ${selectedId===id?'active':''}`} aria-pressed={selectedId===id}>
      <span className="solar-orb" style={{background:body.color}}/><span>{body.name}</span>
    </button>})}
  </div>
}

function TourControls() {
  const autoTour=useStore(s=>s.autoTour)
  const setAutoTour=useStore(s=>s.setAutoTour)
  const select=useStore(s=>s.select)
  const selectedId=useStore(s=>s.selectedId)
  useEffect(()=>{
    if(!autoTour)return
    const ids=['earth','mars','jupiter','saturn','neptune','milky-way','andromeda','carina','blackhole','aethera']
    const timer=window.setInterval(()=>{const index=ids.indexOf(useStore.getState().selectedId);select(ids[(index+1)%ids.length])},9000)
    return()=>window.clearInterval(timer)
  },[autoTour,select])
  return <button className={`tour-toggle ${autoTour?'active':''}`} onClick={()=>setAutoTour(!autoTour)} aria-label={autoTour?'暫停自動導覽':'開始自動導覽'}>{autoTour?<Pause size={14}/>:<Play size={14} fill="currentColor"/>}<span>{autoTour?'暫停導覽':'自動導覽'}</span><span className="toggle-led"/>{selectedId==='universe'&&<span className="sr-only">從宇宙開始</span>}</button>
}

function ControlBar() {
  const selectedId=useStore(s=>s.selectedId)
  const timeRate=useStore(s=>s.timeRate)
  const setTimeRate=useStore(s=>s.setTimeRate)
  const showOrbits=useStore(s=>s.showOrbits)
  const setShowOrbits=useStore(s=>s.setShowOrbits)
  const cameraMode=useStore(s=>s.cameraMode)
  const setCameraMode=useStore(s=>s.setCameraMode)
  const [open,setOpen]=useState(false)
  return <div className="control-wrap">
    <button className="control-trigger" onClick={()=>setOpen(!open)} aria-expanded={open}><SlidersHorizontal size={16}/> 控制台 <ChevronDown size={14} className={open?'rotated':''}/></button>
    {open&&<div className="control-popover">
      <div className="popover-title"><Settings2 size={15}/> 觀測設定</div>
      <div className="setting-row"><span>時間流速</span><div className="segmented">{[0,1,10].map(rate=><button key={rate} className={timeRate===rate?'selected':''} onClick={()=>setTimeRate(rate)}>{rate===0?'暫停':`${rate}×`}</button>)}</div></div>
      <div className="setting-row"><span>軌道指引</span><button className={`switch ${showOrbits?'on':''}`} role="switch" aria-checked={showOrbits} onClick={()=>setShowOrbits(!showOrbits)}><span/></button></div>
      <div className="setting-row"><span>相機模式</span><div className="segmented"><button className={cameraMode==='orbit'?'selected':''} onClick={()=>setCameraMode('orbit')}>環繞</button><button className={cameraMode==='free-fly'?'selected':''} onClick={()=>setCameraMode('free-fly')}>自由</button>{selectedId==='solar-system'&&<button className={cameraMode==='follow'?'selected':''} onClick={()=>setCameraMode('follow')}>追蹤地球</button>}</div></div>
      <div className="setting-note">拖曳旋轉 · 滾輪縮放 · 自由模式以 WASD / Q / E 飛行</div>
    </div>}
  </div>
}

function App() {
  const selectedId=useStore(s=>s.selectedId)
  const category=useStore(s=>s.category)
  const select=useStore(s=>s.select)
  const setCategory=useStore(s=>s.setCategory)
  const searchOpen=useStore(s=>s.searchOpen)
  const setSearchOpen=useStore(s=>s.setSearchOpen)
  const infoOpen=useStore(s=>s.infoOpen)
  const setInfoOpen=useStore(s=>s.setInfoOpen)
  const favorites=useStore(s=>s.favorites)
  const toggleFavorite=useStore(s=>s.toggleFavorite)
  const [menuOpen,setMenuOpen]=useState(false)
  const [railOpen,setRailOpen]=useState(false)
  const [favoritesOpen,setFavoritesOpen]=useState(false)
  const body=findBody(selectedId)
  const peers=bodies.filter(b=>b.category===category)
  const index=peers.findIndex(b=>b.id===selectedId)
  const move=(dir:number)=>select(peers[(index+dir+peers.length)%peers.length].id)
  useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if((e.key==='/'||e.key==='k'&&(e.metaKey||e.ctrlKey))&&!searchOpen){e.preventDefault();setSearchOpen(true)}if(e.key==='Escape'){setSearchOpen(false);setInfoOpen(false);setMenuOpen(false);setFavoritesOpen(false)}};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[searchOpen,setSearchOpen,setInfoOpen])
  return <div className={`app-shell ${selectedId==='universe'?'showcase':''}`} style={{'--accent':body.accent,'--planet':body.color} as React.CSSProperties}>
    <Suspense fallback={<div className="scene-loading">正在校準觀測鏡頭…</div>}><UniverseCanvas/></Suspense>
    <div key={`transition-${selectedId}`} className="scene-transition" aria-hidden="true" />
    <div className="space-vignette"/>
    <header className="topbar"><Brand/><div className="top-actions"><span className="top-coordinate">{body.reality==='fictional'?'FICTIONAL REALM':'OBSERVABLE UNIVERSE'} <i/> {body.en}</span><button className="top-search" onClick={()=>setSearchOpen(true)}><Search size={17}/><span>搜尋天體</span><kbd>/</kbd></button><button className="icon-button favorites-trigger" aria-label="收藏清單" onClick={()=>setFavoritesOpen(!favoritesOpen)}><Heart size={19}/>{favorites.length>0&&<span className="badge">{favorites.length}</span>}</button><button className="icon-button fullscreen-trigger" aria-label="全螢幕" onClick={()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()}><Expand size={18}/></button><button className="icon-button menu-trigger" aria-label="開啟選單" onClick={()=>setMenuOpen(!menuOpen)}><Menu size={20}/></button></div></header>
    <aside className={`left-rail ${menuOpen?'mobile-open':''} ${railOpen?'expanded':''}`}><button className="rail-toggle" onClick={()=>setRailOpen(!railOpen)} aria-label={railOpen?'收合導覽':'展開導覽'} aria-expanded={railOpen}><Menu size={16}/></button><Navigation active={category} onNavigate={c=>{setCategory(c);setMenuOpen(false);setRailOpen(false)}}/><div className="rail-footer"><span className="live-dot"/> LIVE EXPLORATION <span>V 01.0</span></div></aside>
    <main className="hero-copy" key={`hero-${body.id}`}><div className="hero-kicker"><span className="kicker-line"/><span>{body.subtitle}</span></div><div className="hero-overline">{body.en} <span> / {body.reality==='fictional'?'ORIGINAL WORLD':'CELESTIAL OBJECT'}</span></div><h1>{body.name}</h1><p>{body.description}</p><div className="hero-actions"><button className="primary-button" onClick={()=>setInfoOpen(true)}>深入探索 <ArrowDownRight size={17}/></button><button className={`round-button ${favorites.includes(body.id)?'saved':''}`} onClick={()=>toggleFavorite(body.id)} aria-label={favorites.includes(body.id)?'移除收藏':'加入收藏'}><Heart size={17} fill={favorites.includes(body.id)?'currentColor':'none'}/></button></div><div className="hero-fact"><span className="fact-line"/><span>{body.fact}</span></div></main>
    <div className="right-markers"><span>01 / 0{categories.length}</span><span className="vertical-line"/><span>DRAG TO EXPLORE</span></div>
    <div className="scene-indicator"><div className="scene-crosshair">+</div><span>{body.reality==='fictional'?'原創幻想':'科學資料 / 視覺示意'}</span></div>
    <footer className="bottom-bar"><div className="bottom-left"><span className="footer-label">CURRENT LOCATION</span><strong>{body.en}</strong></div><div className="bottom-center">{category==='solar'?<SolarStrip selectedId={selectedId} onSelect={select}/>:<div className="peer-strip"><button onClick={()=>move(-1)} aria-label="上一個天體"><ArrowLeft size={17}/></button><span><i>{String(index+1).padStart(2,'0')}</i> / {String(peers.length).padStart(2,'0')}　 {body.name}</span><button onClick={()=>move(1)} aria-label="下一個天體"><ArrowRight size={17}/></button></div>}</div><div className="bottom-right"><TourControls/><ControlBar/></div></footer>
    {searchOpen&&<SearchDialog onClose={()=>setSearchOpen(false)}/>}
    {infoOpen&&<InfoPanel onClose={()=>setInfoOpen(false)}/>}
    {favoritesOpen&&<div className="favorites-menu"><div className="favorites-heading"><Heart size={15}/> 我的收藏 <button onClick={()=>setFavoritesOpen(false)} aria-label="關閉收藏"><X size={16}/></button></div>{favorites.length?favorites.map(id=>{const b=findBody(id);return <button key={id} onClick={()=>{select(id);setFavoritesOpen(false)}}><span className="result-orb" style={{background:b.color}}/>{b.name}<ArrowRight size={14}/></button>}):<p>尚未收藏天體。點擊愛心，建立你的星際清單。</p>}</div>}
    <div className="asset-credit"><Info size={11}/><a href="https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-map/" target="_blank" rel="noreferrer">NASA Blue Marble</a><span>·</span><a href="https://www.solarsystemscope.com/textures/" target="_blank" rel="noreferrer">Solar System Scope · CC BY 4.0</a></div>
    <div className="mobile-bottom-nav"><button onClick={()=>setMenuOpen(!menuOpen)}><Compass size={19}/> 探索</button><button onClick={()=>setSearchOpen(true)}><Search size={19}/> 搜尋</button><button onClick={()=>setInfoOpen(true)}><BookOpen size={19}/> 百科</button><button onClick={()=>setFavoritesOpen(!favoritesOpen)}><Heart size={19}/> 收藏</button></div>
  </div>
}

export default App
