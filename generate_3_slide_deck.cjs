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
    goldYellow: 'F6C445',
    brightYellow: 'FFD15C',
    amber: 'D97736',
    rustRed: '8B3A2B',
    crimson: 'E74C3C',
    emerald: '2ECC71',
    white: 'FFFFFF',
    creamText: 'EBDDD0',
    mutedGray: '9B8E85',
    darkText: '1C0E0C'
  };
  const FONT = 'Helvetica';

  function addHeader(slide, num, title, subtitle = "CHALLENGE A: ATTENDEE GROWTH · TIER 1 BANGALORE") {
    slide.addShape(pres.ShapeType.ellipse, {
      x: 0.5, y: 0.35, w: 0.55, h: 0.55,
      fill: { color: PALETTE.goldYellow },
      line: { color: PALETTE.white, width: 1.5 }
    });
    slide.addText('RG', {
      x: 0.5, y: 0.35, w: 0.55, h: 0.55,
      fontFace: FONT, fontSize: 13, bold: true, align: 'center', valign: 'middle',
      color: PALETTE.darkText
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: 1.2, y: 0.36, w: 5.2, h: 0.28,
      rectRadius: 0.14,
      fill: { color: '2C1714' },
      line: { color: '3D221D', width: 1 }
    });
    slide.addText(subtitle, {
      x: 1.3, y: 0.36, w: 5.0, h: 0.28,
      fontFace: FONT, fontSize: 8.5, bold: true, valign: 'middle',
      color: PALETTE.goldYellow
    });
    slide.addText([
      { text: num + '  ', options: { color: PALETTE.goldYellow, bold: true } },
      { text: title, options: { color: PALETTE.white, bold: true } }
    ], {
      x: 1.2, y: 0.65, w: 7.0, h: 0.45,
      fontFace: FONT, fontSize: 15, valign: 'top'
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: 8.0, y: 0.38, w: 1.5, h: 0.36,
      rectRadius: 0.18,
      fill: { color: PALETTE.goldYellow }
    });
    slide.addText('RUDRA GUPTA', {
      x: 8.0, y: 0.38, w: 1.5, h: 0.36,
      fontFace: FONT, fontSize: 8.5, bold: true, align: 'center', valign: 'middle',
      color: PALETTE.darkText
    });
  }

  // ==========================================
  // SLIDE 1: HOW HIGH CAN YOU AIM? (Includes Rudra Gupta on first slide)
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: PALETTE.terracottaBg };
    addHeader(slide, 'SLIDE 1', 'HOW HIGH CAN YOU AIM? · TARGET AMBITION & CONVERSION FUNNEL');

    // 3 Hero KPI cards
    const targets = [
      { tag: 'REALISTIC BASE', val: '2,050', cac: '₹133.7 CAC', show: '66.8% Show-up', bg: PALETTE.terracottaCard, hero: false },
      { tag: 'REVISED TARGET (CHALLENGE GOAL)', val: '2,200', cac: '₹124.5 CAC', show: '76.5% Show-up', bg: PALETTE.goldYellow, hero: true },
      { tag: 'AMBITIOUS STRETCH', val: '2,500', cac: '₹109.6 CAC', show: '83.3% Show-up', bg: PALETTE.terracottaCard, hero: false }
    ];
    targets.forEach((t, i) => {
      const x = 0.5 + i * 3.1;
      slide.addShape(pres.ShapeType.roundRect, {
        x: x, y: 1.15, w: 2.9, h: 1.1,
        rectRadius: 0.18, fill: { color: t.bg },
        line: { color: t.hero ? PALETTE.brightYellow : '48221B', width: 1.5 }
      });
      slide.addText([
        { text: t.tag + '\n', options: { fontSize: 7.5, bold: true, color: t.hero ? PALETTE.darkText : PALETTE.goldYellow } },
        { text: t.val + ' ', options: { fontSize: 20, bold: true, color: t.hero ? PALETTE.darkText : PALETTE.white } },
        { text: 'Attendees\n', options: { fontSize: 10, color: t.hero ? '44221A' : PALETTE.creamText } },
        { text: `${t.cac}  •  ${t.show}`, options: { fontSize: 8.5, bold: true, color: t.hero ? PALETTE.darkText : PALETTE.creamText } }
      ], { x: x + 0.15, y: 1.2, w: 2.6, h: 1.0, fontFace: FONT, valign: 'middle' });
    });

    // Funnel Chart
    slide.addChart(pres.ChartType.bar, [
      { name: 'Funnel Stage Volume', labels: ['1. Reach', '2. Reg Starts', '3. Confirmed', '4. Actual Admitted', '5. Stretch Target'], values: [45000, 3850, 3120, 2050, 2500] }
    ], {
      x: 0.5, y: 2.35, w: 4.8, h: 2.95,
      barDir: 'col', chartColors: [PALETTE.goldYellow],
      showValue: true, valueColor: PALETTE.white, valAxisLabelColor: PALETTE.creamText, catAxisLabelColor: PALETTE.goldYellow,
      catAxisFontSize: 8.5, valAxisFontSize: 8, showLegend: false,
      title: 'Attendee Conversion Funnel (Students)', titleColor: PALETTE.white, titleFontSize: 10, titleFontFace: FONT,
      plotArea: { fill: { color: PALETTE.espressoDark } }
    });

    // Supporting quantitative breakdown cards
    const cards = [
      { title: 'Audience & City Justification (Bangalore Tier 1)', badge: 'TAM: 5.38L', desc: '• 5.38 Lakh students across 1,148 colleges. Prioritizing 25 core hubs (PES, Christ, BMS, RVCE, Mount Carmel) within 8km of Metro Purple/Green lines.\n• Bangalore offers the highest student club density & discretionary spend in South India.' },
      { title: 'Funnel Conversion Math & Capacity', badge: 'LEAK: 34.3%', desc: '• Reach-to-Reg: 8.5% | Reg-to-Confirmed: 81.0% | Show-up: 65.7% (Baseline).\n• Capacity Constraint: 2,500 simultaneous venue ceiling managed via two waves (10am–2pm and 3pm–9pm) to comfortably absorb 2,200 admitted.' },
      { title: 'Quantitative Target Model & Budget Math', badge: 'BUDGET: ₹3.0L', desc: '• Total Budget: ₹3,00,000 (Current spend ₹2,74,000; Blended CAC ₹133.7).\n• To reach 2,200 (+150 net gain), we cut underperforming channels and reallocate ₹28,000 into Campus Ambassadors & Referrals (Blended CAC drops to ₹124.5).' }
    ];
    cards.forEach((c, idx) => {
      const y = 2.35 + idx * 0.98;
      slide.addShape(pres.ShapeType.roundRect, {
        x: 5.5, y: y, w: 4.0, h: 0.92,
        rectRadius: 0.15, fill: { color: PALETTE.terracottaCard }, line: { color: '48221B', width: 1 }
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: 8.4, y: y + 0.1, w: 1.0, h: 0.22,
        rectRadius: 0.11, fill: { color: PALETTE.goldYellow }
      });
      slide.addText(c.badge, {
        x: 8.4, y: y + 0.1, w: 1.0, h: 0.22,
        fontFace: FONT, fontSize: 6.5, bold: true, align: 'center', valign: 'middle', color: PALETTE.darkText
      });
      slide.addText([
        { text: c.title + '\n', options: { fontSize: 9.5, bold: true, color: PALETTE.white } },
        { text: c.desc, options: { fontSize: 7.2, color: PALETTE.creamText, lineSpacing: 9.5 } }
      ], { x: 5.65, y: y + 0.08, w: 2.7, h: 0.78, fontFace: FONT, valign: 'middle' });
    });
  }

  // ==========================================
  // SLIDE 2: WHERE WILL YOU PLACE YOUR BETS?
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: PALETTE.espressoDark };
    addHeader(slide, 'SLIDE 2', 'WHERE WILL YOU PLACE YOUR BETS? · 5 STRATEGIC BETS & TRADEOFFS');

    const bets = [
      { rank: '#1', name: 'Campus Ambassador Network (35 Reps across 25 Hubs)', ice: 'ICE: 9.2 (I:9, C:9, E:9)', impact: '+420 Admitted · ₹45K Spend · ₹108 CAC', desc: 'Student leads with tiered incentives (VIP passes, artist meet & greets). 15-student minimum quota with WhatsApp tracking links.', action: 'DOUBLE DOWN', actCol: PALETTE.emerald },
      { rank: '#2', name: 'College Cultural Club Co-Hosting & Societies', ice: 'ICE: 8.8 (I:9, C:8, E:9)', impact: '+385 Admitted · ₹31K Spend · ₹81 CAC', desc: 'Host intra-college dance/music semi-finals at RISA. Clubs guarantee bulk student contingents (91.7% historical show-up rate).', action: 'DOUBLE DOWN', actCol: PALETTE.emerald },
      { rank: '#3', name: 'WhatsApp Peer Referral & Squad Pass Engine', ice: 'ICE: 8.4 (I:8, C:9, E:8)', impact: '+310 Admitted · ₹21.5K Spend · ₹69 CAC', desc: 'Squad Pass (Buy 3 Get 1) triggered via automated WhatsApp bot. Virality coefficient k=1.24 drives lowest CAC of all paid channels.', action: 'EXPAND', actCol: PALETTE.goldYellow },
      { rank: '#4', name: 'High-Intent Waitlist & SMS Drop-Off Recovery', ice: 'ICE: 7.6 (I:7, C:8, E:8)', impact: '+210 Admitted · ₹15K Spend · ₹71 CAC', desc: '730 students started registration but dropped off. Automated WhatsApp dynamic QR countdown passes recover 28% of dropouts.', action: 'SCALE UP', actCol: PALETTE.brightYellow },
      { rank: '#5', name: 'Metro Fast-Track QR Admission & Shuttles', ice: 'ICE: 7.1 (I:7, C:7, E:7)', impact: '+150 Admitted · ₹12.5K Spend · ₹83 CAC', desc: '6 parallel scanner lanes + free shuttles from nearest Purple Line metro station eliminate gate bottleneck and convert hesitant confirmers.', action: 'OPTIMIZE', actCol: PALETTE.amber }
    ];

    bets.forEach((b, i) => {
      const y = 1.15 + i * 0.73;
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.5, y: y, w: 9.0, h: 0.67,
        rectRadius: 0.14, fill: { color: PALETTE.terracottaCard }, line: { color: i === 0 ? PALETTE.brightYellow : '48221B', width: 1.2 }
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.65, y: y + 0.1, w: 0.42, h: 0.47,
        rectRadius: 0.1, fill: { color: i < 2 ? PALETTE.goldYellow : '381914' }
      });
      slide.addText(b.rank, {
        x: 0.65, y: y + 0.1, w: 0.42, h: 0.47,
        fontFace: FONT, fontSize: 10, bold: true, align: 'center', valign: 'middle', color: i < 2 ? PALETTE.darkText : PALETTE.white
      });
      slide.addText([
        { text: b.name + '  ', options: { fontSize: 9, bold: true, color: PALETTE.white } },
        { text: b.ice + '\n', options: { fontSize: 7.5, bold: true, color: PALETTE.goldYellow } },
        { text: b.desc, options: { fontSize: 7, color: PALETTE.creamText } }
      ], { x: 1.15, y: y + 0.05, w: 5.3, h: 0.57, fontFace: FONT, valign: 'middle' });
      slide.addText([
        { text: b.impact, options: { fontSize: 8, bold: true, color: PALETTE.white } }
      ], { x: 6.5, y: y + 0.05, w: 1.6, h: 0.57, fontFace: FONT, valign: 'middle', align: 'right' });
      slide.addShape(pres.ShapeType.roundRect, {
        x: 8.2, y: y + 0.18, w: 1.15, h: 0.3,
        rectRadius: 0.15, fill: { color: b.actCol }
      });
      slide.addText(b.action, {
        x: 8.2, y: y + 0.18, w: 1.15, h: 0.3,
        fontFace: FONT, fontSize: 7, bold: true, align: 'center', valign: 'middle', color: PALETTE.darkText
      });
    });

    // Bottom Explicit Tradeoffs Box (What to Stop)
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.5, y: 4.88, w: 9.0, h: 0.55,
      rectRadius: 0.12, fill: { color: '381313' }, line: { color: PALETTE.crimson, width: 1.2 }
    });
    slide.addText([
      { text: 'WHAT WE ARE DEPRIORITIZING & AVOIDING (THE KILL LIST):  ', options: { bold: true, color: PALETTE.crimson, fontSize: 8 } },
      { text: '• Stop/Cut Paid Social by 30% (CAC is ₹274, 4x referrals; 240 no-shows). • Freeze Creator Partnerships (CAC ₹337, ₹59K spent for only 175 attendees). Reallocating ₹28K into Ambassadors & WhatsApp referrals captures +190 incremental attendees at 1/3 the unit cost.', options: { color: PALETTE.white, fontSize: 7.5 } }
    ], { x: 0.65, y: 4.88, w: 8.7, h: 0.55, fontFace: FONT, valign: 'middle' });
  }

  // ==========================================
  // SLIDE 3: HOW WILL YOU KNOW WHAT'S WORKING?
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: PALETTE.terracottaBg };
    addHeader(slide, 'SLIDE 3', 'HOW WILL YOU KNOW WHAT’S WORKING? · DECISION PLAYBOOK & AI COPILOT');

    const playbooks = [
      {
        action: 'SCALE (DOUBLE DOWN)', tagline: 'High-yield channels', color: PALETTE.emerald, cardBg: '1A261A', borderColor: '2ECC71',
        thresholds: ['CAC < ₹120 per admitted student', 'Confirmed Show-Up Intent > 80%', 'WhatsApp opt-in verification > 75%', 'Rep quota completion > 70% in 48h'],
        signals: 'Clubs confirming bus groups; high squad-pass forward rate (k > 1.2).',
        teamResponse: 'Unlock +₹15,000 bonus ambassador pool; supply extra college banner kits.',
        aiRole: 'Growth Copilot auto-proposes budget scaleup ticket for 1-click team approval.'
      },
      {
        action: 'CHANGE (PIVOT)', tagline: 'Message & funnel optimization', color: PALETTE.goldYellow, cardBg: '2D2412', borderColor: 'F6C445',
        thresholds: ['CAC between ₹125 – ₹190', 'Show-Up Intent between 65% – 75%', 'High reg-starts but checkout drop > 25%', 'Meta ad frequency > 3.8 with flat CTR'],
        signals: 'Students signing up but not sharing phone for QR pass; artist lineup curiosity.',
        teamResponse: 'Pivot ad copy to Artist Lineup & Group discounts; switch to 1-click WhatsApp RSVP.',
        aiRole: 'Copilot flags underperforming creatives and suggests high-converting SMS reminders.'
      },
      {
        action: 'STOP (KILL)', tagline: 'Cut losses & protect budget', color: PALETTE.crimson, cardBg: '2D1616', borderColor: 'E74C3C',
        thresholds: ['CAC > ₹220 per admitted student', 'Confirmed Show-Up Intent < 60%', 'No-Show count > 30% of confirmed', 'Zero ticket redemptions from influencer code'],
        signals: 'Vanity link clicks without registration; negative feedback on travel distance.',
        teamResponse: 'Pause campaign immediately; reallocate remaining daily budget within 4 hours.',
        aiRole: 'Copilot halts spend and automatically generates reallocation scenario in dashboard.'
      }
    ];

    playbooks.forEach((p, idx) => {
      const x = 0.5 + idx * 3.1;
      slide.addShape(pres.ShapeType.roundRect, {
        x: x, y: 1.15, w: 2.9, h: 3.45,
        rectRadius: 0.18, fill: { color: p.cardBg }, line: { color: p.borderColor, width: 1.5 }
      });
      slide.addShape(pres.ShapeType.roundRect, {
        x: x + 0.15, y: 1.28, w: 1.9, h: 0.3,
        rectRadius: 0.15, fill: { color: p.color }
      });
      slide.addText(p.action, {
        x: x + 0.15, y: 1.28, w: 1.9, h: 0.3,
        fontFace: FONT, fontSize: 8, bold: true, align: 'center', valign: 'middle', color: PALETTE.darkText
      });
      slide.addText('MEASURABLE THRESHOLDS', {
        x: x + 0.15, y: 1.68, w: 2.6, h: 0.18,
        fontFace: FONT, fontSize: 7, bold: true, color: p.color
      });
      slide.addText(p.thresholds.map(t => '• ' + t).join('\n'), {
        x: x + 0.15, y: 1.86, w: 2.6, h: 0.72,
        fontFace: FONT, fontSize: 6.8, color: PALETTE.creamText, lineSpacing: 9
      });
      slide.addText('EARLY SIGNALS & RISKS', {
        x: x + 0.15, y: 2.62, w: 2.6, h: 0.18,
        fontFace: FONT, fontSize: 7, bold: true, color: p.color
      });
      slide.addText(p.signals, {
        x: x + 0.15, y: 2.80, w: 2.6, h: 0.42,
        fontFace: FONT, fontSize: 6.8, color: PALETTE.creamText, lineSpacing: 9
      });
      slide.addText('ACTION & AI COPILOT INTERVENTION', {
        x: x + 0.15, y: 3.26, w: 2.6, h: 0.18,
        fontFace: FONT, fontSize: 7, bold: true, color: p.color
      });
      slide.addText(p.teamResponse + '\n' + p.aiRole, {
        x: x + 0.15, y: 3.44, w: 2.6, h: 1.1,
        fontFace: FONT, fontSize: 6.8, color: PALETTE.white, lineSpacing: 9
      });
    });

    // Live Product & Copilot Link Bar at bottom of Slide 3
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.5, y: 4.75, w: 9.0, h: 0.68,
      rectRadius: 0.14, fill: { color: PALETTE.espressoDark }, line: { color: PALETTE.goldYellow, width: 1.2 }
    });
    slide.addText([
      { text: 'COMMAND CENTER & AI COPILOT WORKFLOW:  ', options: { bold: true, color: PALETTE.goldYellow, fontSize: 8.5 } },
      { text: 'https://rudragupta-6071.github.io/risa-growth-dashboard/\n', options: { bold: true, color: PALETTE.white, fontSize: 8.5 } },
      { text: 'Live analytics recalculate CAC and show-up rates upon spend changes. The embedded Gemini Copilot diagnoses bottlenecks and converts recommendations into confirmed tasks in 1 click.', options: { color: PALETTE.creamText, fontSize: 7.5 } }
    ], {
      x: 0.65, y: 4.75, w: 8.7, h: 0.68,
      fontFace: FONT, valign: 'middle',
      hyperlink: { url: 'https://rudragupta-6071.github.io/risa-growth-dashboard/' }
    });
  }

  await pres.writeFile({ fileName: 'RISA_3_Slide_Strategy_Deck.pptx' });
  console.log('Successfully generated: RISA_3_Slide_Strategy_Deck.pptx');
}

buildThreeSlideDeck().catch(console.error);
