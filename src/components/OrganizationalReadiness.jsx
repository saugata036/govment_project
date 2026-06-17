import DomainView from './DomainView';

export default function OrganizationalReadiness({ onNavigate, onBackToDashboard }) {
  return (
    <DomainView domainId={5} onNavigate={onNavigate} onBackToDashboard={onBackToDashboard} />
  );
}
