export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout bypasses the admin auth check
  // so the login page is accessible without authentication
  return <>{children}</>;
}

