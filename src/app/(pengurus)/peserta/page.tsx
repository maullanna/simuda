import type { Metadata } from "next";
import Link from "next/link";
import { FilterChip } from "@/components/FilterChip";
import { KolomCari } from "@/components/KolomCari";
import { Paginasi } from "@/components/Paginasi";
import { potongHalaman } from "@/lib/halaman";
import { ambilSemuaPeserta } from "@/lib/data/peserta";
import { boleh } from "@/lib/hak-akses";
import { requireRole } from "@/lib/pengguna";
import {
  hitungUmur,
  kategoriPeserta,
  labelJenisKelamin,
  labelKategori,
  type Kategori,
} from "@/lib/peserta";

export const metadata: Metadata = {
  title: "Peserta · SIMUDA",
};

// Semua filter disimpan di URL, misalnya /peserta?kategori=remaja&jk=putri&q=siti
// `per` (jumlah baris) ikut dibawa saat filter diganti, sedangkan nomor halaman sengaja
// tidak dibawa supaya tabel kembali ke halaman 1.
type Filter = {
  kategori?: string;
  jk?: string;
  wilayah?: string;
  status?: string;
  q?: string;
  per?: string;
};

// Membuat URL baru dari filter yang sedang aktif, dengan satu filter diubah.
// Kalau nilainya sama dengan yang sedang aktif, filter itu dilepas (seperti tombol on/off).
function urlFilter(saatIni: Filter, kunci: keyof Filter, nilai: string | undefined): string {
  const baru: Filter = { ...saatIni, [kunci]: saatIni[kunci] === nilai ? undefined : nilai };
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(baru)) {
    if (v) params.set(k, v);
  }
  const query = params.toString();
  return query ? `/peserta?${query}` : "/peserta";
}

function ambilTeks(nilai: string | string[] | undefined): string | undefined {
  return typeof nilai === "string" && nilai !== "" ? nilai : undefined;
}

function inisial(nama: string): string {
  return nama
    .split(" ")
    .slice(0, 2)
    .map((kata) => kata[0])
    .join("")
    .toUpperCase();
}

