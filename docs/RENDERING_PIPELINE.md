# ASTRAEON｜渲染管線

## 核心決策

使用 Three.js + R3F 的單一 Canvas 與 WebGL2 基線；React 管 UI，shader/geometry 管逐幀外觀。渲染順序：場景幾何與發光材質 → HDR 中介緩衝 → selective bloom → 色調映射 → 螢幕 UI。桌面視畫質預算使用 HalfFloat HDR；手機先降級 bloom resolution 或關閉 bloom。線性色彩空間計算，輸出 sRGB，避免材質與後處理雙重 tone mapping；此流程依 [postprocessing 官方文件](https://pmndrs.github.io/postprocessing/public/docs/) 驗證。

地球採日夜地表貼圖、獨立雲殼、Fresnel 大氣與定向太陽光；土星環為雙面環幾何和透明度紋理；星系用可控種子的旋臂密度函數與 instanced stars；星雲用多深度粒子／噪聲雲層；黑洞用吸積盤 shader 與屏幕空間近似光線偏折。黑洞需標「視覺模擬」，不聲稱完整廣義相對論 ray tracing。自訂 GLSL 僅用於大氣、吸積盤、星雲體積近似及旋臂，先以基準測試確定需 shader 的效果。

```ts
type RenderTier = 'high' | 'medium' | 'low' | 'fallback';
type RenderProfile = {
  tier: RenderTier; dpr: number; hdr: boolean; bloom: boolean;
  nebulaParticles: number; galaxyStars: number;
  atmosphereSteps: number; shadows: 'none' | 'contact' | 'dynamic';
};
type MaterialRecipe = {
  id: string; baseMap?: string; normalMap?: string; roughnessMap?: string;
  emissiveMap?: string; shader?: 'atmosphere' | 'accretion' | 'nebula' | 'spiral';
  uniforms?: Record<string, number | readonly number[]>;
};
```

## 分級與恢復

High DPR ≤1.75、銀河粒子 ≤120k；Medium DPR ≤1.5、≤60k；Low DPR ≤1.0、≤20k、減少雲層取樣。偵測連續 3 秒 frame time 超過目標 25% 後降一級；30 秒穩定才可升級，避免來回閃動。WebGL context lost 時暫停時間與輸入、顯示重試面板；恢復時重建 render targets 與 GPU 資源，回到目前 scene/bookmark。再次失敗改用靜態天體縮圖與百科。

## 階段任務

P1 建色彩基線、地球材質、quality tier 和 context recovery；P2 加星系與星雲 shader；P3 加黑洞鏡像近似與分級特效。每個 shader 都保存最小退化材質。

## 驗收標準與效能預算

桌面 GPU 每幀 ≤12 ms、手機 ≤25 ms；全屏效果 pass 桌面 ≤3 ms、手機 ≤4 ms；高階場景總 GPU texture 常駐桌面 ≤512 MB、手機 ≤192 MB。失去 context 後 10 秒內顯示可操作恢復／退化 UI；手動恢復成功後導航位置保留。

## 技術風險

透明粒子與 bloom 可能造成 overdraw 和黑位泛灰；需對亮度設閾值並限制屏幕覆蓋率。WebGL2 與浮點 render target 在部分手機上表現不同，初始化時做 capability probe。shader 編譯尖峰以預熱關鍵材質緩解。
