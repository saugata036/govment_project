import { PURPOSE } from '../data/domains';
import { getKpiProgress, statusLabel } from './scoring';
import { buildReportData } from '../components/ReportGenerator';

function getDomain(ctx, id) {
  return ctx.domains.find((d) => d.id === id);
}

function getScore(ctx, id) {
  return ctx.domainScores.find((s) => s.domainId === id);
}

function fmtKpi(kpi) {
  const pct = getKpiProgress(kpi);
  return `${kpi.name}: ${kpi.currentValue}/${kpi.targetValue} ${kpi.unit} (${pct}% of target).`;
}

function fmtCheck(domain, idx) {
  const passed = domain.checkStates?.[idx];
  return `${domain.keyChecks[idx]}: ${passed ? 'PASSED — requirement met.' : 'FAILED — remediation required.'}`;
}

function domainScore(id, ctx) {
  const d = getDomain(ctx, id);
  const s = getScore(ctx, id);
  const passed = d.checkStates.filter(Boolean).length;
  return `${d.name}\n\nScore: ${s.score}% (${statusLabel(s.status)})\nChecks passed: ${passed}/${d.keyChecks.length}\nFail signal: ${d.failSignal}\n\n${d.purpose}`;
}

function kpiByIndex(id, idx, ctx, intro) {
  const d = getDomain(ctx, id);
  return `${intro}\n\n${fmtKpi(d.kpis[idx])}`;
}

function allKpis(id, ctx, title) {
  const d = getDomain(ctx, id);
  return `${title}\n\n${d.kpis.map((k) => `• ${fmtKpi(k)}`).join('\n')}`;
}

function weakKpis(id, ctx) {
  const d = getDomain(ctx, id);
  const weak = d.kpis.filter((k) => getKpiProgress(k) < 80);
  if (!weak.length) return 'All KPIs are at or above 80% of target.';
  return `KPIs needing improvement:\n\n${weak.map((k) => `• ${fmtKpi(k)}`).join('\n')}`;
}

function improveDomain(id, ctx) {
  const d = getDomain(ctx, id);
  const s = getScore(ctx, id);
  const actions = [];
  d.keyChecks.forEach((c, i) => {
    if (!d.checkStates[i]) actions.push(`Close check: ${c}`);
  });
  d.kpis.filter((k) => getKpiProgress(k) < 80).forEach((k) => {
    actions.push(`Improve KPI: ${k.name}`);
  });
  if (!actions.length) actions.push('Maintain controls and monitor KPI drift.');
  return `Improve ${d.name} (currently ${s.score}%):\n\n${actions.map((a) => `• ${a}`).join('\n')}\n\nFail signal: ${d.failSignal}`;
}

function domainChecksSummary(id, ctx) {
  const d = getDomain(ctx, id);
  return `Checks for ${d.name}:\n\n${d.keyChecks.map((_, i) => `• ${fmtCheck(d, i)}`).join('\n')}`;
}

function reportHint() {
  return { text: 'Use "Generate report" to download the full PPT with this domain section.', suggest: ['Generate report'] };
}

function formatDomainLine(domain, score) {
  return `${domain.name}: ${score.score}% (${statusLabel(score.status)})`;
}

