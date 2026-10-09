import { Document, Font, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { DataEksporRekap } from "@/lib/ekspor-rekap";

// Dokumen PDF rekap kehadiran, dibuat dengan @react-pdf/renderer (elemen PDF, bukan HTML).
// Warna ditulis langsung karena token CSS tidak berlaku di PDF.

Font.registerHyphenationCallback((kata) => [kata]); // jangan memenggal nama/materi

const WARNA = {
  primary: "#2e6b30",
  primaryContainer: "#b7f0ae",
  surface: "#f7fbf1",
  surfaceMid: "#ebefe5",
  onSurface: "#191d17",
  onSurfaceVariant: "#42493f",
  outlineVariant: "#c2c9bc",
};

const gaya = StyleSheet.create({
  halaman: { paddingTop: 36, paddingBottom: 44, paddingHorizontal: 36, fontFamily: "Helvetica", fontSize: 8.5, color: WARNA.onSurface },
  kepala: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  logo: { width: 28, height: 28, borderRadius: 8, backgroundColor: WARNA.primary, color: "#fff", fontFamily: "Helvetica-Bold", fontSize: 15, textAlign: "center", paddingTop: 6 },
  judul: { fontFamily: "Helvetica-Bold", fontSize: 15 },
  sub: { fontSize: 8.5, color: WARNA.onSurfaceVariant },
  info: { flexDirection: "row", gap: 16, marginBottom: 12, color: WARNA.onSurfaceVariant },
  kotakBaris: { flexDirection: "row", gap: 8, marginBottom: 18 },
  kotak: { flex: 1, backgroundColor: WARNA.surface, borderRadius: 8, padding: 9 },
  kotakLabel: { fontSize: 7, color: WARNA.onSurfaceVariant, textTransform: "uppercase", letterSpacing: 0.5 },
  kotakNilai: { fontFamily: "Helvetica-Bold", fontSize: 15, marginTop: 2 },
  bagian: { fontFamily: "Helvetica-Bold", fontSize: 11, marginBottom: 6, marginTop: 4 },
  barisJudul: { flexDirection: "row", backgroundColor: WARNA.primary, color: "#fff", fontFamily: "Helvetica-Bold", paddingVertical: 5, borderRadius: 4 },
  baris: { flexDirection: "row", paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: WARNA.outlineVariant },
  sel: { paddingHorizontal: 4 },
  kanan: { textAlign: "right" },
  kaki: { position: "absolute", bottom: 20, left: 36, right: 36, flexDirection: "row", justifyContent: "space-between", fontSize: 7, color: WARNA.onSurfaceVariant },
});

type Kolom<T> = { judul: string; lebar: number | string; isi: (baris: T, i: number) => string | number; kanan?: boolean };

function Tabel<T>({ kolom, data }: { kolom: Kolom<T>[]; data: T[] }) {
  return (
    <View>
      {/* fixed: baris judul diulang di setiap halaman kalau tabelnya bersambung */}
      <View style={gaya.barisJudul} fixed>
        {kolom.map((k) => (
          <Text key={k.judul} style={[gaya.sel, { width: k.lebar }, k.kanan ? gaya.kanan : {}]}>
            {k.judul}
          </Text>
        ))}
      </View>
      {data.map((b, i) => (
        <View key={i} style={[gaya.baris, i % 2 === 1 ? { backgroundColor: WARNA.surface } : {}]} wrap={false}>
          {kolom.map((k) => (
            <Text key={k.judul} style={[gaya.sel, { width: k.lebar }, k.kanan ? gaya.kanan : {}]}>
              {k.isi(b, i)}
            </Text>
          ))}
        </View>
      ))}
      {data.length === 0 && <Text style={{ padding: 10, color: WARNA.onSurfaceVariant }}>Tidak ada data.</Text>}
    </View>
  );
}

type Peserta = DataEksporRekap["perPeserta"][number];
type Sesi = DataEksporRekap["perSesi"][number];

export function DokumenRekap({ data }: { data: DataEksporRekap }) {
  const r = data.ringkasan;
  return (
    <Document title={`Rekap SIMUDA ${data.periode}`} author="SIMUDA" creator="SIMUDA">
      <Page size="A4" style={gaya.halaman}>
        <View style={gaya.kepala}>
          <Text style={gaya.logo}>S</Text>
          <View>
            <Text style={gaya.judul}>Rekap Kehadiran Pengajian</Text>
            <Text style={gaya.sub}>SIMUDA · Muda/i Bendlay 2 & Bendlay 4</Text>
          </View>
        </View>

        <View style={gaya.info}>
          <Text>Periode: {data.periode}</Text>
          <Text>Filter: {data.filter}</Text>
          <Text>Dibuat: {data.dibuat}</Text>
        </View>

        <View style={gaya.kotakBaris}>
          {[
            ["Pengajian", `${r.pengajian} kali`],
            ["Rata-rata hadir", `${r.rataRata}%`],
            ["Total hadir", `${r.hadir}/${r.sasaran}`],
            ["Izin · Alpa", `${r.izin} · ${r.alpa}`],
          ].map(([label, nilai]) => (
            <View key={label} style={gaya.kotak}>
              <Text style={gaya.kotakLabel}>{label}</Text>
              <Text style={gaya.kotakNilai}>{nilai}</Text>
            </View>
          ))}
        </View>

        <Text style={gaya.bagian}>Rekap per peserta</Text>
        <Tabel<Peserta>
          data={data.perPeserta}
          kolom={[
            { judul: "No", lebar: "5%", isi: (_, i) => i + 1 },
            { judul: "Nama", lebar: "29%", isi: (p) => p.nama },
            { judul: "Kelompok", lebar: "10%", isi: (p) => p.kelompok },
            { judul: "Wilayah", lebar: "11%", isi: (p) => p.wilayah },
            { judul: "Kategori", lebar: "11%", isi: (p) => p.kategori },
            { judul: "Hadir", lebar: "9%", isi: (p) => `${p.hadir}/${p.sesi}`, kanan: true },
            { judul: "Izin", lebar: "7%", isi: (p) => p.izin, kanan: true },
            { judul: "Alpa", lebar: "7%", isi: (p) => p.alpa, kanan: true },
            { judul: "Hadir %", lebar: "11%", isi: (p) => `${p.persen}%`, kanan: true },
          ]}
        />

        {/* break: rincian sesi selalu dimulai di halaman baru */}
        <Text style={gaya.bagian} break>
          Rincian sesi
        </Text>
        <Tabel<Sesi>
          data={data.perSesi}
          kolom={[
            { judul: "No", lebar: "5%", isi: (_, i) => i + 1 },
            { judul: "Tanggal", lebar: "15%", isi: (s) => s.tanggal },
            { judul: "Kelompok", lebar: "10%", isi: (s) => s.kelompok },
            { judul: "Sasaran", lebar: "11%", isi: (s) => s.sasaran },
            { judul: "Materi", lebar: "30%", isi: (s) => `${s.materi}${s.pemateri ? ` (${s.pemateri})` : ""}` },
            { judul: "Hadir", lebar: "11%", isi: (s) => `${s.hadir}/${s.jumlahSasaran}`, kanan: true },
            { judul: "Izin", lebar: "9%", isi: (s) => s.izin, kanan: true },
            { judul: "Alpa", lebar: "9%", isi: (s) => s.alpa, kanan: true },
          ]}
        />

        <View style={gaya.kaki} fixed>
          <Text>SIMUDA · Rekap {data.periode}</Text>
          <Text render={({ pageNumber, totalPages }) => `Halaman ${pageNumber} dari ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
