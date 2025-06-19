module.exports = async (ctx, next) => {
  // Permitir acceso público a los endpoints de invitados
  if (ctx.request.url.startsWith('/api/guests')) {
    return await next();
  }
  
  // Para otras rutas, requerir autenticación
  if (!ctx.state.user) {
    return ctx.unauthorized('Authentication required');
  }
  
  return await next();
};
