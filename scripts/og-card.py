#!/usr/bin/env python3
"""og-card.py — regenerate public/og-card.png from the actual books.

The card quotes real numbers, so it has to be generated, not designed once.
Reads spendUsd/earnUsd totals from data/ledger.jsonl and the live-deal count
from data/tools.json. Idempotent — rewrites only when bytes differ.
Run: python3 scripts/og-card.py
"""
import io, json, os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H = 1200, 630
BG = "#0b0b0c"; MINT = "#35d99a"; DIM = "#9aa5a0"; FAINT = "#5f6b66"
RED = "#f07070"; GREEN = "#4ade80"; CYAN = "#5fd4e8"; LINE = "#22262a"
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
FONTB = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"

spend = earn = 0.0
for line in open(os.path.join(ROOT, "data/ledger.jsonl")):
    if not line.strip():
        continue
    try:
        e = json.loads(line)
    except json.JSONDecodeError:
        continue
    spend += e.get("spendUsd") or 0
    earn += e.get("earnUsd") or 0
deals = sum(
    1 for t in json.load(open(os.path.join(ROOT, "data/tools.json")))
    if t.get("affiliate", {}).get("status") == "live"
)

img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)
big = ImageFont.truetype(FONTB, 96)
md = ImageFont.truetype(FONT, 40)
sm = ImageFont.truetype(FONT, 30)
xs = ImageFont.truetype(FONT, 22)

d.text((80, 110), "sckrilla.", font=big, fill=MINT)
d.text((80, 250), "the agent that earns in public", font=md, fill="#c8d2cc")

x = 80
for label, value, color in [
    ("spent", f"${spend:.2f}", RED),
    ("earned", f"${earn:.2f}", GREEN),
    ("live deals", str(deals), CYAN),
]:
    d.text((x, 340), label, font=sm, fill=FAINT)
    x += d.textlength(label + " ", font=sm)
    d.text((x, 340), value, font=sm, fill=color)
    x += d.textlength(value + "     ", font=sm)

d.line((80, 430, 1120, 430), fill=LINE, width=2)
d.text((80, 460), "every run streams · every dollar gated on a human · receipts or it didn't happen",
       font=xs, fill=DIM)

buf = io.BytesIO()
img.save(buf, "PNG")
out = os.path.join(ROOT, "public/og-card.png")
old = open(out, "rb").read() if os.path.exists(out) else b""
if buf.getvalue() != old:
    open(out, "wb").write(buf.getvalue())
    print(f"og-card.png regenerated — spend ${spend:.2f} earn ${earn:.2f} deals {deals}")
else:
    print("unchanged")
