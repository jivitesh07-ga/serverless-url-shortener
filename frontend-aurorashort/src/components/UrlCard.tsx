import { useState } from 'react';
import { Icon } from './Icon';
import { formatDate, formatRelativeTime, getExpirationState } from '../utils/date';
import type { UrlRecord } from '../types/url';
import './UrlCard.css';

interface UrlCardProps {
  record: UrlRecord;
  onDeleteRequest: (record: UrlRecord) => void;
  isDeleting: boolean;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
  isEntering?: boolean;
}

export function UrlCard({ record, onDeleteRequest, isDeleting, showToast, isEntering }: UrlCardProps) {
  const [copied, setCopied] = useState(false);
  const expiration = getExpirationState(record.expiresAt, record.status);
  const isThreat = record.threatStatus === 'threat';
  const shortLabel = record.shortUrl.replace(/^https?:\/\//, '');

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(record.shortUrl);
      setCopied(true);
      showToast('success', 'Copied to clipboard');
      setTimeout(() => setCopied(false), 1800);
    } catch {
      showToast('error', 'Unable to copy — try selecting the link manually.');
    }
  }

  return (
    <li
      className={`url-card${isDeleting ? ' is-deleting' : ''}${isEntering ? ' is-entering' : ''}`}
      data-short-code={record.shortCode}
    >
      <div className="url-card-main">
        <div className="url-card-links">
          <a
            href={record.shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="url-card-short"
          >
            {shortLabel}
          </a>
          <p className="url-card-original" title={record.originalUrl}>
            {record.originalUrl}
          </p>
        </div>

        <div className="url-card-meta">
          <span className="url-meta-item">
            <Icon name="calendar" size={13} />
            {formatDate(record.createdAt)}
          </span>
          <span className={`url-meta-item url-meta-expiration-${expiration.tone}`}>
            <Icon name="clock" size={13} />
            {expiration.label}
          </span>
          <span className="url-meta-item">
            <Icon name="cursor-click" size={13} />
            {record.clickCount.toLocaleString()} clicks
          </span>
          {record.lastAccessedAt && (
            <span className="url-meta-item">
              Last accessed {formatRelativeTime(record.lastAccessedAt)}
            </span>
          )}
          {isThreat && (
            <span className="url-meta-item url-meta-threat">
              <Icon name="shield-warning" size={13} />
              Flagged unsafe
            </span>
          )}
        </div>
      </div>

      <div className="url-card-actions">
        <button
          type="button"
          className="icon-action"
          onClick={handleCopy}
          aria-label={copied ? 'Copied' : 'Copy short URL'}
          title="Copy"
        >
          <Icon name={copied ? 'check' : 'copy'} size={16} />
        </button>
        <a
          className="icon-action"
          href={record.shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open short URL in a new tab"
          title="Open"
        >
          <Icon name="external-link" size={16} />
        </a>
        <button
          type="button"
          className="icon-action icon-action-danger"
          onClick={() => onDeleteRequest(record)}
          aria-label="Delete short URL"
          title="Delete"
          disabled={isDeleting}
        >
          <Icon name={isDeleting ? 'spinner' : 'trash'} size={16} className={isDeleting ? 'spin' : undefined} />
        </button>
      </div>
    </li>
  );
}
