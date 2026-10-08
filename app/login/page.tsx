"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#171717]">
      <nav className="border-b border-black/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="/" className="text-xl font-bold tracking-tight">
            ResumeAI<span className="text-[#6b6b6b]">.</span>
          </a>

          <a
            href="/signup"
            className="text-sm font-medium text-[#555] hover:text-black"
          >
            Create account
          </a>
        </div>
      </nav>

      <section className="flex min-h-[calc(100vh-81px)] items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#777]">
              Welcome back
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em]">
              Sign in
            </h1>

            <p className="mt-3 text-[#666]">
              Continue building your professional resume.
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
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full border border-black/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                placeholder="Enter your password"
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
              {loading ? "Signing in..." : "Sign in →"}
            </button>

            <p className="mt-6 text-center text-sm text-[#777]">
              Don't have an account?{" "}
              <a
                href="/signup"
                className="font-medium text-[#171717] underline underline-offset-4"
              >
                Create one
              </a>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}