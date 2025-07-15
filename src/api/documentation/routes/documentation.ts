export default {
  routes: [
    {
      method: 'GET',
      path: '/documentation',
      handler: 'documentation.index',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
        description: 'Interfaz de documentación Swagger UI',
        tags: ['Documentation'],
      },
    },
    {
      method: 'GET',
      path: '/documentation/spec',
      handler: 'documentation.spec',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
        description: 'Especificación OpenAPI/Swagger en formato JSON',
        tags: ['Documentation'],
      },
    },
  ],
}; 