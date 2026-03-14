/**
 * 檢查 chapters.ts 中引用的所有 vocabId 是否都存在於 pokemon_vocab.json
 * 同時檢查章節內的重複 ID
 *
 * 執行方式: npx tsx scripts/check_vocab_ids.ts
 */

import { chapters } from '../src/data/chapters';
import vocabData from '../src/data/pokemon_vocab.json';

const vocabIds = new Set(vocabData.map((v) => v.id));

let totalIssues = 0;

console.log('='.repeat(60));
console.log('  vocab ID 完整性檢查');
console.log('='.repeat(60));
console.log(`vocab.json 總筆數: ${vocabData.length}`);
console.log();

// ── 逐章節檢查 ────────────────────────────────────────────
for (const chapter of chapters) {
  const rawIds = chapter.vocabIds;
  const uniqueIds = [...new Set(rawIds)];

  // 找出章節內的重複 ID
  const seen = new Set<string>();
  const duplicates: string[] = [];
  for (const id of rawIds) {
    if (seen.has(id)) duplicates.push(id);
    else seen.add(id);
  }

  // 找出不在 vocab.json 中的 ID
  const missing = uniqueIds.filter((id) => !vocabIds.has(id));

  const hasIssue = duplicates.length > 0 || missing.length > 0;
  if (hasIssue) totalIssues++;

  const status = hasIssue ? '⚠️ ' : '✅';
  console.log(
    `${status} Unit ${chapter.id} (${chapter.title})` +
      `  raw=${rawIds.length} unique=${uniqueIds.length} vocab中=${uniqueIds.length - missing.length}`
  );

  if (duplicates.length > 0) {
    console.log(`   🔁 章節內重複 ID (${duplicates.length}): ${duplicates.join(', ')}`);
  }
  if (missing.length > 0) {
    console.log(`   ❌ vocab.json 中找不到 (${missing.length}): ${missing.join(', ')}`);
  }
}

// ── 跨章節重複引用（同一 ID 在多個章節出現）────────────────
console.log();
console.log('─'.repeat(60));
const idToChapters = new Map<string, number[]>();
for (const chapter of chapters) {
  for (const id of new Set(chapter.vocabIds)) {
    if (!idToChapters.has(id)) idToChapters.set(id, []);
    idToChapters.get(id)!.push(chapter.id);
  }
}
const crossChapter = [...idToChapters.entries()].filter(([, chs]) => chs.length > 1);
if (crossChapter.length > 0) {
  console.log(`跨章節共用的 ID (${crossChapter.length} 個):`);
  for (const [id, chs] of crossChapter) {
    const vocab = vocabData.find((v) => v.id === id);
    const label = vocab ? ` (${vocab.zh_tw})` : ' ⚠️ 不在 vocab.json';
    console.log(`   ${id}${label}  出現於: Unit ${chs.join(', ')}`);
  }
} else {
  console.log('✅ 無跨章節重複引用');
}

// ── 總結 ──────────────────────────────────────────────────
console.log();
console.log('='.repeat(60));
const allChapterIds = new Set(chapters.flatMap((ch) => ch.vocabIds));
const missingGlobal = [...allChapterIds].filter((id) => !vocabIds.has(id));
console.log(`章節引用的唯一 ID 總數: ${allChapterIds.size}`);
console.log(`在 vocab.json 中有記錄: ${allChapterIds.size - missingGlobal.length}`);
if (missingGlobal.length > 0) {
  console.log(`❌ 全域缺少 ${missingGlobal.length} 個: ${missingGlobal.join(', ')}`);
  totalIssues++;
} else {
  console.log('✅ 所有引用的 ID 都有對應詞條');
}
console.log(totalIssues === 0 ? '\n✅ 全部通過' : `\n共發現 ${totalIssues} 個章節有問題`);
