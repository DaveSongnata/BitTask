import { useTranslation } from 'react-i18next';
import { PixelModal } from './PixelModal';
import { PixelButton } from './PixelButton';

interface PixelConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
}

/**
 * PixelConfirmModal
 * A pixel-art styled confirmation dialog
 */
export function PixelConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant = 'danger',
  loading = false,
}: PixelConfirmModalProps) {
  const { t } = useTranslation();

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <PixelModal open={open} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="font-pixel text-[10px] text-pixel-text leading-relaxed">
          {message}
        </p>
        <div className="flex gap-2">
          <PixelButton
            variant="secondary"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            {cancelText ?? t('common.cancel')}
          </PixelButton>
          <PixelButton
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={handleConfirm}
            className="flex-1"
            loading={loading}
          >
            {confirmText ?? t('common.confirm')}
          </PixelButton>
        </div>
      </div>
    </PixelModal>
  );
}
