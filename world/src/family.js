export const DEFAULT_FAMILY_MODE = true;
const SIGNS = {
  'SP CREEK MERCANTILE': 'GENERAL STORE', SHERIFF: 'TOWN HALL', JAIL: 'TOWN HALL', BANK: 'SWEET SHOP',
};

export function familySign(text, on) {
  if (text == null) return text;
  const safe=String(text).replace(/THE GOLDEN SPUR (?:SALOON|CAFÉ)/gi,'HONEY BUN CAFÉ')
    .replace(/GUNSMITH/gi,'TOY SHOP').replace(/UNDERTAKER/gi,'BAKERY')
    .replace(/\bSALOON\b/gi,'HONEY BUN CAFÉ').replace(/\bGUNS\b/gi,'TOYS').replace(/\bJAIL\b/gi,'TOWN HALL');
  return on ? SIGNS[safe] || safe : safe;
}
