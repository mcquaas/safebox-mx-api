export default {
  routes: [
    {
      method: 'GET',
      path: '/documents',
      handler: 'document.find',
      config: {
        policies: [],
        middlewares: [],
        description: 'Obtener todos los documentos del usuario autenticado',
        tags: ['Document'],
      },
    },
    {
      method: 'POST',
      path: '/documents',
      handler: 'document.create',
      config: {
        policies: [],
        middlewares: [],
        description: 'Crear un nuevo documento',
        tags: ['Document'],
      },
    },
    {
      method: 'PUT',
      path: '/documents/:id',
      handler: 'document.update',
      config: {
        policies: [],
        middlewares: [],
        description: 'Actualizar un documento existente',
        tags: ['Document'],
      },
    },
    {
      method: 'DELETE',
      path: '/documents/:id',
      handler: 'document.delete',
      config: {
        policies: [],
        middlewares: [],
        description: 'Eliminar un documento',
        tags: ['Document'],
      },
    },
    {
      method: 'GET',
      path: '/documents/stats',
      handler: 'document.stats',
      config: {
        policies: [],
        middlewares: [],
        description: 'Obtener estadísticas de documentos del usuario',
        tags: ['Document'],
      },
    },
  ],
}; 