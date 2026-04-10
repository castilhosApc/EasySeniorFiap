const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

/**
 * Força o Metro a resolver módulos APENAS dentro do node_modules do projeto.
 * Isso evita que pacotes instalados globalmente (ex: react-native-reanimated
 * em C:\Users\<user>\node_modules) sejam carregados acidentalmente,
 * causando conflitos de versão como o erro "Cannot find module react-native-worklets".
 */
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

module.exports = config;
