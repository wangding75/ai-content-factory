import 'reflect-metadata';

// Provide default env vars so ConfigModule.forRoot validates cleanly in tests
// (real values are not needed since PrismaService is always mocked)
process.env['DATABASE_URL'] ??= 'postgresql://test:test@localhost:5432/test';
