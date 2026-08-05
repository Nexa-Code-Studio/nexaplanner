# Product Requirements Document (PRD)

# **NexaHub Timeline**

### Internal Timeline & Event Management System

**Version:** 1.0 (MVP)
**Status:** Draft
**Owner:** NexaCode
**Platform:** Web (Responsive)

---

# 1. Overview

## Background

NexaCode mengelola berbagai aktivitas dalam satu waktu, seperti:

* Kompetisi
* Project Client
* Meeting
* Seminar
* Workshop
* Deadline Proposal
* Internal Event
* Jadwal PKL
* Jadwal Presentasi

Saat ini seluruh informasi masih tersebar di WhatsApp, Discord, Notion, Google Calendar, maupun file PDF sehingga menyebabkan:

* deadline terlewat
* timeline sulit dicari
* anggota baru tidak mengetahui agenda tim
* admin harus memasukkan event satu per satu
* tidak ada reminder otomatis

NexaHub Timeline dikembangkan sebagai pusat informasi kegiatan tim yang memungkinkan admin mengimpor puluhan jadwal sekaligus dari teks, kemudian seluruh anggota dapat melihat timeline dan menerima pengingat melalui email.

---

# 2. Objectives

Membangun aplikasi internal yang mampu:

* Mengelola seluruh agenda NexaCode
* Mengimpor timeline hanya dengan copy-paste teks
* Menampilkan kalender kegiatan
* Menampilkan timeline kegiatan
* Mengirim reminder email otomatis
* Menggunakan Google Login
* Tanpa AI maupun LLM

---

# 3. Goals

### MVP

✅ Login Google

✅ Manajemen Event

✅ Manajemen Kategori

✅ Import Timeline dari Text

✅ Kalender

✅ Timeline

✅ Reminder Email

✅ Member Management

---

# 4. Non Goals

Versi pertama tidak mencakup:

* AI
* OCR
* Chat
* Kanban
* Task Management
* Mobile App
* Push Notification
* WhatsApp Notification
* Sinkronisasi Google Calendar

---

# 5. User Roles

## Administrator

Memiliki hak akses:

* CRUD Event
* CRUD Category
* CRUD Member
* Import Timeline
* Mengirim Reminder
* Melihat Dashboard

---

## Member

Memiliki hak akses:

* Login
* Melihat Kalender
* Melihat Timeline
* Melihat Detail Event
* Menerima Email Reminder

---

# 6. User Flow

## Administrator

```text
Login Google
        │
        ▼
Dashboard
        │
        ▼
Paste Timeline
        │
        ▼
Preview Parsing
        │
        ▼
Import
        │
        ▼
Firestore
        │
        ▼
Kalender Terupdate
```

---

## Member

```text
Login Google
        │
        ▼
Dashboard
        │
        ▼
Kalender
        │
        ▼
Klik Event
        │
        ▼
Melihat Detail
```

---

# 7. Features

## 7.1 Authentication

### Login

Menggunakan Google Login melalui Firebase Authentication.

Tidak terdapat registrasi manual.

---

### Authorization

Role:

* Admin
* Member

Admin memiliki akses penuh.

Member hanya memiliki akses Read Only.

---

# 7.2 Dashboard

Dashboard menampilkan:

* Agenda Hari Ini
* Upcoming Event
* Total Event Bulan Ini
* Event berdasarkan kategori
* Reminder terdekat

---

# 7.3 Calendar

Mode:

* Month View
* Week View
* Day View

Fitur:

* Klik tanggal
* Klik event
* Filter kategori
* Warna kategori
* Search event

---

# 7.4 Timeline

Selain kalender.

Disediakan tampilan timeline horizontal.

Contoh

```text
Jun
█████████

Jul
██████████████

Aug
███████
```

---

# 7.5 Event Management

Admin dapat:

* Tambah Event
* Edit Event
* Hapus Event

Field:

| Field       | Type      |
| ----------- | --------- |
| Title       | String    |
| Category    | Reference |
| Description | Text      |
| Start Date  | Date      |
| End Date    | Date      |
| Location    | String    |
| Color       | String    |

---

# 7.6 Category Management

Kategori dapat dibuat bebas.

Contoh:

* Competition
* Client
* Internal
* Meeting
* Seminar
* Workshop

Setiap kategori mempunyai warna sendiri.

---

# 7.7 Member Management

Admin dapat:

* Menambah email
* Menghapus email
* Mengubah role

Hanya email yang terdaftar yang dapat login.

---

# 7.8 Timeline Import (Core Feature)

## Tujuan

Menghindari input satu per satu.

Admin cukup melakukan copy-paste timeline.

Contoh:

```text
KTI TFS

20 Jun - 4 Jul 2026
Pendaftaran & Submission Abstrak

5 - 15 Jul 2026
Extend Pendaftaran & Submission Abstrak

18 Jul 2026
Pengumuman Lolos Abstrak

19 - 27 Jul 2026
Submission Fullpaper Batch 1

28 Jul - 5 Agu 2026
Submission Fullpaper Batch 2
```

Klik

```
Import Timeline
```

↓

Sistem otomatis membuat seluruh event.

---

# 8. Timeline Parser

Parser menggunakan:

* Regex
* Date Normalizer
* Text Parser

Tanpa AI.

Parser harus mengenali format berikut.

---

## Single Date

```text
18 Jul 2026
Pengumuman
```

---

## Same Month

```text
5 - 15 Jul 2026
Submission
```

---

## Different Month

```text
28 Jul - 5 Agu 2026
Submission
```

---

## Full Range

```text
20 Jun - 4 Jul 2026
Pendaftaran
```

