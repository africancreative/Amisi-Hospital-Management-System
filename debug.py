#!/usr/bin/env python3
import os
import glob

print("[v0] Current working directory:", os.getcwd())
print("[v0] HOME env:", os.environ.get('HOME'))
print("[v0] PWD env:", os.environ.get('PWD'))

# Try to find git directories
git_dirs = glob.glob('/**/.git', recursive=True)
print(f"[v0] Found {len(git_dirs)} .git directories:")
for d in git_dirs[:10]:
    print(f"  - {d}")

# Check if /vercel/share/v0-project exists
test_paths = ['/vercel/share/v0-project', '/home/user/v0-project', '/root/v0-project']
for path in test_paths:
    exists = os.path.isdir(path)
    has_git = os.path.isdir(os.path.join(path, '.git')) if exists else False
    print(f"[v0] {path}: exists={exists}, has_git={has_git}")
