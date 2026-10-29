import re
import sys

if len(sys.argv) != 2:
    print("Usage: python bump.py <version>")
    sys.exit(1)

version = sys.argv[1]

# Regex to find all occurrences of ?v= and index.html
pattern = r'\?v=\d+|index\.html'

# Replace all ?v= with the new version and index.html with the new version
replaced = re.sub(r'\?v=\d+', '?v=' + str(version), open('index.html', encoding='utf-8').read(), flags=re.IGNORECASE)
replaced = re.sub(r'index\.html', f'index.html?v={version}', replaced)

# Write the updated content back to index.html
with open('index.html', 'w') as f:
    f.write(replaced)

print(f"Version bumped to {version}")