export default {
  routes: [
    {
      method: 'GET',
      path: '/auth-logs',
      handler: 'auth-log.find',
      config: {
        policies: [],
        middlewares: [],
        description: 'Obtener logs de autenticación del usuario',
        tags: ['Auth Log'],
      },
    },
    {
      method: 'POST',
      path: '/auth-logs',
      handler: 'auth-log.create',
      config: {
        policies: [],
        middlewares: [],
        description: 'Crear un log de autenticación',
        tags: ['Auth Log'],
      },
    },
  ],
};

