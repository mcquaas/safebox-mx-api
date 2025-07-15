export default {
  routes: [
    {
      method: 'POST',
      path: '/emergency/trigger',
      handler: 'emergency.trigger',
      config: {
        policies: [],
        middlewares: [],
        description: 'Activar el botón de emergencia y notificar contactos designados',
        tags: ['Emergency'],
      },
    },
    {
      method: 'POST',
      path: '/emergency/notify/:contactId',
      handler: 'emergency.notifyContact',
      config: {
        policies: [],
        middlewares: [],
        description: 'Notificar a un contacto específico sobre una emergencia',
        tags: ['Emergency'],
      },
    },
  ],
}; 