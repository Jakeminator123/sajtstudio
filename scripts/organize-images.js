const fs = require('fs');
const path = require('path');

const imagesPath = path.join(__dirname, '..', 'public', 'images');
const heroPath = path.join(imagesPath, 'hero');

// Skapa mappar
const folders = ['portfolio', 'backgrounds', 'patterns', 'animations'];
folders.forEach(folder => {
  const folderPath = path.join(imagesPath, folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`✓ Skapade mapp: ${folder}`);
  }
});

// Flytta portfolio-bilder
const portfolioPath = path.join(imagesPath, 'portfolio');
const heroFiles = fs.readdirSync(heroPath);

heroFiles.forEach(file => {
  const filePath = path.join(heroPath, file);
  const stats = fs.statSync(filePath);
  
  if (stats.isFile()) {
    // Portfolio-bilder (task_* och assets_*)
    if (file.startsWith('task_') || file.startsWith('assets_')) {
      fs.renameSync(filePath, path.join(portfolioPath, file));
      console.log(`✓ Flyttade ${file} -> portfolio/`);
    }
    // Patterns
    else if (file === 'bg-content-pattern.png') {
      fs.renameSync(filePath, path.join(imagesPath, 'patterns', 'content-pattern.png'));
      console.log(`✓ Flyttade ${file} -> patterns/content-pattern.png`);
    }
    else if (file === 'bg-hero-gradient.png') {
      fs.renameSync(filePath, path.join(imagesPath, 'patterns', 'hero-gradient.png'));
      console.log(`✓ Flyttade ${file} -> patterns/hero-gradient.png`);
    }
    // Animations
    else if (file === 'hero-animation.gif') {
      fs.renameSync(filePath, path.join(imagesPath, 'animations', 'hero-animation.gif'));
      console.log(`✓ Flyttade ${file} -> animations/`);
    }
    else if (file === 'gif_of_sites_maybee_hero_pic.gif') {
      fs.renameSync(filePath, path.join(imagesPath, 'animations', 'sites-animation.gif'));
      console.log(`✓ Flyttade ${file} -> animations/sites-animation.gif`);
    }
    // Backgrounds
    else if (file === 'city-background.webp') {
      fs.renameSync(filePath, path.join(imagesPath, 'backgrounds', 'city-background.webp'));
      console.log(`✓ Flyttade ${file} -> backgrounds/`);
    }
    else if (file === 'future_whoman.webp') {
      fs.renameSync(filePath, path.join(imagesPath, 'backgrounds', 'future-background.webp'));
      console.log(`✓ Flyttade ${file} -> backgrounds/future-background.webp`);
    }
    // Hero-background
    else if (file === 'alt_background.webp') {
      // Kopiera till backgrounds som section-background
      fs.copyFileSync(filePath, path.join(imagesPath, 'backgrounds', 'section-background.webp'));
      // Döp om till hero-background.webp
      fs.renameSync(filePath, path.join(heroPath, 'hero-background.webp'));
      console.log(`✓ Kopierade ${file} -> backgrounds/section-background.webp`);
      console.log(`✓ Döpte om ${file} -> hero-background.webp`);
    }
  }
});

console.log('\n✅ Klart! Bilderna är nu organiserade.');
console.log('\nStruktur:');
console.log('  /images/hero/ - Hero-sektionens bilder (hero-background.webp)');
console.log('  /images/portfolio/ - Portfolio-exempel bilder');
console.log('  /images/backgrounds/ - Bakgrundsbilder för olika sektioner');
console.log('  /images/patterns/ - Bakgrundsmönster');
console.log('  /images/animations/ - Animation GIFs');

