export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mt-24 p-4">
      {children}
    </div>
  );
}
