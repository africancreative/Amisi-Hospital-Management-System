import { execSync } from 'child_process';
import path from 'path';

const projectDir = '/vercel/share/v0-project';

try {
  console.log('Starting push to main branch...\n');

  // Change to project directory
  process.chdir(projectDir);

  // Check current branch
  const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
  console.log(`Current branch: ${currentBranch}\n`);

  // Add all changes
  console.log('Adding all changes...');
  execSync('git add -A', { stdio: 'inherit' });

  // Check if there are changes to commit
  const status = execSync('git status --porcelain', { encoding: 'utf-8' });
  
  if (status.trim()) {
    // Commit changes
    console.log('\nCommitting changes...');
    const commitMessage = 'fix: resolve build errors - fix imports, add recharts dependency, export database functions';
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
    console.log('Changes committed successfully\n');
  } else {
    console.log('No changes to commit\n');
  }

  // Checkout main branch if not already on it
  if (currentBranch !== 'main') {
    console.log('Checking out main branch...');
    execSync('git checkout main', { stdio: 'inherit' });
  }

  // Push to main
  console.log('\nPushing to main branch...');
  execSync('git push origin main', { stdio: 'inherit' });
  
  console.log('\n✓ Successfully pushed to main branch on GitHub!');
  process.exit(0);
} catch (error) {
  console.error('Error during push:', error.message);
  process.exit(1);
}
