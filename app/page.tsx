export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#171717]">
      {/* Navigation */}
      <nav className="border-b border-black/10 bg-[#f7f7f5]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="/" className="text-xl font-bold tracking-tight">
            ResumeAI<span className="text-[#6b6b6b]">.</span>
          </a>

          <div className="flex items-center gap-6">
            <a
              href="#how-it-works"
              className="hidden text-sm text-[#555] transition hover:text-black sm:block"
            >
              How it works
            </a>

            <a
              href="/login"
              className="text-sm font-medium transition hover:text-[#666]"
            >
              Sign in
            </a>

            <a
              href="/signup"
              className="rounded-full bg-[#171717] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#333]"
            >
              Get started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-16 sm:pb-28 sm:pt-24">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <p className="mb-6 text-sm font-semibold uppercase tracking-[0.18em] text-[#777]">
              AI career tool
            </p>

            <h1 className="max-w-2xl text-5xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              Your experience.
              <br />
              Your career.
              <br />
              <span className="text-[#777]">One stronger resume.</span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-[#666]">
              Create a professional resume tailored to the job you want.
              ResumeAI helps you turn your real experience into clear,
              compelling content.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="/signup"
                className="rounded-full bg-[#171717] px-7 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-[#333]"
              >
                Build my resume →
              </a>

              <a
                href="#how-it-works"
                className="rounded-full border border-black/15 bg-white px-7 py-3.5 text-center text-sm font-semibold transition hover:bg-[#f0f0ee]"
              >
                See how it works
              </a>
            </div>

            <p className="mt-6 text-sm text-[#888]">
              Free to start · No design experience required
            </p>
          </div>

          {/* Resume Preview */}
          <div className="relative">
            <div className="absolute -right-3 -top-3 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-medium shadow-sm">
              AI enhanced
            </div>

            <div className="mx-auto max-w-md rotate-[1deg] bg-white p-8 shadow-[0_25px_70px_rgba(0,0,0,0.12)] sm:p-10">
              <div className="border-b border-black/10 pb-6">
                <p className="text-2xl font-bold tracking-tight">
                  Alex Morgan
                </p>

                <p className="mt-1 text-sm text-[#777]">
                  Frontend Developer
                </p>

                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#888]">
                  <span>alex@email.com</span>
                  <span>New York</span>
                  <span>linkedin.com/in/alex</span>
                </div>
              </div>

              <div className="mt-7">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#888]">
                  Profile
                </p>

                <p className="mt-3 text-xs leading-5 text-[#555]">
                  Frontend developer focused on building accessible,
                  responsive web applications using modern technologies.
                </p>
              </div>

              <div className="mt-7">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#888]">
                  Experience
                </p>

                <div className="mt-3">
                  <div className="flex justify-between gap-4">
                    <p className="text-xs font-semibold">
                      Frontend Developer
                    </p>
                    <p className="text-[10px] text-[#999]">
                      2024 — Present
                    </p>
                  </div>

                  <p className="mt-1 text-[11px] text-[#777]">
                    Technology Company
                  </p>

                  <ul className="mt-2 space-y-1 text-[11px] leading-4 text-[#555]">
                    <li>• Built responsive web applications</li>
                    <li>• Improved application performance</li>
                    <li>• Collaborated with product designers</li>
                  </ul>
                </div>
              </div>

              <div className="mt-7">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#888]">
                  Skills
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    "React",
                    "Next.js",
                    "TypeScript",
                    "JavaScript",
                    "Git",
                  ].map((skill) => (
                    <span
                      key={skill}
                      className="border border-black/10 px-2 py-1 text-[10px] text-[#555]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-y border-black/10 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-black/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="px-6 py-8">
            <p className="text-2xl font-semibold">01</p>
            <p className="mt-2 text-sm font-medium">Enter your experience</p>
          </div>

          <div className="px-6 py-8">
            <p className="text-2xl font-semibold">02</p>
            <p className="mt-2 text-sm font-medium">Let AI improve it</p>
          </div>

          <div className="px-6 py-8">
            <p className="text-2xl font-semibold">03</p>
            <p className="mt-2 text-sm font-medium">Download your resume</p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <section
        id="how-it-works"
        className="mx-auto max-w-7xl px-6 py-24 sm:py-32"
      >
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#777]">
            Simple by design
          </p>

          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
            From blank page to job-ready resume.
          </h2>

          <p className="mt-5 text-lg leading-8 text-[#666]">
            You provide the facts. AI helps you present them professionally.
            Your experience stays yours.
          </p>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden border border-black/10 bg-black/10 md:grid-cols-3">
          <div className="bg-[#f7f7f5] p-8 sm:p-10">
            <p className="text-sm font-semibold text-[#888]">01</p>

            <h3 className="mt-12 text-xl font-semibold">
              Tell us about yourself
            </h3>

            <p className="mt-4 text-sm leading-6 text-[#666]">
              Add your education, experience, projects, skills, and the type
              of job you're applying for.
            </p>
          </div>

          <div className="bg-[#f7f7f5] p-8 sm:p-10">
            <p className="text-sm font-semibold text-[#888]">02</p>

            <h3 className="mt-12 text-xl font-semibold">
              Get AI assistance
            </h3>

            <p className="mt-4 text-sm leading-6 text-[#666]">
              AI analyzes your information and helps make your descriptions
              clearer, stronger, and more relevant to your target role.
            </p>
          </div>

          <div className="bg-[#f7f7f5] p-8 sm:p-10">
            <p className="text-sm font-semibold text-[#888]">03</p>

            <h3 className="mt-12 text-xl font-semibold">
              Make it yours
            </h3>

            <p className="mt-4 text-sm leading-6 text-[#666]">
              Review the suggestions, edit your resume, preview the final
              version, and download it when you're ready.
            </p>
          </div>
        </div>
      </section>

      {/* AI section */}
      <section className="bg-[#171717] px-6 py-24 text-white sm:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#999]">
                Intelligent assistance
              </p>

              <h2 className="mt-5 max-w-xl text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
                Write less. Say more.
              </h2>

              <p className="mt-6 max-w-xl text-lg leading-8 text-[#aaa]">
                Instead of simply generating random text, ResumeAI uses the
                information you provide to help transform your real
                experience into professional resume language.
              </p>

              <a
                href="/signup"
                className="mt-9 inline-block rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#171717] transition hover:bg-[#e8e8e8]"
              >
                Start building →
              </a>
            </div>

            <div className="border border-white/10 bg-white/[0.04] p-7">
              <p className="text-xs uppercase tracking-[0.18em] text-[#777]">
                Before AI
              </p>

              <p className="mt-4 text-sm leading-7 text-[#aaa]">
                "I worked on a website and helped make it better and faster."
              </p>

              <div className="my-7 border-t border-white/10" />

              <p className="text-xs uppercase tracking-[0.18em] text-[#777]">
                After AI
              </p>

              <p className="mt-4 text-sm leading-7 text-white">
                "Developed responsive web interfaces and improved application
                performance through frontend optimization."
              </p>

              <p className="mt-6 text-xs text-[#777]">
                AI suggestion · Always review before submitting
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
            Your next opportunity starts with a better resume.
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-[#666]">
            Create your account and start building your resume today.
          </p>

          <a
            href="/signup"
            className="mt-9 inline-block rounded-full bg-[#171717] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#333]"
          >
            Create my resume →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/10 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-[#777] sm:flex-row">
          <p>
            ResumeAI<span className="text-[#aaa]">.</span>
          </p>

          <p>© 2026 ResumeAI. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}