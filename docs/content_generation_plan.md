# 寶可夢 火紅/葉綠版 內容爬取與生成計畫 (Content Generation Plan)

## 1. 目標與背景 (Goal & Context)
為了讓玩家能依照遊戲推進的順序，逐步學習《寶可夢 火紅/葉綠版》的單字與情境對話，我們需要建立一套「自動化擷取 + LLM 內容生成」的管線 (Pipeline)。
因為遊戲文本量龐大，包含了數百種寶可夢、招式、道具、地點，以及過場動畫和 NPC 對話，我們將設計一套**分批處理、持續更新**的機制。

## 2. 整體流程設計 (Pipeline Design)

整個流程分成四個階段：

### 階段一：文本素材收集 (Source Collection)
每一批次處理一個「章節 (Chapter)」或「進度節點 (Milestone)」。
* **來源**：使用神奇寶貝百科 (52Poke)、Bulbapedia 的地點/劇情介紹，或直接擷取遊戲 ROM 的文本 (Text Dump) 分拆。
* **做法**：將該章節的生肉文本存放在 `scripts/raw_texts/` 目錄下（例如 `batch_06_cerulean_city.txt`）。

### 階段二：單字與對話擷取 (Terminology Extraction) & 階段三：學習內容生成 (Content Generation)
由 Antigravity (AI 助手) 讀取文本，並一次性完成單字擷取與格式化：
1. 找出重點單字（地點、角色、寶可夢、招式、道具、UI系統）。每個單元需要至少40個單字。
2. 生成屬性（`japanese`, `kanji`, `romaji`, `zh_tw`, `difficulty`, `frequency`, `explanation`, `etymology`, `example_sentence`）。
3. Antigravity 將會產生一份暫存的 JSON 或是直接提出預覽供開發者檢查。

### 階段四：資料整併與更新 (Data Merge & Sync)
* **執行整併腳本**：Antigravity 使用工具或腳本 (如 `scripts/_merge_batch.ts`) 將確認無誤的 JSON 內容，附加寫入至對應的 `scripts/data/*.ts` 原始檔案，並自動賦予不重複的流水號 ID。
    *   **詳細步驟**：
        1.  Antigravity 讀取 `scripts/generator/temp_review.json` (經人工審核後的 JSON)。
        2.  根據 JSON 內容，判斷是新增單字還是更新現有單字。
        3.  將新增或更新的單字物件，附加寫入到 `scripts/data/vocab_batch_XX.ts` (或對應的分類檔案，如 `locations.ts`, `pokemons.ts`)。
        4.  自動為每個新單字生成一個不重複的 ID。
        5.  確保寫入的 TypeScript 檔案格式正確，並導出新的資料。
* **執行編譯腳本**：必須執行 `npx tsx scripts/generate_vocab.ts`，這會把所有分散在 `scripts/data/` 的 ts 檔案重新打包成前端需要的 `src/data/pokemon_vocab.json`。
* **建立新章節**：負責人在 `src/data/chapters.ts` 建立或更新對應的章節，將剛剛學到的單字 ID 納入。
---

## 3. 分批執行計畫 (Batch Strategy)

為了不造成 API 負載過重，且方便人工審核，並確保包含足夠的詞彙量（包含寶可夢專有名詞與**一般基礎日文單字/對話**），我們將整個《火紅/葉綠》遊戲拆分為 **27 個批次**。

### 重製與擴充計畫 (Batch 01 ~ 05)
由於初期的章節單字量較少，我們將重新規劃 Batch 1 到 Batch 5，目標是將每個章節的單詞量提升 ** 3 倍**。擴充重點包括：
1. **補足一般日語單字**：遊戲場景中出現的生活單詞（例如：家、草叢、道路、看、走、傷藥等）。
2. **對話與短語**：NPC 的日常問候、系統提示訊息、以及戰鬥中的基本互動（例如：戰鬥、逃跑、遇見）。
3. **更細緻的拆分**：確保每個初期的重要地點與動作都有對應的生字學習。

### 完整遊戲批次規劃 (Full Game Batches)

**【出發與最初的道館】**
* **Batch 01**: 真新鎮 (Pallet Town) & 1號道路 & 大木研究所
* **Batch 02**: 常磐市 (Viridian City) & 22號道路
* **Batch 03**: 常磐森林 (Viridian Forest) & 2號道路
* **Batch 04**: 尼比市 (Pewter City) & 尼比道館 (深灰道館)
* **Batch 05**: 3號、4號道路 & 月見山 (Mt. Moon) 

