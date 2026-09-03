export const jwtConfig = {
  customerSecret: process.env.JWT_CUSTOMER_SECRET || 'crochet_customer_secret_key_2026_super_safe',
  customerExpiresIn: process.env.JWT_CUSTOMER_EXPIRES_IN || '7d',
  adminSecret: process.env.JWT_ADMIN_SECRET || 'crochet_admin_secret_key_2026_super_safe',
  adminExpiresIn: process.env.JWT_ADMIN_EXPIRES_IN || '1d',
};
