import { Icon } from './Icon';
import './SecurityStatus.css';

export type SecurityPhase = 'idle' | 'checking' | 'passed' | 'threat' | 'unavailable';

interface SecurityStatusProps {
  phase: SecurityPhase;
  onRetry?: () => void;
  onTryAnother?: () => void;
}

export function SecurityStatus({ phase, onRetry, onTryAnother }: SecurityStatusProps) {
  if (phase === 'idle') return null;

  if (phase === 'checking') {
    return (
      <div className="security-status security-checking" role="status">
        <Icon name="spinner" size={15} className="spin" />
        <span>Checking URL security…</span>
      </div>
    );
  }

  if (phase === 'passed') {
    return (
      <div className="security-status security-passed" role="status">
        <Icon name="check" size={15} />
        <span>No known threat detected</span>
      </div>
    );
  }

  if (phase === 'threat') {
    return (
      <div className="security-panel security-panel-threat" role="alert">
        <div className="security-panel-icon">
          <Icon name="shield-warning" size={20} />
        </div>
        <div className="security-panel-body">
          <h3>URL blocked</h3>
          <p>
            Our security check identified this destination as potentially unsafe. The
            short link was not created.
          </p>
          {onTryAnother && (
            <button type="button" className="security-panel-action" onClick={onTryAnother}>
              Try another URL
            </button>
          )}
        </div>
      </div>
    );
  }

  // unavailable (503)
  return (
    <div className="security-panel security-panel-unavailable" role="alert">
      <div className="security-panel-icon">
        <Icon name="shield" size={20} />
      </div>
      <div className="security-panel-body">
        <h3>Security check unavailable</h3>
        <p>URL security check is temporarily unavailable. Please try again later.</p>
        {onRetry && (
          <button type="button" className="security-panel-action" onClick={onRetry}>
            <Icon name="refresh" size={14} /> Try again
          </button>
        )}
      </div>
    </div>
  );
}
