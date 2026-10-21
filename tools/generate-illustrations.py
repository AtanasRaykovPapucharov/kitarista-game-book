# Generates the book's illustrations (src/assets/illustrations/*.webp).
# Run from the project root:  pip install numpy scipy pillow && python3 tools/generate-illustrations.py
# Style: silhouettes against a starry, nebulous sky, in the book's palette
# (night indigo, nebula violet, starlight cyan). Seeds are fixed, so the
# output is the same every time.
import math
import os
import numpy as np
from scipy.ndimage import gaussian_filter, zoom
from PIL import Image, ImageDraw, ImageFilter

W, H = 1200, 600
S = 3  # supersampling for smooth silhouettes
OUT = 'src/assets/illustrations'

INK = (6, 7, 22, 255)        # foreground silhouettes
INK2 = (14, 15, 40, 255)     # middle distance
INK3 = (26, 26, 64, 255)     # far distance
CYAN = (143, 220, 239)
WARM = (255, 224, 130)
VIOLET = (168, 152, 232)


# ---------------------------------------------------------------- sky
def fbm(w, h, octaves=6, base=5, persistence=0.55, seed=0):
    r = np.random.default_rng(seed)
    out = np.zeros((h, w)); amp = 1.0; total = 0
    for o in range(octaves):
        cells = base * 2 ** o
        gh, gw = max(2, int(h / w * cells)), cells
        g = r.random((gh + 3, gw + 3))
        out += amp * zoom(g, (h / gh, w / gw), order=3)[:h, :w]
        total += amp; amp *= persistence
    out /= total
    return (out - out.min()) / (out.max() - out.min())


def sky(seed, top=(8, 9, 26), bottom=(30, 26, 72), nebula=(108, 82, 196), neb_amount=0.6,
        band=(0.7, 0.3, -0.7), stars=2600, horizon_glow=None):
    rng = np.random.default_rng(seed)
    y, x = np.mgrid[0:H, 0:W]
    xn, yn = x / W, y / H
    t = yn[..., None]
    img = np.array(top) / 255 * (1 - t) + np.array(bottom) / 255 * t
    # nebula band
    cx, cy, slope = band
    d = (yn - (cy + slope * (xn - cx)))
    bandmask = np.exp(-(d / 0.22) ** 2)
    n1 = fbm(W, H, 7, 4, seed=seed + 1)
    dust = fbm(W, H, 7, 12, 0.6, seed=seed + 2)
    dens = bandmask * (0.3 + 0.9 * n1 ** 1.6) * (1 - 0.7 * np.clip((dust - 0.5) * 3, 0, 1))
    dens = gaussian_filter(dens, 1.0)
    dens /= dens.max() + 1e-6
    neb = np.array(nebula) / 255
    img += neb * (dens ** 1.3)[..., None] * neb_amount
    img += gaussian_filter(dens, 30)[..., None] * neb * 0.2
    if horizon_glow:
        col, strength, height = horizon_glow
        img += np.array(col) / 255 * (np.exp(-((1 - yn) / height) ** 2) * strength)[..., None]
    # stars
    layer = np.zeros((H, W, 3))
    ys = rng.integers(0, H, stars); xs = rng.integers(0, W, stars)
    b = 0.15 + 0.85 * rng.random(stars) ** 3
    tint = rng.random(stars)
    col = np.stack([0.85 + 0.15 * tint, 0.9 + 0.06 * tint, 1 - 0.15 * tint], 1)
    np.add.at(layer, (ys, xs), col * b[:, None])
    img += gaussian_filter(layer, (0.6, 0.6, 0)) * 2.2
    big = np.zeros((H, W, 3))
    for _ in range(14):
        big[rng.integers(0, H), rng.integers(0, W)] += np.array([1, 0.96, 0.9]) * (2 + 5 * rng.random())
    img += gaussian_filter(big, (1, 1, 0)) * 3 + gaussian_filter(big, (5, 5, 0)) * 5
    img = 1 - np.exp(-img * 1.35)
    return Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8)).convert('RGBA')


# ---------------------------------------------------------------- drawing layer
class Layer:
    """A transparent, supersampled drawing layer in base (1200×600) coordinates."""

    def __init__(self):
        self.im = Image.new('RGBA', (W * S, H * S), (0, 0, 0, 0))
        self.d = ImageDraw.Draw(self.im)

    def p(self, pts):
        return [(x * S, y * S) for x, y in pts]

    def poly(self, pts, fill=INK):
        self.d.polygon(self.p(pts), fill=fill)

    def ellipse(self, cx, cy, rx, ry, fill=INK):
        self.d.ellipse([(cx - rx) * S, (cy - ry) * S, (cx + rx) * S, (cy + ry) * S], fill=fill)

    def rect(self, x0, y0, x1, y1, fill=INK):
        self.d.rectangle([x0 * S, y0 * S, x1 * S, y1 * S], fill=fill)

    def line(self, pts, fill=INK, width=2):
        self.d.line(self.p(pts), fill=fill, width=int(width * S), joint='curve')

    def done(self):
        return self.im.resize((W, H), Image.LANCZOS)


