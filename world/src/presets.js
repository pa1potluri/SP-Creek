// Ready-made peaceful videos: a looping timeline (shot numbers as in camera.js), the art style,
// the weather, the sounds and how busy the town is. Shots are slowed down to fill their clips,
// and each preset's last clip leads gently back into its first, so it loops for hours.
export const BASE_LIFE = { people: 10, riders: 2, coach: 1, train: 1, chickens: 1, tumbleweeds: 1, wind: 1 };

export const VIDEO_PRESETS = {
  golden: {
    label: 'Golden afternoon in town',
    about: 'A slow stroll down the boardwalk, townsfolk about, birds, the piano faint from the café.',
    style: 'film', rain: 0, wind: 0.14, ambience: 0.8,
    life: { people: 14, riders: 2 },
    clips: [
      { shot: 3, seconds: 70, mood: 'golden', move: 'cut' }, // Boardwalk Stroll
      { shot: 0, seconds: 50, mood: 'keep', move: 'fly' }, // Town Square 360°
      { shot: 2, seconds: 40, mood: 'keep', move: 'fly' }, // Café → Town hall
      { shot: 6, seconds: 60, mood: 'keep', move: 'fly' }, // Golden Orbit
      { shot: 1, seconds: 55, mood: 'keep', move: 'fly' }, // Arrival
    ],
  },
  rainyNight: {
    label: 'Rainy night at the Honey Bun Café',
    about: 'Rain on the empty street, then in through the café doors to the warm piano and the singer.',
    style: 'film', rain: 0.75, wind: 0.2, ambience: 0.9,
    life: { people: 3, riders: 0, coach: 0, chickens: 0, tumbleweeds: 0, wind: 1.3 },
    clips: [
      { shot: 3, seconds: 70, mood: 'night', move: 'cut' }, // Boardwalk Stroll
      { shot: 2, seconds: 40, mood: 'keep', move: 'fly' }, // Café → Town hall
      { shot: 17, seconds: 40, mood: 'keep', move: 'cut' }, // Through the Doors
      { shot: 18, seconds: 45, mood: 'keep', move: 'cut' }, // At the Bar
      { shot: 19, seconds: 55, mood: 'keep', move: 'cut' }, // Card Game
    ],
  },
  dawnRiver: {
    label: 'River at dawn',
    about: 'Morning light on the water, the mill wheel turning, the steam train passing the station.',
    style: 'film', rain: 0, wind: 0.11, ambience: 1,
    life: { people: 6, riders: 1 }, train: true,
    clips: [
      { shot: 10, seconds: 55, mood: 'morning', move: 'cut' }, // River Drift
      { shot: 8, seconds: 45, mood: 'keep', move: 'fly' }, // Mill Wheel
      { shot: 9, seconds: 40, mood: 'keep', move: 'fly' }, // Bridge Crossing
      { shot: 12, seconds: 50, mood: 'keep', move: 'fly' }, // Trackside
      { shot: 11, seconds: 50, mood: 'keep', move: 'fly' }, // Station Platform
    ],
  },
  campfire: {
    label: 'Campfire under the stars',
    about: 'Crickets and owls, fireflies over the corral, the camp fire crackling in the pines.',
    style: 'film', rain: 0, wind: 0.09, ambience: 1,
    life: { people: 4, riders: 0, coach: 0 },
    clips: [
      { shot: 15, seconds: 60, mood: 'night', move: 'cut' }, // Forest Camp
      { shot: 14, seconds: 60, mood: 'keep', move: 'fly' }, // Corral Orbit
      { shot: 13, seconds: 50, mood: 'keep', move: 'fly' }, // Ranch Overlook
    ],
  },
  duskValley: {
    label: 'Dusk over the valley',
    about: 'Long, slow flights over the whole valley as the sun goes down and the lamps come on.',
    style: 'film', rain: 0, wind: 0.16, ambience: 0.7,
    life: {},
    clips: [
      { shot: 7, seconds: 60, mood: 'dusk', move: 'cut' }, // Hilltop Vista
      { shot: 16, seconds: 120, mood: 'keep', move: 'fly' }, // Valley Journey
      { shot: 5, seconds: 45, mood: 'keep', move: 'fly' }, // Crane Reveal
      { shot: 6, seconds: 75, mood: 'keep', move: 'fly' }, // Golden Orbit
    ],
  },
  cozyCafe: {
    label: 'Cozy Honey Bun Café (animated film look)',
    about: 'Inside Honey Bun Café: cakes at the counter, board games and piano music, in the soft animated-film style.',
    style: 'film', rain: 0.4, wind: 0.09, ambience: 1,
    life: {},
    clips: [
      { shot: 17, seconds: 40, mood: 'dusk', move: 'cut' }, // Through the Doors
      { shot: 18, seconds: 50, mood: 'keep', move: 'cut' }, // At the Bar
      { shot: 19, seconds: 60, mood: 'keep', move: 'cut' }, // Card Game
    ],
  },
  villageDusk: {
    label: 'Village at dusk',
    about: 'Follow the quiet lane into Willow Creek, glide past the chapel, and watch warm windows light the hillside.',
    style: 'film', rain: 0, wind: 0.09, ambience: 1,
    life: { hamlet: 1, wind: 0.3 },
    clips: [
      { shot: 21, seconds: 90, mood: 'villageDusk', move: 'cut' },
      { shot: 22, seconds: 90, mood: 'villageDusk', move: 'fly' },
      { shot: 23, seconds: 90, mood: 'villageDusk', move: 'fly' },
    ],
  },
  cozyTownCenter: {
    label: 'Cozy town center',
    about: 'Flower-filled boardwalks and a little market, then warm lanterns around the fountain as evening settles.',
    style: 'film', rain: 0, wind: 0.09, ambience: 0.65,
    life: { people: 10, riders: 0, coach: 0, wind: 0.3 },
    clips: [
      { shot: 24, seconds: 100, mood: 'golden', move: 'cut' },
      { shot: 24, seconds: 100, mood: 'villageDusk', move: 'fly' },
    ],
  },
  friendlyGhostTown: {
    label: 'Friendly ghost town', about: 'Smiling neighbours, silver mist and gentle bells in sleepy Old Hollow, from warm dusk to soft moonlight.',
    style: 'film', rain:0, wind:0.07, ambience:0.5,
    life:{people:6,riders:0,coach:0,wind:0.25},
    clips:[{shot:25,seconds:100,mood:'villageDusk',move:'cut'},{shot:25,seconds:100,mood:'night',move:'fly'}],
  },
  fireflyForest: {
    label:'Firefly forest',about:'A lantern trail, glowing mushroom rings and sleepy owls as fireflies fill the clearing.',
    style: 'film',rain:0,wind:0.07,ambience:0.65,life:{people:4,riders:0,coach:0,wind:0.25},
    clips:[{shot:26,seconds:100,mood:'villageDusk',move:'cut'},{shot:26,seconds:100,mood:'night',move:'fly'}],
  },
  dreamyMeadow:{label:'Dreamy meadow',about:'Dreamland flower colours, butterflies and a soft rainbow over a sparkling waterfall lake.',style: 'film',rain:0,wind:0.09,ambience:0.65,life:{people:4,riders:0,coach:0,wind:0.35},clips:[{shot:27,seconds:100,mood:'morning',move:'cut'},{shot:27,seconds:100,mood:'golden',move:'fly'}]},
  magicCrystalHill:{label:'Magic crystal hill',about:'A bright crystal room and a softly glowing rainbow balloon above the valley.',style: 'film',rain:0,wind:0.09,ambience:0.55,life:{people:4,riders:0,coach:0,wind:0.35},clips:[{shot:28,seconds:90,mood:'golden',move:'cut'},{shot:29,seconds:110,mood:'villageDusk',move:'fly'}]},
  // 2:30 YouTube tour: every area once, 9–15 s each at the shots' own calm pace (natural), joined by cuts
  grandTour: {
    label: 'Grand tour of SP Creek (2:30)',
    about: 'Every corner of the valley in two and a half minutes: the town, the café, the mill, Willow Creek, Old Hollow, the forest, the meadow and the crystal hill.',
    style: 'film', rain: 0, wind: 0.11, ambience: 0.8,
    life: { people: 14, riders: 2 },
    clips: [
      { shot: 1, seconds: 15, mood: 'golden', move: 'cut', natural: true }, // 0:00 Arrival
      { shot: 0, seconds: 12, mood: 'keep', move: 'cut', natural: true }, // 0:15 Town square
      { shot: 24, seconds: 15, mood: 'keep', move: 'cut', natural: true }, // 0:27 Town center
      { shot: 17, seconds: 12, mood: 'keep', move: 'cut', natural: true }, // 0:42 Into the Honey Bun Café
      { shot: 8, seconds: 12, mood: 'keep', move: 'cut', natural: true }, // 0:54 Mill wheel
      { shot: 21, seconds: 12, mood: 'keep', move: 'cut', natural: true }, // 1:06 Willow Creek
      { shot: 25, seconds: 15, mood: 'villageDusk', move: 'cut', natural: true }, // 1:18 Old Hollow
      { shot: 15, seconds: 12, mood: 'villageDusk', move: 'cut', natural: true }, // 1:33 Forest camp
      { shot: 27, seconds: 12, mood: 'golden', move: 'cut', natural: true }, // 1:45 Meadow and lake
      { shot: 28, seconds: 12, mood: 'keep', move: 'cut', natural: true }, // 1:57 Crystal mine
      { shot: 29, seconds: 12, mood: 'keep', move: 'cut', natural: true }, // 2:09 Balloon hilltop
      { shot: 6, seconds: 9, mood: 'keep', move: 'cut', natural: true }, // 2:21 Golden orbit over the town → 2:30
    ],
  },
};

