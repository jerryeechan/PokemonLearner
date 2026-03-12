/**
 * Pokemon FireRed/LeafGreen Vocabulary Generator
 * Generates comprehensive pokemon_vocab.json from curated data
 * 
 * Usage: npx tsx scripts/generate_vocab.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface VocabEntry {
  id: string;
  batch?: number;
  category: string;
  japanese: string;
  kanji: string | null;
  hiragana: string;
  katakana?: string;
  romaji: string;
  zh_tw: string;
  difficulty: number;
  frequency: number;
  explanation: string;
  etymology: string;
  example_sentence: string;
  example_sentence_zh: string;
}

// Import data from category files
import { pokemonData } from './data/pokemon';
import { moveData } from './data/moves';
import { itemData } from './data/items';
import { abilityData } from './data/abilities';
import { locationData } from './data/locations';
import { battleData } from './data/battle';
import { uiData } from './data/ui';
import { dialogueData } from './data/dialogue';
import { statusData } from './data/status';
import { typeData } from './data/types';

function validate(entries: VocabEntry[]): void {
  const ids = new Set<string>();
  const errors: string[] = [];
  
  for (const e of entries) {
    if (ids.has(e.id)) errors.push(`Duplicate ID: ${e.id}`);
    ids.add(e.id);
    if (!e.japanese) errors.push(`Missing japanese: ${e.id}`);
    if (!e.hiragana) errors.push(`Missing hiragana: ${e.id}`);
    if (!e.romaji) errors.push(`Missing romaji: ${e.id}`);
    if (!e.zh_tw) errors.push(`Missing zh_tw: ${e.id}`);
    if (e.difficulty < 1 || e.difficulty > 5) errors.push(`Invalid difficulty: ${e.id}`);
    if (e.frequency < 1 || e.frequency > 5) errors.push(`Invalid frequency: ${e.id}`);
    if (!e.example_sentence_zh) errors.push(`Missing example_sentence_zh: ${e.id}`);
  }
  
  if (errors.length > 0) {
    console.error('Validation errors:');
    errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
  }
}

function main() {
  const allEntries: VocabEntry[] = [
    ...pokemonData,
    ...moveData,
    ...itemData,
    ...abilityData,
    ...locationData,
    ...battleData,
    ...uiData,
    ...dialogueData,
    ...statusData,
    ...typeData,
  ];

  validate(allEntries);

  // Stats
  const categories = new Map<string, number>();
  const difficulties = new Map<number, number>();
  for (const e of allEntries) {
    categories.set(e.category, (categories.get(e.category) || 0) + 1);
    difficulties.set(e.difficulty, (difficulties.get(e.difficulty) || 0) + 1);
  }

  console.log(`\n✅ Generated ${allEntries.length} vocabulary entries\n`);
  console.log('Categories:');
  for (const [cat, count] of [...categories.entries()].sort()) {
    console.log(`  ${cat}: ${count}`);
  }
  console.log('\nDifficulty distribution:');
  for (const [diff, count] of [...difficulties.entries()].sort()) {
    console.log(`  Level ${diff}: ${count}`);
  }

  const outPath = path.join(__dirname, '..', 'src', 'data', 'pokemon_vocab.json');
  fs.writeFileSync(outPath, JSON.stringify(allEntries, null, 2), 'utf-8');
  console.log(`\n📁 Written to ${outPath}`);
}

main();
