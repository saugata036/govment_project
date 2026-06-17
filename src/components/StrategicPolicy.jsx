import DomainView from './DomainView';

export default function StrategicPolicy({ onNavigate, onBackToDashboard }) {
  return (
    <DomainView domainId={1} onNavigate={onNavigate} onBackToDashboard={onBackToDashboard} />
  );
}
