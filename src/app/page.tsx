import Link from "next/link";
export default function Home() {
  return (
    <main>
      <header className="app-header">
        <a className="brand" href="/">
          <img src="/foundation-logo.png" alt="Research Commons Africa logo" />
          <span>
            Research Commons<small>AFRICA</small>
          </span>
        </a>
        <Link className="button secondary" href="/sign-in">
          Sign in
        </Link>
      </header>
      <section className="hero">
        <div className="hero-orbit" aria-hidden="true">
          <span>✦</span>
          <span>◌</span>
          <span>✧</span>
        </div>
        <p className="eyebrow">KNOWLEDGE HAS NO BORDERS</p>
        <h1>
          Peer to Peer
          <br />
          <em>Research Collaboration</em>
        </h1>
        <p className="slogan">across borders, disciplines and practice</p>
        <p>
          Good research grows through connection. Find people who understand
          your questions, share their experience, and help you take the next
          step.
        </p>
        <div className="actions">
          <Link className="button" href="/sign-in">
            Join the commons →
          </Link>
          <span className="hint">
            For students, professors & industry professionals
          </span>
        </div>
      </section>
      <section className="features">
        <article>
          <span className="feature-icon">↗</span>
          <h2>Move research forward</h2>
          <p>
            Share questions and projects. Connect ideas across disciplines and
            learn from new perspectives.
          </p>
        </article>
        <article>
          <span className="feature-icon gold-icon">✦</span>
          <h2>Find your next mentor</h2>
          <p>
            Book time with experienced researchers and professionals ready to
            share what they know.
          </p>
        </article>
        <article>
          <span className="feature-icon">◎</span>
          <h2>Connect across borders</h2>
          <p>
            Discover a community across Africa and beyond, united by curiosity
            and collaboration.
          </p>
        </article>
      </section>
      <section className="callout">
        <h2>Your question could start something.</h2>
        <p>A new conversation. A fresh perspective. Your next collaboration.</p>
        <Link className="button" href="/sign-in">
          Create your member profile
        </Link>
      </section>
      <footer>
        <strong>Research Commons Africa</strong>
        <p>
          Contact & feedback:{" "}
          <a href="mailto:maryjoasisfoundation@gmail.com">
            maryjoasisfoundation@gmail.com
          </a>
        </p>
        <p>
          <Link href="/privacy">Privacy policy</Link> ·{" "}
          <Link href="/terms">Terms of use</Link>
        </p>
      </footer>
    </main>
  );
}
