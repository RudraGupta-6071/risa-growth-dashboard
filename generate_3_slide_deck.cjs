const pptxgen = require('pptxgenjs');

async function buildThreeSlideDeck() {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.author = 'Rudra Gupta';
  pres.company = 'RISA Labs';
  pres.title = 'RISA Festival 2025 — 3-Slide Growth Strategy (Rudra Gupta)';

  const PALETTE = {
    espressoDark: '140A09',
    espressoCard: '1F100E',
    terracottaBg: '241310',
    terracottaCard: '2E1612',
    sandBg: 'F6F1EB',
    sandCard: 'FFFFFF',
    sandBorder: 'E0D5C8',
    goldYellow: 'F6C445',
    brightYellow: 'FFD15C',
    amber: 'D97736',
    rustRed: '8B3A2B',
    crimson: 'E74C3C',
    emerald: '2ECC71',
    white: 'FFFFFF',
    creamText: 'EBDDD0',
    mutedGray: '9B8E85',
    darkText: '1C0E0C',
    darkMuted: '5E4E46'
  };
  const FONT = 'Helvetica';

  function addHeader(slide, num, title, subtitle = 'CHALLENGE A: ATTENDEE GROWTH · TIER 1 BANGALORE', isLight = false) {
    slide.addShape(pres.ShapeType.ellipse, {
      x: 0.5, y: 0.3, w: 0.52, h: 0.52,
      fill: { color: isLight ? PALETTE.terracottaBg : PALETTE.goldYellow },
      line: { color: isLight ? PALETTE.goldYellow : PALETTE.white, width: 1.5 }
    });
    slide.addText('RG', {
      x: 0.5, y: 0.3, w: 0.52, h: 0.52,
      fontFace: FONT, fontSize: 12.5, bold: true, align: 'center', valign: 'middle',
      color: isLight ? PALETTE.goldYellow : PALETTE.darkText
    });

    slide.addShape(pres.ShapeType.roundRect, {
      x: 1.15, y: 0.31, w: 5.2, h: 0.25,
      rectRadius: 0.12,
      fill: { color: isLight ? 'E8DFD5' : '2C1714' },
      line: { color: isLight ? 'D4C6B6' : '3D221D', width: 1 }
    });
    slide.addText(subtitle, {
      x: 1.25, y: 0.31, w: 5.0, h: 0.25,
      fontFace: FONT, fontSize: 8, bold: true, valign: 'middle',
      color: isLight ? PALETTE.darkText : PALETTE.goldYellow
    });

    slide.addText([
      { text: num + '  ', options: { color: isLight ? PALETTE.rustRed : PALETTE.goldYellow, bold: true } },
      { text: title, options: { color: isLight ? PALETTE.darkText : PALETTE.white, bold: true } }
    ], {
      x: 1.15, y: 0.58, w: 6.7, h: 0.4,
      fontFace: FONT, fontSize: 14, valign: 'top'
    });

    slide.addShape(pres.ShapeType.roundRect, {
      x: 8.0, y: 0.34, w: 1.5, h: 0.34,
      rectRadius: 0.17,
      fill: { color: isLight ? PALETTE.terracottaBg : PALETTE.goldYellow }
    });
    slide.addText('RUDRA GUPTA', {
      x: 8.0, y: 0.34, w: 1.5, h: 0.34,
      fontFace: FONT, fontSize: 8.5, bold: true, align: 'center', valign: 'middle',
      color: isLight ? PALETTE.white : PALETTE.darkText
    });
  }

  // ==========================================
  // SLIDE 1: HOW HIGH CAN YOU AIM? (Deep Espresso Theme)
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: PALETTE.espressoDark };
    addHeader(slide, 'SLIDE 1', 'HOW HIGH CAN YOU AIM? · TARGET AMBITION & FUNNEL MODEL');

    // 3 Top Hero KPI Cards
    const targets = [
      { tag: 'REALISTIC BASE', val: '2,050', cac: '₹133.7 CAC', show: '66.8% Show-up', bg: PALETTE.terracottaCard, hero: false },
      { tag: 'REVISED TARGET (GOAL)', val: '2,200', cac: '₹124.5 CAC', show: '76.5% Show-up', bg: PALETTE.goldYellow, hero: true },
      { tag: 'AMBITIOUS STRETCH', val: '2,500', cac: '₹109.6 CAC', show: '83.3% Show-up', bg: PALETTE.terracottaCard, hero: false }
    ];
    targets.forEach((t, i) => {
      const x = 0.5 + i * 3.1;
      slide.addShape(pres.ShapeType.roundRect, {
        x: x, y: 1.05, w: 2.9, h: 1.05,
        rectRadius: 0.18, fill: { color: t.bg },
        line: { color: t.hero ? PALETTE.brightYellow : '48221B', width: 1.5 }
      });
      slide.addText([
        { text: t.tag + '\n', options: { fontSize: 7.5, bold: true, color: t.hero ? PALETTE.darkText : PALETTE.goldYellow } },
        { text: t.val + ' ', options: { fontSize: 21, bold: true, color: t.hero ? PALETTE.darkText : PALETTE.white } },
        { text: 'Admitted\n', options: { fontSize: 9.5, color: t.hero ? '44221A' : PALETTE.creamText } },
        { text: `${t.cac}  •  ${t.show}`, options: { fontSize: 8.5, bold: true, color: t.hero ? PALETTE.darkText : PALETTE.creamText } }
      ], { x: x + 0.15, y: 1.08, w: 2.6, h: 0.98, fontFace: FONT, valign: 'middle' });
    });

    // Left: Native Bar Chart of Conversion Funnel
    slide.addChart(pres.ChartType.bar, [
      {
        name: 'Funnel Volume',
        labels: ['1. Reach', '2. Reg Starts', '3. Confirmed', '4. Admitted', '5. Stretch'],
        values: [45000, 3850, 3120, 2050, 2500]
      }
    ], {
      x: 0.5, y: 2.25, w: 4.8, h: 3.1,
      barDir: 'col', chartColors: [PALETTE.goldYellow],
      showValue: true, valueColor: PALETTE.white,
      valAxisLabelColor: PALETTE.creamText, catAxisLabelColor: PALETTE.goldYellow,
      catAxisFontSize: 8.5, valAxisFontSize: 8, showLegend: false,
      title: 'Attendee Conversion Funnel (Students)', titleColor: PALETTE.white, titleFontSize: 10, titleFontFace: FONT,
      plotArea: { fill: { color: PALETTE.terracottaBg } }
    });

    // Right: 3 Rounded Analytical Cards
    const cards = [
      {
        title: 'Why Bangalore? Audience & Sizing',
        badge: 'TAM: 5.38L',
        desc: '• 5.38L students across 1,148 colleges (AISHE). Namma Metro connects 82% of hubs within 40 mins.\n• Priority Clusters: Cultural Core (Christ, SJCC, Jain, MCC) + Tech Hubs (PES, BMS, RVCE, Ramaiah).'
      },
      {
        title: 'Funnel Math & Venue Capacity',
        badge: 'LEAK: 34.3%',
        desc: '• 45K Reach → 8.5% Reg → 81% Confirmed → 65.7% Show-up (34.3% no-show/cancel drop-off).\n• 2,500 simultaneous capacity managed via 2 staggered waves (10am–2pm & 3pm–9pm).'
      },
      {
        title: 'Quantitative Budget & Target Path',
        badge: 'BUDGET: ₹3.0L',
        desc: '• Baseline ₹2.74L spend yields 2,050 (₹133.7 CAC). Cutting Paid Social by ₹28K & shifting to Ambassadors/Referrals hits 2,200 at ₹124.5 CAC. Full ₹3L unlocks 2,500 stretch.'
      }
    ];
    cards.forEach((c, idx) => {
      const y = 2.25 + idx * 1.04;
      slide.addShape(pres.ShapeType.roundRect, {
        x: 5.45, y: y, w: 4.05, h: 0.96,
        rectRadius: 0.16, fill: { color: PALETTE.terracottaCard }, line: { color: '48221B', width: 1 }
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: 8.42, y: y + 0.1, w: 0.96, h: 0.22,
        rectRadius: 0.11, fill: { color: PALETTE.goldYellow }
      });
      slide.addText(c.badge, {
        x: 8.42, y: y + 0.1, w: 0.96, h: 0.22,
        fontFace: FONT, fontSize: 6.5, bold: true, align: 'center', valign: 'middle', color: PALETTE.darkText
      });
      slide.addText([
        { text: c.title + '\n', options: { fontSize: 9.5, bold: true, color: PALETTE.white } },
        { text: c.desc, options: { fontSize: 7.1, color: PALETTE.creamText, lineSpacing: 9.5 } }
      ], { x: 5.6, y: y + 0.06, w: 2.75, h: 0.84, fontFace: FONT, valign: 'middle' });
    });
  }

  // ==========================================
  // SLIDE 2: WHERE WILL YOU PLACE YOUR BETS? (Warm Sand Light Theme)
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: PALETTE.sandBg };
    addHeader(slide, 'SLIDE 2', 'WHERE WILL YOU PLACE YOUR BETS? · 5 RANKED STRATEGIES & TRADEOFFS', 'ICE PRIORITIZATION · ₹3,00,000 BUDGET ALLOCATION', true);

    const bets = [
      {
        rank: '#1', name: 'Campus Ambassador Network (35 Reps / 25 Hubs)', ice: 'ICE 9.2',
        impact: '+420 Admitted  •  ₹45K  •  ₹108 CAC',
        desc: 'Tiered VIP incentives, 15-attendee quota, tracked WhatsApp links. Test: 10-college W1 pilot; KPI: 48h quota completion.',
        action: 'DOUBLE DOWN', actCol: PALETTE.emerald
      },
      {
        rank: '#2', name: 'College Cultural Club Co-Hosting & Societies', ice: 'ICE 8.8',
        impact: '+385 Admitted  •  ₹31K  •  ₹81 CAC',
        desc: 'Host dance/music semi-finals at RISA for guaranteed bulk contingents. Test: 10 clubs (>200 members); KPI: 91.7% show-up.',
        action: 'DOUBLE DOWN', actCol: PALETTE.emerald
      },
      {
        rank: '#3', name: 'WhatsApp Peer Referral & "Squad Pass" Engine', ice: 'ICE 8.4',
        impact: '+310 Admitted  •  ₹21.5K  •  ₹69 CAC',
        desc: 'Automated "Buy 3, Get 1 Free" group pass (k=1.24). Test: A/B vs single pass; KPI: viral k-factor & referral CAC.',
        action: 'EXPAND', actCol: PALETTE.goldYellow
      },
      {
        rank: '#4', name: 'High-Intent Waitlist & SMS Drop-Off Recovery', ice: 'ICE 7.6',
        impact: '+210 Admitted  •  ₹15K  •  ₹71 CAC',
        desc: 'WhatsApp/SMS QR countdown nudges to 730 dropouts + 88 waitlisted. Test: 50/50 holdout in last 72h; KPI: 25–28% recovery.',
        action: 'SCALE UP', actCol: PALETTE.brightYellow
      },
      {
        rank: '#5', name: 'Metro Fast-Track QR Admission & Shuttles', ice: 'ICE 7.1',
        impact: '+150 Admitted  •  ₹12.5K  •  ₹83 CAC',
        desc: '6 parallel QR/NFC gate lanes + free Purple Line metro shuttles. Test: Weekend ops; KPI: <5 min wait time & scans/min.',
        action: 'OPTIMIZE', actCol: PALETTE.amber
      }
    ];

    bets.forEach((b, i) => {
      const y = 1.05 + i * 0.74;
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.5, y: y, w: 9.0, h: 0.67,
        rectRadius: 0.14, fill: { color: PALETTE.sandCard },
        line: { color: i < 2 ? PALETTE.rustRed : PALETTE.sandBorder, width: i < 2 ? 1.5 : 1 }
      });

      // Rank pill
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.62, y: y + 0.1, w: 0.44, h: 0.47,
        rectRadius: 0.1, fill: { color: i < 2 ? PALETTE.terracottaBg : 'E8DFD5' }
      });
      slide.addText(b.rank, {
        x: 0.62, y: y + 0.1, w: 0.44, h: 0.47,
        fontFace: FONT, fontSize: 10, bold: true, align: 'center', valign: 'middle',
        color: i < 2 ? PALETTE.goldYellow : PALETTE.darkText
      });

      // Title + ICE + Concept/Test
      slide.addText([
        { text: b.name + '  ', options: { fontSize: 9, bold: true, color: PALETTE.darkText } },
        { text: b.ice + '\n', options: { fontSize: 8, bold: true, color: PALETTE.rustRed } },
        { text: b.desc, options: { fontSize: 7, color: PALETTE.darkMuted } }
      ], { x: 1.15, y: y + 0.04, w: 5.25, h: 0.59, fontFace: FONT, valign: 'middle' });

      // Impact & Budget
      slide.addText(b.impact, {
        x: 6.42, y: y + 0.04, w: 1.72, h: 0.59,
        fontFace: FONT, fontSize: 7.5, bold: true, color: PALETTE.darkText, valign: 'middle', align: 'right'
      });

      // Action Tag
      slide.addShape(pres.ShapeType.roundRect, {
        x: 8.22, y: y + 0.18, w: 1.15, h: 0.3,
        rectRadius: 0.15, fill: { color: b.actCol }
      });
      slide.addText(b.action, {
        x: 8.22, y: y + 0.18, w: 1.15, h: 0.3,
        fontFace: FONT, fontSize: 7, bold: true, align: 'center', valign: 'middle', color: PALETTE.darkText
      });
    });

    // Bottom Explicit Tradeoffs Banner
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.5, y: 4.8, w: 9.0, h: 0.62,
      rectRadius: 0.14, fill: { color: PALETTE.terracottaBg }, line: { color: PALETTE.crimson, width: 1.5 }
    });
    slide.addText([
      { text: 'EXPLICIT TRADEOFFS (WHAT WE KILL):  ', options: { bold: true, color: PALETTE.goldYellow, fontSize: 8 } },
      { text: 'Cut Paid Social by 30% (-₹28K; CAC ₹274, 240 no-shows, 58.6% show-up) & Freeze Creator Partners (CAC ₹337, ₹59K for 175 attendees). Shifting ₹28K to Ambassadors & Referrals yields +190 net attendees at ₹0 added budget.', options: { color: PALETTE.white, fontSize: 7.4 } }
    ], { x: 0.65, y: 4.8, w: 8.7, h: 0.62, fontFace: FONT, valign: 'middle' });
  }

  // ==========================================
  // SLIDE 3: HOW WILL YOU KNOW WHAT'S WORKING? (Rich Terracotta Theme)
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: PALETTE.terracottaBg };
    addHeader(slide, 'SLIDE 3', 'HOW WILL YOU KNOW WHAT’S WORKING? · DECISION PLAYBOOK & AI COPILOT');

    const playbooks = [
      {
        action: 'SCALE (DOUBLE DOWN)', color: PALETTE.emerald, cardBg: '17261A', borderColor: PALETTE.emerald,
        thresholds: [
          'CAC < ₹120 per admitted student',
          'Confirmed Show-up Intent > 80%',
          'WhatsApp opt-in > 75%',
          'Rep 48h quota completion > 70%'
        ],
        signals: 'Clubs booking bulk bus contingents; Squad Pass forward rate k > 1.2.',
        teamResponse: 'Unlock +₹15,000 bonus ambassador incentive pool & extra promo kits.',
        aiRole: 'Copilot flags outperforming channels and generates scale-up task with 1-click approval.'
      },
      {
        action: 'CHANGE (PIVOT)', color: PALETTE.goldYellow, cardBg: '2B2111', borderColor: PALETTE.goldYellow,
        thresholds: [
          'CAC between ₹125 – ₹190',
          'Show-up Intent between 65% – 75%',
          'Checkout drop-off > 25%',
          'Ad frequency > 3.8 with flat CTR'
        ],
        signals: 'High reg starts without QR confirmation; curiosity around headliner lineup.',
        teamResponse: 'Pivot copy to artist lineup reveal & group discounts; 1-tap WhatsApp RSVP.',
        aiRole: 'Copilot detects funnel drop-off trends & proposes high-converting SMS/WA nudges.'
      },
      {
        action: 'STOP (KILL)', color: PALETTE.crimson, cardBg: '2E1414', borderColor: PALETTE.crimson,
        thresholds: [
          'CAC > ₹220 per admitted student',
          'Confirmed Show-up Intent < 60%',
          'No-show rate > 30% of confirmed',
          'Zero creator promo code redemptions'
        ],
        signals: 'Vanity clicks without registrations; negative feedback on commute distance.',
        teamResponse: 'Pause campaign within 4 hours; reallocate remaining spend to Referrals/Clubs.',
        aiRole: 'Copilot diagnoses unit-cost bleed and models reallocation gains in real time.'
      }
    ];

    playbooks.forEach((p, idx) => {
      const x = 0.5 + idx * 3.1;
      slide.addShape(pres.ShapeType.roundRect, {
        x: x, y: 1.08, w: 2.9, h: 3.55,
        rectRadius: 0.18, fill: { color: p.cardBg }, line: { color: p.borderColor, width: 1.5 }
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: x + 0.15, y: 1.22, w: 1.95, h: 0.3,
        rectRadius: 0.15, fill: { color: p.color }
      });
      slide.addText(p.action, {
        x: x + 0.15, y: 1.22, w: 1.95, h: 0.3,
        fontFace: FONT, fontSize: 8, bold: true, align: 'center', valign: 'middle', color: PALETTE.darkText
      });

      slide.addText('MEASURABLE THRESHOLDS', {
        x: x + 0.15, y: 1.62, w: 2.6, h: 0.18,
        fontFace: FONT, fontSize: 7, bold: true, color: p.color
      });
      slide.addText(p.thresholds.map(t => '• ' + t).join('\n'), {
        x: x + 0.15, y: 1.80, w: 2.6, h: 0.74,
        fontFace: FONT, fontSize: 6.9, color: PALETTE.creamText, lineSpacing: 9.5
      });

      slide.addText('EARLY SIGNALS & RISKS', {
        x: x + 0.15, y: 2.60, w: 2.6, h: 0.18,
        fontFace: FONT, fontSize: 7, bold: true, color: p.color
      });
      slide.addText(p.signals, {
        x: x + 0.15, y: 2.78, w: 2.6, h: 0.44,
        fontFace: FONT, fontSize: 6.9, color: PALETTE.creamText, lineSpacing: 9.5
      });

      slide.addText('TEAM ACTION & AI COPILOT', {
        x: x + 0.15, y: 3.28, w: 2.6, h: 0.18,
        fontFace: FONT, fontSize: 7, bold: true, color: p.color
      });
      slide.addText(p.teamResponse + '\n' + p.aiRole, {
        x: x + 0.15, y: 3.46, w: 2.6, h: 1.08,
        fontFace: FONT, fontSize: 6.9, color: PALETTE.white, lineSpacing: 9.5
      });
    });

    // Bottom Live Command Center & Gemini 2.5 Thinking Strip
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.5, y: 4.76, w: 9.0, h: 0.66,
      rectRadius: 0.14, fill: { color: PALETTE.espressoDark }, line: { color: PALETTE.goldYellow, width: 1.3 }
    });
    slide.addText([
      { text: 'LIVE COMMAND CENTER & GEMINI 2.5 FLASH COPILOT:  ', options: { bold: true, color: PALETTE.goldYellow, fontSize: 8.5 } },
      { text: 'https://rudragupta-6071.github.io/risa-growth-dashboard/\n', options: { bold: true, color: PALETTE.white, fontSize: 8.5 } },
      { text: 'Live Supabase edits recalculate CAC & show-up rates instantly. Embedded AI Copilot queries live campaigns, targets, tasks & daily metrics to diagnose leaks and create confirmed tasks in 1 click.', options: { color: PALETTE.creamText, fontSize: 7.3 } }
    ], {
      x: 0.65, y: 4.76, w: 8.7, h: 0.66,
      fontFace: FONT, valign: 'middle',
      hyperlink: { url: 'https://rudragupta-6071.github.io/risa-growth-dashboard/' }
    });
  }

  await pres.writeFile({ fileName: 'RISA_3_Slide_Strategy_Deck.pptx' });
  console.log('Successfully generated: RISA_3_Slide_Strategy_Deck.pptx');
}

buildThreeSlideDeck().catch(console.error);
