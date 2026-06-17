import { statusLabel } from '../utils/scoring';

export default function StatusBadge({ status, size = 'md' }) {
  return (
    <span className={`status-badge ${status}${size === 'sm' ? ' sm' : ''}`}>
      {statusLabel(status)}
    </span>
  );
}
