import subprocess
import os

os.chdir('/vercel/share/v0-project')

commands = [
    'git add .',
    'git status --porcelain | head -20',
    'git commit -m "fix: resolve build errors - fix imports, add recharts, export database functions"',
    'git log --oneline -1',
    'git push origin main'
]

for cmd in commands:
    print(f'\n[v0] Running: {cmd}')
    result = subprocess.run(cmd, shell=True)
    if result.returncode != 0:
        print(f'[v0] Command failed with code {result.returncode}')
