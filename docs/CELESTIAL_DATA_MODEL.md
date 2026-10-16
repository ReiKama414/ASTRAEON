# ASTRAEON｜天體資料模型

## 分離科學、藝術與互動

天體 ID 永久穩定，real/fictional 是頂層鑑別欄位。真實數據保存原始單位、來源、觀測／推導性質、適用 epoch 與不確定性；視覺化倍率、材質、光照與軌道示意獨立存放，絕不回寫成科學數值。每顆天體有自己的 visualProfile、cameraProfile、lightProfile、assets、interactionProfile。資料以分檔 JSON 或 TS 產生，執行時驗證 schema。

```ts
type SourceRef = { title: string; url: string; accessedAt: string; method: 'observed' | 'derived' };
type Quantity = { value: number; unit: 'km' | 'kg' | 'AU' | 'ly' | 'K' | 'day'; uncertainty?: number };
type ScientificRecord = {
  id: string; reality: 'real'; kind: string; names: Record<string, string>;
  radius?: Quantity; mass?: Quantity; meanDistance?: Quantity;
  epochIso?: string; orbitalModel?: 'horizons-sample' | 'kepler' | 'none';
  sources: SourceRef[]; reviewedAt: string;
};
type FictionRecord = {
  id: string; reality: 'fictional'; kind: string; names: Record<string, string>;
  lore: string; creator: string; scientificInspiration?: string[];
};
type VisualProfile = {
  bodyId: string; geometry: 'sphere' | 'rings' | 'points' | 'volume' | 'disk';
  materialId: string; cameraProfileId: string; lightProfileId: string;
  assetIds: string[]; interactionProfileId: string;
  radiusDisplayScale: number; orbitalDistanceDisplayScale: number;
};
type CelestialEntry = { content: ScientificRecord | FictionRecord; visual: VisualProfile };
```

## 內容來源與規則

太陽系基礎資料以 [NASA 行星頁](https://science.nasa.gov/solar-system/planets/) 核對；需要特定日期位置時以 [JPL Horizons](https://ssd.jpl.nasa.gov/horizons/manual.html) 匯出的快照或預先計算資料為準，版本化並註明時間範圍。銀河／仙女座屬示意幾何，絕不標示為逐星真實位置。黑洞視覺標示為物理啟發的模擬。[NASA 黑洞可視化](https://science.nasa.gov/image-article/apod-2024-may-8-visualization-a-black-hole-accretion-disk/) 作研究參考。

## 階段任務

P1 建立 schema、驗證器與八行星／地球／太陽資料；P2 加星系、星座、星雲來源；P3 加黑洞與 fiction namespace。每次資料更新保留來源變更記錄。

## 驗收標準與效能預算

所有 real 項目至少一個有效來源；fiction 不出現在科學資料 API；數值欄位保留單位，不接受裸數值。P1 首屏只載入當前 scene metadata ≤150 KB gzip；完整搜尋 metadata ≤1 MB 解壓。

## 技術風險

天體數據可能因來源、epoch、定義不同而不一致；顯示時寫明測量條件。第三方紋理授權與資料授權分開追蹤。科學資料格式變更須透過版本遷移，不直接覆蓋收藏 ID。
