const SIGNS = {
  'THE GOLDEN SPUR SALOON': 'THE GOLDEN SPUR CAFÉ',
  GUNSMITH: 'TOY SHOP', UNDERTAKER: 'BAKERY', SALOON: 'CAFÉ', GUNS: 'TOYS',
};

export function familySign(text, on) {
  return on ? SIGNS[text] || text : text;
}