const DOMAIN_ANSWERS = {
  1: {
    'What is the Strategic & Policy Alignment score?': (ctx) => domainScore(1, ctx),
    'Is the project aligned with Vision 2030 priorities?': (ctx) => fmtCheck(getDomain(ctx, 1), 0),
    'Who is the project sponsor and is sponsorship clear?': (ctx) => fmtCheck(getDomain(ctx, 1), 1),
    'Is the budget approved and funding confirmed?': (ctx) => fmtCheck(getDomain(ctx, 1), 2),
    'Are there any policy exceptions identified?': (ctx) => kpiByIndex(1, 3, ctx, 'Policy exceptions:'),
    'What are the regulatory dependencies that are still unresolved?': (ctx) => kpiByIndex(1, 4, ctx, 'Regulatory dependencies:'),
    'Is the legal mandate to proceed in place?': (ctx) => fmtCheck(getDomain(ctx, 1), 4),
    'How does the project align with national sectoral strategies?': (ctx) => fmtCheck(getDomain(ctx, 1), 3),
    'What is the RACI completeness status?': (ctx) => kpiByIndex(1, 1, ctx, 'RACI completeness:'),
    'What actions are needed to resolve policy exceptions?': (ctx) =>
      `Close ${getDomain(ctx, 1).kpis[3].currentValue} policy exception(s): assign owners, document closure plan, and obtain steering committee approval.`,
    'Show me detailed KPIs for Strategic & Policy Alignment': (ctx) => allKpis(1, ctx, 'Strategic & Policy KPIs:'),
    'Which KPIs need improvement in Strategic & Policy Alignment?': (ctx) => weakKpis(1, ctx),
    'How to improve Strategic alignment?': (ctx) => improveDomain(1, ctx),
    'Generate Strategic & Policy Alignment report': () => reportHint(),
  },
  2: {
    'What is the Technical Readiness score?': (ctx) => domainScore(2, ctx),
    'Is the FEED design complete?': (ctx) => `${fmtCheck(getDomain(ctx, 2), 0)}\n${kpiByIndex(2, 0, ctx, 'Design maturity:')}`,
    'What is the design maturity index?': (ctx) => kpiByIndex(2, 0, ctx, 'Design maturity index:'),
    'Are there any unresolved technical assumptions?': (ctx) => kpiByIndex(2, 1, ctx, 'Unresolved assumptions:'),
    'Is the site ready for construction?': (ctx) => `${fmtCheck(getDomain(ctx, 2), 3)}\n${kpiByIndex(2, 3, ctx, 'Site readiness:')}`,
    'What is the interface risk score?': (ctx) => kpiByIndex(2, 2, ctx, 'Interface risk:'),
    'What is the engineering change exposure?': (ctx) => kpiByIndex(2, 4, ctx, 'Change exposure:'),
    'Is technology selection appropriate for this project?': (ctx) => fmtCheck(getDomain(ctx, 2), 1),
    'Are utilities (power, water, access) available?': (ctx) => fmtCheck(getDomain(ctx, 2), 4),
    'What technical issues need resolution?': (ctx) => improveDomain(2, ctx),
    'Show me design maturity progress': (ctx) => kpiByIndex(2, 0, ctx, 'Design maturity:'),
    'What technical assumptions are unresolved?': (ctx) => kpiByIndex(2, 1, ctx, 'Unresolved assumptions:'),
    'How to resolve FEED gaps?': (ctx) => improveDomain(2, ctx),
    'Generate technical assessment report': () => reportHint(),
  },
  3: {
    'What is the Financial Readiness score?': (ctx) => domainScore(3, ctx),
    'Is the CAPEX/OPEX estimate complete and benchmarked?': (ctx) => fmtCheck(getDomain(ctx, 3), 0),
    'What is the cost estimate confidence level?': (ctx) => kpiByIndex(3, 0, ctx, 'Cost confidence:'),
    'Is funding fully committed?': (ctx) => kpiByIndex(3, 2, ctx, 'Funding committed:'),
    'Is contingency adequately funded?': (ctx) => fmtCheck(getDomain(ctx, 3), 4),
    'What is the CAPEX variance vs benchmarks?': (ctx) => kpiByIndex(3, 1, ctx, 'CAPEX variance:'),
    'What is the cashflow alignment score?': (ctx) => kpiByIndex(3, 3, ctx, 'Cashflow alignment:'),
    'Is payment milestone logic properly structured?': (ctx) => fmtCheck(getDomain(ctx, 3), 3),
    'What is the contingency sufficiency ratio?': (ctx) => kpiByIndex(3, 4, ctx, 'Contingency ratio:'),
    'What financial risks exist?': (ctx) => `${getDomain(ctx, 3).failSignal}\n\n${weakKpis(3, ctx)}`,
    'Show me cost estimate details': (ctx) => allKpis(3, ctx, 'Financial KPIs:'),
    'What is the contingency status?': (ctx) => kpiByIndex(3, 4, ctx, 'Contingency:'),
    'How to improve financial readiness?': (ctx) => improveDomain(3, ctx),
    'Generate financial report': () => reportHint(),
  },
  4: {
    'What is the ESG Compliance score?': (ctx) => domainScore(4, ctx),
    'Is the Environmental Impact Assessment (EIA) approved?': (ctx) => `${fmtCheck(getDomain(ctx, 4), 0)}\n${kpiByIndex(4, 2, ctx, 'EIA KPI:')}`,
    'What is the carbon footprint baseline?': (ctx) => kpiByIndex(4, 1, ctx, 'Carbon baseline:'),
    'Are there any ESG gaps requiring mitigation?': (ctx) => kpiByIndex(4, 4, ctx, 'ESG gaps:'),
    'Is the project aligned with global ESG frameworks?': (ctx) => fmtCheck(getDomain(ctx, 4), 4),
    'What is the ESG sub-score breakdown (E/S/G)?': (ctx) => kpiByIndex(4, 0, ctx, 'ESG sub-scores:'),
    'What is the carbon intensity benchmark vs sector norms?': (ctx) => kpiByIndex(4, 1, ctx, 'Carbon vs sector:'),
    'What social risks are forecasted?': (ctx) => kpiByIndex(4, 3, ctx, 'Social risks:'),
    'What governance mechanisms are in place?': (ctx) => fmtCheck(getDomain(ctx, 4), 3),
    'What ESG mitigations are required?': (ctx) => improveDomain(4, ctx),
    'Show me ESG sub-scores': (ctx) => allKpis(4, ctx, 'ESG KPIs:'),
    'What are the ESG gaps?': (ctx) => weakKpis(4, ctx),
    'How to achieve ESG compliance?': (ctx) => improveDomain(4, ctx),
    'Generate ESG report': () => reportHint(),
  },
  5: {
    'What is the Organizational Readiness score?': (ctx) => domainScore(5, ctx),
    'Is the project governance structure adequate?': (ctx) => fmtCheck(getDomain(ctx, 5), 0),
    'What is the PMO maturity level?': (ctx) => kpiByIndex(5, 0, ctx, 'PMO maturity:'),
    'Are EPC contractors prequalified?': (ctx) => fmtCheck(getDomain(ctx, 5), 2),
    'Is decision-making velocity sufficient?': (ctx) => `${fmtCheck(getDomain(ctx, 5), 3)}\n${kpiByIndex(5, 1, ctx, 'Decision turnaround:')}`,
    'What is the governance maturity index?': (ctx) => kpiByIndex(5, 0, ctx, 'Governance maturity:'),
    'What is the EPC readiness score?': (ctx) => kpiByIndex(5, 2, ctx, 'EPC readiness:'),
    'What is the resource adequacy percentage?': (ctx) => kpiByIndex(5, 3, ctx, 'Resource adequacy:'),
    'What is the historical delivery performance?': (ctx) => kpiByIndex(5, 4, ctx, 'Delivery performance:'),
    'What capability gaps exist?': (ctx) => fmtCheck(getDomain(ctx, 5), 4),
    'Show me PMO maturity assessment': (ctx) => domainChecksSummary(5, ctx),
    'What are the capability gaps?': (ctx) => improveDomain(5, ctx),
    'How to improve organizational readiness?': (ctx) => improveDomain(5, ctx),
    'Generate organizational assessment': () => reportHint(),
  },
  6: {
    'What is the Risk & Controls score?': (ctx) => domainScore(6, ctx),
    'Is the integrated risk register complete?': (ctx) => fmtCheck(getDomain(ctx, 6), 0),
    'Are risks properly owned and managed?': (ctx) => fmtCheck(getDomain(ctx, 6), 1),
    'Is mitigation funding in place?': (ctx) => fmtCheck(getDomain(ctx, 6), 2),
    'Are dispute resolution mechanisms defined?': (ctx) => fmtCheck(getDomain(ctx, 6), 4),
    'How many high-risk items are unresolved?': (ctx) => kpiByIndex(6, 0, ctx, 'High-risk items:'),
    'What is the risk mitigation coverage percentage?': (ctx) => kpiByIndex(6, 1, ctx, 'Mitigation coverage:'),
    'What is the risk-adjusted contingency adequacy?': (ctx) => kpiByIndex(6, 2, ctx, 'Risk-adjusted contingency:'),
    'What is the contractual exposure score?': (ctx) => kpiByIndex(6, 3, ctx, 'Contractual exposure:'),
    'Is the audit and assurance ready?': (ctx) => kpiByIndex(6, 4, ctx, 'Audit readiness:'),
    'Show me risk register status': (ctx) => domainChecksSummary(6, ctx),
    'What are the high-risk items?': (ctx) => kpiByIndex(6, 0, ctx, 'High-risk items:'),
    'How to mitigate risks?': (ctx) => improveDomain(6, ctx),
    'Generate risk assessment report': () => reportHint(),
  },
  7: {
    'What is the Digital Readiness score?': (ctx) => domainScore(7, ctx),
    'Are data sources defined?': (ctx) => fmtCheck(getDomain(ctx, 7), 0),
    'Is KPI traceability logic established?': (ctx) => fmtCheck(getDomain(ctx, 7), 1),
    'What is the reporting cadence?': (ctx) => fmtCheck(getDomain(ctx, 7), 2),
    'Is cyber and data governance in place?': (ctx) => fmtCheck(getDomain(ctx, 7), 3),
    'What is the data completeness percentage?': (ctx) => kpiByIndex(7, 0, ctx, 'Data completeness:'),
    'What is the KPI traceability score?': (ctx) => kpiByIndex(7, 1, ctx, 'KPI traceability:'),
    'What is the reporting latency in days?': (ctx) => kpiByIndex(7, 2, ctx, 'Reporting latency:'),
    'What is the dashboard adoption rate?': (ctx) => kpiByIndex(7, 3, ctx, 'Dashboard adoption:'),
    'Are there any data integrity incidents?': (ctx) => kpiByIndex(7, 4, ctx, 'Integrity incidents:'),
    'Show me KPI traceability status': (ctx) => allKpis(7, ctx, 'Digital KPIs:'),
    'What data gaps exist?': (ctx) => weakKpis(7, ctx),
    'How to improve digital readiness?': (ctx) => improveDomain(7, ctx),
    'Generate digital assessment report': () => reportHint(),
  },
  8: {
    'What is the Legal & Regulatory score?': (ctx) => domainScore(8, ctx),
    'Is the contracting strategy complete?': (ctx) => fmtCheck(getDomain(ctx, 8), 0),
    'Are all regulatory approvals in place?': (ctx) => fmtCheck(getDomain(ctx, 8), 1),
    'Is land acquisition ready?': (ctx) => fmtCheck(getDomain(ctx, 8), 2),
    'Is dispute jurisdiction clearly defined?': (ctx) => fmtCheck(getDomain(ctx, 8), 4),
    'What is the regulatory approvals completeness percentage?': (ctx) => kpiByIndex(8, 0, ctx, 'Regulatory approvals:'),
    'What is the contract readiness score?': (ctx) => kpiByIndex(8, 1, ctx, 'Contract readiness:'),
    'What is the legal risk exposure index?': (ctx) => kpiByIndex(8, 2, ctx, 'Legal risk:'),
    'What is the land access readiness status?': (ctx) => kpiByIndex(8, 3, ctx, 'Land access:'),
    'What is the claims probability forecast?': (ctx) => kpiByIndex(8, 4, ctx, 'Claims forecast:'),
    'Show me regulatory approvals status': (ctx) => domainChecksSummary(8, ctx),
    'What permits are pending?': (ctx) => {
      const d = getDomain(ctx, 8);
      const pending = d.keyChecks.filter((_, i) => !d.checkStates[i]);
      return pending.length ? `Pending:\n${pending.map((p) => `• ${p}`).join('\n')}` : 'All legal checks passed.';
    },
    'How to resolve legal issues?': (ctx) => improveDomain(8, ctx),
    'Generate legal assessment report': () => reportHint(),
  },
  9: {
    'What is the Mobilization & Execution score?': (ctx) => domainScore(9, ctx),
    'Is EPC mobilization ready?': (ctx) => fmtCheck(getDomain(ctx, 9), 0),
    'Are long-lead items secured?': (ctx) => fmtCheck(getDomain(ctx, 9), 1),
    'Are all permits in place?': (ctx) => fmtCheck(getDomain(ctx, 9), 2),
    'Is site access confirmed?': (ctx) => fmtCheck(getDomain(ctx, 9), 3),
    'What is the mobilization readiness index?': (ctx) => kpiByIndex(9, 0, ctx, 'Mobilization index:'),
    'What is the long-lead procurement status?': (ctx) => kpiByIndex(9, 1, ctx, 'Long-lead procurement:'),
    'What is the permit completeness percentage?': (ctx) => kpiByIndex(9, 2, ctx, 'Permit completeness:'),
    'What is the Go/No-Go status?': (ctx) => {
      const s = getScore(ctx, 9);
      return `Status: ${statusLabel(s.status)} (${s.score}%)\n${getDomain(ctx, 9).failSignal}`;
    },
    'What is the estimated time-to-mobilize?': (ctx) => kpiByIndex(9, 4, ctx, 'Time-to-mobilize:'),
    'Show me mobilization checklist': (ctx) => domainChecksSummary(9, ctx),
    'What items are blocking mobilization?': (ctx) => improveDomain(9, ctx),
    'How to achieve Go status?': (ctx) => improveDomain(9, ctx),
    'Generate mobilization report': () => reportHint(),
  },
};

