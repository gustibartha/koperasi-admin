import { redirect } from 'next/navigation';

export default function HomePage() {
  // Langsung otomatis arahkan pengguna ke halaman dashboard
  redirect('/dashboard');
}