import { useState } from 'react';
import { Icon } from './Icon';
import { Button } from './Button';
import { AnalyticsSummary } from './AnalyticsSummary';
import { LoadingSkeleton } from './LoadingSkeleton';
import { EmptyState } from './EmptyState';
import { UrlCard } from './UrlCard';
import { DeleteModal } from './DeleteModal';
import type { UrlRecord } from '../types/url';
import './UrlList.css';

interface UrlListProps {
  urls: UrlRecord[];
  isLoading: boolean;
  loadError: string | null;
  onRefresh: () => void;
  onDelete: (shortCode: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  deletingCodes: Set<string>;
  newlyAddedCode: string | null;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
  onCreateClick: () => void;
}

export function UrlList({
  urls,
  isLoading,
  loadError,
  onRefresh,
  onDelete,
  deletingCodes,
  newlyAddedCode,
  showToast,
  onCreateClick,
}: UrlListProps) {
  const [pendingDelete, setPendingDelete] = useState<UrlRecord | null>(null);

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    const result = await onDelete(pendingDelete.shortCode);
    if (result.ok) {
      showToast('success', 'Short link deleted');
      setPendingDelete(null);
    } else {
      showToast('error', result.error);
    }
  }

  return (
    <section id="your-urls" className="url-list-section" aria-labelledby="your-urls-heading">
      <div className="url-list-header">
        <div>
          <h2 id="your-urls-heading">Your shortened URLs</h2>
          <p className="url-list-subtitle">Links created from this browser</p>
        </div>
        <div className="url-list-header-actions">
          {!isLoading && (
            <span className="url-count-badge">
              {urls.length} {urls.length === 1 ? 'link' : 'links'}
            </span>
          )}
          <Button
            variant="ghost"
            className="btn-icon-only btn-sm"
            onClick={onRefresh}
            aria-label="Refresh your URLs"
            title="Refresh"
          >
            <Icon name="refresh" size={16} />
          </Button>
        </div>
      </div>

      {isLoading && <LoadingSkeleton count={3} />}

      {!isLoading && loadError && (
        <div className="url-list-error" role="alert">
          <Icon name="warning" size={16} />
          <span>{loadError}</span>
          <button type="button" className="url-list-retry" onClick={onRefresh}>
            Try again
          </button>
        </div>
      )}

      {!isLoading && !loadError && urls.length === 0 && (
        <EmptyState onCreateClick={onCreateClick} />
      )}

      {!isLoading && !loadError && urls.length > 0 && (
        <>
          <AnalyticsSummary urls={urls} />
          <ul className="url-list">
            {urls.map((record) => (
              <UrlCard
                key={record.shortCode}
                record={record}
                onDeleteRequest={setPendingDelete}
                isDeleting={deletingCodes.has(record.shortCode)}
                showToast={showToast}
                isEntering={record.shortCode === newlyAddedCode}
              />
            ))}
          </ul>
        </>
      )}

      <DeleteModal
        record={pendingDelete}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={pendingDelete ? deletingCodes.has(pendingDelete.shortCode) : false}
      />
    </section>
  );
}
