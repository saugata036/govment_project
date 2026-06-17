import PptxGenJS from 'pptxgenjs';
import { statusLabel, getKpiProgress } from '../utils/scoring';
import { PROJECT_INFO, PURPOSE } from '../data/domains';

/* ── Teal Brand Palette ── */
const C = {
  teal50: 'E0F2F1',
  teal100: 'B2DFDB',
  teal200: '80CBC4',
  teal300: '4DB6AC',
  teal400: '26A69A',
  teal500: '009688',
  teal600: '00796B',
  teal700: '004D40',
  white: 'FFFFFF',
  background: 'E0F2F1',
  text: '1A1A1A',
  textSecondary: '555555',
  border: 'B2DFDB',
  go: '2E7D32',
  conditional: 'F9A825',
  nogo: 'D32F2F',
  failBg: 'E0F2F1',
};

const STATUS_COLOR = { go: C.go, conditional: C.conditional, nogo: C.nogo };

const FONT = 'Segoe UI';

export function buildReportData(assessment) {
  const { domains, domainScores, overallScore, overallStatus } = assessment;

  const summaryDomains = domains.map((domain) => {
    const score = domainScores.find((d) => d.domainId === domain.id);
    const passedChecks = domain.checkStates?.filter(Boolean).length ?? 0;
    const failedChecks = (domain.checkStates?.length ?? 0) - passedChecks;

    const kpisWithProgress = domain.kpis.map((kpi) => ({
      ...kpi,
      progress: getKpiProgress(kpi),
    }));
    const topKpi = kpisWithProgress.reduce(
      (best, k) => (k.progress > best.progress ? k : best),
      kpisWithProgress[0],
    );
    const lowKpi = kpisWithProgress.reduce(
      (worst, k) => (k.progress < worst.progress ? k : worst),
      kpisWithProgress[0],
    );

    return {
      id: domain.id,
      name: domain.name,
      subtitle: domain.subtitle,
      score: score?.score ?? 0,
      status: score?.status ?? 'conditional',
      statusLabel: statusLabel(score?.status ?? 'conditional'),
      purpose: domain.purpose,
      failSignal: domain.failSignal,
      keyChecks: domain.keyChecks,
      checkStates: domain.checkStates ?? domain.keyChecks.map(() => true),
      kpis: kpisWithProgress,
      passedChecks,
      failedChecks,
      topKpi,
      lowKpi,
      failActive: (score?.score ?? 0) < 80,
    };
  });

  const goCount = summaryDomains.filter((d) => d.status === 'go').length;
  const conditionalCount = summaryDomains.filter((d) => d.status === 'conditional').length;
  const nogoCount = summaryDomains.filter((d) => d.status === 'nogo').length;
  const failSignals = summaryDomains.filter((d) => d.failActive);

  const recommendations = summaryDomains
    .filter((d) => d.score < 80)
    .map((d) => {
      if (!d.lowKpi) return `${d.name}: Close readiness gaps across KPIs.`;
      return `${d.name}: Focus on improving "${d.lowKpi.name}" to lift overall readiness.`;
    });

  return {
    projectTitle: PROJECT_INFO.title,
    projectDate: PROJECT_INFO.date,
    projectStatus: PROJECT_INFO.status,
    reportDate: new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    overallScore,
    overallStatus,
    overallStatusLabel: statusLabel(overallStatus),
    goCount,
    conditionalCount,
    nogoCount,
    domains: summaryDomains,
    failSignals,
    recommendations,
    purpose: PURPOSE,
  };
}

/* ── Slide helpers ── */

function addSlideHeader(slide, title, subtitle) {
  slide.addShape('rect', {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.75,
    fill: { color: C.teal300 },
    line: { color: C.teal300 },
  });
  slide.addShape('rect', {
    x: 0,
    y: 0.72,
    w: '100%',
    h: 0.06,
    fill: { color: C.teal200 },
    line: { color: C.teal200 },
  });
  slide.addText(title, {
    x: 0.5,
    y: 0.15,
    w: 11,
    h: 0.45,
    fontSize: 18,
    bold: true,
    color: C.text,
    fontFace: FONT,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.5,
      y: 0.85,
      w: 11,
      h: 0.3,
      fontSize: 11,
      color: C.textSecondary,
      fontFace: FONT,
    });
  }
}

