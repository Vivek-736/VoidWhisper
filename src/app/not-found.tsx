import Link from "next/link";
import { ArrowLeft, Home, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen overflow-hidden bg-bg-base text-text-primary">
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-168 w-2xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,200,212,0.16)_0%,rgba(0,200,212,0)_70%)] blur-3xl" />
        <div className="absolute -left-32 -top-28 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(100,87,249,0.14)_0%,rgba(100,87,249,0)_72%)] blur-3xl" />
        <div className="absolute -bottom-36 -right-24 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_72%)] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.02),transparent_32%,transparent_68%,rgba(255,255,255,0.03))]" />
      </div>

      <section className="relative flex min-h-screen w-full items-center px-6 py-16 md:px-10 lg:px-14">
        <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-end">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-elevated/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-text-muted backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-accent-primary" />
              Route Lost In The Void
            </div>

            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.32em] text-text-faint">
                Error 404
              </p>
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-balance md:text-6xl lg:text-7xl">
                That page isn&apos;t part of this architecture.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-text-secondary md:text-lg">
                The route you tried to open does not exist, may have moved, or
                was never wired into Void Whisper. Head back to a stable entry
                point and continue building.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link href="/editor">
                  <Home className="h-4 w-4" />
                  Open Editor
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link href="/sign-in">
                  <ArrowLeft className="h-4 w-4" />
                  Return To Sign In
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 self-stretch lg:max-w-md">
            <div className="rounded-[1.75rem] border border-border-subtle bg-bg-surface/72 p-6 backdrop-blur">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border-subtle bg-bg-base text-accent-primary">
                  <SearchX className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    Navigation status
                  </p>
                  <p className="text-sm text-text-muted">
                    No matching route found
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm leading-6 text-text-secondary">
                <p>
                  Try opening the editor workspace if you&apos;re already signed
                  in.
                </p>
                <p>
                  If you were following an old link, the destination may have
                  been renamed during setup.
                </p>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-border-subtle bg-bg-elevated/55 p-6 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-text-faint">
                Recovery Path
              </p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-text-secondary">
                <p>Sign in to restore your workspace session.</p>
                <p>Open the editor to continue from a known route.</p>
                <p>Use browser history if you want to inspect the previous page.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}