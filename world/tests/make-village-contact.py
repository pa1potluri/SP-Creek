import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageStat

folder = Path(__file__).resolve().parent
frames = json.loads((folder / 'village-dusk/frames.json').read_text())
font = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 20)
title = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 26)
small = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 16)
width, height, caption, header = 480, 270, 36, 72
sheet = Image.new('RGB', (width * 4, header + (height + caption) * 4), '#211e26')
draw = ImageDraw.Draw(sheet)
draw.text((16, 5), 'Willow Creek — Village at dusk', font=title, fill='#f6d6a0')
draw.text((16, 41), '1080p Oil frames every 20 seconds · full 4:30 loop plus restart · 30 fps simulation · sound locked', font=small, fill='#dfd7e5')
for i, frame in enumerate(frames):
    source = Image.open(folder / 'village-dusk' / Path(frame['file']).name).convert('RGB')
    frame['meanLuminance'] = round(ImageStat.Stat(source.convert('L')).mean[0], 2)
    image = source.resize((width, height), Image.Resampling.LANCZOS)
    x, y = (i % 4) * width, header + (i // 4) * (height + caption)
    sheet.paste(image, (x, y))
    seconds = frame['seconds']
    label = f"{seconds // 60:02d}:{seconds % 60:02d}  {frame['shot'].replace('Willow Creek ', '')}"
    if seconds == 271:
        label += ' (restart)'
    draw.text((x + 8, y + height + 4), label, font=font, fill='#f4e8db')
    draw.text((x + width - 74, y + height + 8), f"{frame['groundClearance']:.1f} m", font=small, fill='#bfcab6')
sheet.save(folder / 'village-dusk-frames.png')
(folder / 'village-dusk/frames.json').write_text(json.dumps(frames, indent=2))
print(f"Saved {len(frames)} frames; luminance {min(f['meanLuminance'] for f in frames):.1f}–{max(f['meanLuminance'] for f in frames):.1f}/255")
