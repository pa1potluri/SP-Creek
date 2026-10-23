// Ready-made peaceful videos: a looping timeline (shot numbers as in camera.js), the art style,
// the weather, the sounds and how busy the town is. Shots are slowed down to fill their clips,
// and each preset's last clip leads gently back into its first, so it loops for hours.
export const BASE_LIFE = { people: 10, riders: 2, coach: 1, train: 1, chickens: 1, tumbleweeds: 1, wind: 1 };

export const VIDEO_PRESETS = {
  golden: {
    label: 'Golden afternoon in town',
    about: 'A slow stroll down the boardwalk, townsfolk about, birds, the piano faint from the saloon.',
    style: 'oil', rain: 0, wind: 0.3, ambience: 0.8,
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
    label: 'Rainy night at the Golden Spur',
    about: 'Rain on the empty street, then in through the batwing doors to the warm piano and the singer.',
    style: 'oil', rain: 0.75, wind: 0.45, ambience: 0.9,
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
    style: 'oil', rain: 0, wind: 0.2, ambience: 1,
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
    style: 'oil', rain: 0, wind: 0.35, ambience: 0.7,
    life: {},
    clips: [
      { shot: 7, seconds: 60, mood: 'dusk', move: 'cut' }, // Hilltop Vista
      { shot: 16, seconds: 120, mood: 'keep', move: 'fly' }, // Valley Journey
      { shot: 5, seconds: 45, mood: 'keep', move: 'fly' }, // Crane Reveal
      { shot: 6, seconds: 75, mood: 'keep', move: 'fly' }, // Golden Orbit
    ],
  },
  cozySaloon: {
    label: 'Cozy saloon (animated film look)',
    about: 'Inside only: the bar, the card game and the piano, in the soft animated-film style.',
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
    style: 'oil', rain: 0, wind: 0.2, ambience: 1,
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
    style: 'oil', rain: 0, wind: 0.2, ambience: 0.65,
    life: { people: 10, riders: 0, coach: 0, wind: 0.3 },
    clips: [
      { shot: 24, seconds: 100, mood: 'golden', move: 'cut' },
      { shot: 24, seconds: 100, mood: 'villageDusk', move: 'fly' },
    ],
  },
  friendlyGhostTown: {
    label: 'Friendly ghost town', about: 'Smiling neighbours, silver mist and gentle bells in sleepy Old Hollow, from warm dusk to soft moonlight.',
    style:'oil', rain:0, wind:0.15, ambience:0.5,
    life:{people:6,riders:0,coach:0,wind:0.25},
    clips:[{shot:25,seconds:100,mood:'villageDusk',move:'cut'},{shot:25,seconds:100,mood:'night',move:'fly'}],
  },
  fireflyForest: {
    label:'Firefly forest',about:'A lantern trail, glowing mushroom rings and sleepy owls as fireflies fill the clearing.',
    style:'oil',rain:0,wind:0.15,ambience:0.65,life:{people:4,riders:0,coach:0,wind:0.25},
    clips:[{shot:26,seconds:100,mood:'villageDusk',move:'cut'},{shot:26,seconds:100,mood:'night',move:'fly'}],
  },
  dreamyMeadow:{label:'Dreamy meadow',about:'Dreamland flower colours, butterflies and a soft rainbow over a sparkling waterfall lake.',style:'oil',rain:0,wind:0.2,ambience:0.65,life:{people:4,riders:0,coach:0,wind:0.35},clips:[{shot:27,seconds:100,mood:'morning',move:'cut'},{shot:27,seconds:100,mood:'golden',move:'fly'}]},
};
