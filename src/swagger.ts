import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'SafeBox MX API',
    version: '1.0.0',
    description: 'API para SafeBox MX - Bóveda digital segura para almacenar documentos importantes con cifrado militar, botón de emergencia y contactos designados. Enfocado en personas con vínculos entre México y EE.UU.',
    contact: {
      name: 'SafeBox MX Team',
      email: 'soporte@mysafebox.org',
      url: 'https://mysafebox.org'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'https://api.mysafebox.org/api',
      description: 'Production server'
    },
    {
      url: 'http://localhost:1337/api',
      description: 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          username: { type: 'string' },
          email: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          phone: { type: 'string' },
          emergencyPin: { type: 'string' },
          biometricEnabled: { type: 'boolean' },
          confirmed: { type: 'boolean' },
          blocked: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Document: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          title: { type: 'string' },
          description: { type: 'string' },
          file: { type: 'object' },
          uploadedAt: { type: 'string', format: 'date-time' },
          visibleToContacts: { type: 'boolean' },
          emergencyOnly: { type: 'boolean' },
          category: { $ref: '#/components/schemas/DocumentCategory' },
          owner: { $ref: '#/components/schemas/User' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      DocumentCategory: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          icon: { type: 'string' },
          systemCategory: { type: 'boolean' },
          owner: { $ref: '#/components/schemas/User' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Contact: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          fullName: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string' },
          relationship: { type: 'string' },
          canReceiveEmergencyAlert: { type: 'boolean' },
          canViewSharedDocs: { type: 'boolean' },
          owner: { $ref: '#/components/schemas/User' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      EmergencyLog: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          triggeredAt: { type: 'string', format: 'date-time' },
          location: { type: 'string' },
          latitude: { type: 'number' },
          longitude: { type: 'number' },
          user: { $ref: '#/components/schemas/User' },
          contactNotified: { $ref: '#/components/schemas/Contact' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      AuthLog: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          method: { type: 'string', enum: ['password', 'biometric', 'pin'] },
          success: { type: 'boolean' },
          timestamp: { type: 'string', format: 'date-time' },
          ipAddress: { type: 'string' },
          userAgent: { type: 'string' },
          user: { $ref: '#/components/schemas/User' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              status: { type: 'integer' },
              name: { type: 'string' },
              message: { type: 'string' },
              details: { type: 'object' }
            }
          }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  paths: {
    '/auth/local/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Registrar nuevo usuario',
        description: 'Crear una nueva cuenta de usuario',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'email', 'password'],
                properties: {
                  username: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 6 },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  phone: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Usuario registrado exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    jwt: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Error de validación',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        },
        security: []
      }
    },
    '/auth/local': {
      post: {
        tags: ['Authentication'],
        summary: 'Iniciar sesión',
        description: 'Autenticar usuario con email/username y contraseña',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['identifier', 'password'],
                properties: {
                  identifier: { type: 'string', description: 'Email o username' },
                  password: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Autenticación exitosa',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    jwt: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Credenciales inválidas',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        },
        security: []
      }
    },
    '/users/me': {
      get: {
        tags: ['User'],
        summary: 'Obtener usuario actual',
        description: 'Obtener información del usuario autenticado',
        responses: {
          '200': {
            description: 'Información del usuario',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' }
              }
            }
          },
          '401': {
            description: 'No autorizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/user/me': {
      get: {
        tags: ['User'],
        summary: 'Obtener perfil de usuario',
        description: 'Obtener información completa del perfil del usuario autenticado',
        responses: {
          '200': {
            description: 'Perfil del usuario',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' }
              }
            }
          },
          '401': {
            description: 'No autorizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      },
      delete: {
        tags: ['User'],
        summary: 'Eliminar cuenta',
        description: 'Eliminar cuenta de usuario (soft delete)',
        responses: {
          '200': {
            description: 'Cuenta eliminada exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' }
                  }
                }
              }
            }
          },
          '401': {
            description: 'No autorizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/user/emergency-pin': {
      put: {
        tags: ['User'],
        summary: 'Actualizar PIN de emergencia',
        description: 'Actualizar el PIN de emergencia del usuario',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['emergencyPin'],
                properties: {
                  emergencyPin: { type: 'string', minLength: 4, maxLength: 6 }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'PIN actualizado exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Error de validación',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/user/biometric': {
      put: {
        tags: ['User'],
        summary: 'Configurar biométrica',
        description: 'Activar/desactivar autenticación biométrica',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['biometricEnabled'],
                properties: {
                  biometricEnabled: { type: 'boolean' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Configuración actualizada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/documents': {
      get: {
        tags: ['Document'],
        summary: 'Obtener documentos',
        description: 'Obtener todos los documentos del usuario autenticado',
        parameters: [
          {
            name: 'category',
            in: 'query',
            description: 'Filtrar por categoría',
            required: false,
            schema: { type: 'integer' }
          },
          {
            name: 'search',
            in: 'query',
            description: 'Buscar por título',
            required: false,
            schema: { type: 'string' }
          },
          {
            name: 'emergencyOnly',
            in: 'query',
            description: 'Solo documentos de emergencia',
            required: false,
            schema: { type: 'boolean' }
          }
        ],
        responses: {
          '200': {
            description: 'Lista de documentos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Document' }
                    },
                    meta: {
                      type: 'object',
                      properties: {
                        pagination: {
                          type: 'object',
                          properties: {
                            page: { type: 'integer' },
                            pageSize: { type: 'integer' },
                            pageCount: { type: 'integer' },
                            total: { type: 'integer' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Document'],
        summary: 'Crear documento',
        description: 'Crear un nuevo documento',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['title', 'file'],
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  file: { type: 'string', format: 'binary' },
                  category: { type: 'integer' },
                  visibleToContacts: { type: 'boolean' },
                  emergencyOnly: { type: 'boolean' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Documento creado exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/Document' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Error de validación',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/documents/{id}': {
      put: {
        tags: ['Document'],
        summary: 'Actualizar documento',
        description: 'Actualizar un documento existente',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  visibleToContacts: { type: 'boolean' },
                  emergencyOnly: { type: 'boolean' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Documento actualizado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/Document' }
                  }
                }
              }
            }
          },
          '404': {
            description: 'Documento no encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      },
      delete: {
        tags: ['Document'],
        summary: 'Eliminar documento',
        description: 'Eliminar un documento',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        responses: {
          '200': {
            description: 'Documento eliminado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/Document' }
                  }
                }
              }
            }
          },
          '404': {
            description: 'Documento no encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/documents/stats': {
      get: {
        tags: ['Document'],
        summary: 'Estadísticas de documentos',
        description: 'Obtener estadísticas de documentos del usuario',
        responses: {
          '200': {
            description: 'Estadísticas de documentos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    totalDocuments: { type: 'integer' },
                    totalCategories: { type: 'integer' },
                    emergencyDocuments: { type: 'integer' },
                    sharedDocuments: { type: 'integer' },
                    documentsByCategory: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          category: { type: 'string' },
                          count: { type: 'integer' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/document-categories': {
      get: {
        tags: ['Document Category'],
        summary: 'Obtener categorías',
        description: 'Obtener todas las categorías de documentos',
        responses: {
          '200': {
            description: 'Lista de categorías',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/DocumentCategory' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Document Category'],
        summary: 'Crear categoría',
        description: 'Crear una nueva categoría de documentos',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string' },
                  icon: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Categoría creada exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/DocumentCategory' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/contacts': {
      get: {
        tags: ['Contact'],
        summary: 'Obtener contactos',
        description: 'Obtener todos los contactos del usuario',
        responses: {
          '200': {
            description: 'Lista de contactos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Contact' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Contact'],
        summary: 'Crear contacto',
        description: 'Crear un nuevo contacto de emergencia',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fullName', 'phone'],
                properties: {
                  fullName: { type: 'string' },
                  phone: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  relationship: { type: 'string' },
                  canReceiveEmergencyAlert: { type: 'boolean' },
                  canViewSharedDocs: { type: 'boolean' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Contacto creado exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/Contact' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/emergency/trigger': {
      post: {
        tags: ['Emergency'],
        summary: 'Activar emergencia',
        description: 'Activar el botón de emergencia y notificar contactos designados',
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  location: { type: 'string' },
                  latitude: { type: 'number' },
                  longitude: { type: 'number' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Emergencia activada exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    emergencyLog: { $ref: '#/components/schemas/EmergencyLog' },
                    notifiedContacts: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Contact' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/emergency/notify/{contactId}': {
      post: {
        tags: ['Emergency'],
        summary: 'Notificar contacto',
        description: 'Notificar a un contacto específico sobre una emergencia',
        parameters: [
          {
            name: 'contactId',
            in: 'path',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        responses: {
          '200': {
            description: 'Contacto notificado exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    contact: { $ref: '#/components/schemas/Contact' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/emergency-logs': {
      get: {
        tags: ['Emergency'],
        summary: 'Obtener logs de emergencia',
        description: 'Obtener historial de activaciones de emergencia',
        responses: {
          '200': {
            description: 'Historial de emergencias',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/EmergencyLog' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/auth-logs': {
      get: {
        tags: ['Auth'],
        summary: 'Obtener logs de autenticación',
        description: 'Obtener historial de intentos de autenticación',
        responses: {
          '200': {
            description: 'Historial de autenticación',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/AuthLog' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

const options = {
  swaggerDefinition,
  apis: [], // No necesitamos esto ya que definimos todo en swaggerDefinition
};

export const swaggerSpec = swaggerJSDoc(options); 