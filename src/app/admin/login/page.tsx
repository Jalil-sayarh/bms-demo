"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAdmin, type AdminActionState } from "@/app/actions/admin";

const initial: AdminActionState = { ok: false, message: "" };

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAdmin, initial);

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-100 px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl ring-1 ring-stone-200">
        <Link href="/" className="text-sm text-stone-500 hover:text-stone-800">
          ← Back to site
        </Link>
        <h1 className="mt-4 text-2xl font-light text-stone-900">Admin login</h1>
        <p className="mt-2 text-sm text-stone-500">
          Seeded credentials: admin@demo.local / admin123
        </p>
        <form action={formAction} className="mt-8 space-y-4">
          <label className="block text-sm text-stone-600">
            Email
            <input
              type="email"
              name="email"
              defaultValue="admin@demo.local"
              className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2"
              required
            />
          </label>
          <label className="block text-sm text-stone-600">
            Password
            <input
              type="password"
              name="password"
              defaultValue="admin123"
              className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2"
              required
            />
          </label>
          {state.message ? (
            <p className="text-sm text-rose-700">{state.message}</p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-stone-900 px-4 py-3 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
