/** PRO Chatbot question flows — dashboard, 9 domains, cross-domain, recommendations */

export const DASHBOARD_WELCOME = [
  'What is the overall project readiness score?',
  'Which domains need immediate attention?',
  'Show me a summary of all domains',
  'What is the project status for fund release?',
  'Generate a complete assessment report',
];

export const DASHBOARD_FOLLOWUP = [
  'Which domains are ready (Go status)?',
  'Which domains are conditional?',
  'Which domains are failing (No-Go status)?',
  'What is the average score across all domains?',
  'Show me the risk heatmap of all domains',
];

export const CROSS_DOMAIN = [
  'Which domain has the highest score and why?',
  'Which domain has the lowest score and what are the gaps?',
  'Compare ESG score vs Technical Readiness score',
  'Which domains have active fail signals?',
  'Show me domain scores in descending order',
  'What is the correlation between Financial and Risk scores?',
  'Which domains need immediate intervention?',
  'Show me the progress trend across all domains',
];

export const RECOMMENDATIONS = [
  'What are the top 5 recommendations for improvement?',
  'How can we improve the overall score to 80%?',
  'What actions are needed for conditional domains?',
  'What is the critical path to achieve Go status?',
  'What resources are needed to address fail signals?',
  'What is the estimated timeline to fix all issues?',
  'What is the priority order for resolving domain issues?',
];

export const DOMAIN_FLOWS = {
  1: {
    initial: [
      'What is the Strategic & Policy Alignment score?',
      'Is the project aligned with Vision 2030 priorities?',
      'Who is the project sponsor and is sponsorship clear?',
      'Is the budget approved and funding confirmed?',
      'Are there any policy exceptions identified?',
    ],
    followup: [
      'What are the regulatory dependencies that are still unresolved?',
      'Is the legal mandate to proceed in place?',
      'How does the project align with national sectoral strategies?',
      'What is the RACI completeness status?',
      'What actions are needed to resolve policy exceptions?',
    ],
    chain: [
      'Show me detailed KPIs for Strategic & Policy Alignment',
      'Which KPIs need improvement in Strategic & Policy Alignment?',
      'How to improve Strategic alignment?',
      'Generate Strategic & Policy Alignment report',
    ],
  },
  2: {
    initial: [
      'What is the Technical Readiness score?',
      'Is the FEED design complete?',
      'What is the design maturity index?',
      'Are there any unresolved technical assumptions?',
      'Is the site ready for construction?',
    ],
    followup: [
      'What is the interface risk score?',
      'What is the engineering change exposure?',
      'Is technology selection appropriate for this project?',
      'Are utilities (power, water, access) available?',
      'What technical issues need resolution?',
    ],
    chain: [
      'Show me design maturity progress',
      'What technical assumptions are unresolved?',
      'How to resolve FEED gaps?',
      'Generate technical assessment report',
    ],
  },
  3: {
    initial: [
      'What is the Financial Readiness score?',
      'Is the CAPEX/OPEX estimate complete and benchmarked?',
      'What is the cost estimate confidence level?',
      'Is funding fully committed?',
      'Is contingency adequately funded?',
    ],
    followup: [
      'What is the CAPEX variance vs benchmarks?',
      'What is the cashflow alignment score?',
      'Is payment milestone logic properly structured?',
      'What is the contingency sufficiency ratio?',
      'What financial risks exist?',
    ],
    chain: [
      'Show me cost estimate details',
      'What is the contingency status?',
      'How to improve financial readiness?',
      'Generate financial report',
    ],
  },
  4: {
    initial: [
      'What is the ESG Compliance score?',
      'Is the Environmental Impact Assessment (EIA) approved?',
      'What is the carbon footprint baseline?',
      'Are there any ESG gaps requiring mitigation?',
      'Is the project aligned with global ESG frameworks?',
    ],
    followup: [
      'What is the ESG sub-score breakdown (E/S/G)?',
      'What is the carbon intensity benchmark vs sector norms?',
      'What social risks are forecasted?',
      'What governance mechanisms are in place?',
      'What ESG mitigations are required?',
    ],
    chain: [
      'Show me ESG sub-scores',
      'What are the ESG gaps?',
      'How to achieve ESG compliance?',
      'Generate ESG report',
    ],
  },
  5: {
    initial: [
      'What is the Organizational Readiness score?',
      'Is the project governance structure adequate?',
      'What is the PMO maturity level?',
      'Are EPC contractors prequalified?',
      'Is decision-making velocity sufficient?',
    ],
    followup: [
      'What is the governance maturity index?',
      'What is the EPC readiness score?',
      'What is the resource adequacy percentage?',
      'What is the historical delivery performance?',
      'What capability gaps exist?',
    ],
    chain: [
      'Show me PMO maturity assessment',
      'What are the capability gaps?',
      'How to improve organizational readiness?',
      'Generate organizational assessment',
    ],
  },
  6: {
    initial: [
      'What is the Risk & Controls score?',
      'Is the integrated risk register complete?',
      'Are risks properly owned and managed?',
      'Is mitigation funding in place?',
      'Are dispute resolution mechanisms defined?',
    ],
    followup: [
      'How many high-risk items are unresolved?',
      'What is the risk mitigation coverage percentage?',
      'What is the risk-adjusted contingency adequacy?',
      'What is the contractual exposure score?',
      'Is the audit and assurance ready?',
    ],
    chain: [
      'Show me risk register status',
      'What are the high-risk items?',
      'How to mitigate risks?',
      'Generate risk assessment report',
    ],
  },
  7: {
    initial: [
      'What is the Digital Readiness score?',
      'Are data sources defined?',
      'Is KPI traceability logic established?',
      'What is the reporting cadence?',
      'Is cyber and data governance in place?',
    ],
    followup: [
      'What is the data completeness percentage?',
      'What is the KPI traceability score?',
      'What is the reporting latency in days?',
      'What is the dashboard adoption rate?',
      'Are there any data integrity incidents?',
    ],
    chain: [
      'Show me KPI traceability status',
      'What data gaps exist?',
      'How to improve digital readiness?',
      'Generate digital assessment report',
    ],
  },
  8: {
    initial: [
      'What is the Legal & Regulatory score?',
      'Is the contracting strategy complete?',
      'Are all regulatory approvals in place?',
      'Is land acquisition ready?',
      'Is dispute jurisdiction clearly defined?',
    ],
    followup: [
      'What is the regulatory approvals completeness percentage?',
      'What is the contract readiness score?',
      'What is the legal risk exposure index?',
      'What is the land access readiness status?',
      'What is the claims probability forecast?',
    ],
    chain: [
      'Show me regulatory approvals status',
      'What permits are pending?',
      'How to resolve legal issues?',
      'Generate legal assessment report',
    ],
  },
  9: {
    initial: [
      'What is the Mobilization & Execution score?',
      'Is EPC mobilization ready?',
      'Are long-lead items secured?',
      'Are all permits in place?',
      'Is site access confirmed?',
    ],
    followup: [
      'What is the mobilization readiness index?',
      'What is the long-lead procurement status?',
      'What is the permit completeness percentage?',
      'What is the Go/No-Go status?',
      'What is the estimated time-to-mobilize?',
    ],
    chain: [
      'Show me mobilization checklist',
      'What items are blocking mobilization?',
      'How to achieve Go status?',
      'Generate mobilization report',
    ],
  },
};

