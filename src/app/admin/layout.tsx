export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={
        {
          "--background": "#2e2013",
          "--panel": "#3c2c1a",
          "--foreground": "#f0e6d2",
          "--accent": "#c99a4a",
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}