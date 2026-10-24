// Ready-made peaceful videos: a looping timeline (shot numbers as in camera.js), the art style,
// the weather, the sounds and how busy the town is. Shots are slowed down to fill their clips,
// and each preset's last clip leads gently back into its first, so it loops for hours.
export const BASE_LIFE = { people: 10, riders: 2, coach: 1, train: 1, chickens: 1, tumbleweeds: 1, wind: 1 };

export const VIDEO_PRESETS = {
  golden: {
    label: 'Golden afternoon in town',
    about: 'A slow stroll down the boardwalk, townsfolk about, birds, the piano faint from the café.',
    style: 'film', rain: 0, wind: 0.3, ambience: 0.8,
    life: { people: 14, riders: 2 },
    clips: [
      { shot: 3, seconds: 70, mood: 'golden', move: 'cut' }, // Boardwalk Stroll
      { shot: 0, seconds: 50, mood: 'keep', move: 'fly' }, // Town Square 360°
      { shot: 2, seconds: 40, mood: 'keep', move: 'fly' }, // Saloon → Sheriff
      { shot: 6, seconds: 60, mood: 'keep', move: 'fly' }, // Golden Orbit
      { shot: 1, seconds: 55, mood: 'keep', move: 'fly' }, // Arrival
    ],
  },
  rainyNight: {
    label: 'Rainy night at the Honey Bun Café',
    about: 'Rain on the empty street, then in through the café doors to the warm piano and the singer.',
    style: 'film', rain: 0.75, wind: 0.45, ambience: 0.9,
    life: { people: 3, riders: 0, coach: 0, chickens: 0, tumbleweeds: 0, wind: 1.3 },
    clips: [
      { shot: 3, seconds: 70, mood: 'night', move: 'cut' }, // Boardwalk Stroll
      { shot: 2, seconds: 40, mood: 'keep', move: 'fly' }, // Saloon → Sheriff
      { shot: 17, seconds: 40, mood: 'keep', move: 'cut' }, // Through the Doors
      { shot: 18, seconds: 45, mood: 'keep', move: 'cut' }, // At the Bar
      { shot: 19, seconds: 55, mood: 'keep', move: 'cut' }, // Card Game
    ],
  },
  dawnRiver: {
    label: 'River at dawn',
    about: 'Morning light on the water, the mill wheel turning, the steam train passing the station.',
    style: 'film', rain: 0, wind: 0.25, ambience: 1,
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
    style: 'film', rain: 0, wind: 0.2, ambience: 1,
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
    style: 'film', rain: 0, wind: 0.35, ambience: 0.7,
    life: {},
    clips: [
      { shot: 7, seconds: 60, mood: 'dusk', move: 'cut' }, // Hilltop Vista
      { shot: 16, seconds: 120, mood: 'keep', move: 'fly' }, // Valley Journey
      { shot: 5, seconds: 45, mood: 'keep', move: 'fly' }, // Crane Reveal
      { shot: 6, seconds: 75, mood: 'keep', move: 'fly' }, // Golden Orbit
    ],
  },
  cozySaloon: {
    label: 'Cozy Honey Bun Café (animated film look)',
    about: 'Inside Honey Bun Café: cakes at the counter, board games and piano music, in the soft animated-film style.',
    style: 'film', rain: 0.4, wind: 0.2, ambience: 1,
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
    style: 'film', rain: 0, wind: 0.2, ambience: 1,
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
    style: 'film', rain: 0, wind: 0.2, ambience: 0.65,
    life: { people: 10, riders: 0, coach: 0, wind: 0.3 },
    clips: [
      { shot: 24, seconds: 100, mood: 'golden', move: 'cut' },
      { shot: 24, seconds: 100, mood: 'villageDusk', move: 'fly' },
    ],
  },
  friendlyGhostTown: {
    label: 'Friendly ghost town', about: 'Smiling neighbours, silver mist and gentle bells in sleepy Old Hollow, from warm dusk to soft moonlight.',
    style: 'film', rain:0, wind:0.15, ambience:0.5,
    life:{people:6,riders:0,coach:0,wind:0.25},
    clips:[{shot:25,seconds:100,mood:'villageDusk',move:'cut'},{shot:25,seconds:100,mood:'night',move:'fly'}],
  },
  fireflyForest: {
    label:'Firefly forest',about:'A lantern trail, glowing mushroom rings and sleepy owls as fireflies fill the clearing.',
    style: 'film',rain:0,wind:0.15,ambience:0.65,life:{people:4,riders:0,coach:0,wind:0.25},
    clips:[{shot:26,seconds:100,mood:'villageDusk',move:'cut'},{shot:26,seconds:100,mood:'night',move:'fly'}],
  },
  dreamyMeadow:{label:'Dreamy meadow',about:'Dreamland flower colours, butterflies and a soft rainbow over a sparkling waterfall lake.',style: 'film',rain:0,wind:0.2,ambience:0.65,life:{people:4,riders:0,coach:0,wind:0.35},clips:[{shot:27,seconds:100,mood:'morning',move:'cut'},{shot:27,seconds:100,mood:'golden',move:'fly'}]},
  magicCrystalHill:{label:'Magic crystal hill',about:'A bright crystal room and a softly glowing rainbow balloon above the valley.',style: 'film',rain:0,wind:0.2,ambience:0.55,life:{people:4,riders:0,coach:0,wind:0.35},clips:[{shot:28,seconds:90,mood:'golden',move:'cut'},{shot:29,seconds:110,mood:'villageDusk',move:'fly'}]},
  // 2:30 YouTube tour: every area once, 9–15 s each at the shots' own calm pace (natural), joined by cuts
  grandTour: {
    label: 'Grand tour of Dusty Hollow (2:30)',
    about: 'Every corner of the valley in two and a half minutes: the town, the café, the mill, Willow Creek, Old Hollow, the forest, the meadow and the crystal hill.',
    style: 'film', rain: 0, wind: 0.25, ambience: 0.8,
    life: { people: 14, riders: 2 },
    clips: [
      { shot: 1, seconds: 15, mood: 'golden', move: 'cut', natural: true }, // 0:00 Arrival
      { shot: 0, seconds: 12, mood: 'keep', move: 'cut', natural: true }, // 0:15 Town square
      { shot: 24, seconds: 15, mood: 'keep', move: 'cut', natural: true }, // 0:27 Town center
      { shot: 19, seconds: 12, mood: 'keep', move: 'cut', natural: true }, // 0:42 Honey Bun Café (the room)
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
const calmPreset=(label,about,season,mood,shots)=>({label,about,season,style:'film',rain:0,wind:0.15,ambience:0.65,life:{...seasonalLife},clips:shots.map((shot,i)=>({shot,seconds:1200/shots.length,mood,move:i?'fly':'cut'}))});
VIDEO_PRESETS.mistyValley=calmPreset('Misty morning in the valley','20 minutes of low river and lake mist, water and quiet morning birds.','summer','morning',[10,34,32]);
VIDEO_PRESETS.sunbeamTown=calmPreset('Golden sunbeams over town','20 minutes of a very slow town stroll, warm light and soft village sounds.','summer','golden',[24]);
VIDEO_PRESETS.moonlitFireflies=calmPreset('Moonlit night with fireflies','20 minutes among gentle fireflies and sleepy forest sounds.','summer','night',[26]);
VIDEO_PRESETS.autumnWillow=calmPreset('Autumn leaves in Willow Creek','20 minutes above gold and russet trees, drifting leaves and quiet village life.','autumn','villageDusk',[23]);
VIDEO_PRESETS.snowyEvening=calmPreset('Snowy winter evening','20 minutes of soft snowfall, cosy windows and the smiling square snowman.','winter','villageDusk',[24,36,4]);
VIDEO_PRESETS.deerFamily=calmPreset('Deer at the forest edge','20 minutes with the grazing deer family, birds and a gentle breeze.','summer','golden',[35]);
