// Menjadikan sebuah akun sebagai Administrator SIMUDA (boleh mengelola seluruh aplikasi).
// Jalankan: npm run jadikan-admin
// Bisa juga tanpa pertanyaan lewat variabel ADMIN_EMAIL dan ADMIN_NAMA.
//
// Akun dipindahkan ke data pengurus khusus "Administrator" (wilayah Pimpinan), terpisah dari
// struktur pengurus Bendlay 2/4. Data pengurus yang sebelumnya terhubung tidak dihapus.

import "dotenv/config";
import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL! }) });

async function main() {
  const tanya = createInterface({ input: stdin, output: stdout });

  const email = (process.env.ADMIN_EMAIL ?? (await tanya.question("Email akun yang dijadikan administrator: "))).trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email }, include: { pengurus: true } });
  if (!user) throw new Error(`Akun dengan email ${email} tidak ditemukan. Buat dulu dengan: npm run akun`);
  if (user.pengurus?.peran === "admin") throw new Error(`${email} sudah administrator.`);

  const namaDefault = user.pengurus?.nama ?? user.name;
  const jawab = process.env.ADMIN_NAMA ?? (await tanya.question(`Nama yang tampil (Enter = ${namaDefault}): `));
  tanya.close();
  const nama = jawab.trim() || namaDefault;

  await prisma.$transaction(async (tx) => {
    // Lepas akun dari data pengurus sebelumnya (datanya tetap ada, hanya tidak terhubung ke akun ini).
    if (user.pengurus) await tx.pengurus.update({ where: { id: user.pengurus.id }, data: { userId: null } });
    await tx.pengurus.create({
      data: { nama, jabatan: "Administrator", wilayah: "pimpinan", peran: "admin", userId: user.id },
    });
    await tx.user.update({ where: { id: user.id }, data: { name: nama } });
    await tx.auditLog.create({
      data: {
        userId: user.id,
        tabel: "pengurus",
        recordId: user.id,
        aksi: "ubah",
        dataLama: user.pengurus ? { pengurusSebelumnya: user.pengurus.id, peran: user.pengurus.peran } : undefined,
        dataBaru: { peran: "admin", nama },
        alasan: "Dijadikan administrator lewat skrip",
      },
    });
  });

  console.log(`\n${email} sekarang Administrator (${nama}). Keluar lalu masuk lagi di aplikasi supaya perubahan terasa.`);
}

main()
  .catch((e) => {
    console.error("\nGagal:", e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
