#!/usr/bin/env python3
import subprocess
import os

project_dir = '/vercel/share/v0-project'

def run_cmd(cmd, desc):
    print(f"[v0] {desc}")
    try:
        result = subprocess.run(cmd, shell=True, check=True, cwd=project_dir, text=True)
        return result.stdout if result.stdout else ""
    except subprocess.CalledProcessError as e:
        print(f"[v0] Error: {e}")
        raise

try:
    print(f"[v0] Starting push to main branch...")
    print(f"[v0] Project directory: {project_dir}\n")
    
    # Verify we can access the directory
    if not os.path.isdir(project_dir):
        raise FileNotFoundError(f"Project directory not found: {project_dir}")
    
    if not os.path.isdir(os.path.join(project_dir, '.git')):
        raise FileNotFoundError(f"Git repository not found in: {project_dir}")
    
    # Check current branch
    current_branch = subprocess.run('git rev-parse --abbrev-ref HEAD', shell=True, capture_output=True, text=True, cwd=project_dir).stdout.strip()
    print(f"[v0] Current branch: {current_branch}\n")
    
    # Add all changes
    run_cmd('git add .', 'Adding all changes...')
    
    # Check if there are changes to commit
    status = subprocess.run('git status --porcelain', shell=True, capture_output=True, text=True, cwd=project_dir).stdout
    
    if status.strip():
        # Commit changes
        commit_msg = 'fix: resolve build errors - fix imports, add recharts dependency, export database functions'
        run_cmd(f'git commit -m "{commit_msg}"', 'Committing changes...')
        print('[v0] Changes committed successfully\n')
    else:
        print('[v0] No changes to commit\n')
    
    # Checkout main branch if not already on it
    if current_branch != 'main':
        run_cmd('git checkout main', 'Checking out main branch...')
    
    # Push to main
    run_cmd('git push origin main', 'Pushing to main branch...')
    
    print("\n[v0] ✓ Successfully pushed to main branch on GitHub!")
    
except Exception as e:
    print(f"[v0] Error: {e}")
    exit(1)
