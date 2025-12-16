export default {
  routes: [
    {
      method: 'GET',
      path: '/document-categories',
      handler: 'document-category.find',
      config: {
        policies: [],
        middlewares: [],
        description: 'Obtener todas las categorías de documentos (sistema y personalizadas)',
        tags: ['Document Category'],
      },
    },
    {
      method: 'GET',
      path: '/document-categories/:id',
      handler: 'document-category.findOne',
      config: {
        policies: [],
        middlewares: [],
        description: 'Obtener una categoría específica',
        tags: ['Document Category'],
      },
    },
    {
      method: 'POST',
      path: '/document-categories',
      handler: 'document-category.create',
      config: {
        policies: [],
        middlewares: [],
        description: 'Crear una nueva categoría personalizada',
        tags: ['Document Category'],
      },
    },
    {
      method: 'PUT',
      path: '/document-categories/:id',
      handler: 'document-category.update',
      config: {
        policies: [],
        middlewares: [],
        description: 'Actualizar una categoría personalizada',
        tags: ['Document Category'],
      },
    },
    {
      method: 'DELETE',
      path: '/document-categories/:id',
      handler: 'document-category.delete',
      config: {
        policies: [],
        middlewares: [],
        description: 'Eliminar una categoría personalizada',
        tags: ['Document Category'],
      },
    },
  ],
};