---

Output parser

```json
{
"title":"Submission",
"category":"KTI TFS",
"startDate":"2026-07-05",
"endDate":"2026-07-15"
}
```

---

# 9. Import Preview

Sebelum disimpan.

Admin melihat tabel hasil parsing.

| Event       | Start  | End    |
| ----------- | ------ | ------ |
| Pendaftaran | 20 Jun | 4 Jul  |
| Submission  | 5 Jul  | 15 Jul |

Jika benar

↓

Klik Save.

---

# 10. Search

Member dapat mencari berdasarkan:

* Judul
* Bulan
* Kategori

---

# 11. Email Reminder

Scheduler berjalan setiap hari pukul **07.00 WIB**.

Reminder dikirim pada:

* H-7
* H-3
* H-1
* Hari H

Untuk event dengan rentang tanggal, email dikirim:

* Saat event dimulai.
* Sehari sebelum event berakhir (opsional).
* Saat hari terakhir event (opsional).

---

# 12. Email Template

Subject

```
📅 NexaHub Reminder
```

Body

```
Halo, Otun.

Hari ini terdapat agenda:

Submission Fullpaper Batch 2

Kategori:
KTI TFS

Tanggal:
28 Juli 2026

Semoga kegiatan berjalan lancar.
```

---

# 13. Database Design

## users

| Field     | Type         |
| --------- | ------------ |
| uid       | String       |
| name      | String       |
| email     | String       |
| photoURL  | String       |
| role      | admin/member |
| createdAt | Timestamp    |

---

## categories

| Field     | Type      |
| --------- | --------- |
| id        | String    |
| name      | String    |
| color     | String    |
| createdAt | Timestamp |

---

## events

| Field       | Type      |
| ----------- | --------- |
| id          | String    |
| title       | String    |
| categoryId  | String    |
| description | String    |
| startDate   | Timestamp |
| endDate     | Timestamp |
| location    | String    |
| color       | String    |
| createdBy   | String    |
| createdAt   | Timestamp |

---

## reminder_logs

| Field        | Type        |
| ------------ | ----------- |
| id           | String      |
| eventId      | String      |
| reminderType | H7/H3/H1/H0 |
| sentAt       | Timestamp   |

---

# 14. Tech Stack

## Frontend

* Next.js 15 (App Router)
* React 19
* TypeScript
* Tailwind CSS
* shadcn/ui
* FullCalendar
* TanStack Table
* React Hook Form
* Zod

---

## Backend

Menggunakan Next.js API Route.

---

## Authentication

Firebase Authentication

Provider:

* Google

---

## Database

Firebase Firestore

---

## Storage

Firebase Storage

---

## Email

Resend

---

## Scheduler

Vercel Cron

Flow:

```
07.00

↓

Cron

↓

API Route

↓

Firestore

↓

Resend

↓

Email Member
```

---

## Hosting

Frontend

* Vercel

Backend

* Next.js API Route (Vercel)

Database

* Firebase

---

# 15. Folder Structure

```text
src/
├── app/
│   ├── (auth)/
│   ├── dashboard/
│   ├── calendar/
│   ├── timeline/
│   ├── categories/
│   ├── events/
│   ├── members/
│   ├── import/
│   ├── settings/
│   └── api/
├── components/
├── features/
│   ├── auth/
│   ├── calendar/
│   ├── events/
│   ├── parser/
│   ├── reminder/
│   └── members/
├── lib/
│   ├── firebase.ts
│   ├── auth.ts
│   ├── parser.ts
│   └── resend.ts
├── hooks/
├── types/
└── utils/
```

---

# 16. Success Metrics

| Metric                    | Target    |
| ------------------------- | --------- |
| Login berhasil            | ≥99%      |
| Parsing timeline berhasil | ≥95%      |
| Import 30 event           | ≤2 menit  |
| Kalender dimuat           | ≤2 detik  |
| Email reminder berhasil   | ≥99%      |
| Input manual event        | ≤30 detik |

---

# 17. Roadmap

### v1.0 (MVP)

* ✅ Google Login
* ✅ Kalender
* ✅ Timeline
* ✅ CRUD Event
* ✅ CRUD Kategori
* ✅ Import Timeline dari Text
* ✅ Email Reminder

### v1.1

* Import Excel (.xlsx)
* Export CSV
* Export PDF
* Export ICS (Google Calendar)

### v1.2

* Import PDF (ekstraksi teks)
* Lampiran pada Event
* Tag anggota pada Event

### v1.3

* Notifikasi Telegram
* Notifikasi Discord
* Sinkronisasi Google Calendar

### v2.0

* Task Management
* Kanban Board
* Project Management
* File Repository
* Dashboard Analytics

---

# Catatan Teknis

Untuk kebutuhan NexaCode, saya menyarankan satu penyesuaian kecil agar sistem lebih fleksibel: **pisahkan konsep "Kategori" dan "Workspace"**.

* **Workspace**: misalnya *Internal NexaCode*, *Kompetisi*, *Client Project*, atau *PKL*. Workspace menentukan siapa saja yang dapat melihat data.
* **Kategori**: misalnya *Meeting*, *Deadline*, *Seminar*, *Presentation*, *Development*. Kategori hanya digunakan untuk pengelompokan dan pewarnaan event.

Dengan struktur ini, nanti jika NexaCode memiliki banyak proyek klien, setiap proyek dapat memiliki workspace sendiri tanpa mencampur timeline satu sama lain, sementara kategori tetap konsisten di seluruh aplikasi. Ini akan membuat arsitektur aplikasi lebih mudah dikembangkan ketika tim bertambah besar.
