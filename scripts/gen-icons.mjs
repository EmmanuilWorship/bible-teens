// generates simple SVG-based PNG icons
import { writeFileSync } from 'fs';

function svgToPngBase64(size) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#0a0a1f"/>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#g)"/>
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#4f46e5"/>
    </linearGradient>
  </defs>
  <text x="50%" y="54%" font-size="${size * 0.45}" text-anchor="middle" dominant-baseline="middle" font-family="serif">📖</text>
</svg>`;
  return svg;
}

writeFileSync('public/icon-192.svg', svgToPngBase64(192));
writeFileSync('public/icon-512.svg', svgToPngBase64(512));
console.log('SVG icons created');
