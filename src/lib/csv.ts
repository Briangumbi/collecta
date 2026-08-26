/**
 * Minimal RFC 4180-ish CSV parser — handles quoted fields (including embedded
 * commas/newlines and "" escaped quotes) without pulling in a dependency for
 * what's otherwise a straightforward format.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let sawAnyField = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      sawAnyField = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
      sawAnyField = true;
    } else if (char === '\r') {
      // skip — handled by the following \n
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      sawAnyField = false;
    } else {
      field += char;
      sawAnyField = true;
    }
  }
  if (sawAnyField || field.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ''));
}

/** Finds a header column by name, case/whitespace-insensitive, trying each alias in order. */
export function findColumn(header: string[], ...aliases: string[]) {
  const normalized = header.map((h) => h.trim().toLowerCase());
  for (const alias of aliases) {
    const idx = normalized.indexOf(alias);
    if (idx !== -1) return idx;
  }
  return -1;
}
