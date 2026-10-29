"""One-shot repair: strip a stray backslash before import quotes after a bad bump regex."""
from pathlib import Path

bad = chr(92) + '"'
good = '"'
fixed = 0
for f in Path("src").glob("*.js"):
    lines = f.read_text(encoding="utf-8").splitlines(keepends=True)
    out = []
    for line in lines:
        if 'from "./' in line and bad in line:
            line = line.replace(bad, good)
            fixed += 1
        out.append(line)
    f.write_text("".join(out), encoding="utf-8")
print("fixed", fixed, "lines")
