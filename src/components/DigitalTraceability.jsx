import DomainView from './DomainView';

export default function DigitalTraceability({ onNavigate, onBackToDashboard }) {
  return (
    <DomainView domainId={7} onNavigate={onNavigate} onBackToDashboard={onBackToDashboard} />
  );
}
