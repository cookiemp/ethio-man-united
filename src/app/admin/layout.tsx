import { AdminNav } from '@/components/layout/admin-nav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row gap-8">
      <aside className="md:w-64">
        <AdminNav />
      </aside>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
