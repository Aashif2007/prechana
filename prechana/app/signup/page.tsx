import { AuthForm } from "@/components/AuthForm";
import { signup } from "@/app/login/actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return <AuthForm mode="signup" action={signup} error={error} />;
}