/** Maps domain tab id → score question alias */
export const DOMAIN_SCORE_QUESTIONS = {
  1: 'What is the Strategic & Policy Alignment score?',
  2: 'What is the Technical Readiness score?',
  3: 'What is the Financial Readiness score?',
  4: 'What is the ESG Compliance score?',
  5: 'What is the Organizational Readiness score?',
  6: 'What is the Risk & Controls score?',
  7: 'What is the Digital Readiness score?',
  8: 'What is the Legal & Regulatory score?',
  9: 'What is the Mobilization & Execution score?',
};

export function getWelcomeQuestions(activeTab) {
  if (activeTab === 'dashboard') return DASHBOARD_WELCOME;
  if (typeof activeTab === 'number' && DOMAIN_FLOWS[activeTab]) {
    return DOMAIN_FLOWS[activeTab].initial;
  }
  return DASHBOARD_WELCOME;
}

export function getWelcomeMessage(activeTab) {
  if (typeof activeTab === 'number' && DOMAIN_FLOWS[activeTab]) {
    return `Welcome to PRO Assistant! Ask about ${getDomainLabel(activeTab)} readiness, KPIs, checks, or follow the guided question chain.`;
  }
  return 'Welcome to PRO Assessment Assistant! Explore dashboard overview, domain insights, or generate a full report.';
}

function getDomainLabel(domainId) {
  const labels = {
    1: 'Strategic & Policy Alignment',
    2: 'Technical Readiness',
    3: 'Financial Readiness',
    4: 'ESG Compliance',
    5: 'Organizational Readiness',
    6: 'Risk & Controls',
    7: 'Digital Readiness',
    8: 'Legal & Regulatory',
    9: 'Mobilization & Execution',
  };
  return labels[domainId] ?? `Domain ${domainId}`;
}

