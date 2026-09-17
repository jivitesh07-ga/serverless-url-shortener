import { Icon } from './Icon';
import './Hero.css';

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <span className="hero-badge">
        <Icon name="shield" size={13} />
        Serverless · Secure · Fast
      </span>
      <h1 id="hero-heading" className="hero-heading">
        Short links.
        <br />
        Beautifully simple.
      </h1>
      <p className="hero-sub">
        Create clean, shareable links with expiration controls, security checks, and
        built-in analytics.
      </p>
    </section>
  );
}
