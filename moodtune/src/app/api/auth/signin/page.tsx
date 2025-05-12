import { redirect } from 'next/navigation';

export default function SignIn() {
  redirect('/login?error=CredentialsSignin');
  return null;
} 