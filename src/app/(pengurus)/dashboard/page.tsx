import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { CalendarCheck, HandHeart, PhoneCall, UserCheck, Users, UserRound } from "lucide-react";
import { DonatKomposisi } from "@/components/beranda/DonatKomposisi";
import { GrafikKehadiran, type TitikKehadiran } from "@/components/beranda/GrafikKehadiran";
import { HeroBeranda } from "@/components/beranda/HeroBeranda";
import { KalenderPekan } from "@/components/beranda/KalenderPekan";
import { KartuSaldo } from "@/components/beranda/KartuSaldo";
import { BarisStat, KotakStat } from "@/components/beranda/KotakStat";
import { daftarPeserta, dataAbsensiContoh, dataSodaqohContoh } from "@/lib/mock";
import { requireRole } from "@/lib/pengguna";
import { akhirBulan, awalBulan, bacaPeriode } from "@/lib/periode";
import { kategoriPeserta, tanggalHariIniWib } from "@/lib/peserta";
import { ringkasSodaqoh } from "@/lib/sodaqoh";
import {
  formatTanggal,
  geserTanggal,
  hariDalamPekan,
  perluDihubungi,
  ringkasKehadiran,
  seninPekanIni,
} from "@/lib/sesi";

export const metadata: Metadata = {
  title: "Beranda · SIMUDA",
};