// Long background loops appended after the existing presets; location sound follows the camera.
const seasonalLife={people:6,riders:0,coach:0,train:0,chickens:1,tumbleweeds:0,wind:0.35,hamlet:1};
const calmPreset=(label,about,season,mood,shots)=>({label,about,season,style:'film',rain:0,wind:0.07,ambience:0.65,life:{...seasonalLife},clips:shots.map((shot,i)=>({shot,seconds:1200/shots.length,mood,move:i?'fly':'cut'}))});
VIDEO_PRESETS.mistyValley=calmPreset('Misty morning in the valley','20 minutes of low river and lake mist, water and quiet morning birds.','summer','morning',[10,34,32]);
VIDEO_PRESETS.sunbeamTown=calmPreset('Golden sunbeams over town','20 minutes of a very slow town stroll, warm light and soft village sounds.','summer','golden',[24]);
VIDEO_PRESETS.moonlitFireflies=calmPreset('Moonlit night with fireflies','20 minutes among gentle fireflies and sleepy forest sounds.','summer','night',[26]);
VIDEO_PRESETS.autumnWillow=calmPreset('Autumn leaves in Willow Creek','20 minutes above gold and russet trees, drifting leaves and quiet village life.','autumn','villageDusk',[23]);
VIDEO_PRESETS.snowyEvening=calmPreset('Snowy winter evening','20 minutes of soft snowfall, cosy windows and the smiling square snowman.','winter','villageDusk',[24,36,4]);
VIDEO_PRESETS.deerFamily=calmPreset('Deer at the forest edge','20 minutes with the grazing deer family, birds and a gentle breeze.','summer','golden',[35]);

