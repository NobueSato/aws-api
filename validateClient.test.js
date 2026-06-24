const { validateClient } = require('./validateClient');

describe('validateClient', () => {

  test('returns valid for correct client data', () => {
    const client = { name: 'Capital Markets', department: 'Trading' };
    const result = validateClient(client);
    expect(result.valid).toBe(true);
  });

  test('returns error when client is missing', () => {
    const result = validateClient(null);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Client data is required');
  });

  test('returns error when name is empty', () => {
    const client = { name: '', department: 'Trading' };
    const result = validateClient(client);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Name is required');
  });

  test('returns error when department is missing', () => {
    const client = { name: 'Capital Markets' };
    const result = validateClient(client);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Department is required');
  });

});