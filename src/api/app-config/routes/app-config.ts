export default {
  routes: [
    {
      method: 'GET',
      path: '/app-config',
      handler: 'app-config.find',
      config: {
        policies: [],
        middlewares: [],
        description: 'Get App Config (single type). Restrict to Admin only via permissions.',
        tags: ['App Config'],
      },
    },
    {
      method: 'PUT',
      path: '/app-config',
      handler: 'app-config.update',
      config: {
        policies: [],
        middlewares: [],
        description: 'Update App Config (single type). Restrict to Admin only via permissions.',
        tags: ['App Config'],
      },
    },
  ],
};
