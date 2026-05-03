# Implementasi Fitur Logout User

Silakan implementasikan tugas berikut secara berurutan sesuai dengan arsitektur yang sudah ditentukan.

## 1. Struktur Arsitektur
Pastikan kode diimplementasikan mengikuti struktur folder di dalam direktori `src` dengan format penamaan file sebagai berikut:
- **`routes`** (`users-route.ts`): Berisi routing dari Elysia.js.
- **`controllers`** (`users-controller.ts`): Berisi controller yang akan dipanggil oleh route.
- **`services`** (`users-service.ts`): Berisi logic bisnis aplikasi (termasuk operasi database).
- **`models`** (`users-model.ts`): Berisi definisi/skema model database.
- **`middleware`** (`users-middleware.ts`): Berisi middleware yang akan digunakan oleh aplikasi.

## 2. Pembuatan Endpoint API

### Endpoint: `DELETE /api/users/logout`
Buat API untuk melakukan proses logout dengan menghapus session user yang sedang aktif.

**Request Body:**
Menerima payload JSON dengan format:
```json
{
    "token": "string"
}
```

**Mekanisme Logika Bisnis:**
1. Menerima request body dan validasi apakah field `token` tersedia (tipe string).
2. Lakukan pencarian atau langsung eksekusi perintah `DELETE` pada tabel `sessions` di mana field `token` bernilai sama dengan token yang diberikan.
3. Jika proses penghapusan berhasil, kembalikan response sukses.

**Response Sukses:**
```json
{
    "data" : "OK"
}
```

## 3. Skenario Testing Verifikasi

Implementasikan pengujian untuk memastikan API berjalan dengan baik:

### Skenario Positif (Berhasil Logout):
- **Langkah**: Kirim request `DELETE /api/users/logout` dengan payload berisi `token` session yang masih valid dan aktif.
- **Ekspektasi Output**: API mengembalikan status 200 OK dengan payload `{ "data": "OK" }`.
- **Ekspektasi Efek Samping (Side Effect)**: Lakukan pengecekan ke tabel `sessions` menggunakan token tersebut dan pastikan data token tersebut sudah tidak ada / terhapus.

### Skenario Negatif (Gagal Logout):
- **Langkah**: Kirim request `DELETE /api/users/logout` dengan payload berisi `token` yang **tidak valid** (contoh: token sembarangan) atau format payload tidak lengkap.
- **Ekspektasi Output**: API harus menolak request dan tidak mengembalikan status 200 (misalnya mengembalikan error validasi 400 Bad Request jika format salah, atau mengabaikan jika token tidak ditemukan). Pastikan aplikasi tidak *crash* ketika token tidak ada di database.
