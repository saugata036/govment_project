import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { useAssessment } from '../context/AssessmentContext';
import { PURPOSE, PROJECT_INFO } from '../data/domains';
import { statusLabel } from '../utils/scoring';
import { generateReport, buildReportData } from './ReportGenerator';

const CHAT_FLOWS = {
  welcome: {
    message: 'Welcome to PRO Assessment Assistant! How can I help you?',
    questions: [
      'What is the overall project readiness score?',
      'Which domains need immediate attention?',
      'Show me a summary of all domains',
    ],
  },
  overall: {
    next: [
      'Show me domain-wise breakdown',
      'What are the key risks?',
      'How can we improve the score?',
    ],
  },
  domainsBreakdown: {
    next: [
      'Which domain has the highest score?',
      'Which domain has the lowest score?',
      'Generate report',
    ],
  },
  risks: {
    next: ['How to fix these issues?', 'Generate report'],
  },
  improvement: {
    next: ['Show me detailed recommendations', 'Generate report'],
  },
  summary: {
    next: [
      'Which domain has the highest score?',
      'Which domain has the lowest score?',
      'Generate report',
    ],
  },
  failSignals: {
    next: ['How to fix these issues?', 'Generate report'],
  },
  domainDetails: {
    next: ['Show next domain', 'Show previous domain', 'Generate report'],
  },
  report: {
    next: ['Start new assessment', 'Exit'],
  },
};

const INITIAL_MESSAGE = {
  role: 'bot',
  text: CHAT_FLOWS.welcome.message,
  flow: 'welcome',
};

const INITIAL_SUGGESTIONS = CHAT_FLOWS.welcome.questions;

const SECTION_CHAINS = {
  overall: [
    'Show me domain-wise breakdown',
    'What are the key risks?',
    'How can we improve the score?',
    'Which domain has the highest score?',
    'Which domain has the lowest score?',
    'What are the fail signals?',
    'Show me details for Strategic & Policy Alignment',
    'How to fix these issues?',
    'Show me detailed recommendations',
    'Generate report',
  ],
  attention: [
    'What are the fail signals?',
    'Show me details for Strategic & Policy Alignment',
    'Show me details for Technical Readiness & Engineering Maturity',
    'Show me details for Financial & Commercial Readiness',
    'Show me details for ESG & Sustainability Compliance',
    'Show me details for Organizational & Delivery Capability Readiness',
    'Show me details for Risk, Controls & Assurance Readiness',
    'Show me details for Digital, Data & Traceability Readiness',
    'How to fix these issues?',
    'Generate report',
  ],
  summary: [
    'Show me domain-wise breakdown',
    'Which domain has the highest score?',
    'Which domain has the lowest score?',
    'What are the key risks?',
    'How can we improve the score?',
    'Show me details for Legal, Contractual & Regulatory Readiness',
    'Show me details for Mobilization & Execution Readiness',
    'What are the fail signals?',
    'Show me detailed recommendations',
    'Generate report',
  ],
};

function formatDomainLine(domain, score) {
  return `${domain.name}: ${score.score}% (${statusLabel(score.status)})`;
}

function getDomainDetailsText(domainName, context) {
  const { domains, domainScores } = context;
  const domain = domains.find((d) => d.name === domainName);
  if (!domain) return `Domain details not found for ${domainName}.`;
  const score = domainScores.find((s) => s.domainId === domain.id);
  const checksPassed = domain.checkStates?.filter(Boolean).length ?? 0;
  const checksTotal = domain.checkStates?.length ?? domain.keyChecks.length;
  const kpiSummary = domain.kpis.map((k) => `${k.name} (${k.currentValue}/${k.targetValue})`).join(', ');
  return `${domain.name} — Score: ${score.score}% (${statusLabel(
    score.status,
  )}). Checks passed: ${checksPassed}/${checksTotal}. KPIs: ${kpiSummary}. Fail signal: ${domain.failSignal}`;
}

