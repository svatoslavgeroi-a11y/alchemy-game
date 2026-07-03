const path = require('path');
const { Jimp } = require('jimp');

const artifactsDir = 'C:/Users/svato/.gemini/antigravity/brain/bd6585b7-1e4c-41d0-82a8-12573abc9fda';
const outputDir = path.join(__dirname, 'public', 'assets', 'icons');

const icons = {
  'magma.png': 'media__1783057099159.png'
};

async function processIcons() {
  for (const [outName, inName] of Object.entries(icons)) {
    const inputPath = path.join(artifactsDir, inName);
    const outputPath = path.join(outputDir, outName);
    console.log(`Processing ${inName} -> ${outName}`);
    try {
      const image = await Jimp.read(inputPath);
      const w = image.bitmap.width;
      const h = image.bitmap.height;
      
      const queue = [];
      const visited = new Uint8Array(w * h);
      
      const push = (x, y) => {
        if (x < 0 || x >= w || y < 0 || y >= h) return;
        const idx = y * w + x;
        if (!visited[idx]) {
          visited[idx] = 1;
          queue.push({x, y});
        }
      };
      
      for (let x = 0; x < w; x++) {
        push(x, 0); push(x, h - 1);
      }
      for (let y = 0; y < h; y++) {
        push(0, y); push(w - 1, y);
      }
      
      const bgR = image.bitmap.data[0];
      const bgG = image.bitmap.data[1];
      const bgB = image.bitmap.data[2];
      const tolerance = 40; // Допуск для JPG артефактов

      while (queue.length > 0) {
        const {x, y} = queue.shift();
        const pIdx = (y * w + x) * 4;
        const r = image.bitmap.data[pIdx];
        const g = image.bitmap.data[pIdx + 1];
        const b = image.bitmap.data[pIdx + 2];
        
        const diff = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
        
        if (diff < tolerance) {
          image.bitmap.data[pIdx + 3] = 0;
          push(x - 1, y);
          push(x + 1, y);
          push(x, y - 1);
          push(x, y + 1);
        }
      }
      
      let minX = w, minY = h;
      let maxX = 0, maxY = 0;
      let hasContent = false;
      
      image.scan(0, 0, w, h, function(x, y, idx) {
        if (this.bitmap.data[idx + 3] > 0) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          hasContent = true;
        }
      });
      
      if (hasContent) {
        const cropW = maxX - minX + 1;
        const cropH = maxY - minY + 1;
        image.crop({ x: minX, y: minY, w: cropW, h: cropH });
      }
      
      await image.write(outputPath);
      console.log(`Saved ${outName}`);
    } catch (err) {
      console.error(`Error processing ${inName}:`, err);
    }
  }
}

processIcons();
