export default {
  routes: [
    {
      method: 'POST',
      path: '/chat/message',
      handler: 'chat.message',
      config: {
        policies: [],
        middlewares: [],
        description: 'Enviar mensaje al asistente IA de MySafeBox (proxy seguro a OpenAI)',
        tags: ['Chat'],
      },
    },
  ],
};
