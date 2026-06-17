import { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { DOMAINS_DATA } from '../data/domains';
import { calculateDomainScore, calculateOverallScore, getStatus } from '../utils/scoring';

const AssessmentContext = createContext(null);

function cloneDomains() {
  return DOMAINS_DATA.map((domain) => ({
    ...domain,
    kpis: domain.kpis.map((kpi) => ({ ...kpi })),
    checkStates: domain.keyChecks.map((_, i) => i % 3 !== 2),
  }));
}

export function AssessmentProvider({ children }) {
  const [domains, setDomains] = useState(cloneDomains);

  const domainScores = useMemo(
    () =>
      domains.map((domain) => {
        const score = calculateDomainScore(domain.kpis);
        return {
          domainId: domain.id,
          score,
          status: getStatus(score),
        };
      }),
    [domains],
  );

  const overallScore = useMemo(
    () => calculateOverallScore(domainScores.map((d) => d.score)),
    [domainScores],
  );

  const overallStatus = useMemo(() => getStatus(overallScore), [overallScore]);

  const updateKpi = useCallback((domainId, kpiId, currentValue) => {
    setDomains((prev) =>
      prev.map((domain) => {
        if (domain.id !== domainId) return domain;
        return {
          ...domain,
          kpis: domain.kpis.map((kpi) =>
            kpi.id === kpiId ? { ...kpi, currentValue: Number(currentValue) } : kpi,
          ),
        };
      }),
    );
  }, []);

  const toggleCheck = useCallback((domainId, checkIndex) => {
    setDomains((prev) =>
      prev.map((domain) => {
        if (domain.id !== domainId) return domain;
        const checkStates = [...domain.checkStates];
        checkStates[checkIndex] = !checkStates[checkIndex];
        return { ...domain, checkStates };
      }),
    );
  }, []);

  const getDomainById = useCallback(
    (id) => domains.find((d) => d.id === id),
    [domains],
  );

  const getDomainScore = useCallback(
    (id) => domainScores.find((d) => d.domainId === id),
    [domainScores],
  );

  const value = useMemo(
    () => ({
      domains,
      domainScores,
      overallScore,
      overallStatus,
      updateKpi,
      toggleCheck,
      getDomainById,
      getDomainScore,
    }),
    [domains, domainScores, overallScore, overallStatus, updateKpi, toggleCheck, getDomainById, getDomainScore],
  );

  return <AssessmentContext.Provider value={value}>{children}</AssessmentContext.Provider>;
}

export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessment must be used within AssessmentProvider');
  }
  return context;
}
