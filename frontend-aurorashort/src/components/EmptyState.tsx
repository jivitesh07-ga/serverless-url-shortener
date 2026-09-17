import { Icon } from './Icon';
import { Button } from './Button';
import './EmptyState.css';

interface EmptyStateProps {
  onCreateClick: () => void;
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-illustration" aria-hidden="true">
        <div className="empty-orb" />
        <Icon name="link" size={26} />
      </div>
      <h3>No short links yet</h3>
      <p>Create your first link and it will appear here.</p>
      <Button variant="secondary" onClick={onCreateClick} icon={<Icon name="plus" size={16} />}>
        Create your first link
      </Button>
    </div>
  );
}
