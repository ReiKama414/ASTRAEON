# ASTRAEON｜資產計畫

## 分類與來源

每份素材必填來源、作者、授權、可否改作、天體 ID、解析度、色彩空間與版本。NASA/JPL 科學影像、觀測資料與其他第三方素材逐件確認使用條款；「公眾可見」不等於可重製。原創幻想星球的貼圖、噪聲與環由自製程序紋理和授權圖層組成。星系不依賴單張照片投影；由粒子、塵埃與核心發光構成。地球至少需 albedo、night lights、cloud alpha、normal/roughness；土星需球面與環 alpha；星雲需多層密度／顏色圖或程序噪聲；黑洞需吸積盤參數與背景星場供透鏡效果。

```ts
type AssetManifestEntry = {
  id: string; bodyId: string; url: string;
  kind: 'ktx2' | 'glb' | 'hdr' | 'json' | 'shader' | 'poster';
  role: 'albedo' | 'normal' | 'cloud' | 'ring' | 'density' | 'model' | 'fallback';
  colorSpace: 'srgb' | 'linear'; bytes: number; width?: number; height?: number;
  license: string; author: string; sourceUrl: string; modified: boolean;
  variants?: Partial<Record<'high' | 'medium' | 'low', string>>;
  sha256: string;
};
```

## 載入與快取

首屏只載入宇宙入口及一個低解析 poster；選中分類時預取下一 scene 的低階資產，Focus 期間漸進替換。CDN 檔名含 hash、HTTP immutable cache；應用內 LRU 按估算 GPU bytes，保護目前與上一場景。載入失敗先重試一次，然後改 low variant 或程序材質，保留百科操作。

## 階段任務

P0 建授權台帳與畫面 moodboard；P1 完成八行星、地球、太陽、字體及 UI 圖示；P2 做銀河、仙女座、星座、星雲；P3 做黑洞與原創幻想星球。每個資產先取得來源與 license，再進製作管線。

## 驗收標準與效能預算

100% 出貨資產可追溯授權；每顆重要天體有 high/low/fallback 方案；首屏傳輸 ≤2 MB gzip/壓縮後總量，任一場景額外初載桌面 ≤12 MB、手機 ≤5 MB；GPU texture 常駐桌面 ≤512 MB、手機 ≤192 MB。真實行星近景不能只靠換色球體辨識。

## 技術風險

不同來源投影、色溫和雲圖時間不一致；需統一貼圖坐標與色彩管理。高解析紋理在手機解壓會瞬間超出記憶體，KTX2 變體與逐步升級必須先驗證裝置支援。授權不清的素材延後採用。
