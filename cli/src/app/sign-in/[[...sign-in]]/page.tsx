import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignIn afterSignInUrl="/dashboard" redirectUrl="/dashboard" />
    </div>
  );
}
