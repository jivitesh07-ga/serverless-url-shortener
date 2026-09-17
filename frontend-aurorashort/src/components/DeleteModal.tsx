import { Modal } from './Modal';
import { Button } from './Button';
import { Icon } from './Icon';
import type { UrlRecord } from '../types/url';

interface DeleteModalProps {
  record: UrlRecord | null;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteModal({ record, onCancel, onConfirm, isDeleting }: DeleteModalProps) {
  return (
    <Modal
      isOpen={record !== null}
      onClose={onCancel}
      titleId="delete-modal-title"
      title="Delete this short link?"
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            isLoading={isDeleting}
            icon={<Icon name="trash" size={15} />}
          >
            Delete
          </Button>
        </>
      }
    >
      <p>This will permanently remove the short link. Anyone who has already shared it won't be able to use it anymore.</p>
      {record && (
        <p style={{ marginTop: 10, fontWeight: 700, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
          {record.shortUrl.replace(/^https?:\/\//, '')}
        </p>
      )}
    </Modal>
  );
}