VIDEO_PRESETS.paviSiri={label:'A day with Pavi & Siri',about:'Meet the brother and sister, follow their gentle town walk and rest beside Willow Creek pond.',style:'film',season:'summer',rain:0,wind:0.07,ambience:0.65,life:{people:8,riders:0,coach:0,train:0,chickens:1,tumbleweeds:0,wind:0.35,hamlet:1},clips:[{shot:37,seconds:365,mood:'golden',move:'cut'},{shot:37,seconds:35,mood:'golden',move:'cut'},{shot:37,seconds:280,mood:'villageDusk',move:'cut'}]};

VIDEO_PRESETS.sunsetCove={label:'Sunset at the cove',about:'20 minutes over the warm seaside village, a gentle sibling beach walk and the lantern lane to the sea.',style:'film',season:'summer',rain:0,wind:0.07,ambience:0.65,life:{people:6,riders:0,coach:0,train:0,chickens:1,tumbleweeds:0,wind:0.3,hamlet:1},clips:[{shot:39,seconds:400,mood:'golden',move:'cut'},{shot:40,seconds:400,mood:'golden',move:'cut'},{shot:41,seconds:400,mood:'villageDusk',move:'fly'}]};

VIDEO_PRESETS.episode1Welcome={label:'Episode 1: Welcome to SP Creek',about:'Three quiet minutes introducing Siri and Pavi at Sunset Cove, seen from behind and far away.',style:'film',season:'summer',rain:0,wind:0.05,ambience:0.65,life:{people:6,riders:0,coach:0,train:0,chickens:1,tumbleweeds:0,wind:0.25,hamlet:1},clips:[{shot:65,seconds:180,mood:'golden',move:'cut',natural:true}]};
VIDEO_PRESETS.letsBuild={label:"Let's build SP Creek",about:'Replay your own pieces in placement order with a soft settle and a slow orbit. Length follows your build and replay speed.',style:'film',season:'summer',rain:0,wind:0.07,ambience:0.5,life:{people:0,riders:0,coach:0,train:0,chickens:0,tumbleweeds:0,wind:0.35,hamlet:1},clips:[{shot:'buildReplay',seconds:1,replaySpeed:2,mood:'golden',move:'cut'}]};

