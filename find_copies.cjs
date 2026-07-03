const fs = require('fs');
const lines = fs.readFileSync('C:/Users/svato/.gemini/antigravity/brain/bd6585b7-1e4c-41d0-82a8-12573abc9fda/.system_generated/logs/transcript.jsonl', 'utf8').split('\n');
lines.forEach(l => {
  if (l.includes('copy "C:\\\\Users') || l.includes('Copying image')) {
    const match = l.match(/media__\d+\.png/);
    const destMatch = l.match(/icons\\\\([a-z_]+)\.png/);
    if (match && destMatch) {
      console.log(destMatch[1], match[0]);
    }
  }
});