def glow(base, cx, cy, r, color, strength=1.0):
    """Adds a soft additive glow."""
    g = Image.new('RGB', (W, H), (0, 0, 0))
    d = ImageDraw.Draw(g)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=tuple(int(c * strength) for c in color))
    g = g.filter(ImageFilter.GaussianBlur(r * 0.55))
    arr = np.asarray(base.convert('RGB')).astype(np.float32) + np.asarray(g).astype(np.float32)
    out = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).convert('RGBA')
    return out


def cone(base, apex, left, right, color, strength=0.35, blur=18):
    g = Image.new('RGB', (W, H), (0, 0, 0))
    ImageDraw.Draw(g).polygon([apex, left, right], fill=tuple(int(c * strength) for c in color))
    g = g.filter(ImageFilter.GaussianBlur(blur))
    arr = np.asarray(base.convert('RGB')).astype(np.float32) + np.asarray(g).astype(np.float32)
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).convert('RGBA')


def over(base, layer):
    return Image.alpha_composite(base, layer.done())


def ellipse_pts(cx, cy, rx, ry, angle=0, n=48, start=0, end=2 * math.pi):
    ca, sa = math.cos(angle), math.sin(angle)
    pts = []
    for i in range(n + 1):
        t = start + (end - start) * i / n
        x, y = rx * math.cos(t), ry * math.sin(t)
        pts.append((cx + x * ca - y * sa, cy + x * sa + y * ca))
    return pts


def rot(pts, cx, cy, angle):
    ca, sa = math.cos(angle), math.sin(angle)
    return [(cx + (x - cx) * ca - (y - cy) * sa, cy + (x - cx) * sa + (y - cy) * ca) for x, y in pts]


def hills(L, base_y, amp, seed, fill, roughness=6):
    rng = np.random.default_rng(seed)
    xs = np.linspace(-20, W + 20, 60)
    n = gaussian_filter(rng.random(60), roughness / 2)
    n = (n - n.min()) / (n.max() - n.min() + 1e-6)
    pts = [(x, base_y - amp * v) for x, v in zip(xs, n)]
    L.poly(pts + [(W + 20, H + 5), (-20, H + 5)], fill)


def guitar(L, cx, cy, size, angle=0, fill=INK):
    """Acoustic guitar silhouette; returns the soundhole centre."""
    s = size
    lower = ellipse_pts(cx, cy + 0.32 * s, 0.42 * s, 0.38 * s)
    upper = ellipse_pts(cx, cy - 0.22 * s, 0.32 * s, 0.30 * s)
    waist = [(cx - 0.3 * s, cy - 0.05 * s), (cx + 0.3 * s, cy - 0.05 * s), (cx + 0.3 * s, cy + 0.12 * s), (cx - 0.3 * s, cy + 0.12 * s)]
    neck = [(cx - 0.055 * s, cy - 0.4 * s), (cx + 0.055 * s, cy - 0.4 * s), (cx + 0.05 * s, cy - 1.15 * s), (cx - 0.05 * s, cy - 1.15 * s)]
    head = [(cx - 0.08 * s, cy - 1.15 * s), (cx + 0.08 * s, cy - 1.15 * s), (cx + 0.07 * s, cy - 1.42 * s), (cx - 0.07 * s, cy - 1.42 * s)]
    for part in (lower, upper, waist, neck, head):
        L.poly(rot(part, cx, cy, angle), fill)
    hx, hy = rot([(cx, cy - 0.02 * s)], cx, cy, angle)[0]
    return hx, hy


def person(L, x, ground, h, fill=INK, arms='down', facing=1, walk=False):
    """A simple standing figure, h = total height."""
    head_r = h * 0.075
    hy = ground - h + head_r
    L.ellipse(x, hy, head_r, head_r * 1.05, fill)
    sh = hy + head_r * 1.5  # shoulders
    hip = ground - h * 0.47
    L.poly([(x - h * 0.11, sh), (x + h * 0.11, sh), (x + h * 0.085, hip), (x - h * 0.085, hip)], fill)
    L.ellipse(x, sh + 2, h * 0.11, h * 0.035, fill)
    stride = h * (0.09 if walk else 0.035)
    L.poly([(x - h * 0.08, hip), (x - h * 0.01, hip), (x - stride, ground), (x - stride - h * 0.05, ground)], fill)
    L.poly([(x + h * 0.01, hip), (x + h * 0.08, hip), (x + stride + h * 0.05, ground), (x + stride, ground)], fill)
    if arms == 'down':
        L.poly([(x - h * 0.11, sh), (x - h * 0.15, sh + h * 0.05), (x - h * 0.13, hip + h * 0.05), (x - h * 0.1, hip + h * 0.05)], fill)
        L.poly([(x + h * 0.11, sh), (x + h * 0.15, sh + h * 0.05), (x + h * 0.13, hip + h * 0.05), (x + h * 0.1, hip + h * 0.05)], fill)
    elif arms == 'up':
        L.poly([(x - h * 0.1, sh), (x - h * 0.06, sh), (x - h * 0.2, sh - h * 0.28), (x - h * 0.24, sh - h * 0.26)], fill)
        L.poly([(x + h * 0.1, sh), (x + h * 0.06, sh), (x + h * 0.2, sh - h * 0.28), (x + h * 0.24, sh - h * 0.26)], fill)
    return hy, sh, hip