VIDEO_PRESETS.lanternEvening={label:'Lantern evening by the lake',about:'A quiet lantern-lit street, then warm paper lights rising over the lake with friends and fireflies.',style:'film',season:'summer',festival:true,rain:0,wind:0.05,ambience:0.65,life:{people:8,riders:0,coach:0,train:0,chickens:0,tumbleweeds:0,wind:0.25,hamlet:1},clips:[{shot:24,seconds:200,mood:'villageDusk',move:'cut'},{shot:27,seconds:700,mood:'villageDusk',move:'fly'},{shot:27,seconds:300,mood:'night',move:'cut'}]};

VIDEO_PRESETS.paviSiriLittleDay={label:'Pavi & Siri: a little day',about:'Five quiet minutes: a bench, a hand-in-hand walk, sandcastles, ducks, friendly waves, a balloon and a kind collar fix.',style:'film',season:'summer',rain:0,wind:0.05,ambience:0.6,life:{people:6,riders:0,coach:0,train:0,chickens:0,tumbleweeds:0,wind:0.25,hamlet:1},clips:[{shot:46,seconds:40,mood:'golden',move:'cut'},{shot:47,seconds:45,mood:'golden',move:'cut'},{shot:48,seconds:45,mood:'golden',move:'cut'},{shot:49,seconds:45,mood:'golden',move:'cut'},{shot:50,seconds:40,mood:'golden',move:'cut'},{shot:51,seconds:45,mood:'golden',move:'cut'},{shot:52,seconds:40,mood:'golden',move:'cut'}]};

