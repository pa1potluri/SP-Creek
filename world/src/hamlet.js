// Built-in scenery uses the same specs as user builds; add catalogue types without another builder.
export const HAMLET = {
  x: -116, z: 65,
  pond: { x: -69, z: 94, rx: 8.5, rz: 6.5 },
  buildings: [
    { type: 'chapel', x: -153, z: 65, yaw: Math.PI / 2, w: 10 },
    { type: 'house', x: -134, z: 77, yaw: Math.PI, w: 8, wall: [95, 25, 60] },
    { type: 'house', x: -113, z: 79, yaw: Math.PI, w: 8, wall: [205, 30, 62] },
    { type: 'house', x: -91, z: 79, yaw: Math.PI, w: 8, wall: [38, 30, 76] },
    { type: 'house', x: -132, z: 53, w: 8, wall: [15, 30, 60] },
    { type: 'shop', x: -110, z: 51, w: 12, sign: 'WILLOW CREEK STORE' },
    { type: 'barn', x: -86, z: 51, w: 12, sign: 'WILLOW CREEK FARM' },
  ],
  road: [[0, 65], [-24, 62], [-48, 64], [-72, 67], [-98, 67], [-122, 65], [-144, 65]],
  benches: [[-142, 60, Math.PI / 2], [-101, 73, Math.PI]],
};
