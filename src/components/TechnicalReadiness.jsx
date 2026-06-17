import DomainView from './DomainView';

export default function TechnicalReadiness({ onNavigate, onBackToDashboard }) {
  return (
    <DomainView domainId={2} onNavigate={onNavigate} onBackToDashboard={onBackToDashboard} />
  );
}
