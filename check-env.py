#!/usr/bin/env python3
import os
import subprocess

print("[v0] Current working directory:", os.getcwd())
print("[v0] Environment PWD:", os.environ.get('PWD'))
print("[v0] Files in current directory:")
for item in os.listdir('.')[:20]:
    print(f"  - {item}")

# Try to run git command
try:
    result = subprocess.run('git status', shell=True, capture_output=True, text=True)
    print("\n[v0] Git status output:")
    print(result.stdout[:500])
    if result.stderr:
        print("[v0] Error:", result.stderr[:500])
except Exception as e:
    print(f"[v0] Error running git: {e}")
