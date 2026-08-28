import { findColumn, parseCsv } from './csv';

describe('parseCsv', () => {
  it('parses a simple header + rows', () => {
    expect(parseCsv('name,email\nJane,jane@acme.test\nTom,tom@heliocraft.test')).toEqual([
      ['name', 'email'],
      ['Jane', 'jane@acme.test'],
      ['Tom', 'tom@heliocraft.test'],
    ]);
  });

  it('handles quoted fields with embedded commas', () => {
    expect(parseCsv('name,company\nJane,"Acme, Co"')).toEqual([
      ['name', 'company'],
      ['Jane', 'Acme, Co'],
    ]);
  });

  it('handles "" as an escaped quote inside a quoted field', () => {
    expect(parseCsv('name\n"Jane ""JJ"" Doe"')).toEqual([['name'], ['Jane "JJ" Doe']]);
  });

  it('handles embedded newlines inside a quoted field', () => {
    expect(parseCsv('note\n"line one\nline two"')).toEqual([['note'], ['line one\nline two']]);
  });

  it('treats \\r\\n the same as \\n', () => {
    expect(parseCsv('a,b\r\n1,2\r\n')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });

  it('drops rows that are entirely blank', () => {
    expect(parseCsv('a,b\n1,2\n\n3,4')).toEqual([
      ['a', 'b'],
      ['1', '2'],
      ['3', '4'],
    ]);
  });

  it('still includes a final row with no trailing newline', () => {
    expect(parseCsv('a,b\n1,2')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });

  it('returns an empty array for empty input', () => {
    expect(parseCsv('')).toEqual([]);
  });
});

describe('findColumn', () => {
  const header = [' Full Name ', 'Email Address', 'Company'];

  it('matches case- and whitespace-insensitively', () => {
    expect(findColumn(header, 'full name')).toBe(0);
  });

  it('tries aliases in order and returns the first match', () => {
    expect(findColumn(header, 'name', 'full name')).toBe(0);
    expect(findColumn(header, 'email', 'email address')).toBe(1);
  });

  it('returns -1 when nothing matches', () => {
    expect(findColumn(header, 'phone')).toBe(-1);
  });
});
