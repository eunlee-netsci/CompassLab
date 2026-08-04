#!/usr/bin/env python3
"""Turn member photos into the light pencil-portrait style used for the PI photo.

  original
    -> person cut out from the background (rembg / u2net_human_seg)
    -> head-aware square crop (uses the cut-out mask, no face model needed)
    -> colour-dodge pencil sketch
    -> tone auto-matched to assets/img/people/outline_eun.png
    -> 600x600 greyscale PNG

Needs:  pip install rembg onnxruntime opencv-python-headless pillow numpy

Add a new member: drop their photo in photos-original/, add one line to JOBS,
then  python3 tools/sketchify.py <name>   (run from the repo root).
"""
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageOps, ImageFilter

SRC = Path("photos-original")   # put the raw photo here, then run this script
OUT = Path("assets/img/people")
SIZE = 600

# tone targets measured from the existing hand-made portraits
TARGET_DARK_FRAC = 0.065      # share of pixels below 200
DARK_THRESH = 200

JOBS = {
    "pic_chihyun":  "pic_chihyun.jpg",
    "gyeong_won":   "gyeong_won.jpg",
    "Yoona_Jang":   "Yoona_Jang.jpg",
    "Sanghun_Park": "Sanghun_Park.png",
    "JW_Lee":       "JW_Lee.png",
}

_session = None


def cutout(im):
    """Return (rgb_on_white, alpha_mask or None)."""
    global _session
    try:
        from rembg import remove, new_session
        if _session is None:
            _session = new_session("u2net_human_seg")
        rgba = remove(im.convert("RGBA"), session=_session,
                      alpha_matting=True,
                      alpha_matting_foreground_threshold=250,
                      alpha_matting_background_threshold=15,
                      alpha_matting_erode_size=8)
    except Exception as e:
        print("  ! background removal unavailable:", e, file=sys.stderr)
        return im.convert("RGB"), None
    alpha = np.asarray(rgba.split()[-1], dtype=np.uint8)
    white = Image.new("RGBA", rgba.size, (255, 255, 255, 255))
    white.alpha_composite(rgba)
    return white.convert("RGB"), alpha


