const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

async function convertSvgToPng(svgPath, outputPath, size) {
  const svgContent = fs.readFileSync(svgPath, 'utf-8');
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Parse SVG and draw to canvas
  const img = await loadImage(Buffer.from(svgContent));
  ctx.drawImage(img, 0, 0, size, size);
  
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`Generated ${outputPath}`);
}

async function generateIcons() {
  const svgPath = './icon-designs/cat.svg';
  const sizes = [
    { size: 32, output: './src-tauri/icons/32x32.png' },
    { size: 128, output: './src-tauri/icons/128x128.png' },
    { size: 256, output: './src-tauri/icons/256x256.png' },
  ];
  
  for (const { size, output } of sizes) {
    await convertSvgToPng(svgPath, output, size);
  }
  
  console.log('All icons generated!');
}

generateIcons().catch(console.error);
