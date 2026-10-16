# ASTRAEON

互動式 3D 宇宙探索網站。使用 React、TypeScript、Vite、Three.js、React Three Fiber、drei、postprocessing 與 Zustand。

> **來源註記：** 本專案是從磁碟翻出來的 **2024 庫存** 專案，重新整理後開源釋出。

授權：[MIT License](LICENSE)

線上預覽：[GitHub Pages](https://reikama414.github.io/ASTRAEON/)

## 啟動

需要 Node.js 20.19+ 或 22.12+。

```bash
npm install
npm run dev
```

開啟 Vite 顯示的本機網址。`npm run build` 會先執行 TypeScript 檢查，再產生 `dist/`。

## 已完成的互動

- 宇宙入口、銀河系與仙女座、太陽系軌道總覽、太陽與八大行星、三組星座、兩組星雲、黑洞、兩顆原創幻想星球。
- 地球日面、夜景、雲殼和大氣層；土星環；星系旋臂粒子；星雲多深度粒子；黑洞吸積盤與透鏡視覺近似。
- 分類、搜尋、天體選取、百科、收藏、自動導覽、時間流速、軌道顯示、全螢幕、相機環繞、自由飛行、太陽系地球追蹤與近地視角。
- 手機觸控操作、基本自適應 DPR、WebGL 載入失敗後的文字退化畫面。

## 資料與尺度

`src/data.ts` 將真實天體與幻想天體明確標記。場景距離與半徑經藝術化壓縮，以利互動呈現；當前實作不是高精度星曆。天文資料來源連結顯示在百科面板。行星貼圖授權詳見 [public/textures/ATTRIBUTION.md](public/textures/ATTRIBUTION.md)。

## 待深化項目

規劃文件位於 `docs/`。目前最新的第一階段 Dreamlike Universe Showcase、瀏覽器截圖、剩餘問題與第二至六階段任務見 [docs/DREAMLIKE_REBUILD_PLAN.md](docs/DREAMLIKE_REBUILD_PLAN.md)。目前尚未接入 JPL 星曆、表面地形網格、精確光線追蹤、完整跨尺度相機座標系、KTX2 資產管線與實機長時間效能量測。
