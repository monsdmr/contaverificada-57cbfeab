const DOMAINS = [
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'yahoo.com.br',
  'yahoo.com',
  'uol.com.br',
  'bol.com.br',
  'terra.com.br',
  'ig.com.br',
  'live.com',
  'icloud.com',
  'msn.com',
  'globomail.com',
  'r7.com',
];

// Domain weights — gmail/hotmail much more common
const DOMAIN_WEIGHTS = [35, 20, 12, 8, 5, 4, 4, 3, 2, 2, 2, 1, 1, 1];

function weightedRandom(weights: number[]): number {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Realistic suffix: birth year, short number, or year+digits
function randomSuffix(): string {
  const r = Math.random();
  if (r < 0.35) return String(rand(1970, 2003));          // birth year: 1970-2003
  if (r < 0.60) return String(rand(1, 999));               // short number: 1-999
  if (r < 0.80) return String(rand(1000, 9999));           // 4-digit number
  return `${rand(1980, 2000)}${String(rand(1, 99)).padStart(2, '0')}`; // year+2digits
}

export function generateRandomEmail(name?: string): string {
  const domain = DOMAINS[weightedRandom(DOMAIN_WEIGHTS)];
  const suffix = randomSuffix();

  if (name && name.trim().length > 2) {
    const cleaned = removeAccents(name.trim().toLowerCase()).replace(/[^a-z\s]/g, '');
    const parts = cleaned.split(/\s+/).filter(Boolean);

    if (parts.length >= 2) {
      const first = parts[0];
      const last = parts[parts.length - 1];
      const mid = parts[1] !== last ? parts[1] : null;

      const variants = [
        `${first}.${last}${suffix}`,
        `${first}${last}${suffix}`,
        `${first}_${last}${suffix}`,
        `${first}.${last}`,
        `${first}${suffix}`,
        ...(mid ? [`${first}.${mid}${suffix}`, `${first[0]}${last}${suffix}`] : []),
      ];
      const local = variants[Math.floor(Math.random() * variants.length)];
      return `${local}@${domain}`;
    }

    // Single name
    const variants = [
      `${parts[0]}${suffix}`,
      `${parts[0]}.${suffix}`,
      `${parts[0]}_${suffix}`,
    ];
    return `${variants[Math.floor(Math.random() * variants.length)]}@${domain}`;
  }

  // Fallback: common Brazilian first names as prefix
  const names = [
    'ana', 'maria', 'joao', 'jose', 'carlos', 'paulo', 'lucas',
    'gabriel', 'rafaela', 'fernanda', 'amanda', 'pedro', 'marcos',
    'rodrigo', 'patricia', 'juliana', 'anderson', 'fabio', 'bruna',
    'diego', 'thiago', 'leticia', 'camila', 'felipe', 'renata',
  ];
  const name2 = names[Math.floor(Math.random() * names.length)];
  return `${name2}${suffix}@${domain}`;
}
