import { AlertTriangle, Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAssessment } from '../context/AssessmentContext';
import { getKpiProgress, statusColor, STATUS_COLORS, progressColor } from '../utils/scoring';
import ScoreGauge from './ScoreGauge';
import StatusBadge from './StatusBadge';
import KPIProgressBar, { KPICard } from './KPIProgressBar';
import ChartTooltip from './ChartTooltip';
import PieLegend from './PieLegend';

const DOMAIN_BLUE = { light: '#93C5FD', mid: '#2563EB' };

const CHECK_COLORS = [STATUS_COLORS.go, STATUS_COLORS.nogo];

export default function DomainView({ domainId, onNavigate, onBackToDashboard }) {
  const { getDomainById, getDomainScore, updateKpi, toggleCheck } = useAssessment();
  const domain = getDomainById(domainId);
  const scoreData = getDomainScore(domainId);

  if (!domain || !scoreData) return null;

  const prevId = domainId > 1 ? domainId - 1 : null;
  const nextId = domainId < 9 ? domainId + 1 : null;

  const passedCount = domain.checkStates.filter(Boolean).length;
  const failedCount = domain.checkStates.length - passedCount;

  const kpiChartData = domain.kpis.map((kpi) => ({
    name: kpi.name.length > 28 ? `${kpi.name.slice(0, 26)}…` : kpi.name,
    fullName: kpi.name,
    progress: getKpiProgress(kpi),
    current: kpi.currentValue,
    target: kpi.targetValue,
  }));

  const checkPieData = [
    { name: 'Passed', value: passedCount },
    { name: 'Failed', value: failedCount },
  ].filter((d) => d.value > 0);

  const compareData = domain.kpis.map((kpi) => ({
    name: `K${domain.kpis.indexOf(kpi) + 1}`,
    fullName: kpi.name,
    Current: kpi.currentValue,
    Target: kpi.targetValue,
  }));

  return (
    <div className="content-inner tableau-dashboard tableau-dashboard-domain">
      {/* Dashboard title bar */}
      <div className="tableau-dash-header">
        <div className="tableau-dash-header-left">
          <span className="tableau-dash-domain-num">D{domain.id}</span>
          <div>
            <h1 className="tableau-dash-title">{domain.name}</h1>
            {domain.subtitle && (
              <span className="tableau-dash-subtitle">{domain.subtitle}</span>
            )}
          </div>
        </div>
        <StatusBadge status={scoreData.status} />
      </div>

      {/* Row 1: KPI scorecards */}
      <div className="tableau-scorecard-row">
        <KPICard label="Domain Score" value={`${scoreData.score}%`} color={statusColor(scoreData.status)} />
        <KPICard label="Checks Passed" value={passedCount} sub={`of ${domain.keyChecks.length}`} color={STATUS_COLORS.go} />
        <KPICard label="Checks Failed" value={failedCount} sub={`of ${domain.keyChecks.length}`} color={STATUS_COLORS.nogo} />
        <KPICard label="KPIs Tracked" value={domain.kpis.length} sub="weighted metrics" color={DOMAIN_BLUE.mid} />
      </div>

      {/* Row 2: Gauge + Charts */}
      <div className="tableau-grid-3">
        <div className="tableau-tile">
          <div className="tableau-tile-header">Readiness Score</div>
          <div className="tableau-tile-body center">
            <ScoreGauge score={scoreData.score} status={scoreData.status} size={150} animated />
            <p className="tableau-purpose-text">{domain.purpose}</p>
          </div>
        </div>

        <div className="tableau-tile tableau-tile-wide">
          <div className="tableau-tile-header">KPI Performance (% of Target)</div>
          <div className="tableau-chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kpiChartData} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#666' }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10, fill: '#333' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="tableau-tooltip">
                        <div className="tableau-tooltip-title">{d.fullName}</div>
                        <div className="tableau-tooltip-row">
                          <span className="tableau-tooltip-value">{d.progress}% of target</span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="progress" name="Progress" radius={[0, 4, 4, 0]} barSize={14}>
                  {kpiChartData.map((entry) => (
                    <Cell
                      key={entry.fullName}
                      fill={progressColor(entry.progress)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="tableau-tile">
          <div className="tableau-tile-header">Check Status</div>
          <div className="tableau-chart-area tableau-chart-area-pie">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={checkPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={62}
                  paddingAngle={3}
                  dataKey="value"
                  label={false}
                >
                  {checkPieData.map((_, i) => (
                    <Cell key={i} fill={CHECK_COLORS[i] || DOMAIN_BLUE.light} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <PieLegend
              items={checkPieData.map((d, i) => ({
                name: d.name,
                value: d.value,
                color: CHECK_COLORS[i] || DOMAIN_BLUE.light,
              }))}
            />
          </div>
        </div>
      </div>

      {/* Row 3: Current vs Target bar chart */}
      <div className="tableau-tile">
        <div className="tableau-tile-header">Current vs Target Comparison</div>
        <div className="tableau-chart-area tableau-chart-area-lg">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={compareData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#666' }} />
              <YAxis tick={{ fontSize: 11, fill: '#666' }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="tableau-tooltip">
                      <div className="tableau-tooltip-title">{d.fullName}</div>
                      {payload.map((p) => (
                        <div key={p.name} className="tableau-tooltip-row">
                          <span className="tableau-tooltip-dot" style={{ backgroundColor: p.fill }} />
                          <span>{p.name}: {p.value}</span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              <Bar dataKey="Current" fill={DOMAIN_BLUE.mid} radius={[4, 4, 0, 0]} barSize={28} />
              <Bar dataKey="Target" fill={DOMAIN_BLUE.light} radius={[4, 4, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 4: KPI sliders + Key checks */}
      <div className="tableau-grid-2">
        <div className="tableau-tile">
          <div className="tableau-tile-header">KPI Adjustments</div>
          <div className="tableau-tile-body">
            {domain.kpis.map((kpi) => (
              <KPIProgressBar
                key={kpi.id}
                kpi={kpi}
                onChange={(val) => updateKpi(domainId, kpi.id, val)}
              />
            ))}
          </div>
        </div>

        <div className="tableau-tile">
          <div className="tableau-tile-header">Key Checks</div>
          <div className="tableau-checks-grid">
            {domain.keyChecks.map((check, index) => {
              const passed = domain.checkStates[index];
              return (
                <button
                  key={index}
                  type="button"
                  className={`tableau-check-tile ${passed ? 'passed' : 'failed'}`}
                  onClick={() => toggleCheck(domainId, index)}
                >
                  <span className="tableau-check-icon">
                    {passed ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
                  </span>
                  <span className="tableau-check-text">{check}</span>
                  <span className={`tableau-check-badge ${passed ? 'passed' : 'failed'}`}>
                    {passed ? 'Passed' : 'Failed'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fail signal */}
      <div className="tableau-fail-banner">
        <AlertTriangle size={20} />
        <div>
          <strong>Fail Signal</strong>
          <p>{domain.failSignal}</p>
        </div>
      </div>

      <div className="domain-nav">
        <button type="button" className="btn btn-secondary" onClick={onBackToDashboard}>
          Back to Dashboard
        </button>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" className="btn btn-primary" disabled={!prevId} onClick={() => prevId && onNavigate(prevId)}>
            <ChevronLeft size={18} /> Previous
          </button>
          <button type="button" className="btn btn-primary" disabled={!nextId} onClick={() => nextId && onNavigate(nextId)}>
            Next <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
