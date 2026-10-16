export type Category = 'overview' | 'galaxy' | 'solar' | 'constellation' | 'nebula' | 'blackhole' | 'fantasy'
export type BodyKind = 'overview' | 'galaxy' | 'solar-system' | 'sun' | 'rocky' | 'earth' | 'gas' | 'ice' | 'constellation' | 'nebula' | 'blackhole' | 'fantasy'
export type Celestial = {
  id: string
  name: string
  en: string
  subtitle: string
  category: Category
  kind: BodyKind
  reality: 'real' | 'fictional'
  description: string
  fact: string
  distance: string
  diameter: string
  temperature: string
  texture?: string
  color: string
  accent: string
  radius: number
  source?: string
}

const nasa = 'https://science.nasa.gov/solar-system/planets/'
export const realBodies: Celestial[] = [
  { id:'universe',name:'可觀測宇宙',en:'THE UNIVERSE',subtitle:'一切故事的起點',category:'overview',kind:'overview',reality:'real',description:'從我們的觀測點出發，穿越星系、恆星與行星。這是一張經過尺度壓縮的探索地圖，而非宇宙的精確縮影。',fact:'約 920 億光年｜可觀測直徑',distance:'觀測視界',diameter:'約 920 億光年',temperature:'2.7 K 背景輻射',color:'#88bfff',accent:'#6dd9ff',radius:2.3,source:'https://science.nasa.gov/universe/' },
  { id:'milky-way',name:'銀河系',en:'MILKY WAY',subtitle:'我們的螺旋家園',category:'galaxy',kind:'galaxy',reality:'real',description:'太陽系位於銀河系的獵戶臂。數千億顆恆星、星際塵埃與氣體，繞著明亮的銀心緩慢旋轉。此處旋臂為藝術化密度模型。',fact:'棒旋星系｜獵戶臂',distance:'太陽系所在',diameter:'約 10 萬光年',temperature:'多種恆星環境',color:'#b9c7ff',accent:'#8caaff',radius:2.4,source:'https://science.nasa.gov/solar-system/solar-system-facts/' },
  { id:'andromeda',name:'仙女座星系',en:'ANDROMEDA',subtitle:'銀河的遙遠鄰居',category:'galaxy',kind:'galaxy',reality:'real',description:'M31 是距離銀河系最近的大型星系。它的傾斜盤面與明亮核心，在深空中形成一座可辨識的螺旋島嶼。',fact:'M31｜大型螺旋星系',distance:'約 250 萬光年',diameter:'約 22 萬光年',temperature:'多種恆星環境',color:'#e6d1aa',accent:'#f5cb92',radius:2.5,source:'https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-31/' },
  { id:'solar-system',name:'太陽系',en:'SOLAR SYSTEM',subtitle:'繞著同一顆恆星',category:'solar',kind:'solar-system',reality:'real',description:'八大行星沿著各自的軌道繞太陽運行。為了讓所有天體同時可見，這裡的距離、尺寸與速度都經過視覺壓縮。點擊一顆行星進入近景。',fact:'1 顆恆星｜8 顆行星',distance:'銀河系獵戶臂',diameter:'海王星軌道約 60 AU',temperature:'多種行星環境',color:'#f5bc73',accent:'#ffcc8b',radius:2.5,source:'https://science.nasa.gov/solar-system/' },
  { id:'sun',name:'太陽',en:'THE SUN',subtitle:'太陽系的光源',category:'solar',kind:'sun',reality:'real',description:'一顆 G 型主序星，以核心核融合照亮八大行星。表面米粒組織與日冕在此以程序材質作視覺模擬。',fact:'G 型主序星',distance:'0 AU',diameter:'約 139 萬公里',temperature:'表面約 5,500°C',color:'#ffab5e',accent:'#ffc27d',radius:2.1,source:'https://science.nasa.gov/sun/' },
  { id:'mercury',name:'水星',en:'MERCURY',subtitle:'最靠近太陽的世界',category:'solar',kind:'rocky',reality:'real',description:'布滿撞擊坑的岩石世界，幾乎沒有能夠緩和晝夜溫差的大氣。',fact:'岩石行星｜88 地球日公轉',distance:'0.39 AU',diameter:'4,879 公里',temperature:'−180 至 430°C',texture:'mercury',color:'#b6aba4',accent:'#ddd0c7',radius:1.65,source:nasa },
  { id:'venus',name:'金星',en:'VENUS',subtitle:'雲幕下的極端溫室',category:'solar',kind:'rocky',reality:'real',description:'濃密的二氧化碳大氣與硫酸雲遮蔽了岩石地表。近景呈現可見的雲頂，不直接暴露地表貼圖。',fact:'最熱的行星',distance:'0.72 AU',diameter:'12,104 公里',temperature:'約 465°C',texture:'venus_atmosphere',color:'#e2bc80',accent:'#f4cf99',radius:1.87,source:nasa },
  { id:'earth',name:'地球',en:'EARTH',subtitle:'我們所知唯一的生命家園',category:'solar',kind:'earth',reality:'real',description:'海洋、陸地與不斷流動的雲層，形成這顆藍色行星獨特的外觀。拖曳觀察日夜交界，再靠近雲層與大氣。',fact:'液態海洋｜生命家園',distance:'1.00 AU',diameter:'12,742 公里',temperature:'平均約 15°C',texture:'earth_daymap',color:'#54baf5',accent:'#5ad5ff',radius:1.95,source:'https://science.nasa.gov/earth/' },
  { id:'mars',name:'火星',en:'MARS',subtitle:'紅色沙漠與古老河床',category:'solar',kind:'rocky',reality:'real',description:'氧化鐵染紅了地表；巨大的火山、峽谷與極冠記錄著複雜的地質歷史。',fact:'奧林帕斯山｜巨大火山',distance:'1.52 AU',diameter:'6,779 公里',temperature:'平均約 −65°C',texture:'mars',color:'#df7a59',accent:'#f29a75',radius:1.78,source:nasa },
  { id:'jupiter',name:'木星',en:'JUPITER',subtitle:'氣體巨人的風暴',category:'solar',kind:'gas',reality:'real',description:'深淺相間的雲帶與大紅斑，呈現這顆太陽系最大行星的湍流大氣。',fact:'太陽系最大行星',distance:'5.20 AU',diameter:'139,820 公里',temperature:'雲頂約 −110°C',texture:'jupiter',color:'#d9b796',accent:'#eac9a6',radius:2.3,source:nasa },
  { id:'saturn',name:'土星',en:'SATURN',subtitle:'冰與塵構成的光環',category:'solar',kind:'gas',reality:'real',description:'由冰粒與岩屑構成的環系向外展開。土星本體與環使用不同的幾何和材質。',fact:'環系跨越數十萬公里',distance:'9.58 AU',diameter:'116,460 公里',temperature:'雲頂約 −140°C',texture:'saturn',color:'#e6d0a2',accent:'#f0daae',radius:1.77,source:nasa },
  { id:'uranus',name:'天王星',en:'URANUS',subtitle:'側躺自轉的冰巨星',category:'solar',kind:'ice',reality:'real',description:'大氣中的甲烷吸收紅光，呈現冷冽青藍色；幾乎側躺的自轉軸帶來極端季節。',fact:'自轉軸傾角約 98°',distance:'19.2 AU',diameter:'50,724 公里',temperature:'雲頂約 −195°C',texture:'uranus',color:'#9fe0e0',accent:'#9de8ef',radius:2.04,source:nasa },
  { id:'neptune',name:'海王星',en:'NEPTUNE',subtitle:'深藍色的遠方',category:'solar',kind:'ice',reality:'real',description:'強風穿越這顆遙遠的冰巨星，深藍大氣中時而出現巨大的暗色風暴。',fact:'太陽系最遠的行星',distance:'30.1 AU',diameter:'49,244 公里',temperature:'雲頂約 −200°C',texture:'neptune',color:'#497dec',accent:'#749dff',radius:2.04,source:nasa },
  { id:'orion',name:'獵戶座',en:'ORION',subtitle:'冬夜的獵人',category:'constellation',kind:'constellation',reality:'real',description:'參宿四、參宿七與獵戶腰帶構成冬季夜空最醒目的輪廓。連線是從地球視角觀看的天球投影。',fact:'天球投影｜非物理星群',distance:'恆星距離各異',diameter:'約 594 平方度',temperature:'多種恆星類型',color:'#a4d5ff',accent:'#83caff',radius:2.3,source:'https://science.nasa.gov/universe/stars/' },
  { id:'cassiopeia',name:'仙后座',en:'CASSIOPEIA',subtitle:'夜空裡的 W',category:'constellation',kind:'constellation',reality:'real',description:'五顆明亮恆星在北方天空排成醒目的 W 形。這是從地球看到的角度關係，恆星彼此相距甚遠。',fact:'北天星座｜W 形星群',distance:'恆星距離各異',diameter:'約 598 平方度',temperature:'多種恆星類型',color:'#bddcff',accent:'#a3dcff',radius:2.3,source:'https://science.nasa.gov/universe/stars/' },
  { id:'cygnus',name:'天鵝座',en:'CYGNUS',subtitle:'橫越銀河的北十字',category:'constellation',kind:'constellation',reality:'real',description:'天津四與其他亮星構成北十字，沿著銀河的明亮星帶展開。線條只代表觀測投影。',fact:'北十字｜銀河星帶',distance:'恆星距離各異',diameter:'約 804 平方度',temperature:'多種恆星類型',color:'#a7d8ff',accent:'#91d3ff',radius:2.3,source:'https://science.nasa.gov/universe/stars/' },
  { id:'carina',name:'船底座星雲',en:'CARINA NEBULA',subtitle:'恆星誕生的劇場',category:'nebula',kind:'nebula',reality:'real',description:'氣體與塵埃在星光雕刻下形成複雜邊界。這裡以多深度粒子雲重建其氛圍，並非觀測影像的三維重建。',fact:'恆星形成區',distance:'約 7,500 光年',diameter:'約 300 光年',temperature:'多種氣體環境',color:'#f1a9ac',accent:'#ff9bb9',radius:2.4,source:'https://science.nasa.gov/mission/webb/' },
  { id:'orion-nebula',name:'獵戶座星雲',en:'ORION NEBULA',subtitle:'群星在此誕生',category:'nebula',kind:'nebula',reality:'real',description:'M42 是夜空中最容易觀測的恆星形成區之一。層疊的氣體與塵埃用深度粒子模擬。',fact:'M42｜發射星雲',distance:'約 1,350 光年',diameter:'約 24 光年',temperature:'多種氣體環境',color:'#84b9e8',accent:'#91d6ff',radius:2.4,source:'https://science.nasa.gov/universe/' },
  { id:'blackhole',name:'黑洞',en:'EVENT HORIZON',subtitle:'光線彎曲的邊界',category:'blackhole',kind:'blackhole',reality:'real',description:'發光吸積盤環繞不可見的中心；後方光線被重力偏折。畫面是物理啟發的視覺近似，不是完整光線追蹤。',fact:'吸積盤｜透鏡視覺模擬',distance:'示意天體',diameter:'依質量而異',temperature:'吸積盤極高溫',color:'#ff9b6e',accent:'#ffad6f',radius:2.2,source:'https://science.nasa.gov/image-article/apod-2024-may-8-visualization-a-black-hole-accretion-disk/' },
]

