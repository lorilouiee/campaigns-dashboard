import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

interface ToastProps {
  message: string;
  description?: string;
  isVisible: boolean;
  onClose: () => void;
}

const Toast = ({ message, description, isVisible, onClose }: ToastProps) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto-dismiss after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 animate-slide-in-from-top"
      style={{
        animation: 'slideInFromTop 0.3s ease-out',
      }}
    >
      <div
        className="bg-white rounded-xl shadow-lg p-4 flex items-start gap-3 min-w-[320px] max-w-[400px]"
        style={{
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          borderRadius: '12px',
        }}
      >
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center"
          style={{
            backgroundColor: 'rgba(220, 252, 231, 1)',
          }}
        >
          <FontAwesomeIcon
            icon={faCheck}
            className="text-green-600"
            style={{
              fontSize: '16px',
              color: 'rgba(22, 163, 74, 1)',
            }}
          />
        </div>
        <div className="flex-1">
          <p
            className="text-sm font-semibold text-gray-900 mb-1"
            style={{
              fontWeight: 600,
              fontSize: '14px',
              color: 'rgba(17, 24, 39, 1)',
            }}
          >
            {message}
          </p>
          {description && (
            <p
              className="text-sm text-gray-600"
              style={{
                fontSize: '14px',
                color: 'rgba(75, 85, 99, 1)',
              }}
            >
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Toast;