export default async function PesertaPage(props: PageProps<"/peserta">) {
  // Semua pengurus boleh melihat; hanya Wakil, Ketua, Sekretaris yang boleh mengelola (KONSEP bagian 3).
  const pengguna = await requireRole("peserta", "lihat");
  const bolehKelola = boleh(pengguna.peran, "peserta", "ubah");
  const bolehTambah = boleh(pengguna.peran, "peserta", "tambah");
  const bolehImpor = boleh(pengguna.peran, "imporPeserta", "jalankan");
  const bolehKartu = boleh(pengguna.peran, "kartu", "tambah");
  const daftarPeserta = await ambilSemuaPeserta();
  const sp = await props.searchParams;
  const filter: Filter = {
    kategori: ambilTeks(sp.kategori),
    jk: ambilTeks(sp.jk),
    wilayah: ambilTeks(sp.wilayah),
    status: ambilTeks(sp.status),
    q: ambilTeks(sp.q),
    per: ambilTeks(sp.per),
  };

  // Kategori dihitung sekali per peserta, lalu dipakai untuk menyaring dan menampilkan.
  const semua = daftarPeserta.map((p) => ({
    ...p,
    umur: hitungUmur(p.tanggalLahir),
    kategori: kategoriPeserta(p.tanggalLahir),
  }));

  const statusDicari = filter.status === "tidak-aktif" ? "tidak_aktif" : "aktif";
  const sesuaiStatus = semua.filter((p) => p.status === statusDicari);

  const jumlahPerTab: Record<"semua" | Kategori, number> = {
    semua: sesuaiStatus.length,
    "pra-remaja": sesuaiStatus.filter((p) => p.kategori === "pra-remaja").length,
    remaja: sesuaiStatus.filter((p) => p.kategori === "remaja").length,
    "pra-nikah": sesuaiStatus.filter((p) => p.kategori === "pra-nikah").length,
  };

  const kataKunci = filter.q?.toLowerCase();
  const hasil = sesuaiStatus
    .filter((p) => !filter.kategori || p.kategori === filter.kategori)
    .filter((p) => !filter.jk || p.jenisKelamin === filter.jk)
    .filter((p) => !filter.wilayah || p.wilayah === `Bendlay ${filter.wilayah}`)
    .filter((p) => !kataKunci || p.nama.toLowerCase().includes(kataKunci))
    .sort((a, b) => a.nama.localeCompare(b.nama, "id"));
  const tabel = potongHalaman(hasil, sp.halaman, sp.per);

  const tab: { label: string; nilai: Kategori | undefined; jumlah: number }[] = [
    { label: "Semua", nilai: undefined, jumlah: jumlahPerTab.semua },
    { label: "Pra-remaja", nilai: "pra-remaja", jumlah: jumlahPerTab["pra-remaja"] },
    { label: "Remaja", nilai: "remaja", jumlah: jumlahPerTab.remaja },
    { label: "Pra-nikah", nilai: "pra-nikah", jumlah: jumlahPerTab["pra-nikah"] },
  ];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          {/* Judul sudah tampil di navbar; h1 tetap ada untuk pembaca layar */}
          <h1 className="sr-only">Peserta</h1>
          <p className="text-on-surface-variant">
            {jumlahPerTab.semua} peserta {statusDicari === "aktif" ? "aktif" : "tidak aktif"}
          </p>
        </div>
        {/* Tombol kelola hanya untuk peran yang boleh; server tetap memeriksa ulang lewat requireRole */}
        {(bolehImpor || bolehKartu || bolehTambah) && (
          <div className="flex flex-wrap gap-2">
            {bolehImpor && <md-outlined-button href="/peserta/impor">Impor Excel</md-outlined-button>}
            {bolehKartu && <md-filled-tonal-button href="/peserta/kartu">Cetak kartu</md-filled-tonal-button>}
            {bolehTambah && <md-filled-button href="/peserta/tambah">Tambah peserta</md-filled-button>}
          </div>
        )}
      </header>

      {/* Tab kategori */}
      <nav className="flex border-b border-outline-variant">
        {tab.map((t) => {
          const aktif = filter.kategori === t.nilai;
          return (
            <Link
              key={t.label}
              href={urlFilter({ ...filter, kategori: undefined }, "kategori", t.nilai)}
              scroll={false}
              aria-current={aktif ? "page" : undefined}
              className={`-mb-px flex-1 border-b-[3px] px-4 pb-3 pt-2 text-center text-sm font-bold transition-colors sm:flex-none ${
                aktif
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {t.label} <span className="font-semibold opacity-70">{t.jumlah}</span>
            </Link>
          );
        })}
      </nav>

      {/* Pencarian dan filter */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <KolomCari label="Cari nama peserta" nilaiAwal={filter.q ?? ""} />
        <div className="flex flex-wrap gap-2">
          <FilterChip label="Putra" href={urlFilter(filter, "jk", "putra")} aktif={filter.jk === "putra"} />
          <FilterChip label="Putri" href={urlFilter(filter, "jk", "putri")} aktif={filter.jk === "putri"} />
          <FilterChip label="Bendlay 2" href={urlFilter(filter, "wilayah", "2")} aktif={filter.wilayah === "2"} />
          <FilterChip label="Bendlay 4" href={urlFilter(filter, "wilayah", "4")} aktif={filter.wilayah === "4"} />
          <FilterChip
            label="Tidak aktif"
            href={urlFilter(filter, "status", "tidak-aktif")}
            aktif={filter.status === "tidak-aktif"}
          />
        </div>
      </div>

      {/* Tabel peserta */}
      <div className="overflow-hidden rounded-3xl bg-surface-low pb-1">
        {hasil.length === 0 ? (
          <p className="px-6 py-12 text-center text-on-surface-variant">
            Tidak ada peserta yang cocok dengan filter ini.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
              <tr>
                <th className="w-12 py-3 pl-4 lg:pl-6">No</th>
                <th className="px-4 py-3">Nama</th>
                <th className="hidden px-4 py-3 md:table-cell">Wilayah</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="hidden px-4 py-3 sm:table-cell">Umur</th>
                <th className="hidden px-4 py-3 lg:table-cell">No HP</th>
              </tr>
            </thead>
            <tbody>
              {tabel.isi.map((p, i) => (
                <tr key={p.id} className="border-t border-outline-variant/60 transition-colors hover:bg-surface-mid">
                  <td className="py-3 pl-4 text-on-surface-variant lg:pl-6">{tabel.nomorAwal + i}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`grid size-10 shrink-0 place-items-center rounded-full text-xs font-bold ${
                          p.jenisKelamin === "putra"
                            ? "bg-primary-container text-on-primary-container"
                            : "bg-tertiary-container text-on-tertiary-container"
                        }`}
                      >
                        {inisial(p.nama)}
                      </div>
                      <div className="min-w-0">
                        {bolehKelola ? (
                          <Link href={`/peserta/${p.id}/ubah`} className="block truncate font-semibold hover:underline">
                            {p.nama}
                          </Link>
                        ) : (
                          <p className="truncate font-semibold">{p.nama}</p>
                        )}
                        <p className="truncate text-xs text-on-surface-variant">
                          {labelJenisKelamin[p.jenisKelamin]}
                          <span className="md:hidden"> · {p.wilayah}</span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">{p.wilayah}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${
                        p.kategori === "pra-remaja"
                          ? "bg-tertiary-container text-on-tertiary-container"
                          : p.kategori === "remaja"
                            ? "bg-secondary-container text-on-secondary-container"
                            : "bg-surface-highest text-on-surface-variant"
                      }`}
                    >
                      {labelKategori[p.kategori]}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">{p.umur} th</td>
                  <td className="hidden px-4 py-3 text-on-surface-variant lg:table-cell">{p.noHp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="px-4 pb-2 lg:px-6">
          <Paginasi total={tabel.total} halaman={tabel.halaman} per={tabel.per} label="peserta" />
        </div>
      </div>
    </div>
  );
}
