import { Container } from "@/components/common/container";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-[calc(100vh-8rem)] overflow-hidden py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(229,9,20,0.12),transparent_70%)]" />
      <Container size="narrow">{children}</Container>
    </div>
  );
}
