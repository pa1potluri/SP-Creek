export const DEFAULT_FAMILY_MODE = true;
const SIGNS = {
  'THE GOLDEN SPUR SALOON': 'THE GOLDEN SPUR CAFÉ',
  GUNSMITH: 'TOY SHOP', UNDERTAKER: 'BAKERY', SALOON: 'CAFÉ', GUNS: 'TOYS',
  'DUSTY HOLLOW MERCANTILE': 'GENERAL STORE', SHERIFF: 'TOWN HALL', JAIL: 'TOWN HALL', BANK: 'SWEET SHOP',
};

export function familySign(text, on) {
  return on ? SIGNS[text] || text : text;
}
