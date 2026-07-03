const fs = require('fs');
const content = fs.readFileSync('src/data/elements.js', 'utf-8');

const regex = /id:\s*'([^']+)'[^>]+icon:\s*'([^']+)'/g;
let match;
const icons = {};
const duplicates = [];

while ((match = regex.exec(content)) !== null) {
  const id = match[1];
  const icon = match[2];
  if (icons[icon]) {
    duplicates.push(`Duplicate: ${id} and ${icons[icon]} both use ${icon}`);
  } else {
    icons[icon] = id;
  }
}

if (duplicates.length > 0) {
  console.log(duplicates.join('\n'));
} else {
  console.log('No duplicates found!');
}
