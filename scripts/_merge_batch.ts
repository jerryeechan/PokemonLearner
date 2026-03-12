import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'scripts', 'data');
const REVIEW_JSON_PATH = path.resolve(process.cwd(), 'scripts', 'batch_02_review.json');

const config = {
  Location: { file: 'locations.ts', varName: 'locationData', prefix: 'loc_' },
  Type:     { file: 'types.ts',     varName: 'typeData',     prefix: 'type_' },
  Pokemon:  { file: 'pokemon.ts',   varName: 'pokemonData',  prefix: 'pokemon_' },
  Item:     { file: 'items.ts',     varName: 'itemData',     prefix: 'item_' },
  Move:     { file: 'moves.ts',     varName: 'moveData',     prefix: 'move_' },
  Dialogue: { file: 'dialogue.ts',  varName: 'dialogueData', prefix: 'dlg_' },
  UI:       { file: 'ui.ts',        varName: 'uiData',       prefix: 'ui_' },
  General:  { file: 'dialogue.ts',  varName: 'dialogueData', prefix: 'dlg_' },
};

function readMaxId(file: string, prefix: string): number {
  if (!fs.existsSync(file)) return 0;
  const content = fs.readFileSync(file, 'utf8');
  const regex = new RegExp(`id:\\s*["']${prefix}(\\d{3})["']`, 'g');
  let max = 0;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const id = parseInt(match[1], 10);
    if (id > max) max = id;
  }
  return max;
}

const batchMatch = REVIEW_JSON_PATH.match(/batch_(\d+)_review/);
const batchId = batchMatch ? parseInt(batchMatch[1], 10) : undefined;

function buildExistingVocabSet(): Set<string> {
  const existingSet = new Set<string>();
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.ts'));
  
  for (const f of files) {
    const content = fs.readFileSync(path.join(DATA_DIR, f), 'utf8');
    const lines = content.split('\n');
    for (const line of lines) {
      const jpMatch = line.match(/japanese:\s*"([^"]+)"/);
      const zhMatch = line.match(/zh_tw:\s*"([^"]+)"/);
      if (jpMatch) existingSet.add(`JP_${jpMatch[1]}`);
      if (zhMatch) existingSet.add(`ZH_${zhMatch[1]}`);
    }
  }
  return existingSet;
}

function processBatch() {
  const parsed = JSON.parse(fs.readFileSync(REVIEW_JSON_PATH, 'utf8'));
  const allItems = Array.isArray(parsed) ? parsed : (parsed.results || []);
  
  const existingSet = buildExistingVocabSet();
  
  const data: Record<string, any[]> = {};
  for (const item of allItems) {
    const cat = item.category || 'Dialogue';
    
    // Check for existing vocab (Japanese OR Traditional Chinese)
    const jpKey = `JP_${item.japanese}`;
    const zhKey = `ZH_${item.zh_tw}`;
    if (existingSet.has(jpKey) || existingSet.has(zhKey)) {
      console.log(`[Duplicate Skipped] ${item.japanese} / ${item.zh_tw} already exists.`);
      continue;
    }
    
    // Add to set to prevent duplicates within the same batch
    existingSet.add(jpKey);
    existingSet.add(zhKey);

    if (!data[cat]) data[cat] = [];
    data[cat].push(item);
  }
  
  for (const [category, items] of Object.entries(data)) {
    const cnf = config[category as keyof typeof config] || config.Dialogue;
    const destPath = path.join(DATA_DIR, cnf.file);
    if (!fs.existsSync(destPath)) {
      console.warn(`File ${destPath} does not exist, skipping ${category}`);
      continue;
    }
    
    let currentId = readMaxId(destPath, cnf.prefix);
    let newContent = '';
    
    // Read the current file content to check for existing IDs
    let currentContentRaw = fs.readFileSync(destPath, 'utf8');
    
    for (const item of items) {
      if (!item.id || item.id === '' || item.id === 'AUTO') {
        currentId++;
        const idStr = String(currentId).padStart(3, '0');
        item.id = `${cnf.prefix}${idStr}`;
      } else {
        // Only append if the ID isn't already in the file
        if (currentContentRaw.includes(`id: "${item.id}"`)) {
          console.log(`[ID Skipped] ID ${item.id} already exists in target file.`);
          continue;
        }
      }
      
      const parts = [];
      parts.push(`id: "${item.id}"`);
      if (batchId !== undefined) {
        parts.push(`batch: ${batchId}`);
      }
      parts.push(`category: "${item.category || category}"`);
      parts.push(`japanese: "${item.japanese || ''}"`);
      parts.push(`kanji: ${item.kanji ? `"${item.kanji}"` : 'null'}`);
      parts.push(`hiragana: "${item.hiragana || ''}"`);
      if (item.katakana) parts.push(`katakana: "${item.katakana}"`);
      parts.push(`romaji: "${item.romaji || ''}"`);
      parts.push(`zh_tw: "${item.zh_tw || ''}"`);
      parts.push(`difficulty: ${item.difficulty || 1}`);
      parts.push(`frequency: ${item.frequency || 1}`);
      parts.push(`explanation: "${item.explanation || ''}"`);
      parts.push(`etymology: "${item.etymology || ''}"`);
      parts.push(`example_sentence: "${item.example_sentence || ''}"`);
      parts.push(`example_sentence_zh: "${item.example_sentence_zh || ''}"`);
      
      newContent += `  { ${parts.join(', ')} },\n`;
    }
    
    if (newContent) {
      // replace "];" with new content + "];"
      currentContentRaw = currentContentRaw.replace(/];[\s\S]*$/, `\n${newContent}];\n`);
      fs.writeFileSync(destPath, currentContentRaw, 'utf8');
      console.log(`Merged ${items.length} items into ${cnf.file}`);
    }
  }
}

processBatch();
