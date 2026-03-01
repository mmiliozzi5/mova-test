import Link from "next/link";

const features = [
  {
    icon: "📊",
    title: "Daily Mood Tracking",
    desc: "A quick emoji check-in captures how employees feel each day — building streaks that encourage consistency.",
  },
  {
    icon: "💬",
    title: "AI Wellness Chat",
    desc: "An empathetic AI companion available 24/7 — for processing stress, exploring coping strategies, or simply venting.",
  },
  {
    icon: "📚",
    title: "Resource Library",
    desc: "Curated articles, videos, and tips on burnout, mindfulness, career growth, and more — filterable by topic.",
  },
  {
    icon: "🔒",
    title: "Privacy by Design",
    desc: "Admins see only anonymized, aggregated metrics. Individual data is never exposed — not even to administrators.",
  },
];

const stats = [
  { value: "76%", label: "of workers report work-related stress" },
  { value: "5×", label: "ROI on mental health programs" },
  { value: "30%", label: "reduction in absenteeism with support" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="border-b border-slate-100 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-slate-800 text-lg">MOVA</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
              aria-label="Sign in to MOVA"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="btn-primary text-sm"
              aria-label="Get started with MOVA"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1.5 rounded-full mb-6">
          <span>Mental wellness for modern teams</span>
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-slate-800 leading-tight mb-6">
          Your team&apos;s mental<br />
          health,{" "}
          <span className="text-blue-600">protected</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          MOVA gives employees a private space to track moods, chat with an AI wellness companion, and access mental health resources — while giving leaders the aggregated insights they need.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register" className="btn-primary px-8 py-3 text-base" aria-label="Start using MOVA">
            Start for free →
          </Link>
          <Link href="/login" className="btn-secondary px-8 py-3 text-base" aria-label="Sign in to existing account">
            Sign in
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-y border-slate-100 py-12">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-bold text-blue-600 mb-2">{s.value}</p>
              <p className="text-slate-500 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-3">
            Everything your team needs
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Simple for employees. Insightful for leaders. Private by default.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-slate-800 text-lg mb-2">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mood scale visualization */}
      <section className="bg-white border-y border-slate-100 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-3">
            Daily check-ins in under 10 seconds
          </h2>
          <p className="text-slate-500 text-sm mb-8">
            Five emojis. One tap. Your wellness data — private and secure.
          </p>
          <div className="flex justify-center gap-4 sm:gap-8">
            {[
              { emoji: "😔", label: "Very Low", color: "bg-rose-100" },
              { emoji: "😟", label: "Low", color: "bg-amber-100" },
              { emoji: "😐", label: "Neutral", color: "bg-slate-100" },
              { emoji: "🙂", label: "Good", color: "bg-emerald-100" },
              { emoji: "😄", label: "Excellent", color: "bg-emerald-200" },
            ].map((m) => (
              <div key={m.label} className="flex flex-col items-center gap-2">
                <div className={`w-14 h-14 ${m.color} rounded-2xl flex items-center justify-center text-3xl`}>
                  {m.emoji}
                </div>
                <span className="text-xs text-slate-500">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">
          Ready to support your team?
        </h2>
        <p className="text-slate-500 mb-8 text-lg">
          Join MOVA today. Your employees&apos; privacy is always protected.
        </p>
        <Link href="/register" className="btn-primary px-10 py-3 text-base inline-block" aria-label="Create your MOVA account">
          Create your account →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">M</span>
            </div>
            <span className="font-bold text-slate-700 text-sm">MOVA</span>
          </div>
          <p className="text-xs text-slate-400">
            Mental Health for Organizations. Privacy-first. Always.
          </p>
        </div>
      </footer>
    </div>
  );
}
