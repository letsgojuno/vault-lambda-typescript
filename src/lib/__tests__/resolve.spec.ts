import { resolve } from '../resolve';

test('resolve', () => {
  return expect(
    resolve([
      {
        envVar: 'foo',
        path: 'asdf',
        key: 'asdf'
      }
    ])
  ).resolves.toEqual([123]);
});
