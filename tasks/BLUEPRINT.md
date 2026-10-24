# SP Creek: world map and blueprint

The plan everything is built against. Coordinates are world metres from the code: **x = east (+) / west (−)**,
**z = south (+) / north (−)**. The ground is 1600 × 1600 m; the lived-in part is about 700 × 700 m (x −400…+300,
z −350…+350). New areas must use the free spaces marked here, and keep a clear walking path to the town.

## Map (north is up)

```
 z
-350 ┌───────────────────────────────────────────────────────────────────────────────┐
     │                    ▲ ▲ FOREST ▲ ▲              ⛰ CRYSTAL HILL  🎈           │
-200 │                  ▲ Firefly forest (−90,−204)    mine (173,−115)              │
     │                  ⛺ Forest camp (−62,−172)        balloon top (202,−145)      │
-100 │                                                                              │
     │   [free: PONY FARM?]   🐎 Ranch (−95,−55)   ⛪ Town center  👻 Old Hollow      │
   0 │ 🌊 SUNSET COVE   🌸 Meadow & lake           │ square (5,−50)  (125,−15)   ║ R │
     │ (new, x −330…    (−225,0) waterfall         │ MAIN STREET     │           ║ A │
     │  −430, sea to    [free: CAMPING NIGHT?]     │ x 0, z −40…40   │  Station  ║ I │
 +50 │  the west)                                  │ ☕ Café (7,8)    │  (60,10)  ║ L │
     │            🏡 Willow Creek (−116,65)  🦆 pond (−69,94)   [free: PLAYGROUND]  ║ x │
+150 │ ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈ RIVER (z ≈ 150, winding) ≈≈≈≈≈≈≈≈ mill wheel (48,~150) ≈≈║70≈│
     │  river mouth → cove                                                          ║   │
+350 └───────────────────────────────────────────────────────────────────────────────┘
       x −400        −250          −100           0            +100          +300
```

## What exists today

| # | Place | Where (x, z) | Mood | Main shots |
|---|---|---|---|---|
| 1 | **Main street** (bakery, general store, toy shop, town hall, doctor, post office, barber, Honey Bun Café) | 0, −40…40 | cosy, warm | Arrival, Boardwalk, Golden Orbit |
| 2 | **Town center** (square, fountain, church, market stall, snowman in winter) | ~5, −50 | friendly | Town Center Stroll, Snowman |
| 3 | **Station and railway** (train runs north–south) | rail x = 70, station ~60, 10 | lively | Station Platform, Trackside |
| 4 | **River and mill** | river z ≈ 150, mill 48 | calm | River Drift, Mill Wheel, Bridge |
| 5 | **Willow Creek** hamlet and duck pond | −116, 65 / pond −69, 94 | gentle | Willow Creek, Pond Tour |
| 6 | **Ranch** with corral | −95, −55 | open | Ranch Overlook, Corral Orbit |
| 7 | **Old Hollow**, the friendly ghost town | 125, −15 | mysterious, safe | Old Hollow Tour |
| 8 | **Firefly forest** and camp | −90, −204 / camp −62, −172 | magical at night | Firefly Forest Tour, Deer |
| 9 | **Flower meadow and waterfall lake** | −225, 0 | bright, dreamy | Meadow and Lake Tour |
| 10 | **Crystal mine and balloon hilltop** | 173, −115 / 202, −145 | glowing | Crystal Mine Tour, Balloon |

Across the whole map: day/night moods, rain, drizzle and rainbow, wind, seasons (summer, autumn, winter), mist,
animals, 6 art styles, Build mode.

## Planned (in this order)

| Next | Place | Where | Notes |
|---|---|---|---|
| now | **Pavi & Siri** walk around town (task 17a) | town, pond | the stars of every video |
| queued | **Playground** (task 19) | free grass east of main street, ~30, 40 | swings, slide, seesaw |
| queued | **Lantern evening** (task 20) | main street + meadow lake | festival mood |
| **new** | **🌊 Sunset Cove** | west coast, x −330…−430, z −80…+170 | see below |
| poll | Pony farm / camping night / train trip / balloon ride | free spaces on the map | built in the order viewers vote |

## Sunset Cove (blueprint)

The valley opens to the sea on the **west**, beyond the meadow, so the sun sets over the water. The river turns
west and flows into the bay at its south end.

- **Bay:** a curved golden beach (~250 m long) from (−340, −80) to (−360, +170); gentle foam waves; smooth rocks.
  Shallow water at the shore, an invisible soft wall at the waterline (no deep water).
- **Sea:** to the west edge of the map; turquoise near the shore, deep blue further out; a sunset light path.
- **Village on the slope** east of the beach (−300…−330, −40…+60): ~15 white stone cottages with terracotta roofs, pink
  bougainvillea, cobbled lanes with steps, wall lanterns, flower pots, a fountain square.
- **Pier** with small boats and a sailboat at (−360, 30). **Lighthouse island** out at sea at (−470, −60).
- **Palms** along the beach and lanes; hills and trees behind.
- **Paths:** the meadow path continues west to the village; the river mouth at (−360, ~150).
- **Shots:** Bay overview from above (golden hour), Pavi & Siri on the waterline at sunset, Lantern lane to the sea.
- **Art:** new texture sets from ChatGPT (white plaster wall, terracotta roof, cobblestones, sand, palm leaves), oil and clean.
