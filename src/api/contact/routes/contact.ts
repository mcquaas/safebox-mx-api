export default {
  routes: [
    {
      method: 'GET',
      path: '/contacts',
      handler: 'contact.find',
      config: {
        policies: [],
        middlewares: [],
        description: 'Obtener todos los contactos del usuario',
        tags: ['Contact'],
      },
    },
    {
      method: 'GET',
      path: '/contacts/:id',
      handler: 'contact.findOne',
      config: {
        policies: [],
        middlewares: [],
        description: 'Obtener un contacto específico',
        tags: ['Contact'],
      },
    },
    {
      method: 'POST',
      path: '/contacts',
      handler: 'contact.create',
      config: {
        policies: [],
        middlewares: [],
        description: 'Crear un nuevo contacto de emergencia',
        tags: ['Contact'],
      },
    },
    {
      method: 'PUT',
      path: '/contacts/:id',
      handler: 'contact.update',
      config: {
        policies: [],
        middlewares: [],
        description: 'Actualizar un contacto existente',
        tags: ['Contact'],
      },
    },
    {
      method: 'DELETE',
      path: '/contacts/:id',
      handler: 'contact.delete',
      config: {
        policies: [],
        middlewares: [],
        description: 'Eliminar un contacto',
        tags: ['Contact'],
      },
    },
  ],
}; 