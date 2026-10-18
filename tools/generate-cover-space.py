# Generates the cover background (src/assets/images/cover-space*.webp).
# Run from the project root:  pip install numpy scipy pillow && python3 tools/generate-cover-space.py
# The seed is fixed, so the output is the same every time; change it for a new sky.
import numpy as np
from scipy.ndimage import gaussian_filter, zoom
from PIL import Image

W, H = 2400, 1500
rng = np.random.default_rng(8022016)   # the story's date, so the image is reproducible

def fbm(w, h, octaves=6, base=6, persistence=0.55, seed=0):
    r = np.random.default_rng(seed)
    out = np.zeros((h, w)); amp = 1.0; total = 0
    for o in range(octaves):
        cells = base * 2 ** o
        gh, gw = max(2, int(h / w * cells)), cells
        g = r.random((gh + 3, gw + 3))
        up = zoom(g, (h / gh, w / gw), order=3)[:h, :w]
        out += amp * up; total += amp; amp *= persistence
    out /= total
    return (out - out.min()) / (out.max() - out.min())

y, x = np.mgrid[0:H, 0:W]
xn, yn = x / W, y / H

# --- background: deep indigo, a little lighter towards the lower right
bg = np.zeros((H, W, 3))
c0 = np.array([8, 9, 26]) / 255
c1 = np.array([22, 20, 58]) / 255
t = np.clip(0.55 * xn + 0.45 * yn, 0, 1)[..., None]
bg = c0 * (1 - t) + c1 * t

# --- nebula: a band sweeping from the upper right to the lower middle,
#     kept away from the left half where the title sits
d = (yn - (1.15 - 1.05 * xn))               # signed distance to the band's axis
band = np.exp(-(d / 0.23) ** 2)
band *= np.clip((xn - 0.28) / 0.35, 0, 1) ** 1.4  # fade out to the left
n1 = fbm(W, H, octaves=7, base=5, seed=1)
n2 = fbm(W, H, octaves=6, base=9, seed=2)
dust = fbm(W, H, octaves=7, base=14, persistence=0.6, seed=3)
density = band * (0.35 + 0.9 * n1 ** 1.6)
density *= 1 - 0.75 * np.clip((dust - 0.48) * 3.2, 0, 1)   # dark dust lanes
density = gaussian_filter(density, 1.2)
density = density / density.max()

violet = np.array([108, 82, 196]) / 255
blue = np.array([46, 78, 160]) / 255
teal = np.array([40, 120, 150]) / 255
brass = np.array([226, 174, 92]) / 255

mix = n2[..., None]
neb_col = violet * (1 - mix) + blue * mix
neb_col = neb_col * (1 - 0.35 * (n1[..., None] > 0.62)) + teal * 0.35 * (n1[..., None] > 0.62)
core = np.clip((density - 0.5) / 0.5, 0, 1) ** 1.6      # hot core glows brass
img = bg + neb_col * (density ** 1.25)[..., None] * 0.95 + brass * core[..., None] * 0.7
img += gaussian_filter(density, 40)[..., None] * violet * 0.25   # soft halo

# --- stars
stars = np.zeros((H, W, 3))
def add_stars(n, bright_min, bright_max, power, bias=0.0):
    ys = rng.integers(0, H, n); xs = rng.integers(0, W, n)
    if bias:   # more stars inside the nebula band
        keep = rng.random(n) < (1 - bias) + bias * band[ys, xs]
        ys, xs = ys[keep], xs[keep]
    b = bright_min + (bright_max - bright_min) * rng.random(len(ys)) ** power
    temp = rng.random(len(ys))
    col = np.stack([0.85 + 0.15 * temp, 0.88 + 0.08 * temp, 1.0 - 0.18 * temp], 1)  # blue-white to warm
    np.add.at(stars, (ys, xs), col * b[:, None])
add_stars(12000, 0.15, 0.9, 3.0)
add_stars(5000, 0.2, 1.0, 2.5, bias=0.8)
small = gaussian_filter(stars, (0.6, 0.6, 0)) * 2.2

big = np.zeros((H, W, 3))
for _ in range(28):
    yy, xx = rng.integers(0, H), rng.integers(int(W * 0.18), W)
    big[yy, xx] += np.array([1.0, 0.95, 0.88]) * (2 + 6 * rng.random())
glow = gaussian_filter(big, (1.1, 1.1, 0)) * 3 + gaussian_filter(big, (6, 6, 0)) * 6
# faint diffraction spikes on the brightest ones
spk = gaussian_filter(big, (0.6, 14, 0)) + gaussian_filter(big, (14, 0.6, 0))
img += small + glow + spk * 2.2

# --- vignette and tone mapping
vig = 1 - 0.35 * (((xn - 0.6) / 0.9) ** 2 + ((yn - 0.5) / 0.8) ** 2)
img *= vig[..., None]
img = 1 - np.exp(-img * 1.35)            # soft highlights, no clipping
img = np.clip(img, 0, 1) ** 0.95

out = Image.fromarray((img * 255).astype(np.uint8))
out.save('src/assets/images/cover-space.webp', quality=82, method=6)
out.resize((1200, 750), Image.LANCZOS).save('src/assets/images/cover-space-1200.webp', quality=80, method=6)
print('ok')
