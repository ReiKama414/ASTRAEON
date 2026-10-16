# ASTRAEON｜Dreamlike Universe 重製與第一階段驗收

> 2026-09-20 的最新視覺方向。此文件取代先前 `CINEMATIC_OVERHAUL.md` 的階段順序；舊文件保留先前工作的紀錄。

## 現況與根因

主場景本來就是 React Three Fiber、Three.js Mesh、WebGL 與部分 GLSL Shader，不是 CSS／SVG／Canvas 2D 偽裝的 3D。實際截圖顯示的問題是：首頁粒子構成稀薄的螺旋圖案，星雲粒子呈方形，黑洞以同心圓構成，太陽著色採用逐格雜訊，幻想星球缺乏材質分層；固定側欄與底列又壓縮了場景。保留資料模型、搜尋、收藏、分類導覽、地球系統、星曆註記與相機操作基礎，不把後續階段誤稱為已完成。

## 第一階段：Dreamlike Universe Showcase（本輪交付，等待視覺確認）

首頁獨立載入 `DreamlikeUniverseShowcase.tsx`，不再重用銀河系的簡單點場景。遠景採專用高品質星雲影像並繪製在 WebGL 平面；中、近景各有透明氣體層，使用 Shader 做 UV 緩慢流動及不同幅度的指標視差。另一層程序化噪聲形成淡薄氣體，三個深度帶中的圓形 GLSL 星點與旋臂共同提供前後關係。前景沿用高解析 EarthSystem Mesh、地表、雲層、夜光與大氣，作為大型 3D 主體。鏡頭以阻尼環繞和指數插值緩慢漂浮，首頁收合左導航並縮小底列。

```ts
type ShowcaseLayer = {
  depth: 'far' | 'mid' | 'subject' | 'near';
  asset?: '/showcase/nebula-distant.webp' | '/showcase/nebula-foreground.webp';
  renderer: 'shader-plane' | 'gpu-points' | 'mesh';
  parallaxFactor: number;
  animated: boolean;
};
type ShowcaseQuality = { mobile: boolean; starCount: number; galaxyStarCount: number; maxDpr: number };
```

### 瀏覽器驗收證據

- [桌面進站](qa/dreamlike-showcase-desktop.jpg)：場景佔據主要可視區，右側大型 3D 地球、藍紫色連續星雲與左側文字負空間清楚。
- [拖曳鏡頭後](qa/dreamlike-showcase-orbit.jpg)：星雲構圖與前景地球的相對位置改變，確認互動與景深關係；首頁環繞角度受限以避免相機穿過影像平面。
- [390×844 手機](qa/dreamlike-showcase-mobile.jpg)：主要天體在上方、文字在下方，觸控導航可見。
- 本機應用內瀏覽器讀取 Canvas context 為 `webgl2`。桌面約 1174×911 的一次 3 秒取樣為 17.0 ms／幀；它僅反映當時瀏覽器的 RAF 平均間隔，不等於 GPU 時間或跨裝置 fps 保證。
- `npm run build`、瀏覽器畫面與操作需一起通過；編譯成功本身不構成美術驗收。

### 尚存問題

- 遠景是高品質影像，空間深度由多層 WebGL 平面、星點、主體與相機視差近似；尚無真正的即時體積光散射。
- 3D 旋臂仍比前景地球與星雲弱；若要以銀河本身作首頁唯一主體，需要在第三階段進一步製作塵帶密度與近景 LOD。
- 桌面單次 RAF 幀間隔可供初步判斷，尚未量測 GPU time、低階設備、持續 10 分鐘的記憶體或耗電。
- 首頁使用地球作視覺錨點，科學資料與夢幻星雲的並置屬藝術構圖；星雲不是對應地球附近的實際星域。
- 場景切換尚沿用原先的即時 Mesh 換景；跨場景電影級轉場、完全隱藏 UI 與正式部署屬第六階段。

### 素材

遠景與透明前景的生成來源、用途和解析度見 [showcase 素材說明](../public/showcase/ATTRIBUTION.md)。地球素材授權見 [行星貼圖說明](../public/textures/ATTRIBUTION.md)。參考截圖沒有直接用作貼圖。第一階段所需的兩張星雲素材已取得；後續星雲專屬場景仍需要可商用的高解析多層氣體素材或新製作的分層圖集。

## 後續階段（尚未執行）

### 第二階段｜地球與 Aethera

地球沿用已具備的 4K 地表、雲層、夜光和近地鏡頭，進一步校正大氣厚度、日夜光照與雲影；Aethera 另製深海、青藍洋流、紫色極光與雲殼 Shader，不能共用單一波紋模板。驗收：兩顆天體在近景各自具備辨識度，且拖曳時各層速度不同；桌面 1080p 中位數 60 fps、手機 30 fps。風險：透明殼排序、貼圖記憶體與極光 overdraw。

### 第三階段｜銀河系與仙女座

把首頁旋臂技術擴展為兩套可區分的 3D 星盤；補密度場、暗塵帶、暖色核心與近遠 LOD。驗收：不用名稱即可辨別兩星系；近景不是放大的粒子貼圖；有桌面與手機拖曳截圖。風險：粒子填充率與核心過曝。

### 第四階段｜太陽系與真實行星

重製斜角總覽、低對比可隱藏軌道與獨立 LOD；太陽流動表面／日冕、木星大紅斑、土星環遮擋及其他行星貼圖分別驗收。風險：素材授權、土星透明排序、太陽 bloom 與高解析紋理佔用。

### 第五階段｜黑洞、星雲、星座與其餘幻想星球

黑洞使用吸積盤與背景折射 Shader 近似；星雲使用可授權影像遠景、半透明氣體與深度採樣前景；星座加上星色與觀測情境；其餘幻想星球建立不同材質語言。驗收：黑洞有背景扭曲，星雲不出現方形粒子，幻想星球不是純色球。風險：shader 可攜性與透明度排序。

### 第六階段｜UI、轉場、效能、手機及部署

統一場景切換的電影級相機軌跡（現有插值系統或 GSAP 時序）、完整沉浸模式、真實縮圖列、資產預載與 KTX2、WebGL context 恢復、裝置畫質矩陣。驗收：桌面 1080p 中位數 60 fps／p95 ≤25 ms／GPU 紋理 ≤512 MB，390×844 手機中位數 30 fps／p95 ≤45 ms／GPU 紋理 ≤192 MB；20 次換景無持續記憶體成長，完成實機與瀏覽器截圖後才部署。風險：相機中斷狀態、手機 overdraw 與不同 GPU 的色彩差異。
