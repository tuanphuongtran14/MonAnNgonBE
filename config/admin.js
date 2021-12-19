module.exports = ({ env }) => ({
  auth: {
    secret: env('STRAPI_JWT_SECRET', 'dc4185349ed39479d511ff4c51c2aecf'),
  },
});
