const fs = require('fs');
if (fs.existsSync('src/assets')) {
  fs.cpSync('src/assets', 'dist/assets', { recursive: true });
}
