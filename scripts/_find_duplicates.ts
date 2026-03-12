import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'scripts', 'data');
const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.ts'));

const seenJapanese = new Map<string, string[]>();
const seenZhTw = new Map<string, string[]>();

for (const f of files) {
  const content = fs.readFileSync(path.join(DATA_DIR, f), 'utf8');
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.includes('id:')) {
      const idMatch = line.match(/id:\s*"([^"]+)"/);
      const jpMatch = line.match(/japanese:\s*"([^"]+)"/);
      const zhMatch = line.match(/zh_tw:\s*"([^"]+)"/);
      
      if (idMatch && jpMatch && zhMatch) {
        const id = idMatch[1];
        const jp = jpMatch[1];
        const zh = zhMatch[1];
        
        if (!seenJapanese.has(jp)) seenJapanese.set(jp, []);
        seenJapanese.get(jp)!.push(`${id} (${f})`);
        
        if (!seenZhTw.has(zh)) seenZhTw.set(zh, []);
        seenZhTw.get(zh)!.push(`${id} (${f})`);
      }
    }
  }
}

console.log("--- Duplicate Japanese ---");
for (const [jp, locs] of seenJapanese.entries()) {
  if (locs.length > 1) console.log(`${jp}: ${locs.join(', ')}`);
}

console.log("\n--- Duplicate zh_tw (excluding those with same jp if we care) ---");
for (const [zh, locs] of seenZhTw.entries()) {
  if (locs.length > 1) console.log(`${zh}: ${locs.join(', ')}`);
}