/** Next suggested questions after each answer */
export const QUESTION_CHAINS = {
  // Dashboard welcome
  'What is the overall project readiness score?': DASHBOARD_FOLLOWUP.slice(0, 3),
  'Which domains need immediate attention?': [
    'Which domains need immediate intervention?',
    'What are the fail signals?',
    'What actions are needed for conditional domains?',
  ],
  'Show me a summary of all domains': [
    'Show me domain scores in descending order',
    'Which domain has the highest score and why?',
    'Which domain has the lowest score and what are the gaps?',
  ],
  'What is the project status for fund release?': [
    'Which domains are ready (Go status)?',
    'What is the critical path to achieve Go status?',
    'Generate a complete assessment report',
  ],
  'Generate a complete assessment report': ['Generate report'],

  // Dashboard follow-up
  'Which domains are ready (Go status)?': CROSS_DOMAIN.slice(0, 3),
  'Which domains are conditional?': RECOMMENDATIONS.slice(2, 5),
  'Which domains are failing (No-Go status)?': [
    'Which domains have active fail signals?',
    'What resources are needed to address fail signals?',
    'Generate report',
  ],
  'What is the average score across all domains?': CROSS_DOMAIN.slice(4, 7),
  'Show me the risk heatmap of all domains': [
    'What are the fail signals?',
    'Which domains need immediate intervention?',
    'Generate report',
  ],

  // Cross-domain
  'Which domain has the highest score and why?': RECOMMENDATIONS.slice(0, 3),
  'Which domain has the lowest score and what are the gaps?': RECOMMENDATIONS.slice(0, 3),
  'Compare ESG score vs Technical Readiness score': CROSS_DOMAIN.slice(3, 6),
  'Which domains have active fail signals?': RECOMMENDATIONS.slice(3, 6),
  'Show me domain scores in descending order': CROSS_DOMAIN.slice(5, 8),
  'What is the correlation between Financial and Risk scores?': RECOMMENDATIONS.slice(0, 3),
  'Which domains need immediate intervention?': RECOMMENDATIONS.slice(0, 4),
  'Show me the progress trend across all domains': ['Generate report'],

  // Recommendations
  'What are the top 5 recommendations for improvement?': ['Generate report'],
  'How can we improve the overall score to 80%?': RECOMMENDATIONS.slice(2, 5),
  'What actions are needed for conditional domains?': RECOMMENDATIONS.slice(3, 6),
  'What is the critical path to achieve Go status?': ['Generate report'],
  'What resources are needed to address fail signals?': ['Generate report'],
  'What is the estimated timeline to fix all issues?': ['Generate report'],
  'What is the priority order for resolving domain issues?': ['Generate report'],

  // Legacy / utility
  'Show me domain-wise breakdown': CROSS_DOMAIN.slice(0, 3),
  'What are the key risks?': RECOMMENDATIONS.slice(3, 6),
  'How can we improve the score?': RECOMMENDATIONS.slice(0, 3),
  'Which domain has the highest score?': CROSS_DOMAIN.slice(0, 3),
  'Which domain has the lowest score?': CROSS_DOMAIN.slice(1, 4),
  'What are the fail signals?': RECOMMENDATIONS.slice(3, 6),
  'How to fix these issues?': RECOMMENDATIONS.slice(0, 3),
  'Show me detailed recommendations': ['Generate report'],
  'Generate report': ['Download report'],
};

// Domain chain links
Object.entries(DOMAIN_FLOWS).forEach(([id, flow]) => {
  const domainId = Number(id);
  flow.initial.forEach((q, i) => {
    if (!QUESTION_CHAINS[q]) {
      QUESTION_CHAINS[q] = flow.followup.slice(i, i + 3).length
        ? flow.followup.slice(i, i + 3)
        : flow.chain.slice(0, 3);
    }
  });
  flow.followup.forEach((q, i) => {
    if (!QUESTION_CHAINS[q]) {
      QUESTION_CHAINS[q] = flow.chain.slice(0, 3);
    }
  });
  flow.chain.forEach((q, i) => {
    if (!QUESTION_CHAINS[q]) {
      QUESTION_CHAINS[q] = i < flow.chain.length - 1
        ? flow.chain.slice(i + 1, i + 4)
        : ['Generate report'];
    }
  });
});

export function getNextSuggestions(question, activeTab) {
  if (QUESTION_CHAINS[question]?.length) {
    return QUESTION_CHAINS[question].slice(0, 3);
  }
  if (typeof activeTab === 'number' && DOMAIN_FLOWS[activeTab]) {
    return DOMAIN_FLOWS[activeTab].followup.slice(0, 3);
  }
  return DASHBOARD_WELCOME.slice(0, 3);
}