export default async function DashboardPage(props: PageProps<"/dashboard">) {
  // Beranda menampilkan data hari ini, jadi dibuat saat dibuka, bukan saat build.
  // Aturan keamanan no. 1: halaman pengurus selalu memeriksa sesi dan peran sendiri.
  const pengguna = await requireRole();
  await connection();
  const hariIni = tanggalHariIniWib();
  const { sesi, kehadiran } = dataAbsensiContoh(hariIni);
  const ringkas = (s: (typeof sesi)[number]) => ringkasKehadiran(s, daftarPeserta, kehadiran);

  // Hari ini
  const sesiHariIni = sesi.filter((s) => s.tanggal === hariIni);
  const putra = sesiHariIni.find((s) => s.jenisKelamin === "putra");
  const putri = sesiHariIni.find((s) => s.jenisKelamin === "putri");
  const rPutra = putra && ringkas(putra);
  const rPutri = putri && ringkas(putri);
  const hadirHariIni = (rPutra?.hadir ?? 0) + (rPutri?.hadir ?? 0);
  const sasaranHariIni = (rPutra?.sasaran ?? 0) + (rPutri?.sasaran ?? 0);
  const izinHariIni = (rPutra?.izin ?? 0) + (rPutri?.izin ?? 0);

  // Pekan ini (Senin sampai Minggu)
  const senin = seninPekanIni(hariIni);
  const hariPekanIni = Array.from({ length: 7 }, (_, i) => geserTanggal(senin, i));
  const jumlahPengajianPekanIni = hariPekanIni.filter(
    (t) => t === hariIni || [2, 4, 6].includes(hariDalamPekan(t)),
  ).length;
  const idSesiPekanIni = new Set(sesi.filter((s) => s.tanggal >= senin && s.tanggal <= hariIni).map((s) => s.id));
  const izinPekanIni = kehadiran.filter((k) => k.status === "izin" && idSesiPekanIni.has(k.sesiId)).length;

  // Peserta aktif
  const aktif = daftarPeserta.filter((p) => p.status === "aktif");
  const jumlahRemaja = aktif.filter((p) => kategoriPeserta(p.tanggalLahir) === "remaja").length;
  const jumlahPraNikah = aktif.length - jumlahRemaja;

  // Kehadiran per hari pengajian (putra + putri digabung), urut dari yang terlama
  const tanggalSelesai = [...new Set(sesi.filter((s) => s.status === "selesai").map((s) => s.tanggal))].sort();
  const kehadiranPerHari = tanggalSelesai.map((tanggal) => {
    const r = sesi.filter((s) => s.tanggal === tanggal).map(ringkas);
    const hadir = r.reduce((n, x) => n + x.hadir, 0);
    const sasaran = r.reduce((n, x) => n + x.sasaran, 0);
    return { tanggal, hadir, sasaran, persen: sasaran ? (hadir / sasaran) * 100 : 0 };
  });
  const terakhir = kehadiranPerHari.at(-1);

  // Grafik dan komposisi mengikuti filter tanggal di navbar (bawaannya bulan ini).
  const sp = await props.searchParams;
  const periode = bacaPeriode(sp.dari, sp.sampai, hariIni);
  const sesiPeriode = sesi.filter(
    (s) => s.status === "selesai" && s.tanggal >= periode.dari && s.tanggal <= periode.sampai,
  );
  const dataGrafik: TitikKehadiran[] = [...new Set(sesiPeriode.map((s) => s.tanggal))].sort().map((tanggal) => {
    const sesiHariItu = sesiPeriode.filter((s) => s.tanggal === tanggal);
    const rPutraHari = sesiHariItu.find((s) => s.jenisKelamin === "putra");
    const rPutriHari = sesiHariItu.find((s) => s.jenisKelamin === "putri");
    const angka = (x: ReturnType<typeof ringkas>) => ({ hadir: x.hadir, izin: x.izin, alpa: x.alpa, sasaran: x.sasaran });
    const semua = sesiHariItu.map(ringkas);
    return {
      tanggal,
      label: formatTanggal(tanggal, { day: "numeric", month: "short" }),
      labelPanjang: formatTanggal(tanggal, { weekday: "long", day: "numeric", month: "long" }),
      gabungan: {
        hadir: semua.reduce((n, x) => n + x.hadir, 0),
        izin: semua.reduce((n, x) => n + x.izin, 0),
        alpa: semua.reduce((n, x) => n + x.alpa, 0),
        sasaran: semua.reduce((n, x) => n + x.sasaran, 0),
      },
      putra: rPutraHari ? angka(ringkas(rPutraHari)) : null,
      putri: rPutriHari ? angka(ringkas(rPutriHari)) : null,
    };
  });
  const komposisi = dataGrafik.reduce(
    (t, d) => ({ hadir: t.hadir + d.gabungan.hadir, izin: t.izin + d.gabungan.izin, alpa: t.alpa + d.gabungan.alpa }),
    { hadir: 0, izin: 0, alpa: 0 },
  );

  // Kartu saldo: saldo keseluruhan, serta masuk/keluar bulan ini (dihitung dari transaksi yang sama dengan halaman Sodaqoh).
  const sodaqoh = ringkasSodaqoh(dataSodaqohContoh(hariIni).transaksi, awalBulan(hariIni), akhirBulan(hariIni));

  const jumlahPerluDihubungi = perluDihubungi(sesi, daftarPeserta, kehadiran).length;

  return (
    <div className="flex flex-col gap-4">
      <HeroBeranda
        namaDepan={pengguna.nama.split(" ")[0]}
        tanggal={formatTanggal(hariIni)}
        hadirHariIni={hadirHariIni}
        sasaranHariIni={sasaranHariIni}
        adaPengajian={sesiHariIni.length > 0}
      />

      {/* Baris 2: kalender, tumpukan statistik hari ini, kartu saldo */}
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-[1.15fr_1fr_1.1fr]">
        <KalenderPekan hariIni={hariIni} jumlahPengajianPekanIni={jumlahPengajianPekanIni} />

        <div className="flex flex-col gap-3">
          <BarisStat
            ikon={UserRound}
            label="Hadir putra hari ini"
            nilai={rPutra ? `${rPutra.hadir} / ${rPutra.sasaran}` : "–"}
            jeda={120}
          />
          <BarisStat
            ikon={UserRound}
            label="Hadir putri hari ini"
            nilai={rPutri ? `${rPutri.hadir} / ${rPutri.sasaran}` : "–"}
            jeda={160}
          />
          <BarisStat ikon={CalendarCheck} label="Izin hari ini" nilai={`${izinHariIni} orang`} jeda={200} />
        </div>

        <div className="lg:col-span-2 xl:col-span-1">
          <KartuSaldo
            saldo={sodaqoh.saldo}
            masuk={sodaqoh.masuk}
            keluar={sodaqoh.keluar}
          />
        </div>
      </div>

      {/* Baris 3: empat kotak statistik */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KotakStat
          ikon={Users}
          label="Peserta aktif"
          nilai={aktif.length}
          catatan={`${aktif.filter((p) => p.jenisKelamin === "putra").length} putra · ${aktif.filter((p) => p.jenisKelamin === "putri").length} putri`}
          jeda={280}
        >
          {/* Komposisi remaja / pra-nikah. Celah 2px di antara segmen, label langsung di bawah. */}
          <div className="flex flex-col gap-1.5">
            <div className="flex h-2.5 gap-0.5">
              <div className="rounded-l-full bg-grafik-1" style={{ width: `${(jumlahRemaja / aktif.length) * 100}%` }} />
              <div className="rounded-r-full bg-grafik-2" style={{ width: `${(jumlahPraNikah / aktif.length) * 100}%` }} />
            </div>
            <div className="flex justify-between text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-grafik-1" /> Remaja {jumlahRemaja}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-grafik-2" /> Pra-nikah {jumlahPraNikah}
              </span>
            </div>
          </div>
        </KotakStat>

        <KotakStat
          ikon={UserCheck}
          label="Hadir pengajian terakhir"
          nilai={terakhir ? `${terakhir.hadir} / ${terakhir.sasaran}` : "–"}
          catatan={terakhir ? formatTanggal(terakhir.tanggal, { weekday: "long", day: "numeric", month: "long" }) : "Belum ada"}
          jeda={320}
        >
          {/* Batang mini: persentase hadir 8 hari pengajian terakhir, yang terbaru paling kanan */}
          <div className="flex h-12 items-end gap-0.5" role="img" aria-label="Kehadiran 8 hari pengajian terakhir">
            {kehadiranPerHari.slice(-8).map((h, i, delapan) => (
              <div
                key={h.tanggal}
                title={`${formatTanggal(h.tanggal, { weekday: "short", day: "numeric", month: "short" })}: ${h.hadir} dari ${h.sasaran} hadir`}
                className={`flex-1 rounded-t-[4px] transition-colors hover:bg-primary ${
                  i === delapan.length - 1 ? "bg-grafik-1" : "bg-grafik-1/35"
                }`}
                style={{ height: `${Math.max(h.persen, 4)}%` }}
              />
            ))}
          </div>
        </KotakStat>

        <KotakStat
          ikon={HandHeart}
          label="Izin pekan ini"
          nilai={`${izinPekanIni} orang`}
          catatan={`Sejak Senin, ${formatTanggal(senin, { day: "numeric", month: "long" })}`}
          jeda={360}
        />

        <KotakStat
          ikon={PhoneCall}
          label="Perlu dihubungi"
          nilai={`${jumlahPerluDihubungi} orang`}
          catatan={
            <Link href="/rekap" className="font-bold text-primary hover:underline">
              Tidak hadir 2 pengajian terakhir · Lihat daftar
            </Link>
          }
          jeda={400}
        />
      </div>

      {/* Baris 4: grafik kehadiran dan komposisi, mengikuti filter tanggal */}
      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <GrafikKehadiran data={dataGrafik} periode={periode.label} />
        <DonatKomposisi hadir={komposisi.hadir} izin={komposisi.izin} alpa={komposisi.alpa} periode={periode.label} />
      </div>
    </div>
  );
}
