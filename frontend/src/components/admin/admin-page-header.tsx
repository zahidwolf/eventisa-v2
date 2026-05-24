interface AdminPageHeaderProps {
  title: string;
  description?: string;
}

export function AdminPageHeader({ title, description }: AdminPageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="font-display text-2xl font-bold text-white md:text-3xl">{title}</h1>
      {description && <p className="mt-2 text-sm text-zinc-500">{description}</p>}
    </div>
  );
}
