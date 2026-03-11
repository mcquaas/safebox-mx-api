import { mergeConfig } from 'vite';

export default (config) => {
  const userConfig = {
    server: {
      allowedHosts: ['api.mysafebox.org'],
    },
  };

  return mergeConfig(config, userConfig);
};
