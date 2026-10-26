import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const services = [
  ["Enterprise Cloud Architecture & Migration", "Modernisasi infrastruktur on-premise ke hybrid atau multi-cloud dengan skalabilitas instan, migrasi tanpa downtime, dan optimasi biaya komputasi (FinOps)."],
  ["Custom SaaS & Enterprise Software Engineering", "Pembangunan aplikasi web dan sistem internal berskala enterprise dengan arsitektur modular, pipeline CI/CD otomatis, dan kode teruji."],
  ["AI, Machine Learning & Big Data Analytics", "Mengubah data bisnis menjadi keunggulan prediktif melalui pipeline machine learning produksi, integrasi LLM korporasi, dan dashboard real-time."],
  ["Cyber Security & Compliance Audit", "Proteksi perimeter berlapis, pengujian penetrasi, desain zero-trust, dan persiapan audit ISO 27001 serta SOC 2."],
  ["DevOps Automation & Reliability (SRE)", "Mempercepat rilis dengan Infrastructure as Code, GitOps, observabilitas telemetri, dan simulasi chaos engineering."],
  ["IT Strategy Consulting & Transformation", "Pendampingan eksekutif untuk peta jalan teknologi, tata kelola IT, audit arsitektur legacy, dan mitigasi risiko teknis."],
];
const products = [
  ["ApexCore ERP Cloud", "Sistem ERP terpadu dengan multi-entity ledger, kepatuhan pajak terintegrasi, dan rekonsiliasi keuangan multi-valuta.", "Throughput: 10.000+ transaksi/detik\nKonsolidasi: Multi-entity\nAPI: REST & GraphQL\nDeployment: Cloud managed atau on-premise"],
  ["ApexSentinel IoT Gateway", "Edge gateway untuk monitoring puluhan ribu sensor pabrik secara real-time dengan enkripsi hardware TPM 2.0.", "Protokol: MQTT, CoAP, Modbus\nKeamanan: TPM 2.0\nOffline: Buffer & auto-sync\nEdge AI: Inference node"],
  ["ApexVault CyberShield", "Tata kelola identitas dan akses zero-trust dengan deteksi anomali berbasis machine learning.", "Autentikasi: FIDO2 / Passkey\nOtorisasi: RBAC & ABAC\nAudit: Access certification otomatis\nKepatuhan: ISO 27001"],
  ["ApexFlow Data Pipeline", "Orkestrasi pipeline data streaming berkapasitas besar menuju data lakehouse dan model analitik prediktif.", "Streaming: Apache Kafka & Iceberg\nThroughput: 5+ GB/detik\nSchema: Registry otomatis\nGaransi: Zero data loss"],
];
const portfolio = [
  ["Modernisasi Core Banking & Multi-Cloud Resiliency", "Transisi arsitektur monolitik perbankan ke microservices Kubernetes multi-cloud dengan audit PCI-DSS dan peralihan tanpa downtime."],
  ["Telemetri Armada Kontainer Otomatis", "Platform ingestion data sensor GPS dan suhu untuk 12.000 kontainer lintas samudra secara real-time."],
  ["Smart Grid Predictive Analytics", "Pipeline machine learning untuk memprediksi fluktuasi beban pembangkit surya dan mendeteksi anomali gardu induk."],
];
const gallery = [["Apex R&D Innovation Lab", "Fasilitas pengujian performa microservices dan validasi jaringan zero-trust."], ["Apex Annual Tech Summit", "Konferensi tahunan pengembang dan mitra industri."], ["Agile Collaboration Hub", "Ruang kolaborasi tim lintas fungsi."]];
const team = [["Nama Direktur Utama", "Chief Executive Officer"], ["Nama CTO", "Chief Technology Officer"], ["Nama Kepala Keamanan", "VP of Cyber Security"], ["Nama Kepala AI", "Head of AI & Analytics"]];
const blogs = [
  ["Strategi Multi-Cloud Tanpa Vendor Lock-in", "Panduan praktis mengadopsi abstraksi infrastruktur berbasis Kubernetes.", "Banyak organisasi terjebak pada satu penyedia cloud karena ketergantungan layanan terkelola.\n\n## Mulai dari abstraksi\n\nGunakan Kubernetes dan Infrastructure as Code agar beban kerja dapat dipindahkan antar penyedia.\n\n## Ukur biaya perpindahan\n\nHitung biaya egress dan rekayasa ulang sebelum memutuskan arsitektur."],
  ["Mempersiapkan Audit ISO 27001:2022 di Lingkungan Cloud", "Daftar periksa kontrol teknis zero-trust dan pelaporan kepatuhan.", "Audit berjalan lancar bila kontrol teknis dan dokumentasi dibangun sejak awal.\n\n## Kontrol yang sering ditanyakan\n\nManajemen akses, enkripsi data, pencatatan log, dan prosedur pemulihan bencana."],
];

const slug = (s: string) => s.normalize("NFKD").toLowerCase().replace(/&/g, " dan ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);

async function main() {
  for (const [name, description] of services) await prisma.service.upsert({ where: { slug: slug(name) }, update: {}, create: { name, slug: slug(name), description } });
  for (const [name, description, specifications] of products) await prisma.product.upsert({ where: { slug: slug(name) }, update: {}, create: { name, slug: slug(name), description, specifications } });
  for (const [name, description] of portfolio) await prisma.portfolio.upsert({ where: { slug: slug(name) }, update: {}, create: { name, slug: slug(name), description, projectDate: new Date() } });
  if ((await prisma.gallery.count()) === 0) await prisma.gallery.createMany({ data: gallery.map(([title, description]) => ({ title, description })) });
  if ((await prisma.teamMember.count()) === 0) await prisma.teamMember.createMany({ data: team.map(([name, position], i) => ({ name, position, displayOrder: i })) });
  for (const [title, excerpt, content] of blogs) await prisma.blog.upsert({ where: { slug: slug(title) }, update: {}, create: { title, slug: slug(title), excerpt, content, status: "PUBLISHED", publishedAt: new Date() } });

  const { SEED_ADMIN_NAME: name, SEED_ADMIN_EMAIL: email, SEED_ADMIN_PASSWORD: pw } = process.env;
  if (email && pw) {
    if (pw.length < 10) throw new Error("SEED_ADMIN_PASSWORD minimal 10 karakter");
    if ((await prisma.user.count()) === 0) {
      await prisma.user.create({ data: { name: name || "Super Admin", email: email.toLowerCase(), passwordHash: await bcrypt.hash(pw, 12), role: "SUPER_ADMIN" } });
      console.log("Super Admin dibuat:", email);
    } else console.log("User sudah ada; Super Admin seed dilewati.");
  } else console.log("SEED_ADMIN_* tidak diatur; tidak ada akun dibuat. Gunakan /dashboard-admin/signup atau `npm run admin:create`.");
}

main().finally(() => prisma.$disconnect());
