// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    // Crear categorías del sistema si no existen
    const systemCategories = [
      { name: 'Identificación', icon: 'id-card' },
      { name: 'Legal', icon: 'gavel' },
      { name: 'Médico', icon: 'medical' },
      { name: 'Contactos', icon: 'users' },
      { name: 'Financiero', icon: 'bank' },
      { name: 'Seguros', icon: 'shield' },
      { name: 'Educación', icon: 'graduation-cap' },
      { name: 'Trabajo', icon: 'briefcase' },
      { name: 'Vivienda', icon: 'home' },
      { name: 'Otros', icon: 'folder' }
    ];

    for (const category of systemCategories) {
      const existingCategory = await strapi.entityService.findMany('api::document-category.document-category', {
        filters: {
          name: category.name,
          systemCategory: true
        }
      });

      if (existingCategory.length === 0) {
        await strapi.entityService.create('api::document-category.document-category', {
          data: {
            ...category,
            systemCategory: true
          }
        });
        strapi.log.info(`Categoría del sistema creada: ${category.name}`);
      }
    }
  },
};