def face_box(rgb):
    """Portrait crop framed on the detected face. None if no face found."""
    arr = np.asarray(rgb)
    gray = cv2.cvtColor(arr, cv2.COLOR_RGB2GRAY)
    gray = cv2.equalizeHist(gray)
    h, w = gray.shape
    best = None
    for name in ("haarcascade_frontalface_default.xml",
                 "haarcascade_frontalface_alt2.xml",
                 "haarcascade_profileface.xml"):
        cc = cv2.CascadeClassifier(cv2.data.haarcascades + name)
        faces = cc.detectMultiScale(gray, scaleFactor=1.08, minNeighbors=6,
                                    minSize=(max(30, w // 20), max(30, h // 20)))
        if len(faces):
            f = max(faces, key=lambda r: r[2] * r[3])
            if best is None or f[2] * f[3] > best[2] * best[3]:
                best = f
        if best is not None:
            break
    if best is None:
        return None
    fx, fy, fw, fh = best
    side = fw * 2.7                       # head ~ 37% of the frame, like the PI portrait
    left = fx + fw / 2.0 - side / 2.0     # may be negative: the canvas is padded first
    top = fy - fh * 0.72
    return (int(round(left)), int(round(top)),
            int(round(left + side)), int(round(top + side)))


def head_box(alpha, w, h):
    """Square crop box framed on the head, derived from the cut-out mask."""
    m = alpha > 96
    rows = np.where(m.any(axis=1))[0]
    cols = np.where(m.any(axis=0))[0]
    if not len(rows) or not len(cols):
        return None
    top, bottom = rows[0], rows[-1]
    subj_h = bottom - top + 1

    # width of the subject a little below the crown ~ head width
    probe = int(top + 0.13 * subj_h)
    probe = min(probe, h - 1)
    band = m[max(top, probe - 2):probe + 3]
    xs = np.where(band.any(axis=0))[0]
    if not len(xs):
        xs = cols
    head_w = max(xs[-1] - xs[0] + 1, 40)
    head_cx = (xs[0] + xs[-1]) / 2.0

    side = min(max(head_w * 2.5, subj_h * 0.62), min(w, h))
    left = head_cx - side / 2.0
    top_c = top - side * 0.11

    left = int(round(max(0, min(w - side, left))))
    top_c = int(round(max(0, min(h - side, top_c))))
    side = int(round(side))
    return (left, top_c, left + side, top_c + side)


def sketch(rgb, blur):
    g = np.asarray(ImageOps.grayscale(rgb), dtype=np.float32)
    inv = 255.0 - g
    inv_b = np.asarray(
        Image.fromarray(inv.astype(np.uint8)).filter(ImageFilter.GaussianBlur(blur)),
        dtype=np.float32)
    out = np.clip(g * 255.0 / np.maximum(255.0 - inv_b, 1.0), 0, 255)
    return out


def match_tone(a, target=TARGET_DARK_FRAC, thresh=DARK_THRESH):
    """Bisect a gamma curve so the share of dark pixels matches the reference.
       Pure white stays pure white, so the background is untouched."""
    x = a / 255.0
    lo, hi = 0.2, 12.0
    for _ in range(45):
        g = (lo + hi) / 2
        frac = ((x ** g) * 255.0 < thresh).mean()
        if frac < target:
            lo = g
        else:
            hi = g
    return np.clip((x ** ((lo + hi) / 2)) * 255.0, 0, 255)


def run(stem, fname):
    im = ImageOps.exif_transpose(Image.open(SRC / fname)).convert("RGB")
    if max(im.size) > 1600:
        k = 1600 / max(im.size)
        im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)

    flat, alpha = cutout(im)

    # white margin so a portrait crop is never clipped by the frame edge
    pad = int(0.5 * min(flat.size))
    padded = Image.new("RGB", (flat.width + 2 * pad, flat.height + 2 * pad), "white")
    padded.paste(flat, (pad, pad))

    box = face_box(flat)
    how = "face"
    if box is None and alpha is not None:
        box = head_box(alpha, *flat.size)
        how = "mask"
    if box is None:
        how = "centre"                                   # fall back to a centre crop
        s = min(flat.size)
        box = ((flat.width - s) // 2, int((flat.height - s) * 0.3),
               (flat.width - s) // 2 + s, int((flat.height - s) * 0.3) + s)
    box = (box[0] + pad, box[1] + pad, box[2] + pad, box[3] + pad)
    crop = padded.crop(box).resize((SIZE, SIZE), Image.LANCZOS)

    a = sketch(crop, blur=SIZE / 150.0)
    a = match_tone(a)
    out = Image.fromarray(a.astype(np.uint8)).filter(
        ImageFilter.UnsharpMask(radius=1.1, percent=60, threshold=3))

    # white -> transparent so the portrait sits on any background
    arr = np.asarray(out.convert("L"), dtype=np.float32)
    rgba = np.zeros(arr.shape + (4,), dtype=np.uint8)
    rgba[..., 0], rgba[..., 1], rgba[..., 2] = (23, 25, 29)
    rgba[..., 3] = np.clip(255.0 - arr, 0, 255).astype(np.uint8)
    out = Image.fromarray(rgba, "RGBA")

    dst = OUT / (stem + ".png")
    out.save(dst, optimize=True)
    for old in OUT.glob(stem + ".jpg"):
        old.unlink()

    chk = np.asarray(out, dtype=np.float32)
    print(f"  {stem:14s} bg={'yes' if alpha is not None else 'NO '} crop={how:6s} "
          f"box={box} mean={chk.mean():.1f} dark={(chk < 200).mean():.3f} "
          f"-> {dst.name} {dst.stat().st_size // 1024} KB")


if __name__ == "__main__":
    for stem in (sys.argv[1:] or list(JOBS)):
        run(stem, JOBS[stem])
