const fs = require('fs');
const path = require('path');
const { Jimp } = require('jimp');

const iconsDir = path.join(__dirname, 'public', 'assets', 'icons');

async function processIcons() {
  const files = fs.readdirSync(iconsDir).filter(f => f.endsWith('.png'));
  
  for (const file of files) {
    console.log(`Processing ${file}...`);
    const filePath = path.join(iconsDir, file);
    try {
      const image = await Jimp.read(filePath);
      
      let minX = image.bitmap.width, minY = image.bitmap.height;
      let maxX = 0, maxY = 0;
      let hasContent = false;

      // Make white pixels transparent and find bounding box
      image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
        const r = this.bitmap.data[idx + 0];
        const g = this.bitmap.data[idx + 1];
        const b = this.bitmap.data[idx + 2];
        const a = this.bitmap.data[idx + 3];
        
        // Tolerance for white background (AI images often have slight off-white)
        if (r > 240 && g > 240 && b > 240) {
          this.bitmap.data[idx + 3] = 0; // Make transparent
        } else if (a > 20) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          hasContent = true;
        }
      });
      
      if (hasContent) {
        // Crop image to content box
        const padding = 5;
        const cropX = Math.max(0, minX - padding);
        const cropY = Math.max(0, minY - padding);
        const cropW = Math.min(image.bitmap.width - cropX, (maxX - minX) + padding * 2);
        const cropH = Math.min(image.bitmap.height - cropY, (maxY - minY) + padding * 2);
        
        image.crop({ x: cropX, y: cropY, w: cropW, h: cropH });
      }
      
      await image.write(filePath);
      console.log(`Saved ${file}`);
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }
}

processIcons();
