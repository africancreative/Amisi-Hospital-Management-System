#!/usr/bin/env python3
import subprocess
import os
import sys

# Try to find the project root by looking for .git and package.json
def find_project_root():
    paths_to_try = [
        '/vercel/share/v0-project',
        os.path.expanduser('~/v0-project'),
        os.getcwd(),
    ]
    
    # Also check current dir and parents
    current = os.getcwd()
    while current != '/':
        if os.path.isdir(os.path.join(current, '.git')) and os.path.isfile(os.path.join(current, 'package.json')):
            return current
        current = os.path.dirname(current)
    
    # Check specified paths
    for path in paths_to_try:
        if os.path.isdir(path) and os.path.isdir(os.path.join(path, '.git')):
            return path
    
    return None

project_dir = find_project_root()
if not project_dir:
    print("[v0] Error: Could not find project root with .git directory")
    sys.exit(1)

print(f"[v0] Found project at: {project_dir}")

def run_cmd(cmd, desc):
    print(f"[v0] {desc}")
    try:
        result = subprocess.run(cmd, shell=True, check=True, cwd=project_dir, capture_output=True, text=True)
        if result.stdout:
            print(result.stdout)
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"[v0] Error running: {cmd}")
        print(f"[v0] stderr: {e.stderr}")
        print(f"[v0] stdout: {e.stdout}")
        raise

try:
    print("[v0] Starting push to main branch...\n")
    
    # Check current branch
    result = subprocess.run('git rev-parse --abbrev-ref HEAD', shell=True, capture_output=True, text=True, cwd=project_dir)
    current_branch = result.stdout.strip()
    print(f"[v0] Current branch: {current_branch}\n")
    
    # Add all changes
    run_cmd('git add .', 'Adding all changes...')
    
    # Check if there are changes to commit
    result = subprocess.run('git status --porcelain', shell=True, capture_output=True, text=True, cwd=project_dir)
    status = result.stdout
    
    if status.strip():
        print(f"[v0] Changes to commit:")
        print(status)
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
    import traceback
    traceback.print_exc()
    sys.exit(1)