function handleStructuredQuestion(question, context) {
  const { overallScore, overallStatus, domains, domainScores, activeTab } = context;

  switch (question) {
    case 'What is the overall project readiness score?': {
      return {
        flow: 'overall',
        text: `Overall Score: ${overallScore}% (${statusLabel(
          overallStatus,
        )}). The project is ${
          overallStatus === 'go'
            ? 'ready for fund release'
            : overallStatus === 'conditional'
            ? 'conditionally ready'
            : 'not ready'
        }.`,
      };
    }
    case 'Which domains need immediate attention?': {
      const atRisk = domains
        .map((d) => ({
          domain: d,
          score: domainScores.find((s) => s.domainId === d.id),
        }))
        .filter((x) => x.score && x.score.status !== 'go');
      const body =
        atRisk.length === 0
          ? 'All domains are currently in Go status.'
          : atRisk
              .map((x) => `• ${x.domain.name}: ${x.score.score}% (${statusLabel(x.score.status)})`)
              .join('\n');
      return {
        flow: 'risks',
        text: `Domains needing immediate attention:\n${body}`,
      };
    }
    case 'Show me a summary of all domains': {
      const lines = domains
        .map((d) => {
          const s = domainScores.find((x) => x.domainId === d.id);
          return `• ${formatDomainLine(d, s)}`;
        })
        .join('\n');
      return {
        flow: 'summary',
        text: `Summary of all domains:\n${lines}`,
      };
    }
    case 'Show me domain-wise breakdown': {
      const lines = domains
        .map((d) => {
          const s = domainScores.find((x) => x.domainId === d.id);
          return formatDomainLine(d, s);
        })
        .join('\n');
      return {
        flow: 'domainsBreakdown',
        text: `Domain-wise breakdown:\n${lines}`,
      };
    }
    case 'What are the key risks?': {
      const atRisk = domains
        .map((d) => ({
          domain: d,
          score: domainScores.find((s) => s.domainId === d.id),
        }))
        .filter((x) => x.score && x.score.score < 80);
      const body =
        atRisk.length === 0
          ? 'No major risks identified — all domains meet Go thresholds.'
          : atRisk
              .map((x) => `• ${x.domain.name}: ${x.domain.failSignal}`)
              .join('\n');
      return {
        flow: 'risks',
        text: `Key risks identified:\n${body}`,
      };
    }
    case 'How can we improve the score?': {
      const lowDomains = domains
        .map((d) => ({
          domain: d,
          score: domainScores.find((s) => s.domainId === d.id),
        }))
        .filter((x) => x.score && x.score.score < 80);
      const body =
        lowDomains.length === 0
          ? 'Scores are strong across all domains. Maintain discipline on risk, ESG, and delivery capability to preserve readiness.'
          : lowDomains
              .map((x) => {
                const weakKpis = x.domain.kpis.filter(
                  (k) => k.currentValue < k.targetValue * 0.7,
                );
                const names =
                  weakKpis.length > 0
                    ? weakKpis.map((k) => k.name).join(', ')
                    : 'address residual risk and implementation discipline';
                return `• ${x.domain.name}: Focus on ${names}.`;
              })
              .join('\n');
      return {
        flow: 'improvement',
        text: `Recommendations for improvement:\n${body}`,
      };
    }
    case 'Which domain has the highest score?': {
      const enriched = domains.map((d) => ({
        domain: d,
        score: domainScores.find((s) => s.domainId === d.id),
      }));
      const best = enriched.reduce(
        (bestSoFar, x) =>
          !bestSoFar || (x.score && x.score.score > bestSoFar.score.score) ? x : bestSoFar,
        null,
      );
      if (!best) {
        return {
          flow: 'summary',
          text: 'No scores are available yet.',
        };
      }
      return {
        flow: 'summary',
        text: `Highest score: ${formatDomainLine(best.domain, best.score)}.`,
      };
    }
    case 'Which domain has the lowest score?': {
      const enriched = domains.map((d) => ({
        domain: d,
        score: domainScores.find((s) => s.domainId === d.id),
      }));
      const worst = enriched.reduce(
        (worstSoFar, x) =>
          !worstSoFar || (x.score && x.score.score < worstSoFar.score.score) ? x : worstSoFar,
        null,
      );
      if (!worst) {
        return {
          flow: 'summary',
          text: 'No scores are available yet.',
        };
      }
      return {
        flow: 'summary',
        text: `Lowest score: ${formatDomainLine(worst.domain, worst.score)}.`,
      };
    }
    case 'What are the fail signals?': {
      const lines = domains
        .map((d) => `• ${d.name}: ${d.failSignal}`)
        .join('\n');
      return {
        flow: 'failSignals',
        text: `Fail signals by domain:\n${lines}`,
      };
    }
    case 'Show me details for Strategic & Policy Alignment': {
      return {
        flow: 'domainDetails',
        text: getDomainDetailsText('Strategic & Policy Alignment', context),
      };
    }
    case 'Show me details for Technical Readiness & Engineering Maturity':
    case 'Show me details for Financial & Commercial Readiness':
    case 'Show me details for ESG & Sustainability Compliance':
    case 'Show me details for Organizational & Delivery Capability Readiness':
    case 'Show me details for Risk, Controls & Assurance Readiness':
    case 'Show me details for Digital, Data & Traceability Readiness':
    case 'Show me details for Legal, Contractual & Regulatory Readiness':
    case 'Show me details for Mobilization & Execution Readiness': {
      const domainName = question.replace('Show me details for ', '');
      return {
        flow: 'domainDetails',
        text: getDomainDetailsText(domainName, context),
      };
    }
    case 'Show next domain': {
      if (typeof activeTab !== 'number') {
        return {
          flow: 'domainDetails',
          text: 'Open a domain tab first, then ask to show the next domain.',
        };
      }
      if (activeTab >= 9) {
        return {
          flow: 'domainDetails',
          text: 'You are already on the last domain.',
        };
      }
      const next = domains.find((d) => d.id === activeTab + 1);
      const s = domainScores.find((x) => x.domainId === next.id);
      return {
        flow: 'domainDetails',
        text: `Domain ${next.id} – ${next.name}: ${s.score}% (${statusLabel(
          s.status,
        )}). Fail signal: ${next.failSignal}`,
        navigateTo: next.id,
      };
    }
    case 'Show previous domain': {
      if (typeof activeTab !== 'number') {
        return {
          flow: 'domainDetails',
          text: 'Open a domain tab first, then ask to show the previous domain.',
        };
      }
      if (activeTab <= 1) {
        return {
          flow: 'domainDetails',
          text: 'You are already on the first domain.',
        };
      }
      const prev = domains.find((d) => d.id === activeTab - 1);
      const s = domainScores.find((x) => x.domainId === prev.id);
      return {
        flow: 'domainDetails',
        text: `Domain ${prev.id} – ${prev.name}: ${s.score}% (${statusLabel(
          s.status,
        )}). Fail signal: ${prev.failSignal}`,
        navigateTo: prev.id,
      };
    }
    case 'How to fix these issues?':
    case 'Show me detailed recommendations': {
      const reportData = buildReportData(context);
      const lines =
        reportData.recommendations.length === 0
          ? 'No specific remediation required — all domains are performing strongly.'
          : reportData.recommendations.join('\n');
      return {
        flow: 'improvement',
        text: `Detailed recommendations:\n${lines}`,
      };
    }
    case 'Start new assessment': {
      return {
        flow: 'welcome',
        text: CHAT_FLOWS.welcome.message,
      };
    }
    case 'Exit': {
      return {
        flow: 'welcome',
        text: 'Chat session ended. You can reopen the assistant at any time.',
        close: true,
      };
    }
    default:
      return null;
  }
}

