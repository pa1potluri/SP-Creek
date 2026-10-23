# ChatGPT prompts — Dusty Hollow painted assets

Work in **one ChatGPT chat** so the style stays the same. Save every image into
`world/assets/` (make the folder). The tool loads these files:

| What you make | Where it goes in the tool |
|---|---|
| Backdrop tiles (sky + far mountains) | **Painted backdrop** → upload the stitched strip |
| Cut-outs (horse, cowboy, wagon…) | **Place objects → Add 2D cut-out (PNG)** → click the ground |

---

## 0. Style lock (paste first, once)

> For this whole project we are painting an original 1890s American frontier town
> called **"Dusty Hollow"** (our own town, not from any game). Style for every image:
> oil painting on canvas, visible thick impasto brushstrokes, painterly soft edges.
> Palette: warm ochre, burnt sienna, dusty rose, sage green, deep teal-blue shadows.
> Late-afternoon golden light with the **sun low on the LEFT**. Hazy, dusty air. In the
> tradition of 19th-century Western landscape painting (Bierstadt, Remington).
> Never photorealistic, no modern objects, no text, no logos, no watermarks.
> Reply "ready" and wait for my next prompt.

---

## 1. Painted backdrop: sky and far mountains (4 tiles, loops 360°)

These go **behind** the town, so: **no buildings, no people, nothing close**. Only
distant land, mountains and sky.

**Tile 1**
> Paint a wide 3:2 landscape. **No foreground, no buildings, no people.**
> Only: a big painterly sky with golden clouds (top two-thirds), and a distant range
> of blue-violet mountains and rolling golden hills. **The horizon / base of the
> hills is exactly at the vertical centre of the image.** The bottom third is
> distant grassy plains fading into haze. Keep the left and right edges simple
> (sky and hills only) so they can be joined to other tiles.

**Tiles 2, 3, 4** (upload the previous tile each time)
> This is the previous view. Turn **90° to the right** and paint what is there, the
> same distant mountains continuing. **The left quarter of the new image must
> continue exactly from the right quarter of the attached image**: same horizon
> height, same clouds, same light, palette and brushwork. Still no buildings, no
> people, nothing close.
> Tile 2: *a tall snowy peak far away*. Tile 3: *low mesas with the sun glow
> behind them*. Tile 4: *pine-covered ridges*.

For tile 4, also upload tile 1 and add:
> The right edge of this image must lead straight into the left edge of this first image.

Then join them: in Dusty Hollow open **Painted backdrop → Stitch ChatGPT tiles…**
(or `http://localhost:8810/stitch.html`), drop the 4 tiles in, press **Stitch**, check the
loop, and press **Use as backdrop in Dusty Hollow**. Name the files `_1 … _4` so they
sort in order (you can also reorder them with the arrows).

---

## 2. Cut-outs (2D objects you place in the town)

For every cut-out add this line:
> **Transparent background PNG.** Full body, nothing cropped, standing on flat
> ground, viewed from the side at eye level. Lit by golden sun from the LEFT,
> same oil-painting brushwork. One subject only, no ground shadow, no text.

Subjects (one image each):
1. A chestnut horse with a saddle, standing still, tail down
2. A white-and-brown painted horse grazing (head down)
3. A cowboy in a long duster coat and wide hat, leaning on nothing, hands at belt
4. A woman in an 1890s prairie dress and bonnet, carrying a basket
5. The sheriff, star on his vest, rifle resting on his shoulder
6. An old prospector with a mule
7. A stagecoach (side view), no horses
8. A shaggy farm dog sitting
9. Three chickens pecking
10. A tall saguaro-free prairie bush / tumbleweed
11. A wooden water pump
12. A blacksmith anvil with tools

Tip: when a cut-out looks good, ask: *"Same character, now walking, side view"* to
get a second pose.

---

## 3. Mood versions (later)

Once the backdrop works, repeat section 1 with one line changed for each mood:
- *"…at dusk: purple-orange sky, the sun just below the hills, first stars."*
- *"…moonlit night: deep blue sky, silver moon high on the right, many stars."*
- *"…misty morning: pale cream fog in the valleys, soft cool light from the right."*
- *"…rainy afternoon: heavy grey clouds, rain streaks over the mountains."*

Name files clearly, e.g. `backdrop_golden_1.png … _4.png`, `cutout_horse_chestnut.png`.
