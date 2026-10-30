"""Start screen: explicit animated GIF layer (from the supplied source video), not a CSS background."""
from pathlib import Path

p = Path("src/startmenu.js")
t = p.read_text(encoding="utf-8")

# CSS: static poster under, GIF layer on top
old_art = '''#fs-start.art{background-image:
    linear-gradient(90deg,rgba(5,7,10,.975) 0%,rgba(5,7,10,.94) 26%,rgba(5,7,10,.60) 44%,rgba(5,7,10,.18) 58%,rgba(5,7,10,0) 70%),
    url("${ART}");
  background-size:100% 100%,cover,cover;
  background-position:center,center;
  background-repeat:no-repeat,no-repeat}'''
new_art = '''#fs-start.art{background-image:
    linear-gradient(90deg,rgba(5,7,10,.975) 0%,rgba(5,7,10,.94) 26%,rgba(5,7,10,.60) 44%,rgba(5,7,10,.18) 58%,rgba(5,7,10,0) 70%),
    url("./assets/start-bg-poster.jpg");
  background-size:100% 100%,cover;
  background-position:center,center;
  background-repeat:no-repeat,no-repeat}
#fs-start .artgif{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;
  object-position:center right;opacity:0;transition:opacity .6s ease;pointer-events:none}
#fs-start.art .artgif{opacity:1}'''
assert old_art in t
t = t.replace(old_art, new_art, 1)

# markup: real <img> so every browser/webview plays the animation
old_markup = '''    <div class="artwrap"></div>
'''
new_markup = '''    <div class="artwrap"></div>
    <img class="artgif" src="./assets/start-bg.gif" alt="" aria-hidden="true" decoding="async" />
'''
assert old_markup in t
t = t.replace(old_markup, new_markup, 1)

# show(): wire the actual element; the class is added when the GIF is decoded
old_show = '''    // probe the art once; if it is missing the gradient stands in
    const img = new Image();
    img.onload = () => root.classList.add("art");
    img.onerror = () => root.classList.remove("art");
    img.src = ART;'''
new_show = '''    // the GIF element is the backdrop; if it fails the poster/gradient stands in
    const gif = q(".artgif");
    if (gif) {
      const mark = () => root.classList.add("art");
      if (gif.complete && gif.naturalWidth > 0) mark();
      else {
        gif.addEventListener("load", mark, { once: true });
        gif.addEventListener("error", () => root.classList.remove("art"), { once: true });
      }
    }'''
assert old_show in t
t = t.replace(old_show, new_show, 1)

p.write_text(t, encoding="utf-8")
print("gif element layer")
