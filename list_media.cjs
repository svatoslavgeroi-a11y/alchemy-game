const fs = require('fs');
const dir = 'C:/Users/svato/.gemini/antigravity/brain/bd6585b7-1e4c-41d0-82a8-12573abc9fda/';
const files = fs.readdirSync(dir).filter(f => f.startsWith('media__') && f.endsWith('.png'));
files.forEach(f => {
  const stat = fs.statSync(dir + f);
  console.log(f, stat.mtime);
});
