import { useEffect } from 'react';
import S from '../../styles/theme';

export default function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={S.toast}>
      {message}
    </div>
  );
}
