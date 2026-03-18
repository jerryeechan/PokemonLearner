---
name: Debug Mode
description: URL parameter-based debug panel for testing features without affecting production UX.
---

# Debug Mode — 功能測試面板

## 設計模式

透過 URL query parameter `?debug` 啟用隱藏的 Debug 面板，不影響一般使用者體驗。面板嵌在 Profile 頁底部。

## 啟用方式

```
/profile?debug
```

本地開發：`http://localhost:5173/PokemonLearner/profile?debug`
線上：`https://<domain>/PokemonLearner/profile?debug`

## 實作方式

```tsx
// Profile.tsx
import { useSearchParams } from 'react-router-dom';

const [searchParams] = useSearchParams();
const isDebug = searchParams.has('debug');

// 條件渲染
{isDebug && <NotificationDebugPanel />}
```

## 目前 Debug 面板

### NotificationDebugPanel (`src/components/notifications/NotificationDebugPanel.tsx`)

**狀態一覽** — 即時顯示所有相關 store 狀態：
- `lastSessionDate`、`lastPlayedDate`、`streak`、`xp`、`unlockedChapters`
- 瀏覽器通知權限狀態
- `notificationStore` 所有欄位

**情境模擬** — 一鍵修改 store 狀態來模擬不同情境：

| 按鈕 | 做了什麼 | 怎麼驗證 |
|------|---------|---------|
| 🔥 連勝危機 | `lastSessionDate = 昨天, streak = 3` | 回首頁看橫幅 |
| 💔 連勝中斷 | `lastSessionDate = 前天, streak = 1` | 回首頁看橫幅 |
| 🏆 長連勝 | `lastSessionDate = 今天, streak = 10` | 回首頁看橫幅 |
| 👋 久違回歸 | `lastSessionDate = 5天前, streak = 0` | 回首頁看橫幅 |

所有模擬都會同時重置 `lastBannerDismissed` 確保橫幅能重新顯示。

**測試動作：**
- 🔄 重置橫幅 — 不改情境，只讓橫幅重新出現
- 🔔 發送測試通知 — 3 秒延遲的瀏覽器推播（自動請求權限）
- ⏰ 排程通知 — 排到 `preferredHour` 的通知
- 🗑 重置所有通知設定 — 回到初始狀態（可重新觸發 OptIn）

## 新增 Debug 功能的慣例

1. 建立獨立的 Debug 元件在對應的 `components/` 資料夾
2. 在 Profile 頁用 `{isDebug && <NewDebugPanel />}` 條件渲染
3. 使用 `useXxxStore.setState({...})` 直接操作 Zustand state 來模擬情境
4. 顯示即時狀態值讓開發者對照
5. 提供一鍵「重置」功能方便重複測試

## 注意事項

- Debug 面板的模擬會**直接修改 localStorage 中的 store 資料**，測試完建議用重置按鈕回復
- `?debug` 參數不會被 React Router 攔截，純粹用 `useSearchParams` 讀取
- Production 環境也能用 `?debug` 開啟（方便線上 debug），因為只是隱藏不是移除
