const path = require('path');
const { Jimp } = require('jimp');

const inputDir = 'C:/Users/svato/.gemini/antigravity/brain/bd6585b7-1e4c-41d0-82a8-12573abc9fda';
const outputDir = path.join(__dirname, 'public', 'assets', 'icons');

const filesToProcess = [
  { in: 'media__1782997231072.png', out: 'wall.png' }
];

async function processIcons() {
  for (const item of filesToProcess) {
    const inputPath = path.join(inputDir, item.in);
    const outputPath = path.join(outputDir, item.out);
    console.log(`Processing ${item.in} -> ${item.out}`);
    try {
      const image = await Jimp.read(inputPath);
      
      let minX = image.bitmap.width, minY = image.bitmap.height;
      let maxX = 0, maxY = 0;
      let hasContent = false;

      image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
        const r = this.bitmap.data[idx + 0];
        const g = this.bitmap.data[idx + 1];
        const b = this.bitmap.data[idx + 2];
        const a = this.bitmap.data[idx + 3];
        
        if (r > 240 && g > 240 && b > 240) {
          this.bitmap.data[idx + 3] = 0;
        } else if (a > 20) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          hasContent = true;
        }
      });
      
      if (hasContent) {
        const padding = 5;
        const cropX = Math.max(0, minX - padding);
        const cropY = Math.max(0, minY - padding);
        const cropW = Math.min(image.bitmap.width - cropX, (maxX - minX) + padding * 2);
        const cropH = Math.min(image.bitmap.height - cropY, (maxY - minY) + padding * 2);
        
        image.crop({ x: cropX, y: cropY, w: cropW, h: cropH });
      }
      
      await image.write(outputPath);
      console.log(`Saved ${item.out}`);
    } catch (err) {
      console.error(`Error processing ${item.in}:`, err);
    }
  }
}

processIcons();
