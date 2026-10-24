import { tileFromImage, stitchTiles } from './stitch.js';
import { putFile } from './store.js';

const $ = (s) => document.querySelector(s);
let items = []; // { name, img, url }
let overrides = [];
let result = null;

const natural = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

function addFiles(list) {
  const files = [...list].filter((f) => f.type.startsWith('image/')).sort((a, b) => natural.compare(a.name, b.name));
  let pending = files.length;
  for (const f of files) {
    const url = URL.createObjectURL(f), img = new Image();
    img.onload = () => {
      items.push({ name: f.name, img, url });
      if (--pending === 0) {
        items.sort((a, b) => natural.compare(a.name, b.name));
        overrides = [];
        renderTiles();
      }
    };
    img.src = url;
  }
}

function renderTiles() {
  const box = $('#tiles');
  box.innerHTML = '';
  items.forEach((it, i) => {
    const d = document.createElement('div');
    d.className = 'tile';
    d.innerHTML = `<img alt=""><div class="name"><span class="n">${i + 1}</span> · </div><div class="row"><button data-a="left" title="Move left">←</button><button data-a="right" title="Move right">→</button><button data-a="del" title="Remove">✕</button></div>`;
    d.querySelector('img').src = it.url;
    d.querySelector('.name').append(it.name);
    d.querySelector('[data-a=left]').onclick = () => move(i, -1);
    d.querySelector('[data-a=right]').onclick = () => move(i, 1);
    d.querySelector('[data-a=del]').onclick = () => { URL.revokeObjectURL(it.url); items.splice(i, 1); overrides = []; renderTiles(); };
    box.append(d);
  });
  $('#stitchBtn').disabled = items.length < 2;
}
function move(i, d) {
  const j = i + d;
  if (j < 0 || j >= items.length) return;
  [items[i], items[j]] = [items[j], items[i]];
  overrides = [];
  renderTiles();
}

const drop = $('#drop');
$('#files').onchange = (e) => { addFiles(e.target.files); e.target.value = ''; };
drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
drop.addEventListener('dragleave', () => drop.classList.remove('over'));
drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('over'); addFiles(e.dataTransfer.files); });
$('#optFeather').oninput = (e) => ($('#featherVal').textContent = e.target.value);

function badge(p) {
  if (p.manual) return '<span class="badge manual">your numbers</span>';
  const c = p.confidence;
  return c > 0.45 ? '<span class="badge good">good</span>' : c > 0.25 ? '<span class="badge ok">check it</span>' : '<span class="badge bad">poor – fix by hand</span>';
}

function run() {
  $('#status').textContent = 'Stitching… (a few seconds)';
  $('#stitchBtn').disabled = true;
  setTimeout(() => {
    try {
      const t0 = performance.now();
      const H = Math.min(2048, ...items.map((it) => it.img.height));
      const tiles = items.map((it) => tileFromImage(it.img, H));
      result = stitchTiles(tiles, {
        loop: $('#optLoop').checked, smartSeam: $('#optSeam').checked, matchColor: $('#optColor').checked,
        feather: +$('#optFeather').value, overrides,
      });
      show(result);
      $('#status').textContent = `Done in ${((performance.now() - t0) / 1000).toFixed(1)} s.`;
    } catch (err) {
      console.error(err);
      $('#status').textContent = `Something went wrong: ${err.message}`;
    }
    $('#stitchBtn').disabled = false;
  }, 30);
}

function show(r) {
  $('#result').classList.remove('hidden');
  const n = items.length;
  $('#pairs').innerHTML = '';
  r.pairs.forEach((p, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i + 1} → ${((i + 1) % n) + 1}</td><td><input type="number" min="1" data-k="ov"></td><td><input type="number" data-k="dy"></td><td>${badge(p)}</td>`;
    for (const inp of tr.querySelectorAll('input')) {
      inp.value = p[inp.dataset.k];
      inp.oninput = () => {
        overrides[i] = { ov: +tr.querySelector('[data-k=ov]').value, dy: +tr.querySelector('[data-k=dy]').value };
      };
    }
    $('#pairs').append(tr);
  });
  $('#size').textContent = `${r.width} × ${r.height} px · aspect ${(r.width / r.height).toFixed(2)} : 1`;

  const strip = $('#strip');
  strip.width = Math.min(2400, r.width);
  strip.height = Math.round((strip.width * r.height) / r.width);
  strip.getContext('2d').drawImage(r.canvas, 0, 0, strip.width, strip.height);

  // last 20% followed by first 20%
  const lc = $('#loopCheck'), part = Math.round(r.width * 0.2);
  lc.width = part * 2;
  lc.height = r.height;
  const x = lc.getContext('2d');
  x.drawImage(r.canvas, r.width - part, 0, part, r.height, 0, 0, part, r.height);
  x.drawImage(r.canvas, 0, 0, part, r.height, part, 0, part, r.height);
}

$('#stitchBtn').onclick = run;
$('#restitchBtn').onclick = run;
$('#autoBtn').onclick = () => { overrides = []; run(); };
const toBlob = () => new Promise((res) => result.canvas.toBlob(res, 'image/png'));
$('#downloadBtn').onclick = async () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(await toBlob());
  a.download = 'sp-creek-backdrop.png';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 10000);
};
$('#useBtn').onclick = async () => {
  $('#status').textContent = 'Saving…';
  if (await putFile('backdrop', await toBlob())) location.href = 'index.html';
  else $('#status').textContent = 'Could not save in this browser – use Download PNG, then Load backdrop in SP Creek.';
};
