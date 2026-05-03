import Link from "next/link";
import { ArrowLeft, Home, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-base px-6 py-16 text-text-primary">
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-112 w-md -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,200,212,0.18)_0%,rgba(0,200,212,0)_68%)] blur-3xl" />
        <div className="absolute -right-24 -top-20 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(100,87,249,0.16)_0%,rgba(100,87,249,0)_72%)] blur-3xl" />
      </div>

      <section className="relative w-full max-w-3xl rounded-3xl border border-border-default bg-bg-surface/90 p-8 shadow-[0_24px_100px_rgba(0,0,0,0.45)] backdrop-blur md:p-12">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-elevated px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-text-muted">
          <span className="h-2 w-2 rounded-full bg-accent-primary" />
          Route Lost In The Void
        </div>

        <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <div className="space-y-5">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-text-faint">
                Error 404
              </p>
              <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-balance md:text-5xl">
                That page isn&apos;t part of this architecture.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-text-secondary">
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

          <div className="rounded-2xl border border-border-subtle bg-bg-elevated/80 p-6">
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
            <div className="space-y-3 text-sm text-text-secondary">
              <p>
                Try opening the editor workspace if you&apos;re already signed
                in.
              </p>
              <p>
                If you were following an old link, the destination may have been
                renamed during setup.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}