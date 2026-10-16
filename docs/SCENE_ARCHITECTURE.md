# ASTRAEON｜場景架構

## 分層座標決策

不建立一個橫跨光年到公尺的 Three.js 世界。每一層 scene 有自己的原點、單位與尺度函數；場景切換保留語意目標 ID，並在新場景重建相機構圖。位置計算使用 double 的 JavaScript 數值，在鏡頭附近轉成浮點 GPU 座標；大型場景採 floating origin。

| 層級 | 單位與呈現 | 場景內容 |
| --- | --- | --- |
| universe | 1 unit ≈ 1 Mpc 的示意映射 | 星系節點與距離標籤 |
| galaxy | 1 unit ≈ 1 kpc，視覺半徑經壓縮 | 銀河／仙女座旋臂、星群 |
| stellar-system | 1 unit ≈ 1 AU，行星半徑另設顯示倍率 | 太陽、軌道、八行星 |
| body | 1 unit ≈ 1000 km | 球面、雲層、環、大氣 |
| surface | 1 unit ≈ 1 m 的局部區域 | 地表視角及地平線 |

相對尺寸與距離的誇張倍率要顯示在 UI。星座是地球觀測方向的天球疊層，不能當成物理上聚集的 3D 星群。星雲和黑洞用專屬 scene module；幻想星球不混入太陽系資料樹。

```ts
type ScaleLevel = 'universe' | 'galaxy' | 'stellar-system' | 'body' | 'surface';
type Vec3d = readonly [number, number, number];
type SceneManifest = {
  id: string; level: ScaleLevel; origin: Vec3d; metersPerUnit: number;
  bodyIds: string[]; environmentAssetIds: string[];
  visualScale: { radiusMultiplier: number; distanceCompression: number };
  cameraPresetId: string; lodPolicyId: string;
};
type SceneAdapter = { preload(id: string): Promise<void>; mount(id: string): void; dispose(id: string): void };
```

## 技術構成

React + TypeScript + Vite 管 UI；R3F 管場景生命週期；drei 限定用於已驗證的 controls、loader 或輔助件；Zustand 以 navigation、time、selection、quality slices 管狀態，逐幀座標留在 Three.js refs，避免 React 重繪。星系以 seeded instancing/points 和塵埃體積近似形成旋臂；星雲採分層粒子與雲紋理，不是背景貼圖。

## 階段任務

P1 建立 scene manifest、scale adapter、場景切換與清理；P2 加 galaxy 與天球疊層；P3 加黑洞／星雲特化 scene。每階段都做跨尺度往返和資源釋放測試。

## 驗收標準與效能預算

任意連續切換 20 次後 GPU texture/geometry 數量回到穩態 ±10%；跨尺度聚焦無可見跳點；太陽系中相機近地球時不出現抖動。桌面同時可見 draw calls ≤300，手機 ≤150；星系粒子由批次渲染而非逐顆 mesh。

## 技術風險

非線性距離壓縮會誤導使用者，必須標示「示意比例」。不同 scene 的深度與曝光不一致會破壞轉場，需共用色彩設定和過渡遮罩。星系粒子過多會吃掉 fill rate，使用螢幕尺寸 LOD。
