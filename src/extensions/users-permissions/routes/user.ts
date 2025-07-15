export default {
  routes: [
    {
      method: 'DELETE',
      path: '/user/me',
      handler: 'user.deleteAccount',
      config: {
        policies: [],
        middlewares: [],
        description: 'Eliminar cuenta de usuario (soft delete)',
        tags: ['User'],
      },
    },
    {
      method: 'PUT',
      path: '/user/emergency-pin',
      handler: 'user.updateEmergencyPin',
      config: {
        policies: [],
        middlewares: [],
        description: 'Actualizar el PIN de emergencia del usuario',
        tags: ['User'],
      },
    },
    {
      method: 'PUT',
      path: '/user/biometric',
      handler: 'user.updateBiometric',
      config: {
        policies: [],
        middlewares: [],
        description: 'Activar/desactivar autenticación biométrica',
        tags: ['User'],
      },
    },
    {
      method: 'GET',
      path: '/user/me',
      handler: 'user.me',
      config: {
        policies: [],
        middlewares: [],
        description: 'Obtener información del usuario autenticado',
        tags: ['User'],
      },
    },
  ],
}; 