const FLAT_DOMAIN_ANSWERS = Object.values(DOMAIN_ANSWERS).reduce((a, m) => ({ ...a, ...m }), {});

const GLOBAL_ANSWERS = {
  'What is the overall project readiness score?': (ctx) =>
    `Overall Score: ${ctx.overallScore}% (${statusLabel(ctx.overallStatus)}).\n\n${PURPOSE.question}\n\n${
      ctx.overallStatus === 'go' ? 'Ready for fund release.' : ctx.overallStatus === 'conditional' ? 'Conditionally ready — remediation required.' : 'Not ready — critical gaps must be closed.'
    }`,
  'Which domains need immediate attention?': (ctx) => {
    const atRisk = ctx.domains.map((d) => ({ d, s: getScore(ctx, d.id) })).filter((x) => x.s.status !== 'go');
    return atRisk.length ? `Attention needed:\n\n${atRisk.map((x) => `• ${formatDomainLine(x.d, x.s)}`).join('\n')}` : 'All domains are Go.';
  },
  'Show me a summary of all domains': (ctx) =>
    `Summary:\n\n${ctx.domains.map((d) => `• ${formatDomainLine(d, getScore(ctx, d.id))}`).join('\n')}`,
  'What is the project status for fund release?': (ctx) =>
    `Status: ${statusLabel(ctx.overallStatus)} (${ctx.overallScore}%).\n${PURPOSE.statement}`,
  'Generate a complete assessment report': () => ({ text: 'Click "Generate report" to build the full PPT.', suggest: ['Generate report'] }),
  'Which domains are ready (Go status)?': (ctx) => {
    const go = ctx.domains.filter((d) => getScore(ctx, d.id).status === 'go');
    return go.map((d) => `• ${formatDomainLine(d, getScore(ctx, d.id))}`).join('\n') || 'None.';
  },
  'Which domains are conditional?': (ctx) => {
    const list = ctx.domains.filter((d) => getScore(ctx, d.id).status === 'conditional');
    return list.map((d) => `• ${formatDomainLine(d, getScore(ctx, d.id))}`).join('\n') || 'None.';
  },
  'Which domains are failing (No-Go status)?': (ctx) => {
    const list = ctx.domains.filter((d) => getScore(ctx, d.id).status === 'nogo');
    return list.map((d) => `• ${formatDomainLine(d, getScore(ctx, d.id))}`).join('\n') || 'None.';
  },
  'What is the average score across all domains?': (ctx) => {
    const avg = Math.round(ctx.domainScores.reduce((a, s) => a + s.score, 0) / ctx.domainScores.length);
    return `Average: ${avg}% | Overall: ${ctx.overallScore}%`;
  },
  'Show me the risk heatmap of all domains': (ctx) =>
    ctx.domains
      .map((d) => ({ d, s: getScore(ctx, d.id) }))
      .sort((a, b) => a.s.score - b.s.score)
      .map(({ d, s }) => `${s.score < 60 ? '🔴' : s.score < 80 ? '🟠' : '🟢'} ${d.name}: ${s.score}%`)
      .join('\n'),
  'Which domain has the highest score and why?': (ctx) => {
    const best = ctx.domains.map((d) => ({ d, s: getScore(ctx, d.id) })).sort((a, b) => b.s.score - a.s.score)[0];
    return `Highest: ${best.d.name} (${best.s.score}%). ${best.d.purpose}`;
  },
  'Which domain has the lowest score and what are the gaps?': (ctx) => {
    const w = ctx.domains.map((d) => ({ d, s: getScore(ctx, d.id) })).sort((a, b) => a.s.score - b.s.score)[0];
    return `Lowest: ${w.d.name} (${w.s.score}%).\n${w.d.failSignal}\n\n${weakKpis(w.d.id, ctx)}`;
  },
  'Compare ESG score vs Technical Readiness score': (ctx) => {
    const esg = getScore(ctx, 4);
    const tech = getScore(ctx, 2);
    return `ESG: ${esg.score}% | Technical: ${tech.score}% | Delta: ${esg.score - tech.score} pts`;
  },
  'Which domains have active fail signals?': (ctx) =>
    ctx.domains.map((d) => `• ${d.name}: ${d.failSignal}`).join('\n'),
  'Show me domain scores in descending order': (ctx) =>
    ctx.domains
      .map((d) => ({ d, s: getScore(ctx, d.id) }))
      .sort((a, b) => b.s.score - a.s.score)
      .map(({ d, s }, i) => `${i + 1}. ${formatDomainLine(d, s)}`)
      .join('\n'),
  'What is the correlation between Financial and Risk scores?': (ctx) =>
    `Financial: ${getScore(ctx, 3).score}% | Risk: ${getScore(ctx, 6).score}% — both must be strong before fund release.`,
  'Which domains need immediate intervention?': (ctx) => GLOBAL_ANSWERS['Which domains need immediate attention?'](ctx),
  'Show me the progress trend across all domains': (ctx) =>
    ctx.domains.map((d) => `• ${d.name}: ${getScore(ctx, d.id).score}%`).join('\n'),
  'What are the top 5 recommendations for improvement?': (ctx) => {
    const recs = buildReportData(ctx).recommendations.slice(0, 5);
    return recs.map((r, i) => `${i + 1}. ${r}`).join('\n') || 'All domains strong.';
  },
  'How can we improve the overall score to 80%?': (ctx) => {
    const gap = 80 - ctx.overallScore;
    if (gap <= 0) return `Already at ${ctx.overallScore}%.`;
    return `Need +${gap} pts. Focus lowest domains:\n${ctx.domains
      .map((d) => ({ d, s: getScore(ctx, d.id) }))
      .filter((x) => x.s.score < 80)
      .map((x) => `• ${x.d.name}: ${x.s.score}%`)
      .join('\n')}`;
  },
  'What actions are needed for conditional domains?': (ctx) =>
    ctx.domains.filter((d) => getScore(ctx, d.id).status === 'conditional').map((d) => `• ${d.name}: ${d.failSignal}`).join('\n') || 'None.',
  'What is the critical path to achieve Go status?': (ctx) => {
    const nogo = ctx.domains.filter((d) => getScore(ctx, d.id).status === 'nogo');
    return `1. Fix No-Go (${nogo.length})\n2. Lift Conditional above 80%\n3. Close fail signals\n4. Re-certify`;
  },
  'What resources are needed to address fail signals?': (ctx) =>
    ctx.domains.map((d) => `• ${d.name}: domain owner + funded plan for — ${d.failSignal}`).join('\n'),
  'What is the estimated timeline to fix all issues?': (ctx) => {
    const weak = ctx.domains.filter((d) => getScore(ctx, d.id).score < 80).length;
    return `Estimate: ${weak * 4 + 4}–${weak * 4 + 12} weeks for ${weak} below-threshold domains.`;
  },
  'What is the priority order for resolving domain issues?': (ctx) =>
    ctx.domains
      .map((d) => ({ d, s: getScore(ctx, d.id) }))
      .sort((a, b) => a.s.score - b.s.score)
      .map(({ d, s }, i) => `${i + 1}. ${d.name} — ${s.score}%`)
      .join('\n'),
  'Show me domain-wise breakdown': (ctx) => GLOBAL_ANSWERS['Show me a summary of all domains'](ctx),
  'What are the key risks?': (ctx) => GLOBAL_ANSWERS['Which domains have active fail signals?'](ctx),
  'How can we improve the score?': (ctx) => GLOBAL_ANSWERS['What are the top 5 recommendations for improvement?'](ctx),
  'Which domain has the highest score?': (ctx) => GLOBAL_ANSWERS['Which domain has the highest score and why?'](ctx),
  'Which domain has the lowest score?': (ctx) => GLOBAL_ANSWERS['Which domain has the lowest score and what are the gaps?'](ctx),
  'What are the fail signals?': (ctx) => GLOBAL_ANSWERS['Which domains have active fail signals?'](ctx),
  'How to fix these issues?': (ctx) => GLOBAL_ANSWERS['What are the top 5 recommendations for improvement?'](ctx),
  'Show me detailed recommendations': (ctx) => buildReportData(ctx).recommendations.join('\n') || 'None required.',
};

const ALL_ANSWERS = { ...GLOBAL_ANSWERS, ...FLAT_DOMAIN_ANSWERS };

export function resolveChatbotAnswer(question, context) {
  const handler = ALL_ANSWERS[question];
  if (!handler) return null;
  const result = handler(context);
  if (result && typeof result === 'object' && result.text) {
    return { flow: 'answered', text: result.text, suggest: result.suggest };
  }
  return { flow: 'answered', text: result };
}
