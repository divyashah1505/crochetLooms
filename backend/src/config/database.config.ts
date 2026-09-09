import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  const databaseUrl = process.env.DATABASE_URL;

  return {
    type: 'postgres',
    ...(databaseUrl
      ? { url: databaseUrl }
      : {
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USERNAME || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: process.env.DB_DATABASE || 'crochet_db',
        }),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: process.env.DB_SYNCHRONIZE === 'true' || true,
    logging: false,
    extra: {
      ssl:
        process.env.DB_SSL === 'true' ||
        (databaseUrl && !databaseUrl.includes('localhost') && !databaseUrl.includes('127.0.0.1'))
          ? { rejectUnauthorized: false }
          : false,
    },
  };
};
