// Create simple SVG PWA icons
const fs = require('fs');
const path = require('path');

// Function to create rounded square icon
function createIcon(size, filename) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.225}" fill="url(#grad${size})"/>
  <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"
        fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="${size * 0.4}">
    📊
  </text>
</svg>`;

  fs.writeFileSync(filename, svg);
  console.log(`Created ${filename}`);
}

// Create icons directory
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Generate SVG icons (for better quality)
createIcon(192, path.join(publicDir, 'icon-192x192.svg'));
createIcon(512, path.join(publicDir, 'icon-512x512.svg'));
createIcon(180, path.join(publicDir, 'apple-touch-icon.svg'));

// Update vite config to use SVG icons
console.log('\nPWA SVG icons generated successfully!');
console.log('Note: For production, consider converting to PNG using online tools or design software.');
