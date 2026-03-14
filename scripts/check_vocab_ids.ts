/**
 * 檢查 chapters.ts 中引用的所有 vocabId 的完整性與重複問題
 *
 * 執行方式:
 *   npx tsx scripts/check_vocab_ids.ts          # 僅檢查
 *   npx tsx scripts/check_vocab_ids.ts --fix     # 自動移除重複 ID
 *
 * 修正規則：
 *   - 章節內重複：保留第一次出現，移除後續重複
 *   - 跨章節重複：保留較早章節，從較晚章節移除
 */

import fs from 'fs';
import path from 'path';
import { chapters } from '../src/data/chapters';
import vocabData from '../src/data/pokemon_vocab.json';

const args = process.argv.slice(2);
const shouldFix = args.includes('--fix');

const vocabIds = new Set(vocabData.map((v) => v.id));
let totalIssues = 0;

console.log('='.repeat(60));
console.log('  vocab ID 完整性檢查');
console.log('='.repeat(60));
console.log(`vocab.json 總筆數: ${vocabData.length}`);
console.log();

// ── 建立跨章節重複索引 ─────────────────────────────────────
// id → 第一次出現的章節 id
const idToFirstChapter: Record<string, number> = {};
// 需要從哪個章節移除哪些 id
const crossDuplicates: { id: string; keep: number; remove: number }[] = [];

for (const chapter of chapters) {
  const seen = new Set<string>();
  for (const id of chapter.vocabIds) {
    if (seen.has(id)) continue; // 跳過章節內重複，另行統計
    seen.add(id);
    if (idToFirstChapter[id] !== undefined) {
      crossDuplicates.push({ id, keep: idToFirstChapter[id], remove: chapter.id });
    } else {
      idToFirstChapter[id] = chapter.id;
    }
  }
}

// ── 逐章節檢查 ─────────────────────────────────────────────
for (const chapter of chapters) {
  const rawIds = chapter.vocabIds;
  const uniqueIds = [...new Set(rawIds)];

  // 章節內重複
  const seen = new Set<string>();
  const intraDuplicates: string[] = [];
  for (const id of rawIds) {
    if (seen.has(id)) intraDuplicates.push(id);
    else seen.add(id);
  }

  // 在 vocab.json 中找不到的 ID
  const missing = uniqueIds.filter((id) => !vocabIds.has(id));

  // 跨章節重複（此章節要被移除的）
  const crossToRemove = crossDuplicates
    .filter((d) => d.remove === chapter.id)
    .map((d) => d.id);

  const hasIssue = intraDuplicates.length > 0 || missing.length > 0 || crossToRemove.length > 0;
  if (hasIssue) totalIssues++;

  const status = hasIssue ? '⚠️ ' : '✅';
  console.log(
    `${status} Unit ${chapter.id} (${chapter.title})` +
      `  raw=${rawIds.length} unique=${uniqueIds.length} vocab中=${uniqueIds.length - missing.length}`
  );

  if (intraDuplicates.length > 0) {
    console.log(`   🔁 章節內重複 (${intraDuplicates.length}): ${intraDuplicates.join(', ')}`);
  }
  if (crossToRemove.length > 0) {
    const details = crossToRemove
      .map((id) => `${id} (已在 Unit ${idToFirstChapter[id]})`)
      .join(', ');
    console.log(`   ❌ 跨章節重複，應移除 (${crossToRemove.length}): ${details}`);
  }
  if (missing.length > 0) {
    console.log(`   ❌ vocab.json 找不到 (${missing.length}): ${missing.join(', ')}`);
  }
}

// ── 全域缺失統計 ───────────────────────────────────────────
console.log();
console.log('─'.repeat(60));
const allChapterIds = new Set(chapters.flatMap((ch) => ch.vocabIds));
const missingGlobal = [...allChapterIds].filter((id) => !vocabIds.has(id));
console.log(`章節引用的唯一 ID 總數: ${allChapterIds.size}`);
if (missingGlobal.length > 0) {
  console.log(`❌ 全域缺少 ${missingGlobal.length} 個: ${missingGlobal.join(', ')}`);
  totalIssues++;
} else {
  console.log('✅ 所有引用的 ID 都有對應詞條');
}

