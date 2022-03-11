const { getShowName } = require('./index');

test('show dir name is reduced', () => {
  const dirName = 'family.guy.s20e10.1080p.web.h264-cakes.nfo';
  const reducedDirName = getShowName(dirName);
  expect(reducedDirName).toBe('family.guy.s20');
});
