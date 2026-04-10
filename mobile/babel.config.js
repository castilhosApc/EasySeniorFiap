module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      // Desabilita o plugin do react-native-reanimated para evitar conflito
      // com instalações globais incompatíveis. Não usamos reanimated neste projeto.
      ['babel-preset-expo', { reanimated: false }],
    ],
  };
};
