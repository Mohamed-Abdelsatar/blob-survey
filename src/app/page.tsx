import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <span className="text-xl font-bold text-purple-700">🫧 Blob Survey</span>
        <Link
          href="/admin"
          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          Create a Survey →
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 gap-8">
        <div className="text-8xl animate-bounce">🫧</div>
        <div className="max-w-2xl flex flex-col gap-4">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight">
            Surveys that don&apos;t suck.
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed">
            Memes. Reactions. Funny quotes. Give your audience a survey they&apos;ll actually enjoy filling out — and get real feedback in return.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/admin"
            className="px-8 py-4 bg-purple-600 text-white rounded-xl text-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
          >
            Create your survey free →
          </Link>
          <a
            href="#how"
            className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl text-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            See how it works
          </a>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-gray-50 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            {[
              { emoji: "✏️", title: "1. Create", desc: "Build your survey in seconds. Add star ratings, polls, or open questions." },
              { emoji: "🔗", title: "2. Share", desc: "Share a link or show a QR code. People fill it on their phones instantly." },
              { emoji: "🎉", title: "3. Watch live", desc: "See responses roll in live on your results screen. No refresh needed." },
            ].map((s) => (
              <div key={s.title} className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl shadow-sm">
                <span className="text-5xl">{s.emoji}</span>
                <h3 className="text-xl font-bold">{s.title}</h3>
                <p className="text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Not your grandma&apos;s survey tool</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { emoji: "🤣", title: "Memes react to answers", desc: "Every response triggers a funny meme and a savage quote. People will want to see what they get." },
              { emoji: "📺", title: "Live results on the big screen", desc: "Perfect for events — show real-time responses on a projector as people vote." },
              { emoji: "📱", title: "QR code ready", desc: "Generate a QR code for any survey. Slap it on a slide or a poster." },
              { emoji: "🏆", title: "Shareable completion card", desc: "After submitting, people get a funny card they can screenshot and share. Free marketing." },
              { emoji: "📊", title: "Export your data", desc: "Download all responses as CSV whenever you need them." },
              { emoji: "⚡", title: "Done in 60 seconds", desc: "Pick a template, customize it, share the link. That's literally it." },
            ].map((f) => (
              <div key={f.title} className="flex gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-3xl flex-shrink-0">{f.emoji}</span>
                <div>
                  <h3 className="font-bold text-gray-900">{f.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-purple-600 py-20 px-6 text-center">
        <div className="max-w-xl mx-auto flex flex-col items-center gap-6">
          <h2 className="text-4xl font-extrabold text-white">Ready to make your next survey actually fun?</h2>
          <Link
            href="/admin"
            className="px-8 py-4 bg-white text-purple-700 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Create your free survey →
          </Link>
        </div>
      </section>

      <footer className="text-center py-8 text-sm text-gray-400 flex flex-col items-center gap-1">
        <p>Built with 💜 by <a href="https://www.linkedin.com/in/mohamedabdelsatar" target="_blank" rel="noopener noreferrer" className="text-purple-600 font-semibold hover:underline">Mohamed Abdelsatar</a></p>
        <p className="text-xs text-gray-300">AI PM • Builder • Making boring things fun</p>
      </footer>
    </main>
  );
}