VIDEO_PRESETS.balloonRide={label:'Balloon ride over SP Creek',about:'Four gentle minutes: lift from the hilltop, float over the forest, town, river, meadow and cove, then come home.',style:'film',season:'summer',rain:0,wind:0.04,ambience:0.5,life:{people:6,riders:0,coach:0,train:0,chickens:0,tumbleweeds:0,wind:0.2,hamlet:1},clips:[{shot:53,seconds:30,mood:'golden',move:'cut'},{shot:54,seconds:180,mood:'golden',move:'cut'},{shot:55,seconds:30,mood:'golden',move:'cut'}]};

VIDEO_PRESETS.trainTrip={label:'A little train trip',about:'Board at SP Creek, wave from a real coach window, pause at Willow Creek and arrive above Sunset Cove.',style:'film',season:'summer',rain:0,wind:0.04,ambience:0.4,life:{people:5,riders:0,coach:0,train:1,chickens:0,tumbleweeds:0,wind:0.2,hamlet:1},clips:[{shot:56,seconds:30,mood:'golden',move:'cut'},{shot:57,seconds:150,mood:'golden',move:'cut'},{shot:58,seconds:60,mood:'golden',move:'cut'}]};

VIDEO_PRESETS.camping={label:'Camping under the stars',about:'Twenty quiet minutes with glowing tents, grown-ups nearby, Pavi and Siri on a log, tiny fireflies and a friendly owl.',style:'film',season:'summer',rain:0,wind:0.03,ambience:0.4,life:{people:3,riders:0,coach:0,train:0,chickens:0,tumbleweeds:0,wind:0.15,hamlet:1},clips:[{shot:59,seconds:600,mood:'night',move:'cut'},{shot:60,seconds:600,mood:'night',move:'fly'}]};

VIDEO_PRESETS.ponyFarm={label:'A day at the pony farm',about:'Five gentle minutes at the red barn, feeding ponies and making little lamb friends, with chicks, a calf, piglets and pond ducks.',style:'film',season:'summer',rain:0,wind:0.05,ambience:0.45,life:{people:4,riders:0,coach:0,train:0,chickens:0,tumbleweeds:0,wind:0.2,hamlet:1},clips:[{shot:61,seconds:80,mood:'golden',move:'cut'},{shot:62,seconds:100,mood:'golden',move:'fly'},{shot:63,seconds:120,mood:'golden',move:'fly'}]};

VIDEO_PRESETS.episode2Balloon={label:'Episode 2: Balloon over the valley',about:'Three minutes with a wide hilltop introduction, a gentle valley flight and a calm wide homecoming, with room for titles.',style:'film',season:'summer',rain:0,wind:0.04,ambience:0.45,life:{people:5,riders:0,coach:0,train:0,chickens:0,tumbleweeds:0,wind:0.2,hamlet:1},clips:[{shot:53,seconds:20,mood:'golden',move:'cut',natural:true},{shot:54,seconds:130,mood:'golden',move:'cut',natural:true},{shot:55,seconds:30,mood:'golden',move:'cut',natural:true}]};
VIDEO_PRESETS.episode3Train={label:'Episode 3: The little train',about:'A wide station introduction, gentle boarding, the coach window and a calm wide seaside arrival.',style:'film',season:'summer',rain:0,wind:0.04,ambience:0.4,life:{people:5,riders:0,coach:0,train:1,chickens:0,tumbleweeds:0,wind:0.2,hamlet:1},clips:[{shot:64,seconds:20,mood:'golden',move:'cut',natural:true},{shot:56,seconds:25,mood:'golden',move:'cut',natural:true},{shot:57,seconds:90,mood:'golden',move:'cut',natural:true},{shot:58,seconds:45,mood:'golden',move:'cut',natural:true}]};
VIDEO_PRESETS.episode5Farm={label:'Episode 5: A day at the pony farm',about:'A wide farm introduction, feeding the ponies, gentle lamb friends and a peaceful wide ending for an end card.',style:'film',season:'summer',rain:0,wind:0.05,ambience:0.45,life:{people:4,riders:0,coach:0,train:0,chickens:0,tumbleweeds:0,wind:0.2,hamlet:1},clips:[{shot:61,seconds:20,mood:'golden',move:'cut',natural:true},{shot:62,seconds:65,mood:'golden',move:'cut',natural:true},{shot:63,seconds:65,mood:'golden',move:'cut',natural:true},{shot:61,seconds:30,mood:'golden',move:'cut',natural:true}]};

