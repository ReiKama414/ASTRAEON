# ASTRAEON｜相機系統

## 模式與控制權

一個 camera director 管理 Orbit、Free Fly、Focus、Follow、Cinematic Tour、Surface View 六模式。相機只有一個 active controller；轉場期間暫停 controls，手動 pointer/keyboard 輸入取消 Tour 並交還控制。Focus 使用目標 bounding sphere 計算安全距離與近遠裁剪；Surface View 用局部切線座標並限制穿透地形。每個天體可覆寫預設 framing、光源方位及允許模式。

```ts
type CameraMode = 'orbit' | 'free-fly' | 'focus' | 'follow' | 'tour' | 'surface';
type CameraProfile = {
  id: string; targetId: string; allowedModes: CameraMode[];
  minRadiusUnits: number; maxRadiusUnits: number; preferredFovDeg: number;
  framing: 'full-body' | 'surface-horizon' | 'wide-context';
  nearFarPolicy: 'dynamic' | 'log-depth';
};
type CameraTransition = {
  fromSceneId: string; toSceneId: string; targetId: string;
  durationMs: number; easing: 'cubic' | 'quint'; canCancel: boolean;
};
type CameraBookmark = { sceneId: string; mode: CameraMode; position: [number, number, number]; target: [number, number, number] };
```

## 轉場策略

同尺度使用 spline/damped interpolation 並在最後 10% 速度歸零。跨尺度先收斂到目標，淡入遮罩切 scene，再展開新尺度；遮罩期預載下一層資產。禁止把相機從 Mpc 真實座標直接飛到地表。Follow 以平滑追蹤點與速度預測減少延遲；Free Fly 的平移速度依尺度與目標距離調整。降低動態效果設定將轉場縮至 150 ms 淡變。

## 階段任務

P1 Orbit、Focus、返回書籤及跨尺度轉場；P2 Follow 與觀測星座鏡頭；P3 Free Fly、Surface View、Tour 軌道編排。各模式在手機採雙指縮放、單指旋轉與明確退出鍵。

## 驗收標準與效能預算

Focus 結束後目標完整落入 10% 安全邊界；20 次快速選取／取消不產生控制器競爭；轉場期間相機每幀更新 ≤1 ms（桌面）／≤2 ms（手機）；使用者操作至停止 Tour ≤1 frame。

## 技術風險

目標運動與相機插值可能互相追逐，轉場應追蹤物件當前 transform 而非固定終點。極近距離 near/far 比例造成 z-fighting，以動態裁剪和局部 scene 解決；僅在基準測試確認必要時使用 logarithmicDepthBuffer。
