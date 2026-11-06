import * as THREE from 'three';

const KEY = 'sp-creek.hidden-stars.v1';

function makeStar() {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const angle = Math.PI / 2 + i * Math.PI / 5;
    const radius = i % 2 ? 0.42 : 0.92;
    const x = Math.cos(angle) * radius, y = Math.sin(angle) * radius;
    if (!i) shape.moveTo(x, y); else shape.lineTo(x, y);
  }
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.05, bevelSegments: 2 });
  geometry.center();
  return geometry;
}

function readFound() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(value) ? new Set(value.filter(Number.isInteger)) : new Set();
  } catch { return new Set(); }
}

/** Ten calm, nearby landmark stars. They only save after a person really taps one. */
export function buildHiddenStars(world, audio) {
  const group = new THREE.Group();
  group.name = 'Hidden Stars';
  group.visible = false;
  const sites = [
    [-8, 14], [14, -20], [-54, 79], [-109, 65], [-91, -198],
    [-222, 2], [43, 57], [121, -18], [202, -142], [-335, 20],
  ];
  const found = readFound();
  const stars = [];
  const geometry = makeStar();
  const material = new THREE.MeshLambertMaterial({ color: 0xffd65c, emissive: 0x9d6210, emissiveIntensity: 0.65 });
  const counter = document.createElement('output');
  counter.id = 'starCounter';
  counter.hidden = true;
  counter.className = 'starCounter';
  counter.setAttribute('aria-live', 'polite');
  document.body.append(counter);
  const refresh = () => { counter.textContent = `⭐ ${found.size}/10 stars`; };

  for (const [index, [x, z]] of sites.entries()) {
    const holder = new THREE.Group();
    holder.name = `Hidden star ${index + 1}`;
    holder.position.set(x, world.groundY(x, z) + 1.25, z);
    holder.userData.hiddenStar = index;
    const star = new THREE.Mesh(geometry, material);
    star.rotation.x = Math.PI / 2;
    star.castShadow = true;
    holder.add(star);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: world.tex.glow, color: 0xffdc72, transparent: true, opacity: 0.42, depthWrite: false }));
    glow.scale.set(3.2, 3.2, 1);
    glow.position.y = 0.04;
    holder.add(glow);
    holder.visible = !found.has(index);
    group.add(holder);
    stars.push(holder);
  }
  world.root.add(group);
  refresh();

  const collect = (index, event) => {
    if (!group.visible || !event?.isTrusted || found.has(index) || !stars[index]) return false;
    found.add(index);
    stars[index].visible = false;
    try { localStorage.setItem(KEY, JSON.stringify([...found].sort((a, b) => a - b))); } catch { /* storage is optional */ }
    audio.chime(event);
    refresh();
    return true;
  };
  return {
    stars, sites, group, counter,
    setVisible(visible) { group.visible = !!visible; counter.hidden = !visible; },
    tryCollect(raycaster, event) {
      if (!group.visible) return false;
      const hit = raycaster.intersectObjects(stars.filter((star) => star.visible), true)[0];
      if (!hit) return false;
      let node = hit.object;
      while (node && node.userData.hiddenStar === undefined) node = node.parent;
      return node ? collect(node.userData.hiddenStar, event) : false;
    },
    collect,
    update(time) {
      for (const [i, star] of stars.entries()) {
        if (!star.visible) continue;
        star.rotation.y = time * 0.7 + i;
        star.position.y = world.groundY(star.position.x, star.position.z) + 1.25 + Math.sin(time * 1.4 + i) * 0.12;
        star.scale.setScalar(1 + Math.sin(time * 2 + i) * 0.06);
      }
    },
    get foundCount() { return found.size; },
  };
}
