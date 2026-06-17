import DomainView from './DomainView';

export default function LegalRegulatory({ onNavigate, onBackToDashboard }) {
  return (
    <DomainView domainId={8} onNavigate={onNavigate} onBackToDashboard={onBackToDashboard} />
  );
}
