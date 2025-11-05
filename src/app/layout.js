import "./globals.css";

export const metadata = {
  title: "Antrian Rumah Sakit",
  description: "Aplikasi antrian rumah sakit menggunakan Next.js + Supabase",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
