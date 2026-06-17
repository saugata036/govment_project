import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAssessment } from '../context/AssessmentContext';
import { PURPOSE } from '../data/domains';
import { statusColor, STATUS_COLORS, TEAL } from '../utils/scoring';
import ScoreGauge from './ScoreGauge';
import StatusBadge from './StatusBadge';
import { KPICard } from './KPIProgressBar';
import ChartTooltip from './ChartTooltip';
import PieLegend from './PieLegend';
import { generateReport } from './ReportGenerator';

const STATUS_PIE_COLORS = { go: STATUS_COLORS.go, conditional: STATUS_COLORS.conditional, nogo: STATUS_COLORS.nogo };

export default function Dashboard({ onDomainClick }) {
  const assessment = useAssessment();
  const { domains, domainScores, overallScore, overallStatus } = assessment;

  const goCount = domainScores.filter((d) => d.status === 'go').length;
  const conditionalCount = domainScores.filter((d) => d.status === 'conditional').length;
  const nogoCount = domainScores.filter((d) => d.status === 'nogo').length;

  const barData = domains.map((domain) => {
    const score = domainScores.find((s) => s.domainId === domain.id);
    return {
      name: `D${domain.id}`,
      fullName: domain.name,
      score: score?.score ?? 0,
      status: score?.status ?? 'conditional',
      fill: statusColor(score?.status ?? 'conditional'),
    };
  });

  const statusPieData = [
    { name: 'Go', value: goCount, key: 'go' },
    { name: 'Conditional', value: conditionalCount, key: 'conditional' },
    { name: 'No-Go', value: nogoCount, key: 'nogo' },
  ].filter((d) => d.value > 0);

  const radarData = domains.map((domain) => {
    const score = domainScores.find((s) => s.domainId === domain.id);
    return { domain: `D${domain.id}`, fullName: domain.name, score: score?.score ?? 0 };
  });

  return (
    <div className="content-inner tableau-dashboard tableau-dashboard-main">
      <div className="tableau-dash-header">
        <div>
          <h1 className="tableau-dash-title">Project Readiness Overview</h1>
          <p className="tableau-dash-subtitle">{PURPOSE.question}</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={async () => {
            try {
              await generateReport(assessment);
            } catch (e) {
              alert(e?.message || 'Failed to download report.');
            }
          }}
        >
          Generate Report
        </button>
      </div>

      {/* Scorecards */}
      <div className="tableau-scorecard-row">
        <KPICard label="Overall Score" value={`${overallScore}%`} color={statusColor(overallStatus)} />
        <KPICard label="Go" value={goCount} sub="domains ready" color={STATUS_COLORS.go} />
        <KPICard label="Conditional" value={conditionalCount} sub="needs attention" color={STATUS_COLORS.conditional} />
        <KPICard label="No-Go" value={nogoCount} sub="not ready" color={STATUS_COLORS.nogo} />
      </div>

      {/* Charts row */}
      <div className="tableau-grid-3">
        <div className="tableau-tile">
          <div className="tableau-tile-header">Overall Readiness</div>
          <div className="tableau-tile-body center">
            <ScoreGauge score={overallScore} status={overallStatus} size={140} />
            <StatusBadge status={overallStatus} />
          </div>
        </div>

        <div className="tableau-tile tableau-tile-wide">
          <div className="tableau-tile-header">Domain Scores</div>
          <div className="tableau-chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ top: 4, right: 20, left: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#666' }} />
                <YAxis type="category" dataKey="name" width={36} tick={{ fontSize: 11, fill: '#333' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="tableau-tooltip">
                        <div className="tableau-tooltip-title">{d.fullName}</div>
                        <div className="tableau-tooltip-row">
                          <span className="tableau-tooltip-value">{d.score}%</span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="score" name="Score" radius={[0, 4, 4, 0]} barSize={16} label={{ position: 'right', fontSize: 11, fill: '#555' }}>
                  {barData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="tableau-tile">
          <div className="tableau-tile-header">Status Distribution</div>
          <div className="tableau-chart-area tableau-chart-area-pie">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={58}
                  paddingAngle={4}
                  dataKey="value"
                  label={false}
                >
                  {statusPieData.map((entry) => (
                    <Cell key={entry.key} fill={STATUS_PIE_COLORS[entry.key]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <PieLegend
              items={statusPieData.map((d) => ({
                name: d.name,
                value: d.value,
                color: STATUS_PIE_COLORS[d.key],
              }))}
            />
          </div>
        </div>
      </div>

      {/* Radar + Purpose */}
      <div className="tableau-grid-2">
        <div className="tableau-tile">
          <div className="tableau-tile-header">Readiness Radar</div>
          <div className="tableau-chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
                <PolarGrid stroke="#ddd" />
                <PolarAngleAxis dataKey="domain" tick={{ fontSize: 11, fill: '#555' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: '#999' }} />
                <Radar name="Score" dataKey="score" stroke={TEAL[500]} fill={TEAL[200]} fillOpacity={0.55} strokeWidth={2} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const item = payload[0].payload;
                    return (
                      <div className="tableau-tooltip">
                        <div className="tableau-tooltip-title">{item.fullName}</div>
                        <div className="tableau-tooltip-row">
                          <span className="tableau-tooltip-value">{item.score}%</span>
                        </div>
                      </div>
                    );
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="tableau-tile">
          <div className="tableau-tile-header">Purpose Statement</div>
          <div className="tableau-tile-body">
            <p className="tableau-purpose-text">{PURPOSE.statement}</p>
            <p className="tableau-purpose-role">{PURPOSE.role}</p>
          </div>
        </div>
      </div>

      {/* Domain tiles */}
      <div className="tableau-tile">
        <div className="tableau-tile-header">The 9 Checking Domains</div>
        <div className="tableau-domain-tiles">
          {domains.map((domain) => {
            const score = domainScores.find((s) => s.domainId === domain.id);
            if (!score) return null;
            return (
              <button
                key={domain.id}
                type="button"
                className="tableau-domain-tile"
                onClick={() => onDomainClick(domain.id)}
              >
                <div className="tableau-domain-tile-top">
                  <span className="tableau-domain-tile-num">D{domain.id}</span>
                  <span
                    className="tableau-domain-tile-score"
                    style={{ color: statusColor(score.status) }}
                  >
                    {score.score}%
                  </span>
                </div>
                <div className="tableau-domain-tile-name">{domain.name}</div>
                <div className="tableau-domain-tile-bar">
                  <div
                    className="tableau-domain-tile-bar-fill"
                    style={{ width: `${score.score}%`, backgroundColor: statusColor(score.status) }}
                  />
                </div>
                <StatusBadge status={score.status} size="sm" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
