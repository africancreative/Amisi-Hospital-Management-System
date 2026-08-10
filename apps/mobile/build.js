const { execSync } = require('child_process');
try {
  execSync('flutter build web', { stdio: 'inherit' });
} catch (e) {
  console.log('Flutter not installed, skipping mobile build');
}