// ── 總結 ───────────────────────────────────────────────────
const hasIntraDuplicates = chapters.some((ch) => {
  const seen = new Set<string>();
  return ch.vocabIds.some((id) => { const dup = seen.has(id); seen.add(id); return dup; });
});
const hasFixable = crossDuplicates.length > 0 || hasIntraDuplicates;

console.log();
console.log('='.repeat(60));
if (totalIssues === 0 && !hasFixable) {
  console.log('✅ 全部通過');
} else {
  console.log(`共發現 ${totalIssues} 個問題`);
  if (hasFixable && !shouldFix) {
    console.log('💡 執行以下指令可自動移除重複 ID：');
    console.log('   npx tsx scripts/check_vocab_ids.ts --fix');
  }
}

// ── 自動修正 ───────────────────────────────────────────────
if (shouldFix) {
  fixDuplicates();
}

function fixDuplicates() {
  console.log();
  console.log('─'.repeat(60));
  console.log('  自動修正中...');
  console.log('─'.repeat(60));

  const chaptersFilePath = path.resolve(process.cwd(), 'src/data/chapters.ts');
  const lines = fs.readFileSync(chaptersFilePath, 'utf8').split('\n');

  // 跨章節：chapterId → 要移除的 id Set
  const crossToRemoveByChapter = new Map<number, Set<string>>();
  for (const { id, remove } of crossDuplicates) {
    if (!crossToRemoveByChapter.has(remove)) crossToRemoveByChapter.set(remove, new Set());
    crossToRemoveByChapter.get(remove)!.add(id);
  }

  let currentChapterId: number | null = null;
  let inVocabIds = false;
  // 每個章節已出現過的 id（用於去除章節內重複）
  const intraSeen = new Map<number, Set<string>>();
  let removedCount = 0;
  const newLines: string[] = [];

  for (const line of lines) {
    // 偵測章節 id 宣告（格式：`    id: N,`）
    const idMatch = line.match(/^\s{2,4}id:\s*(\d+),\s*$/);
    if (idMatch) {
      currentChapterId = parseInt(idMatch[1]);
      if (!intraSeen.has(currentChapterId)) {
        intraSeen.set(currentChapterId, new Set());
      }
    }

    // 偵測 vocabIds 陣列的開始與結束
    if (line.includes('vocabIds: [')) inVocabIds = true;
    if (inVocabIds && /^\s{2,6}\],/.test(line)) inVocabIds = false;

    // 在 vocabIds 區塊內判斷是否移除該行
    if (inVocabIds && currentChapterId !== null) {
      const vocabMatch = line.match(/^\s+'([a-zA-Z]+_\d+)',?/);
      if (vocabMatch) {
        const id = vocabMatch[1];
        const seenSet = intraSeen.get(currentChapterId)!;

        // 章節內重複（第二次以後出現）
        if (seenSet.has(id)) {
          console.log(`   🗑  Unit ${currentChapterId} 章節內重複 → 移除: ${id}`);
          removedCount++;
          continue;
        }
        seenSet.add(id);

        // 跨章節重複（應從此章節移除）
        if (crossToRemoveByChapter.get(currentChapterId)?.has(id)) {
          const keepChapter = idToFirstChapter[id];
          console.log(`   🗑  Unit ${currentChapterId} 跨章節重複 → 移除: ${id} (保留於 Unit ${keepChapter})`);
          removedCount++;
          continue;
        }
      }
    }

    newLines.push(line);
  }

  fs.writeFileSync(chaptersFilePath, newLines.join('\n'));
  console.log();
  console.log(`✅ 已修正 chapters.ts，共移除 ${removedCount} 個重複 ID`);
  console.log('   請再次執行 check_vocab_ids.ts 確認結果');
}
