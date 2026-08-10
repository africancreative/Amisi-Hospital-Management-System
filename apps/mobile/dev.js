const { execSync } = require('child_process');
try {
  execSync('flutter --version', { stdio: 'ignore' });
  execSync('flutter run', { stdio: 'inherit' });
} catch (e) {
  console.log('Flutter not installed. Skipping mobile dev server for monorepo.');
  // Keep process active so turbo dev won't terminate other services
  setInterval(() => {}, 60000);
}
