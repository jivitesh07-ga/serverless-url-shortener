import { Icon } from './Icon';
import './Header.css';

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function Header() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a
          href="#top"
          className="brand"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <span className="brand-mark">
            <Icon name="link" size={17} />
          </span>
          AuroraShort
        </a>

        <nav className="site-nav" aria-label="Primary">
          <button
            type="button"
            className="nav-link"
            onClick={() => scrollToId('create')}
          >
            Create
          </button>
          <button
            type="button"
            className="nav-link"
            onClick={() => scrollToId('your-urls')}
          >
            Your URLs
          </button>
        </nav>
      </div>
    </header>
  );
}
