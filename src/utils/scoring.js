export const calculateDomainScore = (kpis) => {
  let totalScore = 0;

  kpis.forEach((kpi) => {
    let kpiScore;
    if (kpi.targetValue === 0) {
      kpiScore = kpi.currentValue === 0 ? 100 : 0;
    } else {
      kpiScore = (kpi.currentValue / kpi.targetValue) * 100;
    }
    const cappedScore = Math.min(kpiScore, 100);
    totalScore += cappedScore * (kpi.weight / 100);
  });

  return Math.round(totalScore);
};

export const calculateCheckScore = (checkStates) => {
  if (!checkStates?.length) return 100;
  const passed = checkStates.filter(Boolean).length;
  return Math.round((passed / checkStates.length) * 100);
};

export const calculateCombinedDomainScore = (kpis, checkStates) => {
  const kpiScore = calculateDomainScore(kpis);
  const checkScore = calculateCheckScore(checkStates);
  return Math.round(kpiScore * 0.6 + checkScore * 0.4);
};

export const getStatus = (score) => {
  if (score >= 80) return 'go';
  if (score >= 60) return 'conditional';
  return 'nogo';
};

export const calculateOverallScore = (domainScores) => {
  const sum = domainScores.reduce((acc, score) => acc + score, 0);
  return Math.round(sum / domainScores.length);
};

export const getKpiProgress = (kpi) => {
  if (kpi.targetValue === 0) {
    return kpi.currentValue === 0 ? 100 : 0;
  }
  return Math.min(Math.round((kpi.currentValue / kpi.targetValue) * 100), 100);
};

export const statusLabel = (status) => {
  switch (status) {
    case 'go':
      return 'Go';
    case 'conditional':
      return 'Conditional Go';
    case 'nogo':
      return 'No-Go';
    default:
      return status;
  }
};

export const TEAL = {
  50: '#E0F2F1',
  100: '#B2DFDB',
  200: '#80CBC4',
  300: '#4DB6AC',
  400: '#26A69A',
  500: '#009688',
  600: '#00796B',
  700: '#004D40',
};

export const STATUS_COLORS = {
  go: '#2e7d32',
  conditional: '#f9a825',
  nogo: '#d32f2f',
};

export const statusColor = (status) => {
  switch (status) {
    case 'go':
      return STATUS_COLORS.go;
    case 'conditional':
      return STATUS_COLORS.conditional;
    case 'nogo':
      return STATUS_COLORS.nogo;
    default:
      return '#555555';
  }
};

export const progressColor = (progress) => {
  if (progress >= 80) return STATUS_COLORS.go;
  if (progress >= 60) return STATUS_COLORS.conditional;
  return STATUS_COLORS.nogo;
};

export const getCheckStatus = (domainScore, checkIndex) => {
  const threshold = 70 + checkIndex * 3;
  return domainScore >= threshold ? 'passed' : 'failed';
};
