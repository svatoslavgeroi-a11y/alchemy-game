const fs = require('fs');
const path = 'src/data/elements.js';
let content = fs.readFileSync(path, 'utf8');
const count = (content.match(/src="\/assets\/icons\//g) || []).length;
console.log('Found ' + count + ' icon paths to fix');
// Vite handles base path for imports, but for runtime HTML strings
// we need to use import.meta.env.BASE_URL or hardcode the base path.
// Since these are in a JS data file as HTML strings, let's make them use a helper.
