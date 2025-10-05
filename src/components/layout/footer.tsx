export function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex items-center justify-center h-16">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Red Devils Hub. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
