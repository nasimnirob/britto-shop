module.exports = {
  locales: ['en', 'bn'],
  output: 'src/locales/$LOCALE/translation.json',
  defaultValue: (lng, ns, key) => key,
  keySeparator: false,
  namespaceSeparator: false,
  createOldCatalogs: false,
  keepRemoved: false,
};
