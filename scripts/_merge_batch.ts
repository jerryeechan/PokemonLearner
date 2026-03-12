import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'scripts', 'data');
const REVIEW_JSON_PATH = '/Users/jerryee/.gemini/antigravity/brain/283b1c6b-6411-403e-b400-b671881a031c/batch_01_review.json';

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

function processBatch() {
  const parsed = JSON.parse(fs.readFileSync(REVIEW_JSON_PATH, 'utf8'));
  const allItems = parsed.results || [];
  
  const data: Record<string, any[]> = {};
  for (const item of allItems) {
    const cat = item.category || 'Dialogue';
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
          console.log(`Skipping existing ID: ${item.id}`);
          continue;
        }
      }
      
      const parts = [];
      parts.push(`id: "${item.id}"`);
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