VIDEO_PRESETS.episode4Camping={label:'Episode 4: Camping under the stars',about:'Three gentle minutes with glowing tents, a guarded fire and grown-ups nearby, then fireflies, a friendly owl and the quiet night sky.',style:'film',season:'summer',rain:0,wind:0.03,ambience:0.4,life:{people:3,riders:0,coach:0,train:0,chickens:0,tumbleweeds:0,wind:0.15,hamlet:1},clips:[{shot:59,seconds:30,mood:'night',move:'cut',natural:true},{shot:60,seconds:120,mood:'night',move:'cut',natural:true},{shot:59,seconds:30,mood:'night',move:'cut',natural:true}]};

VIDEO_PRESETS.rainyDayFun={label:'A rainy day in SP Creek',about:'Soft drizzle, colourful umbrellas and little puddle splashes, raindrops on the cafe window, then a wide clearing rainbow with Pavi and Siri.',style:'film',season:'summer',weather:'clearing',rain:0,wind:0.03,ambience:0.5,life:{people:3,riders:0,coach:0,train:0,chickens:0,tumbleweeds:0,wind:0.15,hamlet:1},clips:[{shot:66,seconds:30,mood:'morning',move:'cut',natural:true},{shot:67,seconds:20,mood:'morning',move:'cut',natural:true},{shot:68,seconds:190,mood:'morning',move:'cut',natural:true}]};

VIDEO_PRESETS.marketDay={label:'Market day in the square',about:'Five gentle minutes with fruit, flowers, bread, toys, balloons and a friendly street pianist; Pavi and Siri take home a balloon and share a bun.',style:'film',season:'summer',market:true,rain:0,wind:0.03,ambience:0.65,life:{people:5,riders:0,coach:0,train:0,chickens:0,tumbleweeds:0,wind:0.2,hamlet:1},clips:[{shot:69,seconds:45,mood:'golden',move:'cut',natural:true},{shot:70,seconds:80,mood:'golden',move:'cut',natural:true},{shot:71,seconds:110,mood:'golden',move:'cut',natural:true},{shot:69,seconds:65,mood:'golden',move:'cut',natural:true}]};

VIDEO_PRESETS.boatTrip={label:'A little boat trip',about:'Four gentle minutes in bright life jackets, with lake ducks, tiny jumping fish, a quiet waterfall and the calm cove shoreline.',style:'film',season:'summer',rain:0,wind:0.02,ambience:0.5,life:{people:3,riders:0,coach:0,train:0,chickens:0,tumbleweeds:0,wind:0.1,hamlet:1},clips:[{shot:72,seconds:80,mood:'golden',move:'cut',natural:true},{shot:73,seconds:80,mood:'golden',move:'cut',natural:true},{shot:74,seconds:80,mood:'golden',move:'cut',natural:true}]};

VIDEO_PRESETS.gardenTimeLapse={label:"Let's grow a garden",about:'Plant seeds with Pavi and Siri, watch sunflowers, carrots, pumpkins and flowers grow, then water and share a little harvest with visiting bees and butterflies.',style:'film',season:'summer',rain:0,wind:0.03,ambience:0.5,life:{people:3,riders:0,coach:0,train:0,chickens:0,tumbleweeds:0,wind:0.15,hamlet:1},clips:[{shot:75,seconds:80,mood:'golden',move:'cut',natural:true},{shot:76,seconds:80,mood:'golden',move:'cut',natural:true},{shot:77,seconds:80,mood:'golden',move:'cut',natural:true}]};

