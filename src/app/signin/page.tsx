import { signIn } from "@/auth";

export default function SignInPage() {
  return <main className="signin-shell"><form className="signin-card" action={async (formData: FormData) => { "use server"; await signIn("email", formData); }}><div className="brand signin-brand"><span className="brand-mark">⌂</span><span>apartment<span className="brand-strong">hub</span></span></div><h1>Welcome home.</h1><p>Sign in with your community email to continue.</p><label className="field-label">Email address<input type="email" name="email" required placeholder="you@example.com" autoComplete="email"/></label><button className="primary-button" type="submit">Email me a sign-in link <span>→</span></button><small>Your sign-in link is private and expires shortly after it’s sent.</small></form></main>;
}
