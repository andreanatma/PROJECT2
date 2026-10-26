# Apex Global — Next.js + MySQL

Website perusahaan full-stack: Next.js 15 (App Router), TypeScript, Tailwind 3, Prisma 6 + MySQL, Zod, sesi admin berbasis database.

## Instalasi
1. Prasyarat: Node.js 20+, MySQL 8+.
2. Buat database dan user:
   ```sql
   CREATE DATABASE apex_global CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'apex_user'@'localhost' IDENTIFIED BY 'PASSWORD_KUAT';
   GRANT ALL PRIVILEGES ON apex_global.* TO 'apex_user'@'localhost';
   ```
3. `cp .env.example .env`, isi `DATABASE_URL`, `SITE_URL`, dan `BOOTSTRAP_TOKEN` (`openssl rand -hex 24`).
4. `npm install`
5. Migration: `npx prisma migrate dev --name init` (dev) atau `npm run db:deploy` (production, setelah folder `prisma/migrations` ada).
6. Seed konten awal (opsional): `npm run db:seed`
7. `npm run dev` → http://localhost:3000

## Membuat Super Admin pertama (pilih salah satu)
- **Bootstrap web**: buka `/dashboard-admin/signup`. Hanya aktif bila tabel `users` kosong dan `BOOTSTRAP_TOKEN` diatur. Setelah selesai, hapus token dari `.env`.
- **CLI**: `npm run admin:create` (interaktif).
- **Seed**: isi `SEED_ADMIN_EMAIL` dan `SEED_ADMIN_PASSWORD` lalu `npm run db:seed`.
Administrator berikutnya ditambah oleh Super Admin di `/dashboard-admin/users`.

## Build & deployment
`npm run build && npm run start`. Pastikan: `NODE_ENV=production`, HTTPS (cookie `Secure`), `SITE_URL` benar, `UPLOAD_DIR` menunjuk ke volume persisten (atau ganti `src/lib/media.ts` dengan S3/R2), proxy meneruskan `X-Forwarded-For`.

## Keamanan — ringkasan
- Password bcrypt (cost 12); sesi = token acak, hanya hash SHA-256 disimpan di tabel `sessions`; cookie HttpOnly, SameSite=Lax, Secure di production.
- Idle timeout 60 menit dihitung server dari `lastActivityAt`; batas umur absolut 12 jam. Perpanjangan hanya terjadi pada request yang lolos validasi server.
- Setiap server action memanggil `requireUser()` / `requireSuperAdmin()`; middleware hanya gerbang awal.
- Upload divalidasi dari magic bytes + ekstensi + ukuran; nama file UUID; SVG ditolak; file privat memerlukan sesi.
- Rate limit login/contact bersifat in-memory per instance (contact juga dibatasi di DB). Untuk multi-instance gunakan Redis.

## Checklist testing manual
- [ ] Signup bootstrap berhasil sekali, lalu ditutup; token salah ditolak.
- [ ] Login benar/salah; 6 percobaan salah → diblokir sementara.
- [ ] Akses `/dashboard-admin/*` tanpa login → ke halaman login.
- [ ] Ubah `lastActivityAt` sesi di DB ke >60 menit lalu muat halaman → ke login (expired).
- [ ] Logout menghapus baris `sessions`.
- [ ] CRUD semua modul: tambah, edit, hapus (modal konfirmasi), pencarian, paginasi.
- [ ] Upload gambar/PDF valid; file `.exe` yang diganti nama `.png` ditolak; >8 MB ditolak.
- [ ] Blog DRAFT tidak tampil di publik; PUBLISHED tampil dan masuk sitemap.
- [ ] Formulir contact menyimpan ke DB, muncul di dashboard, status unread→read→replied.
- [ ] ADMIN tidak bisa membuka `/dashboard-admin/users` / mengubah settings.
- [ ] Super Admin terakhir tidak dapat dinonaktifkan/dihapus/diturunkan.
- [ ] `/sitemap.xml` tidak memuat dashboard; `/robots.txt` melarang `/dashboard-admin`.
- [ ] Activity logs terisi untuk login, create/update/delete, upload, perubahan role.
