from pathlib import Path
from PIL import Image

src = Path(__file__).resolve().parents[1] / "public" / "favicon-source.png"
out = src.parent
img = Image.open(src).convert("RGBA")

w, h = img.size
side = min(w, h)
left = (w - side) // 2
top = (h - side) // 2
img = img.crop((left, top, left + side, top + side))

for size, name in [
    (180, "apple-touch-icon.png"),
    (512, "favicon-512.png"),
    (32, "favicon-32.png"),
    (64, "favicon.png"),
]:
    resized = img.resize((size, size), Image.Resampling.LANCZOS)
    resized.save(out / name, optimize=True)
    print(f"wrote {name}")

ico_sizes = [(16, 16), (32, 32), (48, 48)]
ico_images = [img.resize(s, Image.Resampling.LANCZOS) for s in ico_sizes]
ico_images[0].save(
    out / "favicon.ico",
    format="ICO",
    sizes=ico_sizes,
    append_images=ico_images[1:],
)
print("wrote favicon.ico")
