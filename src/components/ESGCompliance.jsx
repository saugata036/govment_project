import DomainView from './DomainView';

export default function ESGCompliance({ onNavigate, onBackToDashboard }) {
  return (
    <DomainView domainId={4} onNavigate={onNavigate} onBackToDashboard={onBackToDashboard} />
  );
}
