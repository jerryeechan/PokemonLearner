---
name: Fix Issue
description: 從 GitHub Issue 讀取回報的內容錯誤，查證後修正資料、開分支並提交 PR。
---

# Fix Issue — 內容校稿修正流程

當使用者要求「修 issue」、「處理回報」、「fix issue」或提及 GitHub Issue 的內容修正時，依照以下步驟執行。

## 流程步驟

### 1. 讀取 Issue

```bash
gh issue list --state open
gh issue view <number> --json title,body,comments,labels,author
```

- 確認 Issue 的具體回報內容（哪筆資料、哪個欄位、建議改成什麼）
- 如果 Issue 內容不夠明確，先在 Issue 上留言詢問，不要猜測

### 2. 定位資料

用 Grep 在 `scripts/data/` 目錄下搜尋回報的關鍵字，找到對應的 `.ts` 來源檔案和具體行數。

**重要**：來源資料在 `scripts/data/*.ts`，而非 `src/data/pokemon_vocab.json`（JSON 是自動生成的）。

資料檔案對照：

| 分類 | 來源檔案 |
|------|---------|
| Pokemon | `scripts/data/pokemon.ts` |
| Dialogue | `scripts/data/dialogue.ts` |
| Move | `scripts/data/moves.ts` |
| Item | `scripts/data/items.ts` |
| Location | `scripts/data/locations.ts` |
| Battle | `scripts/data/battle.ts` |
| UI | `scripts/data/ui.ts` |
| Status | `scripts/data/status.ts` |
| Type | `scripts/data/types.ts` |
| Ability | `scripts/data/abilities.ts` |

### 3. 查證內容

**不要直接照 Issue 的建議修改，必須先查證。** 常見查證方式：

- **日文用語**：查詢寶可夢 Wiki（`wiki.ポケモン.com`）、日文維基百科
- **中文翻譯**：對照台灣官方寶可夢繁中翻譯
- **讀音 (hiragana/romaji)**：確認片假名/平假名轉換正確
- **例句語法**：確認日文例句文法正確

查證結論需記錄在 PR 說明中，讓 reviewer 能理解修正依據。

如果查證後發現 Issue 的建議不正確，在 Issue 上回覆說明原因，不要修改。

### 4. 修改來源資料

修改 `scripts/data/` 下對應的 `.ts` 檔案。一筆資料可能需要連動更新多個欄位：

- `japanese` 改了 → 檢查 `hiragana`、`katakana`、`romaji` 是否需要同步
- 語意改了 → 檢查 `explanation`、`etymology`、`example_sentence` 是否需要同步
- `zh_tw` 改了 → 檢查 `example_sentence_zh` 是否需要同步

### 5. 重新生成 JSON

```bash
npx tsx scripts/generate_vocab.ts
```

確認輸出無錯誤，總筆數與修改前一致（除非是新增/刪除）。

### 6. 開分支、提交、建 PR

分支命名：`fix/issue-<number>-<簡短描述>`

```bash
git checkout -b fix/issue-<number>-<描述>
git add scripts/data/<對應檔案>.ts src/data/pokemon_vocab.json
git commit  # 訊息包含 "Closes #<number>"
git push -u origin <branch>
gh pr create
```

**Commit message 格式**：
```
fix: 修正 <vocab_id> 的 <欄位> — <簡述>

Closes #<number>

查證結果：
- <查證來源和結論>
```

**PR body 格式**：
```markdown
## Summary
- 修正內容的簡述
- 查證來源連結

## 變更檔案
- `scripts/data/<file>.ts` - 修正來源資料
- `src/data/pokemon_vocab.json` - 重新生成

Closes #<number>
```

### 7. 切回 master

PR 建立後切回 master，等待 review：

```bash
git checkout master
```

## 批量處理

如果有多個相關 Issue（例如同一筆資料的多個欄位），可以合併到同一個 PR，但 commit message 要列出所有 `Closes #N`。

不相關的 Issue 應該分開成獨立的 PR。

## 注意事項

- **永遠修改 `scripts/data/*.ts`**，不要直接改 `pokemon_vocab.json`
- 每次修改後都要跑 `generate_vocab.ts` 確保 JSON 同步
- 查證是這個流程最重要的步驟，寧可多花時間查證也不要引入新的錯誤
