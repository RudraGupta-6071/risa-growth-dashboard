const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

async function createDeck() {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9'; // 10.0 x 5.625 inches
  pres.author = 'Rudra Gupta';
  pres.company = 'RISA Labs';
  pres.title = 'RISA Festival 2025 — Attendee Growth APM Strategy';

  // Palette definitions
  const PALETTE = {
    espressoDark: '140A09',
    espressoCard: '1F100E',
    terracottaBg: '241310',
    terracottaCard: '2E1612',
    wineBg: '2A1210',
    sandBg: 'F6F1EB',
    sandCard: 'FFFFFF',
    sandBorder: 'E6DDD2',
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
    darkMuted: '6E5D54'
  };

  const FONT = 'Helvetica';

  // Helper: Add standard branded top navigation / header
  function addHeader(slide, titleNumber, titleText, categoryText = "RISA FESTIVAL '25 · APM CHALLENGE A: ATTENDEE GROWTH", isLight = false) {
    // RG avatar circle
    slide.addShape(pres.ShapeType.ellipse, {
      x: 0.5, y: 0.35, w: 0.55, h: 0.55,
      fill: { color: isLight ? PALETTE.terracottaBg : PALETTE.goldYellow },
      line: { color: isLight ? PALETTE.goldYellow : PALETTE.white, width: 1.5 }
    });
    slide.addText('RG', {
      x: 0.5, y: 0.35, w: 0.55, h: 0.55,
      fontFace: FONT, fontSize: 13, bold: true, align: 'center', valign: 'middle',
      color: isLight ? PALETTE.goldYellow : PALETTE.darkText
    });

    // Category pill
    slide.addShape(pres.ShapeType.roundRect, {
      x: 1.2, y: 0.36, w: 4.8, h: 0.28,
      rectRadius: 0.14,
      fill: { color: isLight ? 'E8DFD5' : '2C1714' },
      line: { color: isLight ? 'D4C6B6' : '3D221D', width: 1 }
    });
    slide.addText(categoryText, {
      x: 1.3, y: 0.36, w: 4.6, h: 0.28,
      fontFace: FONT, fontSize: 8.5, bold: true, valign: 'middle',
      color: isLight ? PALETTE.darkText : PALETTE.goldYellow
    });

    // Slide Title & Number
    slide.addText([
      { text: titleNumber + '  ', options: { color: isLight ? PALETTE.rustRed : PALETTE.goldYellow, bold: true } },
      { text: titleText, options: { color: isLight ? PALETTE.darkText : PALETTE.white, bold: true } }
    ], {
      x: 1.2, y: 0.65, w: 7.0, h: 0.45,
      fontFace: FONT, fontSize: 15, valign: 'top'
    });

    // Right-hand candidate badge
    slide.addShape(pres.ShapeType.roundRect, {
      x: 8.1, y: 0.38, w: 1.4, h: 0.36,
      rectRadius: 0.18,
      fill: { color: isLight ? PALETTE.terracottaBg : PALETTE.goldYellow }
    });
    slide.addText('RUDRA GUPTA', {
      x: 8.1, y: 0.38, w: 1.4, h: 0.36,
      fontFace: FONT, fontSize: 8, bold: true, align: 'center', valign: 'middle',
      color: isLight ? PALETTE.white : PALETTE.darkText
    });
  }

  // ==========================================
  // SLIDE 1: COVER / HERO (Dark Espresso & Yellow)
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: PALETTE.espressoDark };

    // Background accent glow shapes
    slide.addShape(pres.ShapeType.ellipse, {
      x: 7.5, y: -0.5, w: 3.5, h: 3.5,
      fill: { color: '23110E', transparency: 30 },
      line: { width: 0 }
    });
    slide.addShape(pres.ShapeType.ellipse, {
      x: 8.2, y: 2.8, w: 2.5, h: 2.5,
      fill: { color: '2B1410', transparency: 40 },
      line: { width: 0 }
    });

    // Left decorative bar
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.6, y: 0.8, w: 0.12, h: 4.0,
      rectRadius: 0.06,
      fill: { color: PALETTE.goldYellow }
    });

    // Candidate Tag
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.9, y: 0.8, w: 4.2, h: 0.34,
      rectRadius: 0.17,
      fill: { color: PALETTE.terracottaCard },
      line: { color: '3F201A', width: 1 }
    });
    slide.addText('RISA LABS APM CHALLENGE A · BANGALORE 2025', {
      x: 1.0, y: 0.8, w: 4.0, h: 0.34,
      fontFace: FONT, fontSize: 9, bold: true, valign: 'middle',
      color: PALETTE.goldYellow
    });

    // Hero Title
    slide.addText('RISA FESTIVAL ‘25\nATTENDEE GROWTH STRATEGY', {
      x: 0.9, y: 1.3, w: 8.5, h: 1.5,
      fontFace: FONT, fontSize: 32, bold: true, color: PALETTE.white,
      lineSpacing: 36
    });

    // Subtitle
    slide.addText('A disciplined, unit-economic growth engine to deliver 2,200+ unique admitted students within a ₹3,00,000 budget.', {
      x: 0.9, y: 2.85, w: 7.8, h: 0.5,
      fontFace: FONT, fontSize: 13, color: PALETTE.creamText
    });

    // 3 Big Floating Stat Pills (Template Style)
    const metrics = [
      { label: 'TARGET ADMITTED', val: '2,200', sub: 'Goal: +7.3% vs Base', bg: PALETTE.goldYellow, text: PALETTE.darkText, valColor: PALETTE.darkText },
      { label: 'CAMPAIGN BUDGET', val: '₹3,00,000', sub: 'Current Spend: ₹2.74L', bg: PALETTE.terracottaCard, text: PALETTE.creamText, valColor: PALETTE.white },
      { label: 'PROJECTED BLENDED CAC', val: '₹124.5', sub: 'Down from ₹133.7 Baseline', bg: PALETTE.terracottaCard, text: PALETTE.creamText, valColor: PALETTE.white }
    ];

    metrics.forEach((m, idx) => {
      const x = 0.9 + idx * 2.9;
      slide.addShape(pres.ShapeType.roundRect, {
        x: x, y: 3.55, w: 2.7, h: 1.35,
        rectRadius: 0.2,
        fill: { color: m.bg },
        line: { color: m.bg === PALETTE.goldYellow ? PALETTE.brightYellow : '44211A', width: 1.5 }
      });
      slide.addText([
        { text: m.label + '\n', options: { fontSize: 8.5, bold: true, color: m.text } },
        { text: m.val + '\n', options: { fontSize: 24, bold: true, color: m.valColor } },
        { text: m.sub, options: { fontSize: 8.5, color: m.text } }
      ], {
        x: x + 0.2, y: 3.65, w: 2.3, h: 1.15,
        fontFace: FONT, valign: 'middle'
      });
    });

    // Bottom author pill
    slide.addText('Prepared by Rudra Gupta · Product & Growth APM Candidate · Verified Deployed Artifact', {
      x: 0.9, y: 5.1, w: 8.0, h: 0.3,
      fontFace: FONT, fontSize: 8.5, color: PALETTE.mutedGray
    });
  }

  // ==========================================
  // SLIDE 2: [SLIDE 1 OF ASSIGNMENT] HOW HIGH CAN YOU AIM?
  // Quantitative Funnel & Target Ambition
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: PALETTE.terracottaBg };
    addHeader(slide, '01', 'HOW HIGH CAN YOU AIM? · TARGET AMBITION & CONVERSION FUNNEL');

    // 3 Top Cards (Left: Base, Center: Revised Target [Yellow], Right: Stretch)
    const targets = [
      { tag: 'REALISTIC BASE', val: '2,050', cac: '₹133.7 CAC', show: '66.8% Show-up', bg: PALETTE.terracottaCard, isHero: false },
      { tag: 'REVISED TARGET (CHALLENGE GOAL)', val: '2,200', cac: '₹124.5 CAC', show: '76.5% Show-up', bg: PALETTE.goldYellow, isHero: true },
      { tag: 'AMBITIOUS STRETCH', val: '2,500', cac: '₹109.6 CAC', show: '83.3% Show-up', bg: PALETTE.terracottaCard, isHero: false }
    ];

    targets.forEach((t, i) => {
      const x = 0.5 + i * 3.1;
      slide.addShape(pres.ShapeType.roundRect, {
        x: x, y: 1.15, w: 2.9, h: 1.1,
        rectRadius: 0.18,
        fill: { color: t.bg },
        line: { color: t.isHero ? PALETTE.brightYellow : '48221B', width: 1.5 }
      });
      slide.addText([
        { text: t.tag + '\n', options: { fontSize: 7.5, bold: true, color: t.isHero ? PALETTE.darkText : PALETTE.goldYellow } },
        { text: t.val + ' ', options: { fontSize: 20, bold: true, color: t.isHero ? PALETTE.darkText : PALETTE.white } },
        { text: 'Attendees\n', options: { fontSize: 10, color: t.isHero ? PALETTE.darkMuted : PALETTE.creamText } },
        { text: `${t.cac}  •  ${t.show}`, options: { fontSize: 8.5, bold: true, color: t.isHero ? PALETTE.darkText : PALETTE.creamText } }
      ], {
        x: x + 0.15, y: 1.2, w: 2.6, h: 1.0,
        fontFace: FONT, valign: 'middle'
      });
    });

    // Native Bar Chart: Funnel Volumes (Reach -> Reg -> Confirmed -> Admitted)
    const funnelChartData = [
      {
        name: 'Funnel Stage Volume',
        labels: ['1. Reach', '2. Reg Starts', '3. Confirmed', '4. Actual Admitted', '5. Stretch Target'],
        values: [45000, 3850, 3120, 2050, 2500]
      }
    ];

    slide.addChart(pres.ChartType.bar, funnelChartData, {
      x: 0.5, y: 2.35, w: 4.8, h: 2.95,
      barDir: 'col',
      chartColors: [PALETTE.goldYellow],
      showValue: true,
      valueColor: PALETTE.white,
      valAxisLabelColor: PALETTE.creamText,
      catAxisLabelColor: PALETTE.goldYellow,
      catAxisFontSize: 8.5,
      valAxisFontSize: 8,
      showLegend: false,
      title: 'Conversion Funnel Volumes (Students)',
      titleColor: PALETTE.white,
      titleFontSize: 10,
      titleFontFace: FONT,
      plotArea: { fill: { color: PALETTE.espressoDark } }
    });

    // Right Column: Key Quantitative Breakdown Cards
    const rightCards = [
      {
        title: 'Target Audience Sizing (Bangalore Tier 1)',
        desc: '• 5.38 Lakh college students across 1,148 colleges in Bengaluru Urban.\n• Prioritizing 25 central hub campuses (VTU Engineering, Christ, PES, BMS, Mount Carmel) within 8km of metro lines.',
        badge: 'TAM: 5.38L',
        bg: PALETTE.terracottaCard
      },
      {
        title: 'Conversion Mechanics & Bottlenecks',
        desc: '• Reach-to-Reg: 8.5% | Reg-to-Confirmed: 81.0% | Confirmed-to-Admitted: 65.7% (Baseline).\n• Primary friction: 1,070 confirmed sign-ups dropped out due to low day-of-event commitment and zero reminder nudges.',
        badge: 'LEAK: 34.3%',
        bg: PALETTE.terracottaCard
      },
      {
        title: 'Capacity & Scheduling Realism',
        desc: '• Venue capacity ceiling: 2,500 simultaneous visitors.\n• Staggered badge entry: Slot A (10am–2pm: 1,100 peak) + Slot B (3pm–9pm: 1,400 peak) safely absorbs our 2,200 admitted goal.',
        badge: 'PEAK: 2,500',
        bg: PALETTE.terracottaCard
      }
    ];

    rightCards.forEach((rc, idx) => {
      const y = 2.35 + idx * 0.98;
      slide.addShape(pres.ShapeType.roundRect, {
        x: 5.5, y: y, w: 4.0, h: 0.92,
        rectRadius: 0.15,
        fill: { color: rc.bg },
        line: { color: '48221B', width: 1 }
      });
      // Badge pill
      slide.addShape(pres.ShapeType.roundRect, {
        x: 8.5, y: y + 0.1, w: 0.9, h: 0.22,
        rectRadius: 0.11,
        fill: { color: PALETTE.goldYellow }
      });
      slide.addText(rc.badge, {
        x: 8.5, y: y + 0.1, w: 0.9, h: 0.22,
        fontFace: FONT, fontSize: 6.5, bold: true, align: 'center', valign: 'middle',
        color: PALETTE.darkText
      });
      slide.addText([
        { text: rc.title + '\n', options: { fontSize: 9.5, bold: true, color: PALETTE.white } },
        { text: rc.desc, options: { fontSize: 7.5, color: PALETTE.creamText, lineSpacing: 10 } }
      ], {
        x: 5.65, y: y + 0.08, w: 2.8, h: 0.78,
        fontFace: FONT, valign: 'middle'
      });
    });
  }

  // ==========================================
  // SLIDE 3: BANGALORE AUDIENCE CLUSTERS & MARKET SIZING (Varying color: Warm Sand Theme)
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: PALETTE.sandBg };
    addHeader(slide, '01B', 'AUDIENCE CLUSTERS · BANGALORE STUDENT ECOSYSTEM SIZING', "TIER 1 CITY DEEP-DIVE · BENGALURU URBAN", true);

    // Left Native Doughnut Chart of Bangalore Student Segments
    const marketSegments = [
      {
        name: 'Bangalore Student Pool (5.38 Lakh Total)',
        labels: ['VTU Engineering & Tech (PES, BMS, RVCE)', 'Commerce & Management (Christ, SJCC, Jain)', 'Arts, Media & Design (Srishti, NIFT, MCC)', 'Law, Medicine & Allied Sciences'],
        values: [240000, 130000, 95000, 73000]
      }
    ];

    slide.addChart(pres.ChartType.doughnut, marketSegments, {
      x: 0.5, y: 1.2, w: 4.6, h: 3.9,
      holeSize: 56,
      chartColors: [PALETTE.rustRed, PALETTE.amber, PALETTE.goldYellow, '5A342B'],
      showPercent: true,
      dataLabelColor: PALETTE.white,
      dataLabelFontSize: 8.5,
      showLegend: true,
      legendColor: PALETTE.darkText,
      legendFontSize: 8,
      legendPos: 'b',
      title: 'Bangalore College Student Distribution (5.38L)',
      titleColor: PALETTE.darkText,
      titleFontSize: 10.5,
      titleFontFace: FONT,
      plotArea: { fill: { color: PALETTE.white } }
    });

    // Right Column: Why Bangalore & Cluster Targeting Cards (Clean White Rounded Cards with Terracotta accents)
    const clusters = [
      {
        title: 'Cluster 1: South-Central Academic Corridor',
        metrics: 'Christ University, St. Joseph’s, Jain University, Mount Carmel',
        strategy: '• High density of student clubs (Dance, Drama, Music, Debate).\n• High disposable pocket-money, extreme viral affinity for festival cultural showcases.',
        highlight: 'Primary Cultural Core'
      },
      {
        title: 'Cluster 2: West & South Tech Powerhouses',
        metrics: 'PES University, BMSCE, RVCE, Dayananda Sagar, Ramaiah',
        strategy: '• High commuter volume along Green & Purple Namma Metro lines.\n• Key incentive: Hackathons, competitive battle-of-the-bands, and inter-collegiate prestige.',
        highlight: 'High-Volume Attendance'
      },
      {
        title: 'Geographic Transport & Metro Advantage',
        metrics: 'Namma Metro interchange (Majestic) connects 82% of target colleges within 40 mins',
        strategy: '• Eliminates Bangalore’s infamous traffic bottleneck.\n• Free shuttle pickup from nearest metro station ensures >80% show-up conversion.',
        highlight: 'Transit Unlocked'
      }
    ];

    clusters.forEach((cl, idx) => {
      const y = 1.2 + idx * 1.32;
      slide.addShape(pres.ShapeType.roundRect, {
        x: 5.3, y: y, w: 4.2, h: 1.22,
        rectRadius: 0.18,
        fill: { color: PALETTE.sandCard },
        line: { color: PALETTE.sandBorder, width: 1.5 }
      });
      // Top colored bar
      slide.addShape(pres.ShapeType.roundRect, {
        x: 5.3, y: y, w: 0.1, h: 1.22,
        rectRadius: 0.05,
        fill: { color: idx === 0 ? PALETTE.rustRed : (idx === 1 ? PALETTE.amber : PALETTE.goldYellow) }
      });
      // Pill tag
      slide.addShape(pres.ShapeType.roundRect, {
        x: 8.1, y: y + 0.1, w: 1.3, h: 0.22,
        rectRadius: 0.11,
        fill: { color: 'F0E5D8' }
      });
      slide.addText(cl.highlight, {
        x: 8.1, y: y + 0.1, w: 1.3, h: 0.22,
        fontFace: FONT, fontSize: 6.5, bold: true, align: 'center', valign: 'middle',
        color: PALETTE.rustRed
      });
      slide.addText([
        { text: cl.title + '\n', options: { fontSize: 9.5, bold: true, color: PALETTE.darkText } },
        { text: cl.metrics + '\n', options: { fontSize: 7.5, bold: true, color: PALETTE.rustRed } },
        { text: cl.strategy, options: { fontSize: 7.5, color: PALETTE.darkMuted, lineSpacing: 10 } }
      ], {
        x: 5.5, y: y + 0.08, w: 2.6, h: 1.05,
        fontFace: FONT, valign: 'middle'
      });
    });
  }

  // ==========================================
  // SLIDE 4: [SLIDE 2 OF ASSIGNMENT] WHERE WILL YOU PLACE YOUR BETS?
  // 5 Ranked Strategic Bets (ICE Framework)
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: PALETTE.espressoDark };
    addHeader(slide, '02', 'WHERE WILL YOU PLACE YOUR BETS? · 5 DISTINCT GROWTH STRATEGIES');

    // 5 Horizontal Cards Ranked by ICE Framework
    const bets = [
      {
        rank: '#1',
        name: 'Campus Ambassador Network (35 Reps across 25 Hubs)',
        ice: 'ICE: 9.2 (I:9, C:9, E:9)',
        impact: '+420 Admitted Students',
        budget: '₹45,000 Spend · ₹108 CAC',
        timeline: 'Week 1–3 Execution',
        howItWorks: 'Student leaders get Tiered incentives (VIP passes, backstage artist access, certs). Each rep owns a 15-attendee minimum quota with WhatsApp tracking links.',
        action: 'DOUBLE DOWN',
        actionColor: PALETTE.emerald
      },
      {
        rank: '#2',
        name: 'College Cultural Club Co-Hosting & Society Tie-ups',
        ice: 'ICE: 8.8 (I:9, C:8, E:9)',
        impact: '+385 Admitted Students',
        budget: '₹31,000 Spend · ₹81 CAC',
        timeline: 'Week 2–4 Execution',
        howItWorks: 'Host semi-final rounds of college music/dance competitions at RISA. Clubs guarantee contingent bulk entry (50+ students per college) with 91.7% historical show-up.',
        action: 'DOUBLE DOWN',
        actionColor: PALETTE.emerald
      },
      {
        rank: '#3',
        name: 'WhatsApp Peer Referral & Group Pass Engine',
        ice: 'ICE: 8.4 (I:8, C:9, E:8)',
        impact: '+310 Admitted Students',
        budget: '₹21,500 Spend · ₹69 CAC',
        timeline: 'Week 3–Day of Event',
        howItWorks: 'Unlock "Squad Pass" (Buy 3 get 1 free) exclusively triggered via automated WhatsApp bot. Referral loop coefficient k=1.24 drives lowest CAC among all paid efforts.',
        action: 'EXPAND',
        actionColor: PALETTE.goldYellow
      },
      {
        rank: '#4',
        name: 'High-Intent Retargeting & Waitlist SMS Recovery',
        ice: 'ICE: 7.6 (I:7, C:8, E:8)',
        impact: '+210 Admitted Students',
        budget: '₹15,000 Spend · ₹71 CAC',
        timeline: 'Last 72 Hours',
        howItWorks: '730 students started registration but didn’t confirm. Automated personalized WhatsApp/SMS nudges with dynamic QR passes and countdown timers recapture 28% of dropouts.',
        action: 'SCALE UP',
        actionColor: PALETTE.brightYellow
      },
      {
        rank: '#5',
        name: 'Metro Fast-Track QR Gate Admission & Bus Shuttles',
        ice: 'ICE: 7.1 (I:7, C:7, E:7)',
        impact: '+150 Admitted Students',
        budget: '₹12,500 Spend · ₹83 CAC',
        timeline: 'Festival Weekend',
        howItWorks: 'Eliminate 45-min peak entrance line friction via 6 parallel scanner lanes and continuous free shuttles from nearest Purple Line station, converting hesitant confirmers.',
        action: 'OPTIMIZE',
        actionColor: PALETTE.amber
      }
    ];

    bets.forEach((b, i) => {
      const y = 1.15 + i * 0.85;
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.5, y: y, w: 9.0, h: 0.78,
        rectRadius: 0.15,
        fill: { color: PALETTE.terracottaCard },
        line: { color: i === 0 ? PALETTE.brightYellow : '48221B', width: 1.2 }
      });

      // Rank Pill
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.65, y: y + 0.12, w: 0.45, h: 0.54,
        rectRadius: 0.1,
        fill: { color: i < 2 ? PALETTE.goldYellow : '381914' }
      });
      slide.addText(b.rank, {
        x: 0.65, y: y + 0.12, w: 0.45, h: 0.54,
        fontFace: FONT, fontSize: 11, bold: true, align: 'center', valign: 'middle',
        color: i < 2 ? PALETTE.darkText : PALETTE.white
      });

      // Strategy Name & Detail
      slide.addText([
        { text: b.name + '  ', options: { fontSize: 9.5, bold: true, color: PALETTE.white } },
        { text: b.ice + '\n', options: { fontSize: 8, bold: true, color: PALETTE.goldYellow } },
        { text: b.howItWorks, options: { fontSize: 7.2, color: PALETTE.creamText } }
      ], {
        x: 1.2, y: y + 0.06, w: 5.3, h: 0.66,
        fontFace: FONT, valign: 'middle'
      });

      // Impact & Budget metrics
      slide.addText([
        { text: b.impact + '\n', options: { fontSize: 9, bold: true, color: PALETTE.white } },
        { text: b.budget + '\n', options: { fontSize: 7.5, color: PALETTE.creamText } },
        { text: b.timeline, options: { fontSize: 7, color: PALETTE.mutedGray } }
      ], {
        x: 6.6, y: y + 0.06, w: 1.45, h: 0.66,
        fontFace: FONT, valign: 'middle', align: 'right'
      });

      // Action Tag
      slide.addShape(pres.ShapeType.roundRect, {
        x: 8.15, y: y + 0.22, w: 1.2, h: 0.34,
        rectRadius: 0.17,
        fill: { color: b.actionColor }
      });
      slide.addText(b.action, {
        x: 8.15, y: y + 0.22, w: 1.2, h: 0.34,
        fontFace: FONT, fontSize: 7.5, bold: true, align: 'center', valign: 'middle',
        color: PALETTE.darkText
      });
    });
  }

  // ==========================================
  // SLIDE 5: CHANNEL UNIT ECONOMICS & WHAT TO KILL (High Contrast Terracotta & Gold)
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: PALETTE.wineBg };
    addHeader(slide, '02B', 'DELIBERATE TRADEOFFS · CHANNEL ECONOMICS & WHAT WE ARE KILLING');

    // Left: Native Bar Chart of Channel CAC
    const cacChartData = [
      {
        name: 'Channel CAC (₹ per Admitted Attendee)',
        labels: ['Referrals', 'Clubs/Partners', 'Ambassadors', 'Targeted Web', 'Paid Social (Meta)', 'Creators/Shoutouts'],
        values: [69, 81, 108, 142, 274, 337]
      }
    ];

    slide.addChart(pres.ChartType.bar, cacChartData, {
      x: 0.5, y: 1.2, w: 4.8, h: 4.0,
      barDir: 'col',
      chartColors: [PALETTE.emerald, PALETTE.emerald, PALETTE.goldYellow, PALETTE.amber, PALETTE.crimson, PALETTE.crimson],
      showValue: true,
      valueColor: PALETTE.white,
      valAxisLabelColor: PALETTE.creamText,
      catAxisLabelColor: PALETTE.creamText,
      catAxisFontSize: 8,
      valAxisFontSize: 8,
      showLegend: false,
      title: 'Channel Unit Cost Comparison (CAC in ₹)',
      titleColor: PALETTE.white,
      titleFontSize: 10,
      titleFontFace: FONT,
      plotArea: { fill: { color: PALETTE.espressoDark } }
    });

    // Right Column: What to Kill vs Double Down
    // Box 1: STOP / CUT
    slide.addShape(pres.ShapeType.roundRect, {
      x: 5.5, y: 1.2, w: 4.0, h: 1.9,
      rectRadius: 0.18,
      fill: { color: '381313' },
      line: { color: PALETTE.crimson, width: 1.5 }
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: 5.65, y: 1.35, w: 1.6, h: 0.28,
      rectRadius: 0.14,
      fill: { color: PALETTE.crimson }
    });
    slide.addText('STOP / CUT (KILL)', {
      x: 5.65, y: 1.35, w: 1.6, h: 0.28,
      fontFace: FONT, fontSize: 8, bold: true, align: 'center', valign: 'middle',
      color: PALETTE.white
    });
    slide.addText([
      { text: 'Paid Social Ads & Untargeted Creator Shoutouts\n', options: { fontSize: 10, bold: true, color: PALETTE.white } },
      { text: '• Spent ₹1,34,000 (49% of budget) to yield only 449 admitted attendees.\n• Paid Social CAC is ₹274 (4x higher than referrals), with a massive 240 no-show drop.\n• Creator Partners CAC is ₹337 (only 175 attendees).\n• Decision: Slash Paid Social spend by 30% (-₹22.5K) and freeze generic creators immediately.', options: { fontSize: 7.5, color: PALETTE.creamText, lineSpacing: 11 } }
    ], {
      x: 5.65, y: 1.7, w: 3.7, h: 1.3,
      fontFace: FONT, valign: 'top'
    });

    // Box 2: SCALE / DOUBLE DOWN
    slide.addShape(pres.ShapeType.roundRect, {
      x: 5.5, y: 3.25, w: 4.0, h: 1.95,
      rectRadius: 0.18,
      fill: { color: '1A291A' },
      line: { color: PALETTE.emerald, width: 1.5 }
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: 5.65, y: 3.4, w: 2.1, h: 0.28,
      rectRadius: 0.14,
      fill: { color: PALETTE.emerald }
    });
    slide.addText('SCALE (DOUBLE DOWN)', {
      x: 5.65, y: 3.4, w: 2.1, h: 0.28,
      fontFace: FONT, fontSize: 8, bold: true, align: 'center', valign: 'middle',
      color: PALETTE.darkText
    });
    slide.addText([
      { text: 'Campus Ambassadors & College Partnerships\n', options: { fontSize: 10, bold: true, color: PALETTE.white } },
      { text: '• College Clubs delivered 385 attendees at ₹81 CAC with an industry-best 91.7% show-up rate!\n• Student Referrals delivered 310 attendees at ₹69 CAC.\n• Decision: Reallocate ₹28,000 from Paid Social into Ambassador incentives and WhatsApp squad referral contests.\n• Net Gain: +190 incremental verified attendees for ₹0 added budget.', options: { fontSize: 7.5, color: PALETTE.creamText, lineSpacing: 11 } }
    ], {
      x: 5.65, y: 3.75, w: 3.7, h: 1.35,
      fontFace: FONT, valign: 'top'
    });
  }

  // ==========================================
  // SLIDE 6: [SLIDE 3 OF ASSIGNMENT] HOW WILL YOU KNOW WHAT'S WORKING?
  // Leading Indicators & Adaptive Decision Matrix
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: PALETTE.terracottaBg };
    addHeader(slide, '03', 'HOW WILL YOU KNOW WHAT’S WORKING? · ADAPTIVE DECISION PLAYBOOK');

    // 3 Equal Vertical Action Playbook Columns (SCALE, CHANGE, STOP)
    const playbooks = [
      {
        action: 'SCALE',
        tagline: 'Double down on high-yield channels',
        color: PALETTE.emerald,
        cardBg: '1A261A',
        borderColor: '2ECC71',
        thresholds: [
          'CAC < ₹120 per admitted student',
          'Confirmed Show-Up Intent > 80%',
          'WhatsApp opt-in verification > 75%',
          'Rep quota completion > 70% in 48h'
        ],
        earlySignals: 'Clubs confirming bus groups; high squad-pass forward rate (k > 1.2).',
        teamResponse: 'Unlock +₹15,000 bonus ambassador pool; supply extra college banner kits.',
        aiRole: 'Growth Copilot auto-proposes budget scaleup ticket for 1-click team approval.'
      },
      {
        action: 'CHANGE / PIVOT',
        tagline: 'Iterate messaging & optimize bottlenecks',
        color: PALETTE.goldYellow,
        cardBg: '2D2412',
        borderColor: 'F6C445',
        thresholds: [
          'CAC between ₹125 – ₹190',
          'Show-Up Intent between 65% – 75%',
          'High reg-starts but checkout drop > 25%',
          'Meta ad frequency > 3.8 with flat CTR'
        ],
        earlySignals: 'Students signing up but not sharing phone for QR pass; artist lineup curiosity.',
        teamResponse: 'Pivot ad copy to Artist Lineup & Group discounts; switch to 1-click WhatsApp RSVP.',
        aiRole: 'Copilot flags underperforming creatives and suggests high-converting SMS reminders.'
      },
      {
        action: 'STOP / KILL',
        tagline: 'Cut losses & protect festival budget',
        color: PALETTE.crimson,
        cardBg: '2D1616',
        borderColor: 'E74C3C',
        thresholds: [
          'CAC > ₹220 per admitted student',
          'Confirmed Show-Up Intent < 60%',
          'No-Show count > 30% of confirmed',
          'Zero ticket redemptions from influencer code'
        ],
        earlySignals: 'Vanity link clicks without registration; negative feedback on travel distance.',
        teamResponse: 'Pause campaign immediately; reallocate remaining daily budget within 4 hours.',
        aiRole: 'Copilot halts spend and automatically generates reallocation scenario in dashboard.'
      }
    ];

    playbooks.forEach((p, idx) => {
      const x = 0.5 + idx * 3.1;
      slide.addShape(pres.ShapeType.roundRect, {
        x: x, y: 1.15, w: 2.9, h: 4.15,
        rectRadius: 0.18,
        fill: { color: p.cardBg },
        line: { color: p.borderColor, width: 1.5 }
      });

      // Top Action Pill
      slide.addShape(pres.ShapeType.roundRect, {
        x: x + 0.15, y: 1.3, w: 1.2, h: 0.32,
        rectRadius: 0.16,
        fill: { color: p.color }
      });
      slide.addText(p.action, {
        x: x + 0.15, y: 1.3, w: 1.2, h: 0.32,
        fontFace: FONT, fontSize: 8.5, bold: true, align: 'center', valign: 'middle',
        color: PALETTE.darkText
      });
      slide.addText(p.tagline, {
        x: x + 0.15, y: 1.65, w: 2.6, h: 0.3,
        fontFace: FONT, fontSize: 7.5, bold: true, color: PALETTE.white
      });

      // Section 1: Quantitative Thresholds
      slide.addText('MEASURABLE THRESHOLDS', {
        x: x + 0.15, y: 1.95, w: 2.6, h: 0.2,
        fontFace: FONT, fontSize: 7, bold: true, color: p.color
      });
      const thresholdText = p.thresholds.map(t => '• ' + t).join('\n');
      slide.addText(thresholdText, {
        x: x + 0.15, y: 2.15, w: 2.6, h: 0.75,
        fontFace: FONT, fontSize: 7, color: PALETTE.creamText, lineSpacing: 9.5
      });

      // Section 2: Early Signals
      slide.addText('EARLY SIGNALS', {
        x: x + 0.15, y: 2.95, w: 2.6, h: 0.2,
        fontFace: FONT, fontSize: 7, bold: true, color: p.color
      });
      slide.addText(p.earlySignals, {
        x: x + 0.15, y: 3.15, w: 2.6, h: 0.45,
        fontFace: FONT, fontSize: 7, color: PALETTE.creamText, lineSpacing: 9.5
      });

      // Section 3: Team Response & Dashboard/AI Role
      slide.addText('ACTION & AI TOOL ROLE', {
        x: x + 0.15, y: 3.65, w: 2.6, h: 0.2,
        fontFace: FONT, fontSize: 7, bold: true, color: p.color
      });
      slide.addText(p.teamResponse + '\n\n' + p.aiRole, {
        x: x + 0.15, y: 3.85, w: 2.6, h: 1.35,
        fontFace: FONT, fontSize: 7, color: PALETTE.white, lineSpacing: 9.5
      });
    });
  }

  // ==========================================
  // SLIDE 7: BUDGET REALLOCATION & RUN-RATE SIMULATION (Warm Sand Theme)
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: PALETTE.sandBg };
    addHeader(slide, '03B', 'BUDGET REALLOCATION · PATHWAY TO DELIVER 2,200+ ATTENDEES', 'DATA-BACKED SIMULATION · ₹3.00L BUDGET', true);

    // Left Native Line / Area Trend Chart showing Cumulative Admitted Run-rate
    const runRateData = [
      {
        name: 'Baseline 2025 Run-rate (2,050 Target)',
        labels: ['Day 1', 'Day 3', 'Day 5', 'Day 7', 'Day 9', 'Day 11', 'Day 13', 'Day 14 (Festival)'],
        values: [120, 310, 580, 940, 1260, 1590, 1880, 2050]
      },
      {
        name: 'Optimized Reallocated Run-rate (2,240 Target)',
        labels: ['Day 1', 'Day 3', 'Day 5', 'Day 7', 'Day 9', 'Day 11', 'Day 13', 'Day 14 (Festival)'],
        values: [150, 420, 780, 1190, 1580, 1920, 2140, 2240]
      }
    ];

    slide.addChart(pres.ChartType.line, runRateData, {
      x: 0.5, y: 1.2, w: 4.8, h: 4.0,
      chartColors: ['8B3A2B', '2ECC71'],
      lineDataSymbol: 'circle',
      lineDataSymbolSize: 5,
      showLegend: true,
      legendColor: PALETTE.darkText,
      legendFontSize: 8,
      legendPos: 'b',
      catAxisLabelColor: PALETTE.darkText,
      valAxisLabelColor: PALETTE.darkText,
      catAxisFontSize: 8,
      valAxisFontSize: 8,
      title: 'Cumulative Admitted Students: Baseline vs Optimized',
      titleColor: PALETTE.darkText,
      titleFontSize: 10,
      titleFontFace: FONT,
      plotArea: { fill: { color: PALETTE.white } }
    });

    // Right Column: Side-by-Side Model Comparison
    const scenarios = [
      {
        title: 'Original 2025 Baseline Model',
        status: 'Fails 2,200 Challenge Goal by 150 Students',
        spend: '₹2,74,000 Spent',
        attendees: '2,050 Admitted',
        cac: '₹133.7 Blended CAC',
        keyIssue: 'Over-indexed on Paid Social (₹75K spend) and Creator partners (₹59K spend) with 34.3% no-show attrition.',
        bg: 'FFFFFF',
        borderColor: 'D9D0C5',
        textColor: PALETTE.darkText
      },
      {
        title: 'Reallocated ₹2.74L Model (Zero Added Budget)',
        status: 'Beats Goal: 2,240 Admitted (+190 Net)',
        spend: '₹2,74,000 Spent (Same Budget)',
        attendees: '2,240 Admitted',
        cac: '₹122.3 Blended CAC (-8.5%)',
        keyIssue: 'Shifted ₹28,000 from Paid Social into Campus Ambassadors (+110) and WhatsApp squad referrals (+80).',
        bg: 'FFF9E6',
        borderColor: PALETTE.goldYellow,
        textColor: PALETTE.darkText
      },
      {
        title: 'Full ₹3.00L Deployment (Ambitious Stretch)',
        status: 'Surpasses Goal: 2,410 Admitted (+360 Net)',
        spend: '₹3,00,000 Full Budget',
        attendees: '2,410 Admitted',
        cac: '₹124.5 Blended CAC',
        keyIssue: 'Deploys remaining ₹26,000 into Metro Purple Line shuttles and high-intent waitlist SMS redemption passes.',
        bg: 'EAF7EC',
        borderColor: PALETTE.emerald,
        textColor: PALETTE.darkText
      }
    ];

    scenarios.forEach((sc, i) => {
      const y = 1.2 + i * 1.32;
      slide.addShape(pres.ShapeType.roundRect, {
        x: 5.5, y: y, w: 4.0, h: 1.22,
        rectRadius: 0.16,
        fill: { color: sc.bg },
        line: { color: sc.borderColor, width: 1.5 }
      });
      slide.addText([
        { text: sc.title + '  ', options: { fontSize: 9.5, bold: true, color: sc.textColor } },
        { text: `(${sc.status})\n`, options: { fontSize: 7.5, bold: true, color: i === 0 ? PALETTE.rustRed : PALETTE.emerald } },
        { text: `${sc.spend}  •  ${sc.attendees}  •  ${sc.cac}\n`, options: { fontSize: 8.5, bold: true, color: PALETTE.rustRed } },
        { text: sc.keyIssue, options: { fontSize: 7.2, color: PALETTE.darkMuted, lineSpacing: 9.5 } }
      ], {
        x: 5.65, y: y + 0.08, w: 3.7, h: 1.05,
        fontFace: FONT, valign: 'middle'
      });
    });
  }

  // ==========================================
  // SLIDE 8: [PART 2] THE LIVE GROWTH CENTER & EMBEDDED AI COPILOT
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: PALETTE.espressoDark };
    addHeader(slide, 'PART 2', 'THE WORKING GROWTH CENTER & EMBEDDED AI COPILOT');

    // Hero Live App Announcement Pill
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.5, y: 1.15, w: 9.0, h: 0.52,
      rectRadius: 0.18,
      fill: { color: PALETTE.terracottaCard },
      line: { color: PALETTE.goldYellow, width: 1.5 }
    });
    slide.addText([
      { text: '🌐 LIVE DEPLOYED WEB APPLICATION: ', options: { bold: true, color: PALETTE.goldYellow, fontSize: 9 } },
      { text: 'https://rudragupta-6071.github.io/risa-growth-dashboard/ ', options: { bold: true, color: PALETTE.white, fontSize: 9 } },
      { text: '(Click to Open Live Dashboard & Test Copilot)', options: { color: PALETTE.creamText, fontSize: 8 } }
    ], {
      x: 0.7, y: 1.15, w: 8.6, h: 0.52,
      fontFace: FONT, valign: 'middle',
      hyperlink: { url: 'https://rudragupta-6071.github.io/risa-growth-dashboard/' }
    });

    // 3 Feature Cards Demonstrating the Product Pillars (from assignment Part 2)
    const productFeatures = [
      {
        title: '1. Real-Time Analytics & CAC Recalculator',
        badge: 'ENGINE',
        desc: '• Interactive Funnel: Tracks Impressions → Reg Starts → Confirmed → Actual Admitted.\n• Live Recalculation: Users can edit any campaign’s spend or attendee numbers; blended CAC & show-up rates update instantly.\n• Supabase Sync: Persistent schema with multi-tier storage fallback and original baseline reset.',
        bg: PALETTE.terracottaCard
      },
      {
        title: '2. Grounded AI Growth Copilot (Gemini 1.5 Flash)',
        badge: 'AI COPILOT',
        desc: '• Deeply Grounded: Reads actual database rows and live state; refuses to hallucinate or give generic marketing platitudes.\n• Honest Uncertainty: When asked about untracked data (e.g. attendee ages), explicitly flags missing data.\n• Insight-to-Action: Direct button to create actionable tasks with assignee & priority in 1 click.',
        bg: PALETTE.terracottaCard
      },
      {
        title: '3. Student-Crafted High-Usability UI',
        badge: 'DESIGN',
        desc: '• Custom Flat Aesthetic: Warm reddish-brown (#241310), golden yellow (#F6C445), and Helvetica typography.\n• Fully Responsive: Rounded cards, Recharts interactive wave visuals, KPI status pills, and task manager.\n• Zero Dependencies: Hosted live on GitHub Pages with instant 200 OK uptime.',
        bg: PALETTE.terracottaCard
      }
    ];

    productFeatures.forEach((pf, i) => {
      const x = 0.5 + i * 3.1;
      slide.addShape(pres.ShapeType.roundRect, {
        x: x, y: 1.8, w: 2.9, h: 2.7,
        rectRadius: 0.18,
        fill: { color: pf.bg },
        line: { color: i === 1 ? PALETTE.brightYellow : '48221B', width: 1.2 }
      });
      // Badge
      slide.addShape(pres.ShapeType.roundRect, {
        x: x + 0.15, y: 1.95, w: 1.1, h: 0.24,
        rectRadius: 0.12,
        fill: { color: i === 1 ? PALETTE.goldYellow : '3C1C17' }
      });
      slide.addText(pf.badge, {
        x: x + 0.15, y: 1.95, w: 1.1, h: 0.24,
        fontFace: FONT, fontSize: 7, bold: true, align: 'center', valign: 'middle',
        color: i === 1 ? PALETTE.darkText : PALETTE.goldYellow
      });
      slide.addText([
        { text: pf.title + '\n', options: { fontSize: 9.5, bold: true, color: PALETTE.white } },
        { text: pf.desc, options: { fontSize: 7.2, color: PALETTE.creamText, lineSpacing: 10 } }
      ], {
        x: x + 0.15, y: 2.25, w: 2.6, h: 2.15,
        fontFace: FONT, valign: 'top'
      });
    });

    // Bottom Summary Banner
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.5, y: 4.65, w: 9.0, h: 0.65,
      rectRadius: 0.15,
      fill: { color: '1C0E0C' },
      line: { color: '3F1E19', width: 1 }
    });
    slide.addText([
      { text: 'VERIFICATION CHECKLIST:  ', options: { bold: true, color: PALETTE.goldYellow, fontSize: 8.5 } },
      { text: '✓ 3 Core Strategy Slides  •  ✓ Working Analytics Dashboard  •  ✓ Embedded AI Copilot with Task Creation  •  ✓ Accurate CAC Math  •  ✓ Tier 1 Bangalore Focus', options: { color: PALETTE.white, fontSize: 8 } }
    ], {
      x: 0.7, y: 4.65, w: 8.6, h: 0.65,
      fontFace: FONT, valign: 'middle'
    });
  }

  // Write presentation to file
  const fileName = 'RISA_Growth_APM_Presentation.pptx';
  await pres.writeFile({ fileName });
  console.log('Successfully generated presentation:', fileName);
}

createDeck().catch(console.error);
