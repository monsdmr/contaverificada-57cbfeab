const domains = [
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
];

function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function generateRandomEmail(name?: string): string {
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const randomNum = Math.floor(Math.random() * 9000) + 100;

  if (name && name.trim().length > 2) {
    const cleaned = removeAccents(name.trim().toLowerCase()).replace(/[^a-z\s]/g, '');
    const parts = cleaned.split(/\s+/).filter(Boolean);

    if (parts.length >= 2) {
      const variants = [
        `${parts[0]}.${parts[parts.length - 1]}${randomNum}`,
        `${parts[0]}${parts[parts.length - 1]}${randomNum}`,
        `${parts[0]}_${parts[parts.length - 1]}${randomNum}`,
        `${parts[0]}.${parts[1]}${randomNum}`,
      ];
      const local = variants[Math.floor(Math.random() * variants.length)];
      return `${local}@${domain}`;
    }

    return `${parts[0]}${randomNum}@${domain}`;
  }

  const prefixes = ['usuario', 'cliente', 'contato', 'user', 'pagamento'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  return `${prefix}${randomNum}@${domain}`;
}