export default function Chatbot({ activeTab }) {
  const assessment = useAssessment();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [flow, setFlow] = useState('welcome');
  const [suggested, setSuggested] = useState(INITIAL_SUGGESTIONS);
  const [typing, setTyping] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [reportReady, setReportReady] = useState(false);
  const [section, setSection] = useState(null);
  const [sectionIndex, setSectionIndex] = useState(0);
  const messagesEndRef = useRef(null);

  const resetChat = () => {
    setInput('');
    setMessages([INITIAL_MESSAGE]);
    setFlow('welcome');
    setSuggested(INITIAL_SUGGESTIONS);
    setTyping(false);
    setGenerating(false);
    setReportReady(false);
    setSection(null);
    setSectionIndex(0);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const updateFlowSuggestions = (nextFlow) => {
    setFlow(nextFlow);
    if (!section) {
      const next = CHAT_FLOWS[nextFlow]?.questions ?? [];
      if (next.length > 0) setSuggested(next);
    }
  };

  const pushBotMessage = (text, nextFlow) => {
    setMessages((prev) => [...prev, { role: 'bot', text, flow: nextFlow }]);
    if (nextFlow) updateFlowSuggestions(nextFlow);
  };

  const getSectionSuggestions = (sectionName, idx) => {
    const chain = SECTION_CHAINS[sectionName] ?? [];
    if (idx >= chain.length) return ['Generate report'];
    return chain.slice(idx, idx + 3);
  };

  const beginSection = (sectionName) => {
    setSection(sectionName);
    setSectionIndex(0);
    setSuggested(getSectionSuggestions(sectionName, 0));
  };

  const advanceSection = (question) => {
    if (!section) return;
    const chain = SECTION_CHAINS[section] ?? [];
    const idx = chain.indexOf(question);
    if (idx === -1) return;
    const nextIdx = idx + 1;
    setSectionIndex(nextIdx);
    setSuggested(getSectionSuggestions(section, nextIdx));
  };

  const handleQuestion = async (question) => {
    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setTyping(true);

    const context = { activeTab, ...assessment };

    if (question === 'What is the overall project readiness score?') {
      beginSection('overall');
    } else if (question === 'Which domains need immediate attention?') {
      beginSection('attention');
    } else if (question === 'Show me a summary of all domains') {
      beginSection('summary');
    } else if (question === 'Start new assessment') {
      setSection(null);
      setSectionIndex(0);
      setSuggested(INITIAL_SUGGESTIONS);
      setReportReady(false);
    } else if (question === 'Exit') {
      setSection(null);
      setSectionIndex(0);
      setSuggested(INITIAL_SUGGESTIONS);
    }

    if (question === 'Generate report') {
      setFlow('report');
      setGenerating(true);
      setReportReady(false);
      setSuggested([]);
      pushBotMessage('Generating report...', 'report');
      setTimeout(() => {
        setGenerating(false);
        setReportReady(true);
        setSuggested(['Download report']);
        pushBotMessage(
          'Report ready! Click "Download report" to save the PPT locally.',
          'report',
        );
        setTyping(false);
      }, 1400);
      return;
    }

    if (question === 'Download report') {
      setGenerating(true);
      try {
        await generateReport(assessment);
        pushBotMessage('Download started. The PPT report has been saved to your local machine.', 'report');
        setSuggested(['Start new assessment', 'Exit']);
      } catch (e) {
        console.error('Report download failed:', e);
        pushBotMessage(
          `Download failed: ${e?.message || 'Please click "Download report" again.'}`,
          'report',
        );
        setSuggested(['Download report']);
      } finally {
        setGenerating(false);
        setTyping(false);
      }
      return;
    }

    const structured = handleStructuredQuestion(question, context);
    if (structured) {
      if (structured.navigateTo) {
        assessment.getDomainById(structured.navigateTo); // no-op but keeps access pattern
      }
      if (structured.close) {
        setTimeout(() => setOpen(false), 600);
      }
      setTimeout(() => {
        pushBotMessage(structured.text, structured.flow);
        advanceSection(question);
        setTyping(false);
      }, 400);
      return;
    }

    // Fallback to free-text handler using previous logic
    const q = question.toLowerCase().trim();
    const { overallScore, overallStatus, domains, domainScores } = context;

    let response = `I can help with PRO assessment questions. The current overall score is ${overallScore}/100 (${statusLabel(
      overallStatus,
    )}). Ask about domains, KPIs, scoring, fail signals, or ESG compliance.`;

    if (q.includes('purpose') || q.includes('what is pro') || q.includes('fund release')) {
      response = `${PURPOSE.question} ${PURPOSE.statement} ${PURPOSE.role}`;
    } else if (q.includes('overall') || q.includes('total score') || q.includes('project score')) {
      response = `The overall project readiness score is ${overallScore}/100 with a status of "${statusLabel(
        overallStatus,
      )}". This is calculated as the average of all 9 domain scores.`;
    } else if (q.includes('go') && (q.includes('no-go') || q.includes('conditional'))) {
      response =
        'Go (≥80%): Ready for fund release. Conditional Go (60–79%): Requires remediation before release. No-Go (<60%): Not ready — critical gaps must be addressed.';
    } else if (q.includes('9 domain')) {
      const list = domains.map((d) => `${d.id}. ${d.name}`).join('\n');
      response = `The 9 Checking Domains:\n${list}`;
    }

    setTimeout(() => {
      pushBotMessage(response, flow);
      advanceSection(question);
      setTyping(false);
    }, 400);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    const question = text;
    setInput('');
    handleQuestion(question);
  };

  return (
    <>
      <button
        type="button"
        className="chatbot-fab"
        onClick={() => {
          if (open) {
            resetChat();
            setOpen(false);
          } else {
            resetChat();
            setOpen(true);
          }
        }}
        aria-label="Open PRO assistant"
      >
        <MessageCircle size={24} />
      </button>

      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>PRO Assistant</h3>
            <button
              type="button"
              className="chatbot-close"
              onClick={() => {
                resetChat();
                setOpen(false);
              }}
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.role}`} style={{ whiteSpace: 'pre-line' }}>
                {msg.text}
              </div>
            ))}
            {typing && (
              <div className="chat-message bot">
                <span className="typing-indicator">
                  <span />
                  <span />
                  <span />
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chatbot-suggestions">
            {suggested.map((q) => (
              <button
                key={q}
                type="button"
                className="chip"
                onClick={() => handleQuestion(q)}
              >
                {q}
              </button>
            ))}
            {flow === 'report' && reportReady && suggested.length === 0 && (
              <button type="button" className="chip chip-primary" onClick={() => handleQuestion('Download report')}>
                Download report
              </button>
            )}
          </div>
          <div className="chatbot-input-area">
            <input
              type="text"
              className="chatbot-input"
              placeholder="Ask or choose a suggested question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button type="button" className="chatbot-send" onClick={handleSend} disabled={generating}>
              {generating ? '...' : <Send size={16} />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

