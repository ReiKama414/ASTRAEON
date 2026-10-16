# ASTRAEON｜效能計畫

## 量測設備與指標

在固定場景、固定路徑量測：桌面 1080p 中階 GPU；手機 390×844、近三年中階 Android 的 Chrome；快速網路與受限 4G 各一輪。錄 FPS median/1% low、CPU/GPU frame time、draw calls、textures、JS heap、首個可互動時間及 scene 切換時間。數字是交付門檻，實機選型於 P0 固定並寫入測試紀錄。

```ts
type PerfBudget = {
  tier: 'desktop' | 'mobile'; medianFps: number; low1PctFps: number;
  maxDrawCalls: number; maxGpuTextureMB: number;
  firstInteractiveMs: number; sceneSwitchMs: number;
};
const budgets: PerfBudget[] = [
  { tier: 'desktop', medianFps: 60, low1PctFps: 30, maxDrawCalls: 300, maxGpuTextureMB: 512, firstInteractiveMs: 4000, sceneSwitchMs: 1500 },
  { tier: 'mobile', medianFps: 30, low1PctFps: 20, maxDrawCalls: 150, maxGpuTextureMB: 192, firstInteractiveMs: 8000, sceneSwitchMs: 3000 },
];
```

## 優化順序

按可見螢幕尺寸與距離做 LOD：遠距 billboard／點精靈、中距簡化幾何、近距高解析材質與 shader。相同星體群採 instancing；不可見 scene 卸載 GPU 資源，只保留小型 metadata。圖片經 KTX2/Basis 壓縮並提供低解析首屏，資產 URL + version 作 cache key。R3F `useLoader` 有 URL 快取，但長時段探索仍要加 reference counting、釋放策略及載入佇列；依 [R3F 效能指南](https://r3f.docs.pmnd.rs/advanced/scaling-performance) 規劃。渲染解析度隨 frame time 自適應，不以裝置名稱固定畫質。

## 降級階梯

先降 DPR → 粒子密度 → 雲層／體積步數 → bloom → 陰影；保留輪廓、主色與互動標籤。無 WebGL 或兩次 context restore 失敗時顯示預製天體圖卡與完整百科、搜尋、收藏，並提供重試。避免 loading 畫面無限旋轉，逾 10 秒顯示跳過效果選項。

## 階段任務

P1 建基準腳本與儀表板，地球／太陽系壓測；P2 測星系、星雲密度與跨場景洩漏；P3 測黑洞與 Tour 長時間運行。每階段於桌面與實機各錄 60 秒穩態及 20 次 scene 往返。

## 驗收標準與技術風險

交付門檻如上表；另要求 20 次往返後 GPU 資源回到穩態 ±10%、JS heap 增幅 ≤15%。高 DPR 手機的 fill rate 與 browser thermal throttling 是最大風險，需實機長測；Network 預算受圖片 CDN 延遲影響，以本地預載與 progressive asset 降低波動。
