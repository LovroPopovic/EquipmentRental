const { withAppBuildGradle } = require('@expo/config-plugins');

const withAppAuth = (config, { appAuthRedirectScheme }) => {
  return withAppBuildGradle(config, (config) => {
    const buildGradle = config.modResults.contents;
    
    // Check if manifestPlaceholders already exists
    if (!buildGradle.includes('manifestPlaceholders')) {
      // Find the defaultConfig section and add manifestPlaceholders
      const defaultConfigRegex = /(defaultConfig\s*\{[^}]*)/;
      
      if (buildGradle.match(defaultConfigRegex)) {
        config.modResults.contents = buildGradle.replace(
          defaultConfigRegex,
          `$1
        manifestPlaceholders = [
            appAuthRedirectScheme: '${appAuthRedirectScheme}'
        ]`
        );
      } else {
        console.warn('Could not find defaultConfig in build.gradle');
      }
    }
    
    return config;
  });
};

module.exports = withAppAuth;