# Contact sheet: python3 sheet.py out.png img1 img2 ... (labels from filenames)
import sys
from PIL import Image, ImageDraw
out, files = sys.argv[1], sys.argv[2:]
ims = [Image.open(f).convert('RGB') for f in files]
w, h = ims[0].size
cols = min(len(ims), int(sys.argv[0] and 5))
cols = min(5, len(ims))
rows = (len(ims) + cols - 1) // cols
pad, lab = 12, 26
S = Image.new('RGB', (cols * (w + pad) + pad, rows * (h + pad + lab) + pad), (40, 40, 48))
d = ImageDraw.Draw(S)
for i, (im, f) in enumerate(zip(ims, files)):
    r, c = divmod(i, cols)
    x, y = pad + c * (w + pad), pad + r * (h + pad + lab)
    d.text((x, y + 4), f.split('/')[-1][:40], fill=(230, 230, 230))
    S.paste(im, (x, y + lab))
S.save(out)
print(S.size)
