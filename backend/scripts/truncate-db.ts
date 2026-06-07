/**
 * Truncate all application tables. Keeps schema, drops data.
 *
 * Run: pnpm run db:truncate
 *
 * Safety: refuses to run when NODE_ENV=production.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to truncate in production.');
    process.exit(1);
  }

  // Optional --yes flag skips confirmation.
  if (!process.argv.includes('--yes')) {
    const url = process.env.DATABASE_URL ?? '(unset)';
    console.error(
      `\nThis will TRUNCATE all tables in:\n  ${url}\n\nRe-run with --yes to confirm:\n  pnpm run db:truncate -- --yes\n`,
    );
    process.exit(1);
  }

  // Discover all public tables except prisma_migrations.
  const rows = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename != '_prisma_migrations'
  `;

  if (rows.length === 0) {
    console.log('No tables to truncate.');
    return;
  }

  const tables = rows.map((r) => `"public"."${r.tablename}"`).join(', ');
  const stmt = `TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE;`;

  console.log(`Truncating ${rows.length} table(s)...`);
  await prisma.$executeRawUnsafe(stmt);
  console.log('Done. Tables emptied, identities restarted.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
