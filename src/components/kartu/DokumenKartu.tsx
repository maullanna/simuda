import { Document, Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

// Bawaan @react-pdf memenggal kata panjang dengan tanda hubung ("Ramad-hani").
// Untuk nama orang itu tidak pantas, jadi setiap kata dibiarkan utuh.
Font.registerHyphenationCallback((kata) => [kata]);

// Dokumen PDF kartu peserta (KONSEP 5.2), dibuat dengan @react-pdf/renderer.
// Komponen di sini BUKAN HTML: <View>, <Text>, <Image> adalah elemen khusus PDF,
// dan class Tailwind tidak berlaku. Karena itu warna ditulis langsung (sama dengan token terang).

export type DataKartu = {
  id: string;
  nama: string;
  inisial: string;
  jenisKelamin: string; // "Putra" / "Putri"
  wilayah: string;
  qr: string; // gambar QR (data URL) berisi token acak saja, tanpa data pribadi
};

export type KontakKartu = { wilayah: string; nama: string; noHp: string };

const WARNA = {
  primary: "#2e6b30",
  primaryContainer: "#b7f0ae",
  onPrimaryContainer: "#002204",
  tertiaryContainer: "#c9e6ff",
  onTertiaryContainer: "#001d33",
  surface: "#f7fbf1",
  onSurface: "#191d17",
  onSurfaceVariant: "#42493f",
  outlineVariant: "#c2c9bc",
};

// Ukuran kartu standar (ISO ID-1) dan tata letak 2 kolom x 5 baris di A4 (210 x 297 mm).
const KARTU = { lebar: 85.6, tinggi: 54 };
const CELAH = 3;
const KOLOM = 2;
const BARIS = 5;
const PER_LEMBAR = KOLOM * BARIS;
const TEPI_KIRI = (210 - (KOLOM * KARTU.lebar + (KOLOM - 1) * CELAH)) / 2;
const TEPI_ATAS = (297 - (BARIS * KARTU.tinggi + (BARIS - 1) * CELAH)) / 2;

const mm = (n: number) => `${n}mm`;

const gaya = StyleSheet.create({
  halaman: { backgroundColor: "#ffffff", fontFamily: "Helvetica" },
  kartu: {
    position: "absolute",
    width: mm(KARTU.lebar),
    height: mm(KARTU.tinggi),
    borderWidth: 0.6,
    borderColor: WARNA.outlineVariant,
    borderRadius: mm(3),
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  isi: { flexGrow: 1, flexDirection: "row", padding: mm(3.2), gap: mm(3) },
  kepala: { flexDirection: "row", alignItems: "center", gap: mm(1.6) },
  logo: {
    width: mm(6),
    height: mm(6),
    borderRadius: mm(1.6),
    backgroundColor: WARNA.primary,
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    textAlign: "center",
    paddingTop: mm(0.9),
  },
  merek: { fontFamily: "Helvetica-Bold", fontSize: 9.5, color: WARNA.onSurface },
  submerek: { fontSize: 6, color: WARNA.onSurfaceVariant },
  avatar: {
    width: mm(15),
    height: mm(15),
    borderRadius: mm(7.5),
    fontFamily: "Helvetica-Bold",
    fontSize: 16,
    textAlign: "center",
    paddingTop: mm(4.2),
  },
  nama: { fontFamily: "Helvetica-Bold", fontSize: 9.5, color: WARNA.onSurface, maxLines: 2, textOverflow: "ellipsis" },
  chip: {
    fontFamily: "Helvetica-Bold",
    fontSize: 6.2,
    paddingVertical: mm(0.6),
    paddingHorizontal: mm(1.6),
    borderRadius: mm(1.2),
  },
  kakiDepan: {
    height: mm(5.5),
    backgroundColor: WARNA.primary,
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
    fontSize: 5.6,
    letterSpacing: 1,
    textAlign: "center",
    paddingTop: mm(1.6),
  },
  judulBelakang: { fontFamily: "Helvetica-Bold", fontSize: 8.5, color: WARNA.primary },
  langkah: { fontSize: 6.6, color: WARNA.onSurface, lineHeight: 1.35 },
  kotakHilang: {
    backgroundColor: WARNA.surface,
    borderRadius: mm(2),
    padding: mm(2),
    gap: mm(0.6),
  },
  kecil: { fontSize: 5.8, color: WARNA.onSurfaceVariant },
});

function posisi(urutan: number, cermin: boolean) {
  const baris = Math.floor(urutan / KOLOM);
  let kolom = urutan % KOLOM;
  // Sisi belakang dicerminkan kiri-kanan supaya pas saat dicetak bolak-balik (balik di sisi panjang).
  if (cermin) kolom = KOLOM - 1 - kolom;
  return {
    left: mm(TEPI_KIRI + kolom * (KARTU.lebar + CELAH)),
    top: mm(TEPI_ATAS + baris * (KARTU.tinggi + CELAH)),
  };
}

function KartuDepan({ data }: { data: DataKartu }) {
  const putra = data.jenisKelamin === "Putra";
  return (
    <>
      <View style={gaya.isi}>
        <View style={{ flex: 1, justifyContent: "space-between" }}>
          <View style={gaya.kepala}>
            <Text style={gaya.logo}>S</Text>
            <View>
              <Text style={gaya.merek}>SIMUDA</Text>
              <Text style={gaya.submerek}>Pengajian Muda/i Bendlay 2 & 4</Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: mm(2.4) }}>
            {/* Foto belum ada di data contoh, jadi dipakai inisial. Nanti diganti <Image src={foto}>. */}
            <Text
              style={[
                gaya.avatar,
                {
                  backgroundColor: putra ? WARNA.primaryContainer : WARNA.tertiaryContainer,
                  color: putra ? WARNA.onPrimaryContainer : WARNA.onTertiaryContainer,
                },
              ]}
            >
              {data.inisial}
            </Text>
            <View style={{ flex: 1, gap: mm(1.2) }}>
              <Text style={gaya.nama}>{data.nama}</Text>
              <View style={{ flexDirection: "row", gap: mm(1) }}>
                <Text
                  style={[
                    gaya.chip,
                    {
                      backgroundColor: putra ? WARNA.primaryContainer : WARNA.tertiaryContainer,
                      color: putra ? WARNA.onPrimaryContainer : WARNA.onTertiaryContainer,
                    },
                  ]}
                >
                  {data.jenisKelamin}
                </Text>
                <Text style={[gaya.chip, { backgroundColor: WARNA.surface, color: WARNA.onSurfaceVariant }]}>
                  {data.wilayah}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ width: mm(25), alignItems: "center", justifyContent: "center", gap: mm(0.8) }}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- <Image> di sini elemen PDF, bukan <img> HTML */}
          <Image src={data.qr} style={{ width: mm(25), height: mm(25) }} />
          <Text style={[gaya.kecil, { textAlign: "center" }]}>Tunjukkan ke petugas scan</Text>
        </View>
      </View>
      <Text style={gaya.kakiDepan}>KARTU PESERTA PENGAJIAN</Text>
    </>
  );
}