export const fictionalBodies: Celestial[] = [
  { id:'aethera',name:'艾瑟拉',en:'AETHERA',subtitle:'潮汐編織的幻想之海',category:'fantasy',kind:'fantasy',reality:'fictional',description:'原創幻想星球。發光的海流在大氣中留下青紫色極光，表面像液態玻璃一樣緩緩變化。',fact:'原創幻想世界',distance:'虛構星域',diameter:'視覺設定',temperature:'未知',color:'#49d5ea',accent:'#5de6fa',radius:2.06 },
  { id:'ignis',name:'伊格尼斯',en:'IGNIS',subtitle:'裂隙中的熾熱脈動',category:'fantasy',kind:'fantasy',reality:'fictional',description:'原創幻想星球。黑色地殼被熔岩裂縫切開，表面熱流向夜空拋出橙色微光。',fact:'原創幻想世界',distance:'虛構星域',diameter:'視覺設定',temperature:'極高溫',color:'#ec6c3e',accent:'#ff9b5f',radius:2.02 },
]

export const bodies: Celestial[] = [...realBodies,...fictionalBodies]

export const categories: { id: Category; label: string; count: string }[] = [
  { id:'overview',label:'宇宙總覽',count:'01' },
  { id:'galaxy',label:'星系',count:'02' },
  { id:'solar',label:'太陽系',count:'10' },
  { id:'constellation',label:'星座',count:'03' },
  { id:'nebula',label:'星雲',count:'02' },
  { id:'blackhole',label:'黑洞',count:'01' },
  { id:'fantasy',label:'幻想星球',count:'02' },
]

export const findBody = (id: string) => bodies.find(body => body.id === id) ?? bodies[0]
