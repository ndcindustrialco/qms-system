import { db } from '../lib/db';

async function main() {
  const rows = await db.kpiMaster.findMany({ take: 1, orderBy: { createdAt: 'desc' } });
  console.log(JSON.stringify({ ok: true, count: rows.length }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