**【水之道館與枯葉市】**
* **Batch 06**: 華藍市 (Cerulean City) & 華藍道館 (已完成擴充版)
* **Batch 07**: 24、25號道路 (金珠橋) & 正輝的家 (Bill's House) (已完成擴充版)
* **Batch 08**: 5號、6號道路 & 枯葉市 (Vermilion City)
* **Batch 09**: 聖安妮號 (S.S. Anne) & 枯葉道館

**【紫苑鎮與彩虹市】**
* **Batch 10**: 11號道路 & 地鼠洞穴 (Diglett's Cave)
* **Batch 11**: 9號、10號道路 & 岩山隧道 (Rock Tunnel)
* **Batch 12**: 紫苑鎮 (Lavender Town) & 寶可夢塔 (Pokemon Tower) 初探
* **Batch 13**: 8號道路 & 彩虹市 (Celadon City) & 彩虹道館
* **Batch 14**: 火箭隊遊戲城地下基地 (Rocket Hideout)

**【喚醒卡比獸與西爾佛公司】**
* **Batch 15**: 寶可夢塔 (Pokemon Tower) 救援富士老人 & 取得寶可夢之笛
* **Batch 16**: 12~15號道路 (Silence Bridge) & 淺紅市 (Fuchsia City)
* **Batch 17**: 狩獵地帶 (Safari Zone) & 淺紅道館
* **Batch 18**: 格鬥道場 & 金黃市 (Saffron City) & 西爾佛公司 (Silph Co.)
* **Batch 19**: 金黃道館

**【最終道館與水路】**
* **Batch 20**: 16~18號道路 (寶可夢鄉間小路 / 單車道)
* **Batch 21**: 19~20號水路 & 雙子島 (Seafoam Islands)
* **Batch 22**: 紅蓮鎮 (Cinnabar Island) & 寶可夢屋 (Pokemon Mansion) & 紅蓮道館
* **Batch 23**: 七之島 (Sevii Islands) 第一~三島劇情
* **Batch 24**: 21號水路 & 常磐道館 (Viridian Gym)

**【終局與二周目】**
* **Batch 25**: 22號、23號道路 & 冠軍之路 (Victory Road)
* **Batch 26**: 寶可夢聯盟 (Pokemon League) & 四天王與冠軍戰
* **Batch 27**: 殿堂之後 (Post-game) & 七之島第四~七島 & 華藍洞窟 (Cerulean Cave)

---

## 4. 具體工具與腳本結構建議 (Proposed File Structure)

我們直接在專案建立一個專屬資料夾放置提供給 AI 的生肉輸入：

```text
scripts/
  ├── raw_texts/            # 存放每次要處理的參考文本 (如 batch_06_cerulean_city.txt)
  └── data/                 # 現有的字庫 (dialogue.ts, locations.ts 等等)
```

## 5. 人工介入點 (Human in the Loop)
在自動化過程中，我們會在 `scripts/generator/` 中產出一個中繼的 `temp_review.json`。
開發者可以檢閱這個 JSON：
1. 確認單字的假名、羅馬拼音是否完全正確。
2. 確認字源分析 (Etymology) 是否通順。
3. 刪除太冷門或重複的單字。
確認無誤後，再執行 `merge.ts` 將資料寫入主程式碼中。

---

## 7. 目前擴充進度追蹤 (Progress Tracker)

> 最後更新：2026-03-14

### 重製批次（Batch 01 ~ 05）

| Batch | 地點 | 狀態 | 詞彙數量 |
|-------|------|------|---------|
| **Batch 01** | 真新鎮 & 1號道路 & 大木研究所 | ✅ 已完成重製 | ~44 個 |
| **Batch 02** | 常磐市 & 22號道路 | ✅ 已完成重製 | 57 個（原15個 → 57個）|
| **Batch 03** | 常磐森林 & 2號道路 | ✅ 已完成重製 | 40 個（原15個 → 40個）|
| **Batch 04** | 尼比市 & 尼比道館 | ✅ 已完成重製 | 38 個（原13個 → 38個）|
| **Batch 05** | 3號、4號道路 & 月見山 | ⬜ 待重製 | - |

### 擴充批次（Batch 06+）

| Batch | 地點 | 狀態 |
|-------|------|------|
| **Batch 06** | 華藍市 & 華藍道館 | ✅ 已完成擴充 |
| **Batch 07** | 24、25號道路 & 正輝的家 | ✅ 已完成擴充 |
| **Batch 08 ~ 27** | 其餘章節 | ⬜ 待生成 |

### 全域統計

- **vocabulary JSON 總詞彙數**：375 個
- **已完成 Batch 數**：1, 2, 3, 4, 6, 7
