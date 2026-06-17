import DomainView from './DomainView';

export default function FinancialReadiness({ onNavigate, onBackToDashboard }) {
  return (
    <DomainView domainId={3} onNavigate={onNavigate} onBackToDashboard={onBackToDashboard} />
  );
}
