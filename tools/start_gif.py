"""Restore the animated GIF start screen as the canonical background (drop the video overlay)."""
from pathlib import Path

p = Path("src/startmenu.js")
t = p.read_text(encoding="utf-8")

video_markup = '''    <video class="artvid" muted loop playsinline autoplay preload="auto" tabindex="-1"
           poster="./assets/start-bg-poster.jpg" aria-hidden="true">
      <source src="./assets/start-bg.mp4" type="video/mp4" />
      <source src="./assets/start-bg.webm" type="video/webm" />
    </video>
'''
assert video_markup in t
t = t.replace(video_markup, "", 1)

start = t.index('    const vid = q(".artvid");')
end = t.index('    root.classList.add("open");', start)
t = t[:start] + t[end:]

t = t.replace('''    const vid = q(".artvid");
    if (vid) { try { vid.pause(); } catch (e) {} }
''', "")

t = t.replace('tag.textContent = "BUILD " + (m ? m[1].slice(-1).toUpperCase() : "?") + " · VIDEO";',
              'tag.textContent = "BUILD " + (m ? m[1].slice(-1).toUpperCase() : "?") + " · LIVE";')

p.write_text(t, encoding="utf-8")
print("gif start screen restored")
