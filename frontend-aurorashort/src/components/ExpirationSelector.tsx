import { minDateTimeLocal } from '../utils/date';
import type { ExpirationOption } from '../types/url';
import './ExpirationSelector.css';

const OPTIONS: { value: ExpirationOption; label: string }[] = [
  { value: '1d', label: '1 Day' },
  { value: '7d', label: '1 Week' },
  { value: 'never', label: 'Never' },
  { value: 'custom', label: 'Custom' },
];

interface ExpirationSelectorProps {
  value: ExpirationOption;
  onChange: (value: ExpirationOption) => void;
  customValue: string;
  onCustomChange: (value: string) => void;
  customError?: string | null;
}

export function ExpirationSelector({
  value,
  onChange,
  customValue,
  onCustomChange,
  customError,
}: ExpirationSelectorProps) {
  return (
    <div className="expiration-field">
      <span className="field-label" id="expiration-label">
        Expiration
      </span>
      <div className="expiration-segments" role="radiogroup" aria-labelledby="expiration-label">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={value === opt.value}
            className={`expiration-segment${value === opt.value ? ' is-selected' : ''}`}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {value === 'custom' && (
        <div className="custom-date-wrap">
          <input
            type="datetime-local"
            className={`text-input${customError ? ' has-error' : ''}`}
            value={customValue}
            min={minDateTimeLocal()}
            onChange={(e) => onCustomChange(e.target.value)}
            aria-invalid={customError ? true : undefined}
            aria-describedby={customError ? 'custom-expiration-error' : undefined}
          />
          {customError && (
            <p className="field-error" id="custom-expiration-error">
              {customError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