def tree(L, x, ground, h, fill=INK, seed=0):
    rng = np.random.default_rng(seed)
    L.poly([(x - h * 0.05, ground), (x + h * 0.05, ground), (x + h * 0.025, ground - h * 0.45), (x - h * 0.025, ground - h * 0.45)], fill)
    for _ in range(26):
        a = rng.random() * math.pi * 2; r = rng.random() ** 0.6 * h * 0.32
        L.ellipse(x + math.cos(a) * r * 1.2, ground - h * 0.66 + math.sin(a) * r * 0.85, h * 0.12, h * 0.11, fill)


def save(img, name):
    os.makedirs(OUT, exist_ok=True)
    img.convert('RGB').save(f'{OUT}/{name}.webp', quality=80, method=6)
    print(name, os.path.getsize(f'{OUT}/{name}.webp') // 1024, 'KB')


# ================================================================ scenes

def void():
    img = sky(11, top=(4, 4, 16), bottom=(16, 12, 44), neb_amount=0.9, band=(0.55, 0.45, -0.35), stars=3400)
    # the presence: a vast faceless swirl of darker dark, with a faint violet rim
    y, x = np.mgrid[0:H, 0:W]
    cx, cy = 760, 290
    r = np.hypot((x - cx) / 1.25, y - cy)
    ang = np.arctan2(y - cy, x - cx)
    swirl = np.exp(-(r / 210) ** 2) * (0.75 + 0.25 * np.sin(ang * 5 + r / 22))
    arr = np.asarray(img).astype(np.float32)
    arr[..., :3] *= (1 - 0.82 * swirl[..., None])
    rim = np.exp(-((r - 215) / 18) ** 2) * (0.5 + 0.5 * np.sin(ang * 7))
    arr[..., :3] += rim[..., None] * np.array(VIOLET) * 0.35
    img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    # the small blue planet, far away
    img = glow(img, 180, 470, 26, (60, 120, 200), 0.9)
    L = Layer(); L.ellipse(180, 470, 9, 9, (70, 140, 220, 255)); img = over(img, L)
    return img


def window():
    img = sky(21, bottom=(24, 22, 64), band=(0.5, 0.35, -0.5), stars=3000)
    for (x, y, r) in [(420, 170, 30), (690, 120, 22), (840, 260, 26), (560, 300, 18)]:
        img = glow(img, x, y, r, (255, 250, 230), 0.85)
    L = Layer()
    # wall around a window
    L.poly([(0, 0), (W, 0), (W, H), (0, H), (0, 0), (300, 70), (300, 470), (900, 470), (900, 70), (300, 70)], INK)
    L.rect(0, 0, 300, H); L.rect(900, 0, W, H); L.rect(0, 0, W, 70); L.rect(0, 470, W, H)
    L.rect(594, 70, 606, 470); L.rect(300, 262, 900, 274)
    # curtains
    L.poly([(300, 70), (370, 70), (340, 300), (360, 470), (300, 470)], INK2)
    L.poly([(900, 70), (830, 70), (860, 300), (842, 470), (900, 470)], INK2)
    # bed edge and a sleeping child under a blanket
    L.poly([(120, 560), (1080, 560), (1100, 600), (100, 600)], INK2)
    L.ellipse(430, 548, 70, 30, INK2); L.ellipse(560, 552, 180, 26, INK2)
    img = over(img, L)
    return img


def guitar_light():
    img = sky(31, top=(6, 6, 20), bottom=(20, 18, 50), neb_amount=0.35, stars=1800)
    hx, hy = 610, 330
    # rays from the soundhole
    rng = np.random.default_rng(3)
    for i in range(14):
        a = -math.pi / 2 + (i - 6.5) * 0.18 + rng.normal(0, 0.03)
        l = 700
        img = cone(img, (hx, hy), (hx + math.cos(a - 0.035) * l, hy + math.sin(a - 0.035) * l),
                   (hx + math.cos(a + 0.035) * l, hy + math.sin(a + 0.035) * l), CYAN, 0.22, 10)
    L = Layer()
    sx, sy = guitar(L, 600, 360, 230, angle=-0.35)
    L.poly([(0, 520), (W, 500), (W, H), (0, H)], INK2)  # the bed / floor
    img = over(img, L)
    img = glow(img, sx, sy, 34, CYAN, 1.0)
    img = glow(img, sx, sy, 12, (255, 255, 255), 1.0)
    return img


def corridor():
    img = Image.new('RGBA', (W, H), (16, 16, 40, 255))
    vx, vy = 640, 270  # vanishing point
    img = glow(img, vx, vy, 160, (60, 60, 120), 1.0)
    img = glow(img, vx, vy, 40, CYAN, 0.6)
    L = Layer()
    # floor, ceiling and walls in perspective
    L.poly([(0, H), (W, H), (vx + 60, vy + 40), (vx - 60, vy + 40)], INK2)
    L.poly([(0, 0), (W, 0), (vx + 60, vy - 50), (vx - 60, vy - 50)], INK2)
    L.poly([(0, 0), (vx - 60, vy - 50), (vx - 60, vy + 40), (0, H)], INK3)
    L.poly([(W, 0), (vx + 60, vy - 50), (vx + 60, vy + 40), (W, H)], INK3)
    # lockers on the left
    for i in range(9):
        t0, t1 = i / 9, (i + 1) / 9
        x0 = (vx - 60) * t0 ** 0.6; x1 = (vx - 60) * t1 ** 0.6
        y0t = 0 + (vy - 50) * t0 ** 0.6; y0b = H - (H - vy - 40) * t0 ** 0.6
        y1t = 0 + (vy - 50) * t1 ** 0.6; y1b = H - (H - vy - 40) * t1 ** 0.6
        L.poly([(x0, y0t + 40 * (1 - t0)), (x1, y1t + 40 * (1 - t1)), (x1, y1b - 30 * (1 - t1)), (x0, y0b - 30 * (1 - t0))], INK2 if i % 2 else INK)
    # ceiling lamps
    for t in (0.25, 0.5, 0.72):
        y = (vy - 50) * t ** 0.7 + 18
        img_l = (vx, y)
    # two figures: big and small
    person(L, 560, 520, 300, INK)
    person(L, 760, 520, 210, INK, arms='down')
    img = over(img, L)
    for t in (0.2, 0.45, 0.68):
        y = (vy - 50) * t + 20
        img = glow(img, vx, y, 30 * (1 - t) + 8, (220, 230, 255), 0.6)
    return img


def observatory():
    img = sky(51, top=(5, 6, 22), bottom=(26, 22, 66), neb_amount=0.95, band=(0.6, 0.15, 0.55), stars=3600)
    L = Layer()
    hills(L, 520, 140, 5, INK3, 8)
    hills(L, 560, 70, 6, INK2, 5)
    # observatory: tower and dome on the ridge, a radio dish beside it
    L.rect(760, 360, 860, 470, INK)
    L.d.pieslice([760 * S, 300 * S, 860 * S, 420 * S], 180, 360, fill=INK)
    L.poly([(803, 300), (817, 300), (822, 360), (798, 360)], (20, 22, 52, 255))  # dome slit
    L.poly([(560, 470), (575, 400), (590, 470)], INK)
    L.d.chord([500 * S, 330 * S, 650 * S, 430 * S], 160, 380, fill=INK)
    L.line([(575, 380), (612, 345)], INK, 4)
    L.poly([(0, 470), (W, 460), (W, H), (0, H)], INK)
    img = over(img, L)
    img = cone(img, (810, 310), (700, -40), (760, -40), CYAN, 0.25, 14)
    img = glow(img, 600, 340, 10, CYAN, 0.8)
    return img


def linden():
    img = sky(61, top=(14, 12, 40), bottom=(70, 50, 110), neb_amount=0.25, stars=900,
              horizon_glow=((120, 80, 150), 0.6, 0.35))
    L = Layer()
    hills(L, 520, 60, 7, INK2, 6)
    tree(L, 760, 520, 360, INK, seed=4)
    L.poly([(0, 520), (W, 512), (W, H), (0, H)], INK)
    # a small figure kneeling by the tree
    L.ellipse(600, 470, 15, 16, INK)
    L.poly([(585, 485), (615, 485), (625, 520), (575, 520)], INK)
    img = over(img, L)
    # the bird's soul: a spark rising, with a faint trail
    for i, (x, y) in enumerate([(612, 500), (630, 440), (660, 370), (700, 300), (735, 230), (760, 160)]):
        img = glow(img, x, y, 8 + i * 2, WARM if i == 5 else (200, 200, 255), 0.35 + i * 0.1)
    img = glow(img, 760, 160, 6, (255, 255, 255), 1.0)
    return img


def silhouette():
    img = sky(71, top=(3, 3, 12), bottom=(14, 10, 36), neb_amount=0.5, band=(0.5, 0.5, 0), stars=2200)
    L = Layer()
    # a colossal faceless shape, all wrong angles
    rng = np.random.default_rng(9)
    pts = []
    for i in range(36):
        a = math.pi + i / 35 * math.pi
        r = 380 + rng.normal(0, 40) + (90 if i % 5 == 0 else 0)
        pts.append((600 + math.cos(a) * r * 1.25, 640 + math.sin(a) * r * 1.2))
    L.poly(pts, (2, 2, 9, 255))
    # spars and angles that don't fit together
    for i in range(7):
        a = math.pi * (1.1 + i * 0.13)
        x0, y0 = 600 + math.cos(a) * 300, 640 + math.sin(a) * 340
        x1, y1 = 600 + math.cos(a + 0.05) * 560, 640 + math.sin(a - 0.08) * 560
        L.line([(x0, y0), (x1, y1), (x1 + rng.normal(0, 30), y1 - 60)], (2, 2, 9, 255), 7)
    # the dreamer, tiny, and the thin thread of a mother's voice
    person(L, 600, 585, 70, (40, 40, 80, 255))
    img = over(img, L)
    L2 = Layer()
    L2.line([(600, 520), (640, 420), (590, 300), (660, 160), (620, 0)], (255, 224, 130, 200), 1.6)
    img = over(img, L2)
    img = glow(img, 600, 520, 18, WARM, 0.5)
    return img


def orpheus():
    img = Image.new('RGBA', (W, H), (4, 4, 14, 255))
    # light at the end of a tunnel, right behind him
    img = glow(img, 820, 300, 260, (60, 70, 130), 1.0)
    img = glow(img, 820, 300, 120, (190, 210, 255), 0.95)
    img = glow(img, 820, 300, 40, (255, 255, 255), 1.0)
    L = Layer()
    rng = np.random.default_rng(12)
    top = [(x, 70 + 45 * math.sin(x / 90) + rng.normal(0, 10)) for x in range(-10, W + 20, 30)]
    bottom = [(x, 480 + 25 * math.sin(x / 70) + rng.normal(0, 8)) for x in range(-10, W + 20, 30)]
    L.poly([(-10, -10), (W + 20, -10)] + top[::-1], INK)
    L.poly(bottom + [(W + 20, H + 10), (-10, H + 10)], INK)
    # Orpheus walking towards the light with a lyre, not looking back
    hy, sh, hip = person(L, 760, 488, 210, INK, walk=True)
    L.poly([(785, sh + 6), (830, sh - 26), (836, sh + 40), (790, sh + 52)], INK)  # lyre
    # the shadow behind him, waiting, with two faint points where eyes are not
    L.ellipse(180, 330, 150, 210, (1, 1, 6, 255))
    img = over(img, L)
    L2 = Layer()
    for k in range(4):
        L2.line([(803 + k * 7, sh - 12 + k * 5), (806 + k * 7, sh + 40)], (220, 230, 255, 170), 1)
    img = over(img, L2)
    img = glow(img, 150, 300, 6, VIOLET, 0.5)
    img = glow(img, 205, 300, 6, VIOLET, 0.5)
    return img


def shop():
    img = sky(91, top=(8, 8, 26), bottom=(30, 24, 70), neb_amount=0.5, band=(0.5, 0.2, 0.2), stars=1800)
    L = Layer()
    # leaning old houses
    houses = [(-20, 230, 260, -0.04), (220, 200, 180, 0.03), (390, 160, 260, 0.0), (650, 210, 220, -0.03), (860, 180, 360, 0.05)]
    for x, top, w, lean in houses:
        pts = [(x, 520), (x + w, 520), (x + w + lean * 300, top), (x + lean * 300, top)]
        L.poly(pts, INK2)
        L.poly([(x + lean * 300 - 10, top), (x + w / 2 + lean * 300, top - 70), (x + w + lean * 300 + 10, top)], INK2)
    L.poly([(0, 520), (W, 520), (W, H), (0, H)], INK)
    img = over(img, L)
    # windows: a few warm, the shop window cyan
    rng = np.random.default_rng(5)
    for _ in range(12):
        x, y = rng.integers(20, 1180), rng.integers(250, 430)
        img = glow(img, x, y, 10, (200, 180, 255), 0.45)
    img = glow(img, 520, 440, 110, CYAN, 0.55)
    L3 = Layer()
    L3.rect(430, 390, 610, 500, (120, 200, 230, 255))
    L3.rect(518, 390, 522, 500, INK2)
    guitar(L3, 470, 460, 40, 0.1, INK2); L3.ellipse(565, 470, 22, 16, INK2)  # instruments in the window
    L3.rect(450, 330, 590, 362, INK)  # the sign
    img = over(img, L3)
    img = glow(img, 520, 346, 22, CYAN, 0.9)
    L4 = Layer()
    L4.poly([(520, 336), (524, 344), (533, 345), (526, 351), (528, 360), (520, 355), (512, 360), (514, 351), (507, 345), (516, 344)], (230, 250, 255, 255))
    img = over(img, L4)
    return img


def stage():
    img = Image.new('RGBA', (W, H), (8, 8, 22, 255))
    img = glow(img, 600, 120, 300, (40, 36, 90), 1.0)
    img = cone(img, (600, -20), (420, 470), (780, 470), (220, 230, 255), 0.55, 22)
    L = Layer()
    L.poly([(150, 470), (1050, 470), (1120, 520), (80, 520)], INK2)   # stage edge
    # chair and a seated player with a guitar
    L.rect(560, 380, 640, 392, INK); L.rect(565, 392, 573, 470, INK); L.rect(627, 392, 635, 470, INK)
    L.ellipse(600, 300, 16, 17, INK)
    L.poly([(582, 318), (618, 318), (622, 385), (578, 385)], INK)
    L.poly([(585, 385), (650, 392), (655, 470), (640, 470), (632, 405), (585, 400)], INK)
    guitar(L, 615, 370, 70, angle=-1.15, fill=INK)
    # audience heads
    rng = np.random.default_rng(8)
    for row, y in enumerate((560, 590)):
        for i in range(16):
            x = 40 + i * 75 + rng.normal(0, 8) + row * 30
            L.ellipse(x, y, 24, 26, INK)
    L.rect(0, 575, W, H, INK)
    img = over(img, L)
    for x in (180, 330, 870, 1020):
        img = glow(img, x, 40, 18, WARM, 0.35)
    return img


def dark():
    img = sky(111, top=(2, 2, 10), bottom=(12, 8, 30), neb_amount=0.7, band=(0.5, 0.4, 0.1), stars=2600)
    y, x = np.mgrid[0:H, 0:W]
    r = np.hypot((x - 640) / 1.1, (y - 230) / 1.0)
    arr = np.asarray(img).astype(np.float32)
    shape = np.exp(-(r / 260) ** 3)
    arr[..., :3] *= (1 - 0.95 * shape[..., None])
    ang = np.arctan2(y - 230, x - 640)
    rim = np.exp(-((r - 265) / 14) ** 2) * (0.6 + 0.4 * np.sin(ang * 9))
    arr[..., :3] += rim[..., None] * np.array(VIOLET) * 0.45
    img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    L = Layer()
    L.poly([(0, 540), (W, 530), (W, H), (0, H)], INK)
    img = glow(img, 470, 450, 90, (90, 90, 170), 0.8)  # a little light around the dreamer
    person(L, 470, 545, 170, INK)
    img = over(img, L)
    img = glow(img, 500, 455, 24, (230, 235, 255), 1.0)  # the feather's light
    img = cone(img, (500, 455), (575, 180), (665, 215), (200, 220, 255), 0.28, 16)
    return img


def light_end():
    img = sky(121, top=(8, 12, 40), bottom=(40, 50, 110), nebula=(80, 160, 210), neb_amount=0.75,
              band=(0.5, 0.25, -0.15), stars=3200, horizon_glow=((90, 160, 220), 0.5, 0.25))
    # five faint staff lines across the sky
    L0 = Layer()
    for k in range(5):
        pts = [(x, 150 + k * 18 + 40 * math.sin(x / 260)) for x in range(-20, W + 40, 40)]
        L0.line(pts, (190, 225, 255, 70), 1.2)
    img = over(img, L0)
    L = Layer()
    hills(L, 520, 80, 13, INK2, 6)
    L.poly([(0, 540), (300, 500), (520, 470), (760, 490), (W, 530), (W, H), (0, H)], INK)
    hy, sh, hip = person(L, 520, 472, 120, INK)
    guitar(L, 535, 420, 46, angle=-0.9, fill=INK)
    img = over(img, L)
    for (x, y) in [(300, 170), (480, 136), (660, 190), (820, 152)]:
        img = glow(img, x, y, 10, (220, 240, 255), 0.9)
    return img


def puppet():
    img = sky(131, top=(6, 6, 16), bottom=(30, 20, 46), neb_amount=0.4, stars=1600)
    img = cone(img, (600, -20), (460, 500), (740, 500), (200, 190, 240), 0.35, 20)
    L = Layer()
    L.poly([(200, 500), (1000, 500), (1060, 540), (140, 540)], INK2)
    L.rect(0, 540, W, H, INK)
    hy, sh, hip = person(L, 600, 500, 220, INK, arms='up')
    img = over(img, L)
    L2 = Layer()
    for (x, y) in [(600, hy - 18), (556, sh - 60), (644, sh - 60), (575, hip), (625, hip)]:
        L2.line([(x, y), (x + (x - 600) * 0.15, -10)], (200, 200, 255, 140), 1.2)
    img = over(img, L2)
    # wash the colour out a little: the puppet's world is greyer
    arr = np.asarray(img.convert('RGB')).astype(np.float32)
    g = arr.mean(axis=2, keepdims=True)
    arr = arr * 0.55 + g * 0.45
    return Image.fromarray(arr.astype(np.uint8)).convert('RGBA')


def silence():
    img = Image.new('RGBA', (W, H), (6, 6, 16, 255))
    img = glow(img, 960, 140, 160, (44, 46, 96), 1.0)
    # moonbeam from the window down to the floor under the bed
    img = cone(img, (960, 140), (320, 470), (640, 470), (170, 190, 255), 0.45, 26)
    L = Layer()
    L.rect(0, 0, W, 300, (10, 10, 26, 0))
    L.rect(860, 50, 1060, 230, (40, 44, 92, 255))
    L.rect(956, 50, 964, 230, (8, 8, 22, 255)); L.rect(860, 136, 1060, 144, (8, 8, 22, 255))
    L.rect(80, 290, 1000, 350, INK2)                           # the bed
    L.rect(90, 350, 112, 470, INK2); L.rect(968, 350, 990, 470, INK2)
    L.poly([(0, 470), (W, 470), (W, H), (0, H)], INK)
    # the guitar case under the bed, caught by the moonlight
    L.poly(ellipse_pts(500, 428, 125, 36), (46, 48, 96, 255))
    L.poly([(270, 414), (390, 400), (390, 452), (270, 442)], (46, 48, 96, 255))
    L.line(ellipse_pts(500, 428, 125, 36), (120, 140, 210, 255), 1.4)
    L.rect(160, 440, 250, 454, (34, 34, 70, 255))  # the old lesson book
    img = over(img, L)
    L2 = Layer()
    for k in range(6):
        L2.line([(285, 420 + k * 3), (600, 420 + k * 3)], (143, 220, 239, 70), 0.8)
    img = over(img, L2)
    img = glow(img, 500, 428, 40, CYAN, 0.22)
    return img


def well():
    img = sky(141, top=(4, 5, 18), bottom=(22, 20, 54), neb_amount=0.85, band=(0.62, 0.2, 0.55), stars=3000)
    L = Layer()
    # pine forest on the slopes
    rng = np.random.default_rng(21)
    for i in range(46):
        x = rng.uniform(-20, W + 20)
        base = 470 - 60 * math.exp(-((x - 1050) / 260) ** 2) - 40 * math.exp(-((x - 120) / 200) ** 2)
        h = rng.uniform(80, 170)
        if 420 < x < 780:
            continue  # the meadow stays open
        L.poly([(x, base - h), (x - h * 0.22, base), (x + h * 0.22, base)], INK2 if h < 120 else INK)
    L.poly([(0, 470), (W, 460), (W, H), (0, H)], INK)
    img = over(img, L)
    # grey dust around the well
    L2 = Layer()
    L2.ellipse(600, 500, 230, 42, (52, 52, 66, 255))
    L2.ellipse(600, 500, 170, 30, (64, 64, 78, 255))
    img = over(img, L2)
    # the pillar of a colour with no name: shifting, sickly hues
    y, x = np.mgrid[0:H, 0:W]
    col = np.zeros((H, W, 3))
    width = 34 + (480 - y) * 0.09
    mask = np.exp(-((x - 600) / np.maximum(width, 1)) ** 2) * (y < 486) * np.clip((486 - y) / 60, 0, 1)
    mask *= 0.55 + 0.45 * np.sin(y / 23 + np.sin(x / 17))
    hue = (y / 140.0) % 1.0
    # pale and sickly: a faint shimmer of hues over a washed-out grey-green
    col[..., 0] = 0.62 + 0.16 * np.sin(hue * 6.28)
    col[..., 1] = 0.70 + 0.14 * np.sin(hue * 6.28 + 2.3)
    col[..., 2] = 0.66 + 0.16 * np.sin(hue * 6.28 + 4.4)
    glowmask = gaussian_filter(mask, 8)
    arr = np.asarray(img.convert('RGB')).astype(np.float32) / 255
    arr = 1 - (1 - arr) * (1 - col * (mask * 0.55 + glowmask * 0.45)[..., None])
    img = Image.fromarray((np.clip(arr, 0, 1) * 255).astype(np.uint8)).convert('RGBA')
    # the stone well with its carved arch, in front of the light
    L3 = Layer()
    L3.ellipse(600, 492, 66, 16, (30, 30, 46, 255))
    L3.rect(534, 462, 666, 492, (24, 24, 40, 255))
    L3.ellipse(600, 462, 66, 15, (40, 40, 60, 255))
    L3.ellipse(600, 462, 50, 10, (8, 8, 16, 255))
    L3.rect(540, 360, 556, 466, (24, 24, 40, 255)); L3.rect(644, 360, 660, 466, (24, 24, 40, 255))
    L3.d.arc([540 * S, 320 * S, 660 * S, 400 * S], 180, 360, fill=(24, 24, 40, 255), width=16 * S)
    for k in range(9):  # the notches – notes in stone
        L3.rect(552 + k * 11, 366 + (k % 3) * 3, 556 + k * 11, 372 + (k % 2) * 5, (90, 90, 120, 255))
    # a small figure with a guitar at the edge of the dust
    person(L3, 712, 512, 112, INK)
    guitar(L3, 724, 480, 34, angle=-0.8, fill=INK)
    img = over(img, L3)
    img = glow(img, 600, 456, 40, (200, 230, 210), 0.45)
    return img


def sea():
    img = sky(151, top=(10, 14, 26), bottom=(40, 52, 66), nebula=(90, 120, 140), neb_amount=0.25, stars=600)
    y, x = np.mgrid[0:H, 0:W]
    arr = np.asarray(img.convert('RGB')).astype(np.float32) / 255
    # the sea, and a vast smooth hill of water breathing in the bay
    sea_top = 330 - 70 * np.exp(-((x - 760) / 240) ** 2)
    water = y > sea_top
    deep = np.array([0.05, 0.10, 0.12])
    shade = 0.6 + 0.4 * np.clip((y - sea_top) / 260, 0, 1)
    arr[water] = deep * (1 / shade[water])[..., None] * 0.9
    glowsea = np.exp(-((x - 760) / 200) ** 2) * np.exp(-((y - 360) / 60) ** 2) * water
    arr += glowsea[..., None] * np.array([0.10, 0.35, 0.30])
    # fog in thick, soft bands
    fog = fbm(W, H, 5, 3, seed=7)
    fogmask = np.clip((fog - 0.35) * 1.6, 0, 1) * np.exp(-((y - 300) / 170) ** 2)
    arr = arr * (1 - fogmask[..., None] * 0.55) + fogmask[..., None] * np.array([0.55, 0.62, 0.66]) * 0.55
    img = Image.fromarray((np.clip(arr, 0, 1) * 255).astype(np.uint8)).convert('RGBA')
    # the lighthouse beam
    img = cone(img, (150, 170), (1150, 60), (1150, 190), (230, 235, 210), 0.30, 16)
    L = Layer()
    # cliff and lighthouse on the left
    L.poly([(0, 330), (90, 300), (220, 320), (260, 600), (0, 600)], INK2)
    L.poly([(130, 300), (170, 300), (162, 160), (138, 160)], (200, 205, 200, 255))
    L.rect(132, 148, 168, 162, INK2)
    # the long stone pier running into the fog
    L.poly([(260, 600), (420, 600), (700, 392), (676, 392)], INK)
    for k in range(9):
        t = k / 8
        xk, yk = 340 + (688 - 340) * t, 600 - (600 - 392) * t
        L.rect(xk - 4 + (1 - t) * -20, yk - 6, xk + 4, yk, INK)
    # Viktoria at the end of the pier, and Tommy halfway, guitar on the back
    person(L, 690, 392, 46, INK)
    person(L, 560, 492, 82, INK)
    guitar(L, 572, 470, 24, angle=0.5, fill=INK)
    img = over(img, L)
    img = glow(img, 150, 170, 22, (255, 245, 210), 1.0)
    return img


def mine():
    img = sky(161, top=(4, 4, 14), bottom=(18, 16, 40), neb_amount=0.55, band=(0.3, 0.2, 0.4), stars=1800)
    L = Layer()
    # the mountainside
    L.poly([(0, 120), (300, 60), (620, 140), (900, 90), (1200, 170), (1200, 600), (0, 600)], INK2)
    L.poly([(0, 330), (1200, 280), (1200, 600), (0, 600)], INK)
    img = over(img, L)
    # the dark mouth of the mine, and a lantern deep inside
    L2 = Layer()
    L2.rect(470, 240, 730, 470, (2, 2, 6, 255))
    L2.rect(458, 228, 742, 246, (40, 30, 26, 255))      # lintel beam
    L2.rect(458, 240, 476, 470, (40, 30, 26, 255)); L2.rect(724, 240, 742, 470, (40, 30, 26, 255))
    img = over(img, L2)
    img = glow(img, 615, 380, 70, (255, 190, 110), 0.7)
    img = glow(img, 615, 380, 14, (255, 230, 170), 1.0)
    L3 = Layer()
    # rusty rails coming out of the dark
    for off in (-34, 34):
        L3.line([(600 + off * 0.5, 470), (600 + off * 5, 600)], (90, 60, 44, 255), 4)
    for k in range(6):
        y = 480 + k * 22; w = 26 + k * 30
        L3.rect(600 - w, y, 600 + w, y + 5, (54, 40, 32, 255))
    img = over(img, L3)
    # a figure standing in the mouth, black against the lantern light behind
    L4 = Layer()
    person(L4, 590, 468, 118, (1, 1, 4, 255))
    img = over(img, L4)
    return img


def zann():
    img = sky(171, top=(6, 6, 20), bottom=(24, 22, 56), neb_amount=0.45, band=(0.2, 0.3, -0.3), stars=1600)
    y, x = np.mgrid[0:H, 0:W]
    arr = np.asarray(img.convert('RGB')).astype(np.float32)
    # beyond the wall (top right): not a town, not stars – only darkness
    void = np.clip((x - 700) / 160, 0, 1) * np.clip((330 - y) / 80, 0, 1)
    arr *= (1 - 0.97 * void[..., None])
    img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).convert('RGBA')
    rng = np.random.default_rng(17)
    for _ in range(9):  # points of light in colours stars don't have
        px, py = rng.uniform(820, 1180), rng.uniform(20, 250)
        img = glow(img, px, py, rng.uniform(4, 8), tuple(int(c) for c in rng.choice([(190, 255, 120), (255, 90, 210), (90, 255, 230)])), 0.9)
    L = Layer()
    # the old town under the wall, and the wall itself across the top right
    L.poly([(600, 370), (1200, 340), (1200, 600), (600, 600)], INK2)
    L.poly([(640, 330), (1200, 300), (1200, 360), (640, 380)], INK)
    for k in range(10):
        bx = 650 + k * 56
        L.rect(bx, 300 - (k * 3), bx + 28, 334 - (k * 3), INK)
    # the steep street: steps climbing from bottom left to the wall
    for k in range(14):
        x0 = 120 + k * 46; y0 = 600 - k * 22
        L.rect(x0, y0 - 22, x0 + 70, y0, INK2 if k % 2 else (18, 18, 44, 255))
    # leaning houses on both sides
    houses = [(-20, 600, 150, 220, 0.10), (130, 560, 120, 230, 0.07), (420, 600, 140, 300, -0.08), (560, 520, 120, 260, -0.12)]
    for hx, base, w, h, lean in houses:
        top = base - h
        L.poly([(hx, base), (hx + w, base), (hx + w + lean * h, top), (hx + lean * h, top)], INK)
        L.poly([(hx + lean * h - 8, top), (hx + w / 2 + lean * h, top - 50), (hx + w + lean * h + 8, top)], INK)
    # the last house, tall, against the wall – its attic is above the wall
    L.poly([(660, 400), (780, 400), (790, 150), (668, 150)], INK)
    L.poly([(660, 150), (729, 90), (798, 150)], INK)
    img = over(img, L)
    # the attic window glows warm, shutters ajar
    img = glow(img, 728, 200, 34, (255, 190, 110), 0.7)
    W2 = Layer()
    W2.rect(712, 182, 744, 222, (255, 214, 150, 255))
    W2.rect(706, 182, 714, 222, (40, 30, 26, 255)); W2.rect(742, 182, 750, 222, (40, 30, 26, 255))
    img = over(img, W2)
    # a lone figure with a guitar climbing the steps
    P = Layer()
    person(P, 338, 490, 78, (2, 2, 8, 255))
    guitar(P, 350, 468, 23, angle=0.5, fill=(2, 2, 8, 255))
    img = over(img, P)
    for (lx, ly) in [(205, 360), (468, 330), (605, 300)]:  # a few lit windows below
        img = glow(img, lx, ly, 9, (200, 180, 255), 0.4)
    return img


SCENES = {
    'void': void, 'window': window, 'guitar': guitar_light, 'corridor': corridor,
    'observatory': observatory, 'linden': linden, 'silhouette': silhouette, 'orpheus': orpheus,
    'shop': shop, 'stage': stage, 'well': well, 'sea': sea, 'mine': mine, 'zann': zann, 'dark': dark, 'light': light_end, 'puppet': puppet, 'silence': silence,
}

if __name__ == '__main__':
    for name, fn in SCENES.items():
        save(fn(), name)