VIDEO_PRESETS.episode6Rain={...VIDEO_PRESETS.rainyDayFun,label:'Episode 6: A rainy day',about:'Three quiet minutes: a wide rainy town, little puddle splashes, the cafe window and a wide clearing rainbow.',clips:[{shot:78,seconds:20,mood:'morning',move:'cut',natural:true},{shot:66,seconds:30,mood:'morning',move:'cut',natural:true},{shot:67,seconds:25,mood:'morning',move:'cut',natural:true},{shot:68,seconds:75,mood:'morning',move:'cut',natural:true},{shot:79,seconds:30,mood:'morning',move:'cut',natural:true}]};
VIDEO_PRESETS.episode7Market={...VIDEO_PRESETS.marketDay,label:'Episode 7: Market day',about:'A wide square, a balloon for Pavi, a shared bakery bun and a calm wide market ending.',clips:[{shot:69,seconds:20,mood:'golden',move:'cut',natural:true},{shot:70,seconds:65,mood:'golden',move:'cut',natural:true},{shot:71,seconds:65,mood:'golden',move:'cut',natural:true},{shot:69,seconds:30,mood:'golden',move:'cut',natural:true}]};
VIDEO_PRESETS.episode8Boat={...VIDEO_PRESETS.boatTrip,label:'Episode 8: A little boat trip',about:'Three gentle minutes: a wide lake, the waterfall, a near-shore cove row and a wide seaside ending.',clips:[{shot:72,seconds:25,mood:'golden',move:'cut',natural:true},{shot:73,seconds:60,mood:'golden',move:'cut',natural:true},{shot:74,seconds:65,mood:'golden',move:'cut',natural:true},{shot:80,seconds:30,mood:'golden',move:'cut',natural:true}]};
VIDEO_PRESETS.episode9Garden={...VIDEO_PRESETS.gardenTimeLapse,label:"Episode 9: Let's grow a garden",about:'Plant seeds, watch the garden grow, water and pick vegetables, then hold a wide harvest ending for an end card.',clips:[{shot:75,seconds:30,mood:'golden',move:'cut',natural:true},{shot:76,seconds:75,mood:'golden',move:'cut',natural:true},{shot:77,seconds:45,mood:'golden',move:'cut',natural:true},{shot:81,seconds:30,mood:'golden',move:'cut',natural:true}]};
VIDEO_PRESETS.snowDay={label:'A snow day in SP Creek',about:'Build a smiling snowman, make soft snow angels, enjoy a slow sled with grown-ups nearby, then warm up with cocoa by the cafe window.',style:'film',season:'winter',rain:0,wind:0.03,ambience:0.45,life:{people:3,riders:0,coach:0,train:0,chickens:0,tumbleweeds:0,wind:0.15,hamlet:1},clips:[{shot:82,seconds:60,mood:'morning',move:'cut',natural:true},{shot:83,seconds:60,mood:'morning',move:'cut',natural:true},{shot:84,seconds:60,mood:'golden',move:'cut',natural:true},{shot:85,seconds:60,mood:'villageDusk',move:'cut',natural:true}]};

VIDEO_PRESETS.kiteDay={label:'Kite day',about:'Four gentle minutes with colourful kites above the meadow hill, soft tails, friends and grown-ups nearby.',style:'film',season:'summer',rain:0,wind:.12,ambience:.45,life:{people:4,riders:0,coach:0,train:0,chickens:0,tumbleweeds:0,wind:.35,hamlet:1},clips:[{shot:86,seconds:80,mood:'morning',move:'cut',natural:true},{shot:87,seconds:80,mood:'golden',move:'cut',natural:true},{shot:88,seconds:80,mood:'golden',move:'cut',natural:true}]};
VIDEO_PRESETS.waterfallPicnic={label:'Picnic by the waterfall',about:'Four quiet minutes beside the lake: a soft blanket, fruit, friends and little ducks, with the waterfall beyond.',style:'film',season:'summer',rain:0,wind:.04,ambience:.5,life:{people:4,riders:0,coach:0,train:0,chickens:0,tumbleweeds:0,wind:.2,hamlet:1},clips:[{shot:89,seconds:80,mood:'morning',move:'cut',natural:true},{shot:90,seconds:80,mood:'golden',move:'cut',natural:true},{shot:91,seconds:80,mood:'golden',move:'cut',natural:true}]};

