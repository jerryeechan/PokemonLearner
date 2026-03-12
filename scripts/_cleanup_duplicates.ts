import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'scripts', 'data');
const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.ts'));

// The duplicate IDs that we know were double-added with double quotes in the ID part
const duplicatedIDsPattern = /id: "(pokemon_001|pokemon_004|pokemon_007|loc_001|dlg_001|dlg_016|dlg_017|dlg_010|dlg_002|battle_008|battle_009|ui_006|ui_007)"/;

for (const f of files) {
  const filePath = path.join(DATA_DIR, f);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const newLines = lines.filter(line => !duplicatedIDsPattern.test(line));

  if (lines.length !== newLines.length) {
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
    console.log(`Cleaned duplicates from ${f} (removed ${lines.length - newLines.length} lines)`);
  }
}
