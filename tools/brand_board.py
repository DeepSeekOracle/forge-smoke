"""Stadium-style branded board behind spawn + side sign."""
from pathlib import Path

p = Path("src/branding.js")
t = p.read_text(encoding="utf-8")

t = t.replace('''  const lygoTex = wordmarkTexture(["LYGO"], { sub: "EXCAVATIONPRO.CA", size: 92 });
  const urlTex = wordmarkTexture(["EXCAVATIONPRO"], { sub: ".CA  //  FORGE SMOKE", size: 74 });
  const emblemTex = emblemTexture();

  const signs = [
    { tex: lygoTex, x: -8.6, z: -8.8 },
    { tex: urlTex, x: 8.8, z: -8.2 },
  ];
  for (const s of signs) {
    const sign = makeSign(s.tex);
    sign.position.set(s.x, 2.2, s.z);
    sign.lookAt(0, 2.0, 0);
    group.add(sign);
  }''','''  const boardTex = wordmarkTexture(["LYGO"], { sub: "EXCAVATIONPRO.CA  //  FORGE SMOKE", size: 112 });
  const urlTex = wordmarkTexture(["EXCAVATIONPRO"], { sub: ".CA  //  SECTOR 09", size: 76 });
  const emblemTex = emblemTexture();

  // Big stadium board behind the spawn, squared to the chase camera so it reads in every run.
  const board = makeSign(boardTex, 7.4, 2.15);
  board.position.set(0, 3.4, -11.5);
  group.add(board);

  // Side board angled toward the arena centre.
  const side = makeSign(urlTex, 4.4, 1.5);
  side.position.set(-9.8, 2.35, -4.6);
  side.rotation.y = 0.55;
  group.add(side);''')
p.write_text(t, encoding="utf-8")
print("stadium board")