VIDEO_PRESETS.episode10Snow={...VIDEO_PRESETS.snowDay,label:'Episode 10: Snow day',about:'A wide snowy clearing, a snowman, snow angels, a slow supervised sled and warm cocoa, then a quiet wide ending.',clips:[{shot:92,seconds:20,mood:'morning',move:'cut',natural:true},{shot:82,seconds:35,mood:'morning',move:'cut',natural:true},{shot:83,seconds:30,mood:'morning',move:'cut',natural:true},{shot:84,seconds:35,mood:'golden',move:'cut',natural:true},{shot:85,seconds:30,mood:'villageDusk',move:'cut',natural:true},{shot:92,seconds:30,mood:'villageDusk',move:'cut',natural:true}]};
VIDEO_PRESETS.episode11Kites={...VIDEO_PRESETS.kiteDay,label:'Episode 11: Kite day',about:'A wide meadow introduction, colourful kites and friends in a gentle breeze, with a wide ending for an end card.',clips:[{shot:93,seconds:20,mood:'morning',move:'cut',natural:true},{shot:86,seconds:35,mood:'golden',move:'cut',natural:true},{shot:87,seconds:60,mood:'golden',move:'cut',natural:true},{shot:88,seconds:35,mood:'golden',move:'cut',natural:true},{shot:93,seconds:30,mood:'golden',move:'cut',natural:true}]};
VIDEO_PRESETS.episode12Picnic={...VIDEO_PRESETS.waterfallPicnic,label:'Episode 12: Picnic by the waterfall',about:'A wide lake introduction, a blanket and fruit with friends, little ducks and a calm wide waterfall ending.',clips:[{shot:94,seconds:20,mood:'morning',move:'cut',natural:true},{shot:89,seconds:35,mood:'golden',move:'cut',natural:true},{shot:90,seconds:60,mood:'golden',move:'cut',natural:true},{shot:91,seconds:35,mood:'golden',move:'cut',natural:true},{shot:94,seconds:30,mood:'golden',move:'cut',natural:true}]};
VIDEO_PRESETS.episode13CoveNight={...VIDEO_PRESETS.boatTrip,label:'Episode 13: Night at the cove',about:'Wide quiet water under the stars, a warm lantern lane, a gentle near-shore boat view and a wide seaside ending.',clips:[{shot:95,seconds:20,mood:'night',move:'cut',natural:true},{shot:41,seconds:45,mood:'night',move:'cut',natural:true},{shot:80,seconds:85,mood:'night',move:'cut',natural:true},{shot:95,seconds:30,mood:'night',move:'cut',natural:true}]};
VIDEO_PRESETS.dreamyLake={label:'Dreamy night by the lake',about:'45 calm minutes from the dock: a warm cottage, floating lanterns, pink water lilies and drifting fireflies on deep blue water. For stories and quiet background.',style:'film',season:'summer',rain:0,wind:0.03,ambience:0.4,life:{people:0,riders:0,coach:0,train:0,chickens:0,tumbleweeds:0,wind:0.15,hamlet:1},clips:[{shot:98,seconds:2700,mood:'dreamyNight',move:'cut'}]};
VIDEO_PRESETS.dreamyCove={...VIDEO_PRESETS.dreamyLake,label:'Dreamy night at the cove',about:'45 calm minutes on the pier: a little glowing lighthouse, floating lanterns and fireflies over the quiet sea. For stories and quiet background.',clips:[{shot:99,seconds:2700,mood:'dreamyNight',move:'cut'}]};
