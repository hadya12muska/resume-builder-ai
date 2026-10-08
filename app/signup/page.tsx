"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(
      "Account created! Check your email to confirm your account."
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#171717]">
      <nav className="border-b border-black/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="/" className="text-xl font-bold tracking-tight">
            ResumeAI<span className="text-[#6b6b6b]">.</span>
          </a>

          <a
            href="/login"
            className="text-sm font-medium text-[#555] hover:text-black"
          >
            Sign in
          </a>
        </div>
      </nav>

      <section className="flex min-h-[calc(100vh-81px)] items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#777]">
              Get started
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em]">
              Create your account
            </h1>

            <p className="mt-3 text-[#666]">
              Start building your professional resume.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="border border-black/10 bg-white p-7 shadow-sm sm:p-8"
          >
            <div>
              <label htmlFor="email" className="text-sm font-medium">
                Email address
              </label>

              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full border border-black/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                placeholder="you@example.com"
              />
            </div>

            <div className="mt-5">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>

              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full border border-black/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                placeholder="At least 6 characters"
              />
            </div>

            <div className="mt-5">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium"
              >
                Confirm password
              </label>

              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                className="mt-2 w-full border border-black/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                placeholder="Enter your password again"
              />
            </div>

            {message && (
              <div className="mt-5 border border-black/10 bg-[#f7f7f5] px-4 py-3 text-sm text-[#555]">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-full bg-[#171717] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account →"}
            </button>

            <p className="mt-6 text-center text-sm text-[#777]">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-medium text-[#171717] underline underline-offset-4"
              >
                Sign in
              </a>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}