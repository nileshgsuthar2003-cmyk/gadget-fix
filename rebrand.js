const fs = require('fs');
const path = require('path');

const directories = [
  'frontend/src',
  'frontend/index.html',
  'expo-mobile/src',
  'expo-mobile/app.json',
  'laravel-backend/app',
  'laravel-backend/database',
  'laravel-backend/routes'
];

function processPath(targetPath) {
  const fullPath = path.resolve(__dirname, targetPath);
  if (!fs.existsSync(fullPath)) return;
  
  const stat = fs.statSync(fullPath);
  if (stat.isDirectory()) {
    const files = fs.readdirSync(fullPath);
    for (const file of files) {
      processPath(path.join(targetPath, file));
    }
  } else if (stat.isFile()) {
    const ext = path.extname(fullPath);
    if (!['.ts', '.tsx', '.js', '.jsx', '.html', '.css', '.json', '.php'].includes(ext)) return;
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let original = content;
    
    // Replacements
    content = content.replace(/Fixly/g, 'Cell Care');
    content = content.replace(/fixly/g, 'cellcare');
    content = content.replace(/FIXLY/g, 'CELLCARE');
    
    if (content !== original) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Updated ${targetPath}`);
    }
  }
}

for (const dir of directories) {
  processPath(dir);
}
console.log('Rebranding complete.');