function KartuBelakang({ kontak }: { kontak: KontakKartu[] }) {
  return (
    <View style={{ flexGrow: 1, padding: mm(3.6), gap: mm(2), justifyContent: "space-between" }}>
      <View style={{ gap: mm(1) }}>
        <Text style={gaya.judulBelakang}>Cara memakai kartu</Text>
        <Text style={gaya.langkah}>1. Bawa kartu ini setiap datang pengajian.</Text>
        <Text style={gaya.langkah}>2. Tunjukkan kode QR ke petugas scan di pintu masuk.</Text>
        <Text style={gaya.langkah}>3. Tunggu sapaan di layar, lalu silakan masuk.</Text>
      </View>
      <View style={gaya.kotakHilang}>
        <Text style={[gaya.langkah, { fontFamily: "Helvetica-Bold" }]}>Kartu hilang atau rusak? Hubungi pengurus:</Text>
        {kontak.map((k) => (
          <Text key={k.wilayah} style={gaya.langkah}>
            {k.wilayah}: {k.nama} · {k.noHp}
          </Text>
        ))}
      </View>
      <Text style={gaya.kecil}>Kartu ini hanya untuk absensi pengajian. Kartu lama tidak berlaku setelah diganti.</Text>
    </View>
  );
}

export function DokumenKartu({
  kartu,
  denganBelakang,
  kontak,
}: {
  kartu: DataKartu[];
  denganBelakang: boolean;
  kontak: KontakKartu[];
}) {
  const lembar: DataKartu[][] = [];
  for (let i = 0; i < kartu.length; i += PER_LEMBAR) lembar.push(kartu.slice(i, i + PER_LEMBAR));

  return (
    <Document title="Kartu peserta SIMUDA" author="SIMUDA" creator="SIMUDA">
      {lembar.map((isi, nomor) => [
        <Page key={`depan-${nomor}`} size="A4" style={gaya.halaman}>
          {isi.map((k, i) => (
            <View key={k.id} style={[gaya.kartu, posisi(i, false)]}>
              <KartuDepan data={k} />
            </View>
          ))}
        </Page>,
        denganBelakang && (
          <Page key={`belakang-${nomor}`} size="A4" style={gaya.halaman}>
            {isi.map((k, i) => (
              <View key={k.id} style={[gaya.kartu, posisi(i, true)]}>
                <KartuBelakang kontak={kontak} />
              </View>
            ))}
          </Page>
        ),
      ])}
    </Document>
  );
}
