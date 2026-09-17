import { Icon, type IconName } from './Icon';
import type { ToastMessage } from '../types/url';
import './Toast.css';

const ICONS: Record<ToastMessage['type'], IconName> = {
  success: 'check',
  error: 'warning',
  warning: 'shield-warning',
  info: 'shield',
};

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  return (
    <div className={`toast toast-${toast.type}`} role="status">
      <span className="toast-icon" aria-hidden="true">
        <Icon name={ICONS[toast.type]} size={16} />
      </span>
      <p className="toast-message">{toast.message}</p>
      <button
        type="button"
        className="toast-dismiss"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
      >
        <Icon name="x" size={14} />
      </button>
    </div>
  );
}
