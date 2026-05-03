# Learn Vibe Coding (Elysia + Bun + Drizzle ORM)

Proyek ini adalah backend RESTful API sederhana yang dibangun menggunakan **Elysia.js**, berjalan di atas runtime **Bun**, dan menggunakan **Drizzle ORM** untuk berinteraksi dengan database **MySQL**. Aplikasi ini menyediakan fitur registrasi, autentikasi (login/logout) berbasis token, serta pengambilan profil *current user*.

## 🛠️ Technology Stack & Library
- **Runtime:** [Bun](https://bun.sh/)
- **Framework:** [Elysia.js](https://elysiajs.com/) (Web framework super cepat untuk Bun)
- **Database ORM:** [Drizzle ORM](https://orm.drizzle.team/) (TypeScript ORM)
- **Database:** MySQL
- **Hashing:** `bcryptjs` (untuk enkripsi password)

## 📁 Arsitektur & Struktur Folder
Proyek ini memisahkan lapisan rute, logika bisnis (*service*), dan penanganan HTTP (*controller*) untuk menjaga *clean architecture*. Konvensi penamaan menggunakan *kebab-case* dengan ekstensi spesifik lapisannya (contoh: `users-controller.ts`).

```text
learn-vibe-coding/
├── src/
│   ├── index.ts                     # Entry point utama aplikasi Elysia
│   ├── controllers/                 # Logika HTTP request/response & status HTTP
│   │   └── users-controller.ts
│   ├── db/                          # Konfigurasi koneksi database
│   │   └── index.ts
│   ├── models/                      # Definisi Schema database (Drizzle)
│   │   └── users-model.ts
│   ├── routes/                      # Definisi endpoint (URL) & HTTP methods
│   │   └── users-route.ts
│   └── services/                    # Logika bisnis inti dan query database
│       └── users-service.ts
├── drizzle.config.ts                # Konfigurasi Drizzle-Kit
├── test-app.ts                      # Skrip tes integrasi End-to-End
├── apply-migration.ts               # Skrip migrasi manual / modifikasi tabel
└── .env                             # Environment variables
```

## 🗄️ Database Schema
Terdapat dua tabel utama dalam aplikasi ini yang didefinisikan pada `users-model.ts`:

1. **`users`**: Menyimpan data profil dan kredensial pengguna.
   - `id`: Serial (Primary Key)
   - `name`: Varchar(255)
   - `email`: Varchar(255) (Unique)
   - `password`: Varchar(255) (Hashed dengan bcrypt)
   - `accessToken`: Varchar(255) (Token autentikasi aktif jika login)
   - `createdAt`: Timestamp

2. **`sessions`**: Menyimpan dan melacak sesi login (*access token*) milik pengguna yang masih berlaku.
   - `id`: Varchar(255) (UUID, Primary Key)
   - `userId`: Integer (Foreign Key ke `users.id`)
   - `token`: Varchar(255) (Session token / Access token)
   - `createdAt`: Timestamp
   - `expiredAt`: Timestamp (Masa kedaluwarsa sesi)

## 🌐 API Terdaftar

Semua request yang memiliki body membutuhkan format `application/json`.

| Endpoint | Method | Keterangan | Request Body | Headers |
|---|---|---|---|---|
| `/users/register` | `POST` | Mendaftarkan pengguna baru dengan panjang nama 3-30 karakter (tanpa spasi ekstra). | `name`, `email`, `password` | - |
| `/users/login` | `POST` | Login dengan kredensial untuk mendapatkan `token` sesi. | `email`, `password` | - |
| `/users/verify` | `GET` | Memverifikasi token via parameter query URL. | - | `?access_token=TOKEN` |
| `/api/users/current` | `GET` | Mengambil profil user yang sedang login berdasarkan token Bearer. | - | `Authorization: Bearer <token>` |
| `/api/users/logout` | `DELETE` | Menghapus sesi dan mencabut `accessToken` dari database. | `token` | - |

## 🚀 Cara Setup Project

1. **Pastikan Bun terinstall** di mesin Anda. Jika belum, [install Bun](https://bun.sh/).
2. Clone repositori ini.
3. Install semua dependencies (Meskipun Bun tidak wajib memerlukan `bun install` jika sudah dicache, disarankan untuk tetap menjalankannya):
   ```bash
   bun install
   ```
4. Buat file `.env` di root project dan sesuaikan URL database Anda:
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/nama_database"
   ```

## 💾 Setup & Migrasi Database
Aplikasi ini menyediakan dua opsi pengelolaan database. Jika ingin menggunakan *script* manual:

```bash
bun run apply-migration.ts
```

Jika ingin menggunakan Drizzle Kit untuk membuat tabel secara otomatis (pastikan database kosong / sudah sesuai):
```bash
bun run db:generate
bun run db:push
```

## 🏃 Cara Menjalankan Aplikasi

Jalankan mode pengembangan (*watch mode*) menggunakan perintah:

```bash
bun run dev
```

Aplikasi akan menyala dan *listen* di `http://localhost:3000`.

## 🧪 Cara Menjalankan Test

Proyek ini telah dilengkapi dengan *script* testing yang menyimulasikan panggilan API (Skenario positif maupun skenario negatif seperti validasi panjang karakter). 
Pastikan server tidak berjalan (*stop* server terlebih dahulu jika masih menyala di terminal lain karena port 3000 akan bentrok, atau skrip test bisa langsung mengeksekusinya jika dikonfigurasi demikian).

Jalankan perintah berikut:
```bash
bun run test-app.ts
```

Skrip ini akan membuat *dummy user*, memverifikasi *login*, menguji kesalahan token, memverifikasi penolakan registrasi dengan panjang karakter yang tidak diizinkan, dan menghapus sesi (logout).
