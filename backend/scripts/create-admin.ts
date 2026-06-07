/**
 * Usage:
 *   pnpm run admin:create -- --email=root@dbbconnect.id --name=Root --password=changeme --phone=+6281234567890
 *
 * Idempotent: skips if user with email already exists.
 */
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

function parseArgs(argv: string[]) {
  const out: Record<string, string> = {};
  for (const arg of argv) {
    const m = arg.match(/^--([^=]+)=(.*)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const email = args.email ?? process.env.ADMIN_EMAIL;
  const name = args.name ?? process.env.ADMIN_NAME ?? 'Root Admin';
  const password = args.password ?? process.env.ADMIN_PASSWORD;
  const phone = args.phone ?? process.env.ADMIN_PHONE;

  if (!email || !password || !phone) {
    console.error(
      'Missing required args. Usage:\n' +
        '  pnpm run admin:create -- --email=... --name=... --password=... --phone=...',
    );
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log(`Admin with email ${email} already exists. Skipping.`);
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        phoneNumber: phone,
        role: UserRole.ADMIN,
      },
      select: { id: true, email: true, role: true },
    });
    console.log(`Created admin: ${JSON.stringify(user)}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
