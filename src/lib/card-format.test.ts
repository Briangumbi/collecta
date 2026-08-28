import { formatCardNumber, formatExpiry, isCardNumberValid, isCvcValid, isExpiryValid } from './card-format';

describe('formatCardNumber', () => {
  it('groups digits into 4s', () => {
    expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242');
  });

  it('strips non-digit characters before grouping', () => {
    expect(formatCardNumber('4242-4242 4242.4242')).toBe('4242 4242 4242 4242');
  });

  it('caps at 16 digits', () => {
    expect(formatCardNumber('42424242424242421234')).toBe('4242 4242 4242 4242');
  });
});

describe('formatExpiry', () => {
  it('inserts a slash after 2 digits', () => {
    expect(formatExpiry('1225')).toBe('12/25');
  });

  it('leaves 2 or fewer digits unslashed', () => {
    expect(formatExpiry('12')).toBe('12');
  });

  it('caps at 4 digits', () => {
    expect(formatExpiry('122599')).toBe('12/25');
  });
});

describe('isCardNumberValid', () => {
  it('requires exactly 16 digits, spaces ignored', () => {
    expect(isCardNumberValid('4242 4242 4242 4242')).toBe(true);
    expect(isCardNumberValid('4242 4242 4242')).toBe(false);
  });
});

describe('isExpiryValid', () => {
  it('accepts a well-formed MM/YY with a valid month', () => {
    expect(isExpiryValid('01/30')).toBe(true);
    expect(isExpiryValid('12/30')).toBe(true);
  });

  it('rejects an out-of-range month', () => {
    expect(isExpiryValid('00/30')).toBe(false);
    expect(isExpiryValid('13/30')).toBe(false);
  });

  it('rejects the wrong shape', () => {
    expect(isExpiryValid('1/30')).toBe(false);
    expect(isExpiryValid('0130')).toBe(false);
  });
});

describe('isCvcValid', () => {
  it('requires exactly 3 digits', () => {
    expect(isCvcValid('123')).toBe(true);
    expect(isCvcValid('12')).toBe(false);
    expect(isCvcValid('1234')).toBe(false);
    expect(isCvcValid('12a')).toBe(false);
  });
});
