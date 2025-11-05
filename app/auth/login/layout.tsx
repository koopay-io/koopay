import { AuthLayout } from './_components/AuthLayout';

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthLayout>
      <div className="flex min-h-svh w-full items-center justify-center p-2 lg:justify-end lg:pr-0">
        {children}
      </div>
    </AuthLayout>
  );
}