function addSlideFooter(slide, pageNum, total) {
  slide.addShape('line', {
    x: 0.5,
    y: 7.15,
    w: 12.3,
    h: 0,
    line: { color: C.border, width: 0.75 },
  });
  slide.addText('Project Readiness Office (PRO)  |  Assessment Report', {
    x: 0.5,
    y: 7.2,
    w: 8,
    h: 0.25,
    fontSize: 8,
    color: C.textSecondary,
    fontFace: FONT,
  });
  slide.addText(`${pageNum} / ${total}`, {
    x: 11.5,
    y: 7.2,
    w: 1.3,
    h: 0.25,
    fontSize: 8,
    color: C.textSecondary,
    align: 'right',
    fontFace: FONT,
  });
}

function addSectionDivider(pptx, sectionTitle, sectionSubtitle) {
  const slide = pptx.addSlide();
  slide.background = { color: C.background };
  slide.addShape('rect', {
    x: 0,
    y: 2.8,
    w: '100%',
    h: 1.8,
    fill: { color: C.teal300 },
    line: { color: C.teal300 },
  });
  slide.addShape('rect', {
    x: 0,
    y: 4.55,
    w: '100%',
    h: 0.08,
    fill: { color: C.teal200 },
    line: { color: C.teal200 },
  });
  slide.addText(sectionTitle, {
    x: 0.8,
    y: 3.1,
    w: 11.5,
    h: 0.7,
    fontSize: 28,
    bold: true,
    color: C.text,
    fontFace: FONT,
  });
  if (sectionSubtitle) {
    slide.addText(sectionSubtitle, {
      x: 0.8,
      y: 3.85,
      w: 11.5,
      h: 0.4,
      fontSize: 14,
      color: C.textSecondary,
      fontFace: FONT,
    });
  }
  return slide;
}

function addStatusBadge(slide, status, x, y) {
  const color = STATUS_COLOR[status] ?? C.textSecondary;
  const label = statusLabel(status);
  slide.addShape('roundRect', {
    x,
    y,
    w: 2.2,
    h: 0.38,
    fill: { color: C.white },
    line: { color, width: 1.5 },
    rectRadius: 0.15,
  });
  slide.addText(label, {
    x,
    y: y + 0.05,
    w: 2.2,
    h: 0.3,
    fontSize: 10,
    bold: true,
    color,
    align: 'center',
    fontFace: FONT,
  });
}

/* ── Main generator ── */

