import { execSync } from 'child_process';

try {
  console.log('[v0] Starting git operations...');
  console.log('[v0] Current directory:', process.cwd());
  
  // Add all changes
  console.log('[v0] Staging changes...');
  execSync('git add .', { stdio: 'inherit' });
  
  // Check git status
  console.log('[v0] Git status:');
  execSync('git status', { stdio: 'inherit' });
  
  // Commit changes
  console.log('[v0] Committing changes...');
  execSync('git commit -m "fix: resolve build errors - fix imports and add missing dependencies"', { stdio: 'inherit' });
  
  // Push to main
  console.log('[v0] Pushing to main branch...');
  execSync('git push origin main', { stdio: 'inherit' });
  
  console.log('[v0] Successfully pushed to main!');
} catch (error) {
  console.error('[v0] Error:', error.message);
  process.exit(1);
}
