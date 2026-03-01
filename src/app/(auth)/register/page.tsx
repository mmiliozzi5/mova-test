"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

interface Department {
  id: string;
  name: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    orgSlug: "",
    departmentId: "",
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [orgError, setOrgError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [slugLoading, setSlugLoading] = useState(false);

  useEffect(() => {
    if (form.orgSlug.length < 2) {
      setDepartments([]);
      setOrgError("");
      return;
    }

    const timer = setTimeout(async () => {
      setSlugLoading(true);
      try {
        const res = await fetch(`/api/departments?orgSlug=${form.orgSlug}`);
        if (!res.ok) {
          setOrgError("Organization not found.");
          setDepartments([]);
        } else {
          const data = await res.json();
          setDepartments(data);
          setOrgError("");
        }
      } catch {
        setOrgError("Could not verify organization.");
      } finally {
        setSlugLoading(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [form.orgSlug]);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (orgError) return;
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Registration failed.");
      setLoading(false);
      return;
    }

    // Auto sign-in
    const signInRes = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (signInRes?.error) {
      router.push("/login");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4">
            <span className="text-white text-2xl">M</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Join MOVA</h1>
          <p className="text-slate-500 mt-1">Create your employee wellness account</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                Full name
              </label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className="input-field"
                placeholder="Alex Johnson"
                required
                aria-label="Full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Work email
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="input-field"
                placeholder="you@company.com"
                required
                aria-label="Work email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                className="input-field"
                placeholder="At least 8 characters"
                required
                minLength={8}
                aria-label="Password"
              />
            </div>

            <div>
              <label htmlFor="orgSlug" className="block text-sm font-medium text-slate-700 mb-1">
                Organization code
              </label>
              <input
                id="orgSlug"
                type="text"
                value={form.orgSlug}
                onChange={(e) => update("orgSlug", e.target.value.toLowerCase())}
                className={`input-field ${orgError ? "border-rose-300 focus:ring-rose-400" : ""}`}
                placeholder="your-company"
                required
                aria-label="Organization code"
              />
              {slugLoading && (
                <p className="text-xs text-slate-400 mt-1">Verifying…</p>
              )}
              {orgError && (
                <p className="text-xs text-rose-500 mt-1">{orgError}</p>
              )}
              {departments.length > 0 && !orgError && (
                <p className="text-xs text-emerald-600 mt-1">✓ Organization found</p>
              )}
            </div>

            {departments.length > 0 && (
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-slate-700 mb-1">
                  Department <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <select
                  id="department"
                  value={form.departmentId}
                  onChange={(e) => update("departmentId", e.target.value)}
                  className="input-field"
                  aria-label="Department"
                >
                  <option value="">Select your department…</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !!orgError || slugLoading}
              className="btn-primary w-full"
              aria-label="Create account"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
