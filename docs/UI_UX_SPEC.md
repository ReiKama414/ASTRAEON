# ASTRAEON｜UI/UX 規格

## 參考畫面分析

[Celestial Transmutation](https://codepen.io/VoXelo/pen/yygKOVy) 可見：近黑藍星場、畫面中央佔主要視覺的發光 3D 概念星球、左側小分類與大標題、右上 AUTO 開關、底部固定膠囊分段選單。切換星球時主色、球面紋理、環與敘述一起變動。ASTRAEON 沿用此構圖節奏與「天體即主角」，延伸成有階層導覽、百科、操作提示的產品。參考頁屬幻想星球展示，不能直接作科學資料或全部場景的模板。

## 資訊架構與版面

桌面：左上 ASTRAEON + 麵包屑，左側選中天體標題／距離／來源狀態，右側可收合百科，底部尺度導覽與相機／時間工具，中央保留至少 55% 無 UI 的視覺區。手機：頂部搜尋、底部單列主導覽與「資訊」抽屜；抽屜最多佔視窗 70%，可下滑收起。選中天體後，標籤顯示「真實資料／藝術示意」或「原創幻想」。場景切換的 loading 顯示天體名稱、下一步和取消鍵。

```ts
type NavigationCrumb = { sceneId: string; bodyId?: string; label: string };
type OverlayState = {
  panel: 'none' | 'search' | 'encyclopedia' | 'favorites' | 'settings';
  selectedId?: string; crumbs: NavigationCrumb[];
  helpVisible: boolean; reducedMotion: boolean;
};
type CelestialCard = {
  title: string; subtitle: string; realityLabel: '科學資料' | '藝術示意' | '原創幻想';
  sourceUrl?: string; actionLabel: '探索' | '進入地表' | '觀看導覽';
};
```

## 互動與可及性

滑鼠拖曳 Orbit、滾輪縮放、雙擊 Focus；觸控單指旋轉、雙指縮放、點按選取。鍵盤 Tab 遍歷 UI、方向鍵控制相機、Esc 關閉面板／退出 Tour、F 切全螢幕；所有圖示有文字或 aria-label。Canvas 外提供可鍵盤操作的天體清單與文字百科。偏好減少動態時關閉長飛行與閃爍，色彩對比正文至少 WCAG AA 4.5:1，觸控目標至少 44 CSS px。

## 階段任務

P1 做設計 token、資訊架構、太陽系／地球響應式畫面；P2 加分類、星座天球資訊與百科；P3 加 Tour 腳本、幻想內容差異化與可及性修整。收到新的參考截圖時比對構圖、字重、色彩與過渡，記錄接受與偏離理由。

## 驗收標準與效能預算

首次進站 3 次點擊內到地球；手機 390×844 無水平溢出；鍵盤可完成搜尋、聚焦、收藏、返回；正文對比符合 AA。UI 動畫每幀主線程 ≤4 ms；面板開啟 ≤150 ms；場景操作時不觸發整棵 React 樹逐幀重渲。

## 技術風險

華麗文字與 glow 易降低可讀性；發光僅作裝飾，不用在正文。星場可能干擾標籤，需遮罩與景深層級。手機底部控制列易與系統手勢衝突，預留 safe-area inset。
