import { useRef, useState, type FormEvent } from 'react';
import { Icon } from './Icon';
import { Button } from './Button';
import { ExpirationSelector } from './ExpirationSelector';
import { SecurityStatus, type SecurityPhase } from './SecurityStatus';
import { ShortUrlResult } from './ShortUrlResult';
import { api, ApiError } from '../api/client';
import { createResponseToRecord } from '../hooks/useUrls';
import { isoDaysFromNow } from '../utils/date';
import { validateAlias, validateCustomExpiration, validateLongUrl } from '../utils/validation';
import type { ExpirationOption, UrlRecord } from '../types/url';
import './UrlCreator.css';

interface UrlCreatorProps {
  ownerToken: string;
  onCreated: (record: UrlRecord) => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}

function resolveExpiresAt(option: ExpirationOption, customValue: string): string | undefined {
  switch (option) {
    case '1d':
      return isoDaysFromNow(1);
    case '7d':
      return isoDaysFromNow(7);
    case 'custom':
      return new Date(customValue).toISOString();
    case 'never':
    default:
      return undefined;
  }
}

export function UrlCreator({ ownerToken, onCreated, showToast }: UrlCreatorProps) {
  const [longUrl, setLongUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [expiration, setExpiration] = useState<ExpirationOption>('never');
  const [customDate, setCustomDate] = useState('');

  const [urlTouched, setUrlTouched] = useState(false);
  const [aliasTouched, setAliasTouched] = useState(false);
  const [customTouched, setCustomTouched] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [securityPhase, setSecurityPhase] = useState<SecurityPhase>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<UrlRecord | null>(null);

  const formRef = useRef<HTMLDivElement>(null);

  const urlError = urlTouched ? validateLongUrl(longUrl) : null;
  const aliasError = aliasTouched ? validateAlias(alias) : null;
  const customError = customTouched && expiration === 'custom' ? validateCustomExpiration(customDate) : null;

  const canSubmit =
    !isSubmitting &&
    !validateLongUrl(longUrl) &&
    !validateAlias(alias) &&
    (expiration !== 'custom' || !validateCustomExpiration(customDate));

  function resetForNewLink() {
    setResult(null);
    setSubmitError(null);
    setSecurityPhase('idle');
    setLongUrl('');
    setAlias('');
    setExpiration('never');
    setCustomDate('');
    setUrlTouched(false);
    setAliasTouched(false);
    setCustomTouched(false);
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setUrlTouched(true);
    setAliasTouched(true);
    setCustomTouched(true);
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setSecurityPhase('checking');

    const payload = {
      originalUrl: longUrl.trim(),
      ownerToken,
      alias: alias.trim() || undefined,
      expiresAt: resolveExpiresAt(expiration, customDate),
    };

    try {
      const response = await api.createUrl(payload);
      setSecurityPhase('passed');
      const record = createResponseToRecord(response, payload);
      setResult(record);
      onCreated(record);
      showToast('success', 'Short URL created');
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setSecurityPhase('threat');
        showToast('warning', 'Security check blocked this URL');
      } else if (err instanceof ApiError && err.status === 503) {
        setSecurityPhase('unavailable');
      } else {
        setSecurityPhase('idle');
        setSubmitError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
        showToast('error', err instanceof ApiError ? err.message : 'Something went wrong.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (result) {
    return (
      <div ref={formRef}>
        <ShortUrlResult record={result} onCreateAnother={resetForNewLink} />
      </div>
    );
  }

  return (
    <div className="creator-card" ref={formRef}>
      <div className="creator-glow" aria-hidden="true" />
      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label className="field-label" htmlFor="long-url">
            Long URL
          </label>
          <input
            id="long-url"
            type="url"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            placeholder="https://example.com/your-long-url"
            className={`text-input${urlError ? ' has-error' : ''}`}
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            onBlur={() => setUrlTouched(true)}
            aria-invalid={urlError ? true : undefined}
            aria-describedby={urlError ? 'long-url-error' : undefined}
          />
          {urlError && (
            <p className="field-error" id="long-url-error">
              {urlError}
            </p>
          )}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="alias">
            Custom alias <span className="field-optional">(optional)</span>
          </label>
          <div className={`alias-input-wrap${aliasError ? ' has-error' : ''}`}>
            <span className="alias-prefix">/</span>
            <input
              id="alias"
              type="text"
              autoComplete="off"
              spellCheck={false}
              placeholder="myportfolio"
              className="alias-input"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              onBlur={() => setAliasTouched(true)}
              aria-invalid={aliasError ? true : undefined}
              aria-describedby={aliasError ? 'alias-error' : undefined}
            />
          </div>
          {aliasError && (
            <p className="field-error" id="alias-error">
              {aliasError}
            </p>
          )}
        </div>

        <ExpirationSelector
          value={expiration}
          onChange={setExpiration}
          customValue={customDate}
          onCustomChange={setCustomDate}
          customError={customError}
        />

        <div className="creator-submit-row">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={!canSubmit}
            icon={<Icon name="link" size={16} />}
            className="creator-submit"
          >
            {isSubmitting ? 'Checking & shortening…' : 'Shorten URL'}
          </Button>
          <SecurityStatus
            phase={securityPhase === 'threat' || securityPhase === 'unavailable' ? 'idle' : securityPhase}
          />
        </div>

        {(securityPhase === 'threat' || securityPhase === 'unavailable') && (
          <div className="creator-alert">
            <SecurityStatus
              phase={securityPhase}
              onTryAnother={() => setSecurityPhase('idle')}
              onRetry={() => setSecurityPhase('idle')}
            />
          </div>
        )}

        {submitError && (
          <p className="field-error creator-form-error" role="alert">
            {submitError}
          </p>
        )}
      </form>
    </div>
  );
}
