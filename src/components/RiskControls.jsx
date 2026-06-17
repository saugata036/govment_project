import DomainView from './DomainView';

export default function RiskControls({ onNavigate, onBackToDashboard }) {
  return (
    <DomainView domainId={6} onNavigate={onNavigate} onBackToDashboard={onBackToDashboard} />
  );
}
