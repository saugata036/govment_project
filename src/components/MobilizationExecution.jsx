import DomainView from './DomainView';

export default function MobilizationExecution({ onNavigate, onBackToDashboard }) {
  return (
    <DomainView domainId={9} onNavigate={onNavigate} onBackToDashboard={onBackToDashboard} />
  );
}
