export default {
  routes: [
    {
      method: 'GET',
      path: '/emergency-logs',
      handler: 'emergency-log.find',
      config: {
        policies: [],
        middlewares: [],
        description: 'Obtener logs de emergencia del usuario',
        tags: ['Emergency Log'],
      },
    },
    {
      method: 'GET',
      path: '/emergency-logs/:id',
      handler: 'emergency-log.findOne',
      config: {
        policies: [],
        middlewares: [],
        description: 'Obtener un log de emergencia específico',
        tags: ['Emergency Log'],
      },
    },
  ],
};

