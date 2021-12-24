module.exports = {
  afterCreate: async (event) => {
    try {
      const { result } = event;
      await strapi.db.query('api::category.category').update({
        where: { id: result.category.id },
        data: {
          foodCount: result.category.foodCount + 1,
        },
      });
    } catch (ex) {
      strapi.log.error(ex)
    }
  },
};
