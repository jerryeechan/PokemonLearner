import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'scripts', 'data');

const replacements: Record<string, string> = {
  'dlg_040': 'dlg_008',
  'dlg_058': 'dlg_028',
  'dlg_029': 'item_006',
  'dlg_064': 'dlg_036',
  'dlg_074': 'dlg_038',
  'item_026': 'item_025',
  'loc_019': 'loc_004',
  'loc_028': 'loc_005',
  'loc_025': 'loc_021',
  'pokemon_154': 'pokemon_063',
};

const toDelete = new Set(Object.keys(replacements));

// 1. Update chapters.ts
const chaptersPath = path.resolve(process.cwd(), 'src', 'data', 'chapters.ts');
let chaptersContent = fs.readFileSync(chaptersPath, 'utf8');

for (const [oldId, newId] of Object.entries(replacements)) {
  const regex = new RegExp(`'${oldId}'`, 'g');
  chaptersContent = chaptersContent.replace(regex, `'${newId}'`);
}

fs.writeFileSync(chaptersPath, chaptersContent, 'utf8');
console.log('✅ Updated references in chapters.ts');


// 2. Delete lines in scripts/data/
const dataFiles = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.ts'));

for (const file of dataFiles) {
  const filePath = path.join(DATA_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const newLines = lines.filter(line => {
    const match = line.match(/id:\s*"([^"]+)"/);
    if (match) {
      if (toDelete.has(match[1])) {
        console.log(`🗑️  Deleted duplicate ID ${match[1]} from ${file}`);
        return false;
      }
    }
    return true;
  });
  
  if (lines.length !== newLines.length) {
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
  }
}

console.log('✅ Deleted duplicated entries from data files.');
