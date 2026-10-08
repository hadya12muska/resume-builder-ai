"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type SavedResume = {
  id: string;
  title: string;
  template_id: string;
  created_at: string;
  updated_at: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [resumeToDelete, setResumeToDelete] =
    useState<SavedResume | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setEmail(user.email ?? "");

      const { data, error } = await supabase
        .from("resumes")
        .select(
          "id, title, template_id, created_at, updated_at"
        )
        .eq("user_id", user.id)
        .order("updated_at", {
          ascending: false,
        });

      if (error) {
        console.error(error);
        setMessage(
          "Could not load your saved resumes."
        );
      } else {
        setResumes(data ?? []);
      }

      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  async function handleLogout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.push("/");
  }

  async function handleDelete() {
    if (!resumeToDelete) {
      return;
    }

    setDeletingId(resumeToDelete.id);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("resumes")
      .delete()
      .eq("id", resumeToDelete.id);

    if (error) {
      console.error(error);
      setMessage("Failed to delete resume.");
      setDeletingId(null);
      return;
    }

    setResumes((current) =>
      current.filter(
        (resume) =>
          resume.id !== resumeToDelete.id
      )
    );

    setResumeToDelete(null);
    setDeletingId(null);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5] text-[#171717]">
        <p className="text-sm text-[#777]">
          Loading...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#171717]">
      <nav className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a
            href="/"
            className="text-xl font-bold tracking-tight"
          >
            ResumeAI
            <span className="text-[#6b6b6b]">.</span>
          </a>

          <button
            type="button"
            onClick={handleLogout}
            className="text-sm font-medium text-[#555] transition hover:text-black"
          >
            Sign out
          </button>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#777]">
              Dashboard
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em]">
              Welcome back.
            </h1>

            <p className="mt-3 text-[#666]">
              Signed in as {email}
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/builder")}
            className="w-fit rounded-full bg-[#171717] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#333]"
          >
            Create new resume →
          </button>
        </div>

        {message && (
          <div className="mt-8 border border-black/10 bg-white px-5 py-4 text-sm text-[#555]">
            {message}
          </div>
        )}

        <div className="mt-12">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#777]">
              Your resumes
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              {resumes.length === 0
                ? "Create your first resume"
                : `${resumes.length} saved ${
                    resumes.length === 1
                      ? "resume"
                      : "resumes"
                  }`}
            </h2>
          </div>

          {resumes.length === 0 ? (
            <div className="border border-black/10 bg-white p-8">
              <p className="max-w-lg text-sm leading-6 text-[#666]">
                You haven't saved any resumes yet.
                Create your first professional resume
                and save it here.
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push("/builder")
                }
                className="mt-7 rounded-full bg-[#171717] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#333]"
              >
                Create resume →
              </button>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="border border-black/10 bg-white p-6 transition hover:border-black/20"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#888]">
                        Resume
                      </p>

                      <h3 className="mt-2 text-xl font-semibold">
                        {resume.title}
                      </h3>
                    </div>

                    <div className="flex h-10 w-8 shrink-0 items-end justify-center border border-black/10 bg-[#f7f7f5] pb-1">
                      <div className="h-6 w-5 border border-black/20 bg-white" />
                    </div>
                  </div>

                  <div className="mt-6 border-t border-black/10 pt-4">
                    <p className="text-xs text-[#888]">
                      Last updated
                    </p>

                    <p className="mt-1 text-sm text-[#555]">
                      {new Date(
                        resume.updated_at
                      ).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/builder?id=${resume.id}`
                        )
                      }
                      className="flex-1 rounded-full bg-[#171717] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#333]"
                    >
                      Open
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setResumeToDelete(resume)
                      }
                      disabled={
                        deletingId === resume.id
                      }
                      className="rounded-full border border-black/15 px-4 py-2.5 text-sm font-semibold text-[#555] transition hover:border-black hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="border border-black/10 bg-white p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#777]">
              AI assistance
            </p>

            <h2 className="mt-4 text-2xl font-semibold">
              Improve your resume
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-[#666]">
              Get help making your experience clearer,
              stronger, and more professional.
            </p>

            <div className="mt-7 rounded-full border border-black/10 px-6 py-3 text-center text-sm text-[#777]">
              Available inside the builder
            </div>
          </div>

          <div className="border border-black/10 bg-white p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#777]">
              Resume templates
            </p>

            <h2 className="mt-4 text-2xl font-semibold">
              Choose your style
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-[#666]">
              Explore professional templates designed
              for different industries and career
              levels.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push("/builder")
              }
              className="mt-7 rounded-full border border-black/15 px-6 py-3 text-sm font-semibold text-[#171717] transition hover:border-black"
            >
              Browse templates →
            </button>
          </div>
        </div>
      </section>

      {resumeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div
            className="w-full max-w-md border border-black/10 bg-white p-7 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#777]">
              Delete resume
            </p>

            <h2
              id="delete-title"
              className="mt-3 text-2xl font-semibold tracking-[-0.02em]"
            >
              Are you sure you want to delete
              this resume?
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#666]">
              "{resumeToDelete.title}" will be
              permanently removed from your saved
              resumes.
            </p>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setResumeToDelete(null)
                }
                className="rounded-full border border-black/15 px-5 py-2.5 text-sm font-semibold text-[#555] transition hover:border-black hover:text-black"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={
                  deletingId === resumeToDelete.id
                }
                className="rounded-full bg-[#171717] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingId === resumeToDelete.id
                  ? "Deleting..."
                  : "Delete resume"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}