export async function generateReport(assessment) {
  const data = buildReportData(assessment);
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'PRO Assessment Tool';
  pptx.subject = 'Project Readiness Assessment';
  pptx.title = 'PROJECT READINESS OFFICE (PRO) - Assessment Report';

  const totalSlides =
    1 + 1 + 1 + 1 + 1 + data.domains.length + 1 + 1 + 1 + 1;
  let page = 0;
  const nextPage = () => {
    page += 1;
    return page;
  };

  /* ── SLIDE 1: Cover ── */
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.background };
    slide.addShape('rect', {
      x: 0,
      y: 0,
      w: '100%',
      h: 3.2,
      fill: { color: C.teal300 },
      line: { color: C.teal300 },
    });
    slide.addShape('rect', {
      x: 0,
      y: 3.15,
      w: '100%',
      h: 0.1,
      fill: { color: C.teal200 },
      line: { color: C.teal200 },
    });
    slide.addText('PROJECT READINESS OFFICE (PRO)', {
      x: 0.8,
      y: 0.8,
      w: 11.5,
      h: 0.7,
      fontSize: 32,
      bold: true,
      color: C.text,
      fontFace: FONT,
    });
    slide.addText('Assessment Report', {
      x: 0.8,
      y: 1.55,
      w: 11.5,
      h: 0.5,
      fontSize: 20,
      color: C.text,
      fontFace: FONT,
    });
    slide.addText(data.projectTitle, {
      x: 0.8,
      y: 3.6,
      w: 11.5,
      h: 0.45,
      fontSize: 14,
      bold: true,
      color: C.text,
      fontFace: FONT,
    });
    slide.addText(
      [
        { text: `Report Date: `, options: { bold: true, color: C.text } },
        { text: data.reportDate, options: { color: C.textSecondary } },
        { text: '\n', options: { breakLine: true } },
        { text: `Project Date: `, options: { bold: true, color: C.text } },
        { text: data.projectDate, options: { color: C.textSecondary } },
        { text: '\n', options: { breakLine: true } },
        { text: `Status: `, options: { bold: true, color: C.text } },
        { text: data.projectStatus, options: { color: C.textSecondary } },
      ],
      { x: 0.8, y: 4.2, w: 6, h: 1.2, fontSize: 12, fontFace: FONT },
    );

    slide.addShape('roundRect', {
      x: 8.5,
      y: 4.0,
      w: 4.0,
      h: 2.2,
      fill: { color: C.white },
      line: { color: C.border, width: 1 },
      rectRadius: 0.12,
    });
    slide.addText('OVERALL SCORE', {
      x: 8.5,
      y: 4.15,
      w: 4.0,
      h: 0.3,
      fontSize: 10,
      color: C.textSecondary,
      align: 'center',
      fontFace: FONT,
    });
    slide.addText(`${data.overallScore}%`, {
      x: 8.5,
      y: 4.5,
      w: 4.0,
      h: 0.9,
      fontSize: 44,
      bold: true,
      color: C.text,
      align: 'center',
      fontFace: FONT,
    });
    addStatusBadge(slide, data.overallStatus, 9.4, 5.55);

    slide.addText('Generated by: PRO Assessment Tool', {
      x: 0.8,
      y: 7.0,
      w: 6,
      h: 0.3,
      fontSize: 9,
      color: C.textSecondary,
      fontFace: FONT,
    });
    nextPage();
  }

  /* ── SLIDE 2: Purpose ── */
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.white };
    addSlideHeader(slide, 'Purpose Statement');
    slide.addText(data.purpose.question, {
      x: 0.6,
      y: 1.2,
      w: 12,
      h: 0.5,
      fontSize: 16,
      bold: true,
      color: C.text,
      fontFace: FONT,
    });
    slide.addShape('roundRect', {
      x: 0.6,
      y: 1.85,
      w: 12.1,
      h: 1.5,
      fill: { color: C.background },
      line: { color: C.border, width: 0.75 },
      rectRadius: 0.08,
    });
    slide.addText(data.purpose.statement, {
      x: 0.85,
      y: 2.0,
      w: 11.6,
      h: 1.2,
      fontSize: 12,
      color: C.textSecondary,
      fontFace: FONT,
      valign: 'top',
    });
    slide.addShape('roundRect', {
      x: 0.6,
      y: 3.55,
      w: 12.1,
      h: 0.9,
      fill: { color: C.white },
      line: { color: C.teal300, width: 1.5 },
      rectRadius: 0.08,
    });
    slide.addText(data.purpose.role, {
      x: 0.85,
      y: 3.7,
      w: 11.6,
      h: 0.65,
      fontSize: 12,
      bold: true,
      color: C.text,
      fontFace: FONT,
      valign: 'middle',
    });
    addSlideFooter(slide, nextPage(), totalSlides);
  }

  /* ── SLIDE 3: Executive Summary ── */
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.white };
    addSlideHeader(slide, 'Executive Summary', 'Overall readiness assessment results');

    const stats = [
      { label: 'Overall Score', value: `${data.overallScore}%`, color: C.text },
      { label: 'Go', value: data.goCount, color: C.go },
      { label: 'Conditional', value: data.conditionalCount, color: C.conditional },
      { label: 'No-Go', value: data.nogoCount, color: C.nogo },
    ];
    stats.forEach((stat, i) => {
      const x = 0.6 + i * 3.1;
      slide.addShape('roundRect', {
        x,
        y: 1.3,
        w: 2.8,
        h: 1.5,
        fill: { color: C.background },
        line: { color: C.border, width: 0.75 },
        rectRadius: 0.1,
      });
      slide.addText(stat.value, {
        x,
        y: 1.45,
        w: 2.8,
        h: 0.8,
        fontSize: 32,
        bold: true,
        color: stat.color,
        align: 'center',
        fontFace: FONT,
      });
      slide.addText(stat.label, {
        x,
        y: 2.3,
        w: 2.8,
        h: 0.35,
        fontSize: 11,
        color: C.textSecondary,
        align: 'center',
        fontFace: FONT,
      });
    });

    slide.addChart(
      pptx.charts.BAR,
      [
        {
          name: 'Score',
          labels: data.domains.map((d) => `D${d.id}`),
          values: data.domains.map((d) => d.score),
        },
      ],
      {
        x: 0.6,
        y: 3.2,
        w: 12.1,
        h: 3.5,
        barDir: 'col',
        showTitle: true,
        title: 'Domain Readiness Scores',
        titleColor: C.text,
        titleFontSize: 12,
        catAxisLabelColor: C.textSecondary,
        valAxisLabelColor: C.textSecondary,
        valAxisMaxVal: 100,
        chartColors: [C.teal300],
        showValue: true,
      },
    );

    addSlideFooter(slide, nextPage(), totalSlides);
  }

  /* ── SLIDE 4: Domain Summary Table ── */
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.white };
    addSlideHeader(slide, 'Domain Summary', 'All 9 checking domains at a glance');

    const tableRows = [
      [
        { text: '#', options: { bold: true, fill: { color: C.teal300 }, color: C.text } },
        { text: 'Domain', options: { bold: true, fill: { color: C.teal300 }, color: C.text } },
        { text: 'Score', options: { bold: true, fill: { color: C.teal300 }, color: C.text, align: 'center' } },
        { text: 'Status', options: { bold: true, fill: { color: C.teal300 }, color: C.text, align: 'center' } },
        { text: 'Checks', options: { bold: true, fill: { color: C.teal300 }, color: C.text, align: 'center' } },
        { text: 'Fail Signal', options: { bold: true, fill: { color: C.teal300 }, color: C.text, align: 'center' } },
      ],
      ...data.domains.map((d) => [
        { text: String(d.id), options: { align: 'center', fontSize: 10 } },
        { text: d.name, options: { fontSize: 10 } },
        { text: `${d.score}%`, options: { align: 'center', bold: true, fontSize: 10 } },
        {
          text: d.statusLabel,
          options: {
            align: 'center',
            bold: true,
            color: STATUS_COLOR[d.status],
            fontSize: 10,
          },
        },
        {
          text: `${d.passedChecks}/${d.passedChecks + d.failedChecks}`,
          options: { align: 'center', fontSize: 10 },
        },
        {
          text: d.failActive ? 'Yes' : 'No',
          options: {
            align: 'center',
            bold: true,
            color: d.failActive ? C.nogo : C.go,
            fontSize: 10,
          },
        },
      ]),
    ];

    slide.addTable(tableRows, {
      x: 0.5,
      y: 1.2,
      w: 12.3,
      colW: [0.5, 5.5, 1.0, 1.8, 1.0, 1.2],
      fontSize: 10,
      fontFace: FONT,
      border: { type: 'solid', color: C.border, pt: 0.75 },
      autoPage: false,
    });

    addSlideFooter(slide, nextPage(), totalSlides);
  }

  /* ── Section: Detailed Breakdown ── */
  addSectionDivider(pptx, 'Detailed Breakdown', 'Per-domain assessment with checks, KPIs, and fail signals');
  nextPage();

  /* ── SLIDES: One per domain ── */
  data.domains.forEach((d) => {
    const slide = pptx.addSlide();
    slide.background = { color: C.white };

    const headerTitle = `Domain ${d.id}: ${d.name}`;
    const headerSub = d.subtitle ? `(${d.subtitle})` : d.purpose;
    addSlideHeader(slide, headerTitle, headerSub);

    slide.addShape('roundRect', {
      x: 0.5,
      y: 1.25,
      w: 2.5,
      h: 1.3,
      fill: { color: C.background },
      line: { color: C.border, width: 0.75 },
      rectRadius: 0.1,
    });
    slide.addText('SCORE', {
      x: 0.5,
      y: 1.35,
      w: 2.5,
      h: 0.25,
      fontSize: 9,
      color: C.textSecondary,
      align: 'center',
      fontFace: FONT,
    });
    slide.addText(`${d.score}%`, {
      x: 0.5,
      y: 1.6,
      w: 2.5,
      h: 0.65,
      fontSize: 30,
      bold: true,
      color: C.text,
      align: 'center',
      fontFace: FONT,
    });
    addStatusBadge(slide, d.status, 0.65, 2.35);

    slide.addText('Key Checks', {
      x: 3.3,
      y: 1.2,
      w: 4.5,
      h: 0.3,
      fontSize: 11,
      bold: true,
      color: C.text,
      fontFace: FONT,
    });
    const checkRows = [
      [
        { text: 'Check', options: { bold: true, fill: { color: C.teal200 }, fontSize: 9 } },
        { text: 'Status', options: { bold: true, fill: { color: C.teal200 }, fontSize: 9, align: 'center' } },
      ],
      ...d.keyChecks.map((check, i) => [
        { text: check, options: { fontSize: 8 } },
        {
          text: d.checkStates[i] ? 'Passed' : 'Failed',
          options: {
            fontSize: 8,
            bold: true,
            align: 'center',
            color: d.checkStates[i] ? C.go : C.nogo,
          },
        },
      ]),
    ];
    slide.addTable(checkRows, {
      x: 3.3,
      y: 1.55,
      w: 9.4,
      colW: [7.8, 1.6],
      fontFace: FONT,
      border: { type: 'solid', color: C.border, pt: 0.5 },
      autoPage: false,
    });

    slide.addText('KPIs', {
      x: 0.5,
      y: 4.0,
      w: 12,
      h: 0.3,
      fontSize: 11,
      bold: true,
      color: C.text,
      fontFace: FONT,
    });
    const kpiRows = [
      [
        { text: 'KPI', options: { bold: true, fill: { color: C.teal300 }, fontSize: 9 } },
        { text: 'Current', options: { bold: true, fill: { color: C.teal300 }, fontSize: 9, align: 'center' } },
        { text: 'Target', options: { bold: true, fill: { color: C.teal300 }, fontSize: 9, align: 'center' } },
        { text: 'Progress', options: { bold: true, fill: { color: C.teal300 }, fontSize: 9, align: 'center' } },
        { text: 'Weight', options: { bold: true, fill: { color: C.teal300 }, fontSize: 9, align: 'center' } },
      ],
      ...d.kpis.map((k) => [
        { text: k.name, options: { fontSize: 8 } },
        { text: `${k.currentValue} ${k.unit}`, options: { fontSize: 8, align: 'center' } },
        { text: `${k.targetValue} ${k.unit}`, options: { fontSize: 8, align: 'center' } },
        {
          text: `${k.progress}%`,
          options: {
            fontSize: 8,
            align: 'center',
            bold: true,
            color: k.progress >= 80 ? C.go : k.progress >= 60 ? C.conditional : C.nogo,
          },
        },
        { text: `${k.weight}%`, options: { fontSize: 8, align: 'center' } },
      ]),
    ];
    slide.addTable(kpiRows, {
      x: 0.5,
      y: 4.35,
      w: 12.3,
      colW: [5.5, 1.5, 1.5, 1.5, 1.0],
      fontFace: FONT,
      border: { type: 'solid', color: C.border, pt: 0.5 },
      autoPage: false,
    });

    slide.addShape('roundRect', {
      x: 0.5,
      y: 6.55,
      w: 12.3,
      h: 0.5,
      fill: { color: d.failActive ? C.failBg : 'E8F5E9' },
      line: { color: d.failActive ? C.nogo : C.go, width: 1 },
      rectRadius: 0.06,
    });
    slide.addText(
      [
        { text: 'Fail Signal: ', options: { bold: true, color: d.failActive ? C.nogo : C.go } },
        { text: d.failSignal, options: { color: C.text } },
      ],
      {
        x: 0.7,
        y: 6.62,
        w: 11.9,
        h: 0.38,
        fontSize: 9,
        fontFace: FONT,
        valign: 'middle',
      },
    );

    addSlideFooter(slide, nextPage(), totalSlides);
  });

  /* ── Section: Fail Signals ── */
  addSectionDivider(pptx, 'Fail Signals', 'Active readiness gates requiring attention');
  nextPage();

  /* ── Fail Signals slide ── */
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.white };
    addSlideHeader(slide, 'Fail Signals', 'Domains below Go threshold');

    if (data.failSignals.length === 0) {
      slide.addShape('roundRect', {
        x: 2,
        y: 2.5,
        w: 9.3,
        h: 1.5,
        fill: { color: 'E8F5E9' },
        line: { color: C.go, width: 1 },
        rectRadius: 0.1,
      });
      slide.addText('No active fail signals — all domains meet Go readiness threshold.', {
        x: 2.2,
        y: 2.9,
        w: 8.9,
        h: 0.7,
        fontSize: 14,
        color: C.go,
        align: 'center',
        fontFace: FONT,
      });
    } else {
      const signalRows = [
        [
          { text: 'Domain', options: { bold: true, fill: { color: C.nogo }, color: C.white, fontSize: 10 } },
          { text: 'Score', options: { bold: true, fill: { color: C.nogo }, color: C.white, fontSize: 10, align: 'center' } },
          { text: 'Fail Signal', options: { bold: true, fill: { color: C.nogo }, color: C.white, fontSize: 10 } },
        ],
        ...data.failSignals.map((d) => [
          { text: d.name, options: { fontSize: 10 } },
          { text: `${d.score}%`, options: { fontSize: 10, align: 'center', bold: true, color: C.nogo } },
          { text: d.failSignal, options: { fontSize: 9, color: C.nogo } },
        ]),
      ];
      slide.addTable(signalRows, {
        x: 0.5,
        y: 1.3,
        w: 12.3,
        colW: [4.0, 1.2, 7.1],
        fontFace: FONT,
        border: { type: 'solid', color: C.border, pt: 0.75 },
        autoPage: true,
        autoPageRepeatHeader: true,
      });
    }

    addSlideFooter(slide, nextPage(), totalSlides);
  }

  /* ── Recommendations slide ── */
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.white };
    addSlideHeader(slide, 'Recommendations', 'Actions to improve readiness scores');

    const recItems =
      data.recommendations.length === 0
        ? ['All domains are performing strongly. Maintain current readiness discipline.']
        : data.recommendations;

    recItems.forEach((rec, i) => {
      const y = 1.3 + i * 0.75;
      slide.addShape('ellipse', {
        x: 0.6,
        y: y + 0.05,
        w: 0.25,
        h: 0.25,
        fill: { color: C.teal300 },
        line: { color: C.teal300 },
      });
      slide.addShape('roundRect', {
        x: 1.0,
        y,
        w: 11.8,
        h: 0.6,
        fill: { color: C.background },
        line: { color: C.border, width: 0.5 },
        rectRadius: 0.06,
      });
      slide.addText(rec.replace(/^•\s*/, ''), {
        x: 1.15,
        y: y + 0.08,
        w: 11.5,
        h: 0.45,
        fontSize: 11,
        color: C.text,
        fontFace: FONT,
        valign: 'middle',
      });
    });

    addSlideFooter(slide, nextPage(), totalSlides);
  }

  /* ── Closing slide ── */
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.background };
    slide.addShape('rect', {
      x: 0,
      y: 2.5,
      w: '100%',
      h: 2.5,
      fill: { color: C.teal300 },
      line: { color: C.teal300 },
    });
    slide.addShape('rect', {
      x: 0,
      y: 4.95,
      w: '100%',
      h: 0.08,
      fill: { color: C.teal200 },
      line: { color: C.teal200 },
    });
    slide.addText('End of Report', {
      x: 0.8,
      y: 2.9,
      w: 11.5,
      h: 0.6,
      fontSize: 28,
      bold: true,
      color: C.text,
      align: 'center',
      fontFace: FONT,
    });
    slide.addText(
      `Overall Score: ${data.overallScore}%  |  Status: ${data.overallStatusLabel}`,
      {
        x: 0.8,
        y: 3.65,
        w: 11.5,
        h: 0.4,
        fontSize: 14,
        color: C.text,
        align: 'center',
        fontFace: FONT,
      },
    );
    slide.addText('Generated by: PRO Assessment Tool', {
      x: 0.8,
      y: 6.5,
      w: 11.5,
      h: 0.3,
      fontSize: 10,
      color: C.textSecondary,
      align: 'center',
      fontFace: FONT,
    });
    nextPage();
  }

  const filename = `PRO_Assessment_Report_${new Date().toISOString().slice(0, 10)}.pptx`;

  try {
    await pptx.writeFile({
      fileName: filename,
      compression: true,
    });
  } catch (error) {
    console.error('PPT generation failed:', error);
    throw new Error(
      error?.message || 'Unable to generate the PowerPoint report. Please try again.',
    );
  }
}
