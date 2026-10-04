"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useRef, useState } from "react";
import { Reveal, RevealItem, RevealLine, EASE } from "@/components/Reveal";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function Newsletter() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const done = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) {
      setError("Please enter your email address.");
      input.current?.focus();
      return;
    }
    if (!EMAIL.test(value)) {
      setError("That doesn't look like an email address yet.");
      input.current?.focus();
      return;
    }
    setError(null);
    setBusy(true);
    // Nothing leaves the browser: this is a concept store.
    window.setTimeout(() => {
      setBusy(false);
      setSent(true);
      window.setTimeout(() => done.current?.focus(), 50);
    }, 650);
  };

  return (
    <section id="letters" aria-labelledby="letters-title" className="relative overflow-hidden bg-clay-100/60">
      <div className="mx-auto grid max-w-[1680px] gap-12 px-5 py-24 md:px-8 md:py-32 lg:grid-cols-12 lg:px-12 lg:py-36">
        <Reveal className="lg:col-span-6">
          <RevealItem as="p" className="label text-ink-500">
            Letters from the atelier
          </RevealItem>
          <h2 id="letters-title" className="mt-5 font-serif text-title font-light tracking-[-0.02em]">
            <RevealLine>Four letters</RevealLine>
            <RevealLine>
              <span className="italic text-clay-600">a year.</span>
            </RevealLine>
          </h2>
          <RevealItem as="p" className="mt-6 max-w-[38ch] text-[1.0625rem] leading-relaxed text-ink-700">
            New velvets before anyone else, notes from the workshop floor and the occasional sample sale. Never more than
            four a year.
          </RevealItem>
        </Reveal>

        <Reveal className="flex items-end lg:col-span-5 lg:col-start-8">
          <RevealItem className="w-full">
            <AnimatePresence mode="wait" initial={false}>
              {sent ? (
                <motion.div
                  key="done"
                  ref={done}
                  tabIndex={-1}
                  role="status"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: EASE }}
                  className="rounded-[1.25rem] border border-ink-900/10 bg-oat-50/70 p-7 focus:outline-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-full bg-ink-900 text-oat-50" aria-hidden>
                      <svg width="14" height="11" viewBox="0 0 14 11">
                        <motion.path
                          d="M1 5.5l4 4L13 1"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
                        />
                      </svg>
                    </span>
                    <p className="font-serif text-[2rem] leading-none">You&rsquo;re on the list.</p>
                  </div>
                  <p className="mt-4 text-ink-700">
                    The first letter will find <span className="text-ink-900">{email.trim()}</span> with the next velvet.
                  </p>
                  <p className="mt-3 text-[0.8125rem] text-ink-500">
                    Concept store: this form doesn&rsquo;t send or store anything.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={submit}
                  noValidate
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  <label htmlFor={`${id}-email`} className="label text-ink-500">
                    Email address
                  </label>
                  <div
                    className={`mt-3 flex items-center gap-2 rounded-full border bg-oat-50/80 p-1.5 pl-5 transition-colors focus-within:border-ink-900 ${
                      error ? "border-clay-600" : "border-ink-900/15"
                    }`}
                  >
                    <input
                      ref={input}
                      id={`${id}-email`}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      aria-invalid={!!error}
                      aria-describedby={error ? `${id}-error` : `${id}-hint`}
                      className="h-11 min-w-0 flex-1 bg-transparent text-[1rem] text-ink-900 placeholder:text-ink-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={busy}
                      className="h-11 shrink-0 rounded-full bg-ink-900 px-6 text-[0.9375rem] text-oat-50 transition-colors hover:bg-clay-700 disabled:opacity-70"
                    >
                      {busy ? "Adding…" : "Subscribe"}
                    </button>
                  </div>
                  <div className="mt-3 min-h-[1.25rem] pl-5 text-[0.875rem]">
                    <p id={`${id}-error`} role="alert" className="text-clay-700">
                      {error}
                    </p>
                    {!error && (
                      <p id={`${id}-hint`} className="text-ink-500">
                        One click to leave, whenever you like.
                      </p>
                    )}
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </RevealItem>
        </Reveal>
      </div>
    </section>
  );
}
