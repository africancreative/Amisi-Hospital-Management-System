import { execSync } from 'child_process';

const projectDir = '/vercel/share/v0-project';

const runCmd = (cmd, desc) => {
  console.log(`[v0] ${desc}`);
  try {
    return execSync(cmd, { 
      cwd: projectDir,
      stdio: 'inherit',
      encoding: 'utf-8'
    });
  } catch (error) {
    console.error(`[v0] Error: ${error.message}`);
    throw error;
  }
};

try {
  console.log('[v0] Starting push to main branch...\n');

  // Check current branch
  const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { 
    cwd: projectDir,
    encoding: 'utf-8' 
  }).trim();
  console.log(`[v0] Current branch: ${currentBranch}\n`);

  // Add all changes
  runCmd('git add .', 'Adding all changes...');

  // Check if there are changes to commit
  const status = execSync('git status --porcelain', { 
    cwd: projectDir,
    encoding: 'utf-8' 
  });
  
  if (status.trim()) {
    // Commit changes
    const commitMessage = 'fix: resolve build errors - fix imports, add recharts dependency, export database functions';
    runCmd(`git commit -m "${commitMessage}"`, 'Committing changes...');
    console.log('[v0] Changes committed successfully\n');
  } else {
    console.log('[v0] No changes to commit\n');
  }

  // Checkout main branch if not already on it
  if (currentBranch !== 'main') {
    runCmd('git checkout main', 'Checking out main branch...');
  }

  // Push to main
  runCmd('git push origin main', 'Pushing to main branch...');
  
  console.log('\n[v0] ✓ Successfully pushed to main branch on GitHub!');
  process.exit(0);
} catch (error) {
  console.error('[v0] Error during push:', error.message);
  process.exit(1);
}
