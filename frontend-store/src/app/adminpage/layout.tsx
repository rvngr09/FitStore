import AdminPageLayout from '@/components/AdminPageLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminPageLayout>{children}</AdminPageLayout>;
}
