export default {
  routes: [
    {
      method: 'GET',
      path: '/documents',
      handler: 'document.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/documents',
      handler: 'document.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/documents/:id',
      handler: 'document.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/documents/:id',
      handler: 'document.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/documents/stats',
      handler: 'document.stats',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 