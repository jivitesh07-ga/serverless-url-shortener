import { useState } from 'react';
import { Icon } from './Icon';
import { Button } from './Button';
import { formatDateTime, getExpirationState } from '../utils/date';
import type { UrlRecord } from '../types/url';
import './ShortUrlResult.css';

interface ShortUrlResultProps {
  record: UrlRecord;
  onCreateAnother: () => void;
}

export function ShortUrlResult({ record, onCreateAnother }: ShortUrlResultProps) {
  const [copyState, setCopyState] = useState<'idle' | 'copying' | 'copied' | 'failed'>('idle');
  const expiration = getExpirationState(record.expiresAt, record.status);

  async function handleCopy() {
    setCopyState('copying');
    try {
      await navigator.clipboard.writeText(record.shortUrl);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2000);
    } catch {
      setCopyState('failed');
      setTimeout(() => setCopyState('idle'), 2000);
    }
  }

  return (
    <div className="result-card" role="status">
      <div className="result-glow" aria-hidden="true" />
      <div className="result-check">
        <Icon name="check" size={18} />
      </div>
      <h3 className="result-title">Your short link is ready</h3>

      <div className="result-url-row">
        <a
          href={record.shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="result-url"
        >
          {record.shortUrl.replace(/^https?:\/\//, '')}
        </a>
      </div>

      <div className="result-actions">
        <Button
          variant="primary"
          onClick={handleCopy}
          icon={<Icon name="copy" size={16} />}
          disabled={copyState === 'copying'}
        >
          {copyState === 'copied' ? 'Copied ✓' : copyState === 'failed' ? 'Copy failed' : 'Copy'}
        </Button>
        <Button
          variant="secondary"
          onClick={() => window.open(record.shortUrl, '_blank', 'noopener,noreferrer')}
          icon={<Icon name="external-link" size={16} />}
        >
          Open
        </Button>
        <Button variant="ghost" onClick={onCreateAnother} icon={<Icon name="plus" size={16} />}>
          Create another
        </Button>
      </div>

      <div className="result-meta">
        <p className="result-original">
          <span>Original URL</span>
          {record.originalUrl}
        </p>
        <div className="result-chips">
          <span className={`chip chip-expiration-${expiration.tone}`}>
            <Icon name="clock" size={12} />
            {expiration.label}
          </span>
          <span className="chip chip-security">
            <Icon name="shield" size={12} />
            Security check passed
          </span>
          <span className="chip">
            <Icon name="calendar" size={12} />
            {formatDateTime(record.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
