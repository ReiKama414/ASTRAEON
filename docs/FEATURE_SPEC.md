# ASTRAEON｜功能規格

## 功能邊界

P1 必須完成宇宙入口、分類導覽、太陽系八行星、地球詳頁、搜尋、點選聚焦、軌道顯示、時間倍率、收藏與基本全螢幕。P2 加入銀河與仙女座、獵戶座及至少兩組其他星座、星雲、百科交叉連結。P3 加入黑洞、幻想星球、Free Fly、Follow、Surface View、Cinematic Tour。

搜尋以名稱／別名／分類在本機索引；結果包括尺度與真實性標籤。收藏先用 localStorage，帶 schemaVersion 並提供匯出；無帳號服務依賴。時間控制僅推進明確有軌道模型的天體；沒有可靠資料者顯示「示意運動」。

```ts
type FeatureId = 'search' | 'favorite' | 'orbit' | 'time' | 'tour' | 'fullscreen';
type FeatureState = { enabled: boolean; phase: 1 | 2 | 3; fallback?: string };
type SearchResult = {
  id: string; title: string; aliases: string[];
  category: 'galaxy' | 'star' | 'planet' | 'constellation' | 'nebula' | 'black-hole';
  reality: 'real' | 'fictional'; sceneId: string;
};
type TimeControl = { epochIso: string; rate: 0 | 1 | 10 | 100 | -1; model: 'ephemeris' | 'kepler' | 'illustrative' };
```

## 主要流程

1. 入口選卡或輸入搜尋；選中結果先預載場景，再做相機轉場。
2. 點天體打開輕量資訊卡；「探索」進入 Focus／Surface View；返回保留上一個尺度的相機書籤。
3. 收藏即時更新導覽清單；無法讀取儲存空間時維持當次工作階段並提示。
4. Tour 每段均可暫停、跳過、退出；手動拖曳立即停止自動鏡頭。

## 階段任務

P1 定義路由與狀態、搜尋索引、收藏遷移、基本互動；P2 擴充內容分類與時間模型；P3 補進階相機模式與劇場導覽。每項功能交付時同時補鍵盤、觸控與無 WebGL 退化路徑。

## 驗收標準與效能預算

- P1 清單所有入口可達且返回；搜尋 1000 筆資料在中階手機輸入後 100 ms 內回應；收藏刷新後保留。
- 轉場中能取消；點選命中區至少 44×44 CSS px 對應的屏幕容差；Tour 不會奪取已由使用者操作的相機。
- 搜尋索引解壓後 ≤1 MB；UI 主執行緒單次功能運算 ≤16 ms，重型索引建置移到 Worker。

## 技術風險

深連結與跨尺度載入可能使相機目標失效；路由必須等待場景 ready。負時間倍率與星曆範圍可能衝突；超出模型支援日期時停用或顯示示意。全螢幕在行動瀏覽器支援不一致，提供沉浸式 UI 退化模式。
