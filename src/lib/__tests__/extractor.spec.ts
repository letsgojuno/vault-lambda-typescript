import { extract } from '../extractor';
const prefix = 'SECRET';

process.env[`${prefix}_VAULT_VALUE`] = 'path/to/entry/in/vault:key';
process.env[`${prefix}_VAULT_VALUE_INVALID`] = 'path/to/entry/with/missing/key';

test('extractor success', () => {
  expect(extract(prefix)).toEqual([
    {
      envVar: 'VAULT_VALUE',
      path: 'path/to/entry/in/vault',
      key: 'key'
    }
  ]);
});
