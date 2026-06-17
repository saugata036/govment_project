import { useState } from 'react';
import {
  LayoutDashboard,
  Target,
  Wrench,
  DollarSign,
  Leaf,
  Users,
  ShieldAlert,
  Database,
  Scale,
  Rocket,
} from 'lucide-react';
import { AssessmentProvider, useAssessment } from './context/AssessmentContext';
import { statusColor } from './utils/scoring';
import Dashboard from './components/Dashboard';
import DomainView from './components/DomainView';
import Chatbot from './components/Chatbot';
import HeaderScorePanel from './components/HeaderScorePanel';
import StrategicPolicy from './components/StrategicPolicy';
import TechnicalReadiness from './components/TechnicalReadiness';
import FinancialReadiness from './components/FinancialReadiness';
import ESGCompliance from './components/ESGCompliance';
import OrganizationalReadiness from './components/OrganizationalReadiness';
import RiskControls from './components/RiskControls';
import DigitalTraceability from './components/DigitalTraceability';
import LegalRegulatory from './components/LegalRegulatory';
import MobilizationExecution from './components/MobilizationExecution';
import './App.css';

const TAB_ICONS = {
  dashboard: LayoutDashboard,
  1: Target,
  2: Wrench,
  3: DollarSign,
  4: Leaf,
  5: Users,
  6: ShieldAlert,
  7: Database,
  8: Scale,
  9: Rocket,
};

const DOMAIN_COMPONENTS = {
  1: StrategicPolicy,
  2: TechnicalReadiness,
  3: FinancialReadiness,
  4: ESGCompliance,
  5: OrganizationalReadiness,
  6: RiskControls,
  7: DigitalTraceability,
  8: LegalRegulatory,
  9: MobilizationExecution,
};

function TabButton({ tab, isActive, score, onSelect }) {
  const Icon = TAB_ICONS[tab.id];

  return (
    <button
      type="button"
      className={`tab-btn ${isActive ? 'active' : ''}`}
      onClick={() => onSelect(tab.id)}
      title={tab.label}
    >
      <span className="tab-btn-top">
        <Icon className="tab-icon" />
        {score && (
          <span
            className="tab-dot"
            style={{ backgroundColor: statusColor(score.status) }}
          />
        )}
      </span>
      <span className="tab-label">{tab.label}</span>
    </button>
  );
}

function AppShell() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { domains, domainScores, overallScore, overallStatus } = useAssessment();

  const domainTabs = domains.map((d) => ({ id: d.id, label: d.name }));
  const tabRowOne = [{ id: 'dashboard', label: 'Dashboard' }, ...domainTabs.slice(0, 4)];
  const tabRowTwo = domainTabs.slice(4);

  const getTabScore = (tabId) =>
    typeof tabId === 'number' ? domainScores.find((s) => s.domainId === tabId) : null;

  const navigateDomain = (id) => setActiveTab(id);
  const backToDashboard = () => setActiveTab('dashboard');

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return <Dashboard onDomainClick={navigateDomain} />;
    }

    const DomainComponent = DOMAIN_COMPONENTS[activeTab];
    if (DomainComponent) {
      return (
        <DomainComponent onNavigate={navigateDomain} onBackToDashboard={backToDashboard} />
      );
    }

    return (
      <DomainView
        domainId={activeTab}
        onNavigate={navigateDomain}
        onBackToDashboard={backToDashboard}
      />
    );
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <div className="header-brand">
            <h1>Project Readiness Office <span className="header-pro">(PRO)</span></h1>
            <p className="header-tagline">Government Project Fund Release Assessment</p>
          </div>

          <HeaderScorePanel score={overallScore} status={overallStatus} />
        </div>

        <nav className="tab-nav-wrap" aria-label="Domain navigation">
          <div className="tab-nav-row">
            {tabRowOne.map((tab) => (
              <TabButton
                key={tab.id}
                tab={tab}
                isActive={activeTab === tab.id}
                score={getTabScore(tab.id)}
                onSelect={setActiveTab}
              />
            ))}
          </div>
          <div className="tab-nav-row">
            {tabRowTwo.map((tab) => (
              <TabButton
                key={tab.id}
                tab={tab}
                isActive={activeTab === tab.id}
                score={getTabScore(tab.id)}
                onSelect={setActiveTab}
              />
            ))}
          </div>
        </nav>
      </header>

      <main className="app-content">{renderContent()}</main>

      <Chatbot activeTab={activeTab} />
    </div>
  );
}

export default function App() {
  return (
    <AssessmentProvider>
      <AppShell />
    </AssessmentProvider>
  );
}
