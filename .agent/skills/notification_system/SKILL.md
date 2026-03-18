---
name: Notification System (情勒通知)
description: Pokemon-themed daily reminder system with in-app banners and browser push notifications, inspired by Duolingo's guilt-trip bird.
---

# Notification System — 寶可夢情勒提醒

## 設計理念

像 Duolingo 的情勒貓頭鷹一樣，用道館館主和寶可夢的語氣提醒玩家每天回來練習日語。採用「中文為主 + 日文穿插」的雙語格式，讓玩家看得懂同時增加日文曝光。

## 兩層架構

| 層級 | 機制 | 可靠性 |
|------|------|--------|
| **Layer 1: App 內情勒橫幅** | 使用者回到 app 時顯示角色催促訊息 | 100% — 主力功能 |
| **Layer 2: 瀏覽器推播通知** | Service Worker + Notification API | ~40-60% — SW 可能被瀏覽器殺掉 |

Layer 2 在純靜態 SPA (GitHub Pages) 上有先天限制：SW 的 `setTimeout` 在瀏覽器背景時可能被終止。未來可透過 Cloudflare Worker cron 提升可靠性。

## 檔案結構

```
src/
  data/notificationCharacters.ts     — 角色定義 + 台詞模板（4 角色 × 5 情境）
  stores/notificationStore.ts        — 通知偏好 Zustand store (persist)
  hooks/useReturnNotification.ts     — 情境判斷邏輯 hook
  services/
    notificationPermission.ts        — 瀏覽器 Notification API 封裝
    notificationScheduler.ts         — SW 註冊 + 排程邏輯
  components/notifications/
    ReturnBanner.tsx                  — App 內情勒橫幅元件
    NotificationOptIn.tsx            — 通知授權彈窗
    NotificationSettings.tsx         — Profile 頁通知設定面板
    NotificationDebugPanel.tsx       — Debug 測試面板
public/
  sw.js                              — Service Worker（純通知，不做快取）
  manifest.json                      — 基本 PWA manifest
```

## 角色系統

4 個角色根據玩家章節解鎖進度出現：

| 角色 | 解鎖章節 | 語氣 | themeColor |
|------|---------|------|------------|
| 夥伴寶可夢 🔴 | Ch1 | 通用鼓勵 | red-50 |
| 皮卡丘 ⚡ | Ch3 | 可愛撒嬌 ピカピカ | yellow-50 |
| 小剛 🪨 | Ch4 | 硬漢嚴格鞭策 | stone-100 |
| 小霞 💧 | Ch6 | 活潑好勝 | blue-50 |

每個角色 5 類情境台詞：
- `streakAtRisk` — 今天還沒練習，連勝要斷了
- `streakBroken` — 連勝已中斷
- `longStreak` — 連勝 ≥7 天，鼓勵
- `comeBack` — 超過 2 天沒來
- `firstTime` — 首次通知提示

## 台詞格式原則

- **中文是主要語意**，確保所有玩家都看得懂
- **日文用括號標註**，作為被動學習曝光
- 角色專屬口頭禪保留日文原味（ピカピカ、ピカー 等）
- 範例：`偷懶(サボり)嗎？...岩石不會偷懶。你也不許偷懶(なまけるな)！`

## 關鍵設計決策

### lastSessionDate vs lastPlayedDate

`progressStore.updateStreak()` 在 App 啟動時就把 `lastPlayedDate` 設為今天，無法用來判斷「今天是否真的練習過」。因此新增 `lastSessionDate` 欄位，僅在 `Game.tsx` 的 session 完成時透過 `markSessionComplete()` 更新。Banner 用 `lastSessionDate` 判斷是否該顯示。

### 通知授權 UX

- **不在首次造訪時跳出** — 需要有 XP（已完成至少一次練習）
- 自訂 in-app 彈窗先解釋功能，使用者點「好」才觸發瀏覽器原生 `Notification.requestPermission()`
- 最多問 3 次，回絕後間隔 3 天再問
- 授權後自動註冊 SW 並排程通知

### Service Worker 注意事項

- base path 必須是 `/PokemonLearner/sw.js`
- SW 僅做通知排程，**不做任何快取**
- 用 `tag` 欄位防止重複通知
- `notificationclick` 處理開啟 app 或聚焦已開啟的 tab

## 擴充新角色

在 `notificationCharacters.ts` 新增一個 `NotificationCharacter` 物件即可：

```typescript
{
  id: 'surge',
  nameJa: 'マチス',
  nameZh: '馬志士',
  emoji: '⚡',
  unlockedByChapter: 8,     // 對應章節
  themeColor: 'bg-amber-50 border-amber-300',
  messages: {
    streakAtRisk: ['...'],   // 中文為主 + 日文穿插
    streakBroken: ['...'],
    longStreak: ['...'],
    comeBack: ['...'],
    firstTime: ['...'],
  },
}
```

Hook (`useReturnNotification`) 會自動根據 `unlockedChapters` 篩選可用角色。
