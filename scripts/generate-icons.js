#!/usr/bin/env node

/**
 * Script para generar iconos PWA
 * Requiere: npm install sharp
 * Uso: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

// SVG base para el icono (Market POS)
const iconSVG = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="512" height="512" rx="80" fill="url(#grad)"/>
  
  <!-- Shopping bag icon -->
  <g transform="translate(128, 128)">
    <!-- Bag body -->
    <path d="M 40 80 L 216 80 L 240 256 L 16 256 Z" fill="white" opacity="0.95"/>
    
    <!-- Bag handles -->
    <path d="M 80 80 Q 80 40, 128 40 Q 176 40, 176 80" 
          fill="none" stroke="white" stroke-width="12" stroke-linecap="round" opacity="0.95"/>
    
    <!-- Dollar sign -->
    <text x="128" y="200" font-family="Arial, sans-serif" font-size="120" 
          font-weight="bold" fill="#3b82f6" text-anchor="middle">$</text>
  </g>
</svg>
`.trim();

// Crear el archivo SVG
const svgPath = path.join(publicDir, 'icon.svg');
fs.writeFileSync(svgPath, iconSVG);
console.log('✅ Creado: icon.svg');

// Crear placeholders PNG (estos deberían ser reemplazados con sharp para producción)
const createPlaceholderPNG = (size, filename) => {
  const canvas = `
<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <rect width="512" height="512" rx="80" fill="url(#grad)"/>
  
  <g transform="translate(128, 128)">
    <path d="M 40 80 L 216 80 L 240 256 L 16 256 Z" fill="white" opacity="0.95"/>
    <path d="M 80 80 Q 80 40, 128 40 Q 176 40, 176 80" 
          fill="none" stroke="white" stroke-width="12" stroke-linecap="round" opacity="0.95"/>
    <text x="128" y="200" font-family="Arial, sans-serif" font-size="120" 
          font-weight="bold" fill="#3b82f6" text-anchor="middle">$</text>
  </g>
</svg>
  `.trim();
  
  const pngPath = path.join(publicDir, filename);
  fs.writeFileSync(pngPath, canvas);
  console.log(`✅ Creado: ${filename} (${size}x${size})`);
};

// Crear iconos en diferentes tamaños
createPlaceholderPNG(192, 'icon-192.png');
createPlaceholderPNG(512, 'icon-512.png');
createPlaceholderPNG(180, 'apple-touch-icon.png');

console.log('\n📱 Iconos PWA creados exitosamente!');
console.log('\n⚠️  NOTA: Los archivos .png son SVG temporales.');
console.log('Para producción, instala sharp y genera PNGs reales:');
console.log('  npm install sharp');
console.log('  Luego actualiza este script para usar sharp.\n');
