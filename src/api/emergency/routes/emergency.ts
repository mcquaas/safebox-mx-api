export default {
  routes: [
    {
      method: 'POST',
      path: '/emergency/trigger',
      handler: 'emergency.trigger',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/emergency/notify/:contactId',
      handler: 'emergency.notifyContact',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 