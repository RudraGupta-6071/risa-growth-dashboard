const pptxgen = require('pptxgenjs');

async function buildThreeSlideDeck() {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9'; // 10.0 x 5.625 inches
  pres.author = 'Rudra Gupta';
  pres.company = 'RISA Labs';
  pres.title = 'RISA Festival 2025 — Growth Strategy (Rudra Gupta)';

  const C = {
    espresso: '160B0A',
    espressoCard: '231210',
    terracotta: '241310',
    terracottaCard: '301915',
    sand: 'F6F1EB',
    white: 'FFFFFF',
    sandBorder: 'E2D8CC',
    gold: 'F6C445',
    goldSoft: 'FFF6DB',
    rust: '8B3A2B',
    crimson: 'E04F44',
    emerald: '2ECC71',
    cream: 'E6D8CC',
    mutedLight: 'A8968C',
    darkText: '1C0E0C',
    darkMuted: '5C4B43'
  };
  const FONT = 'Helvetica';

  function addActionHeader(slide, eyebrow, actionTitle, isLight = false) {
    slide.addText(eyebrow.toUpperCase(), {
      x: 0.55, y: 0.28, w: 8.9, h: 0.22,
      fontFace: FONT, fontSize: 8.5, bold: true,
      color: isLight ? C.rust : C.gold
    });
    slide.addText(actionTitle, {
      x: 0.55, y: 0.50, w: 8.9, h: 0.42,
      fontFace: FONT, fontSize: 13.5, bold: true,
      color: isLight ? C.darkText : C.white,
      valign: 'top'
    });
    // Subtle divider line under header
    slide.addShape(pres.ShapeType.line, {
      x: 0.55, y: 0.96, w: 8.9, h: 0,
      line: { color: isLight ? C.sandBorder : '3A201B', width: 1 }
    });
  }

  function addFooter(slide, pageNum, isLight = false) {
    slide.addText('Rudra Gupta', {
      x: 0.55, y: 5.26, w: 3.0, h: 0.25,
      fontFace: FONT, fontSize: 8, bold: true,
      color: isLight ? C.darkMuted : C.mutedLight
    });
    slide.addText('RISA Festival 2025 Attendee Growth Strategy', {
      x: 3.2, y: 5.26, w: 4.0, h: 0.25,
      fontFace: FONT, fontSize: 8, align: 'center',
      color: isLight ? C.darkMuted : C.mutedLight
    });
    slide.addText(`${pageNum} / 3`, {
      x: 8.45, y: 5.26, w: 1.0, h: 0.25,
      fontFace: FONT, fontSize: 8, bold: true, align: 'right',
      color: isLight ? C.darkMuted : C.mutedLight
    });
  }

  // ============================================================================
  // SLIDE 1 — HOW HIGH CAN YOU AIM? (Deep Espresso Theme)
  // ============================================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.espresso };
    addActionHeader(
      slide,
      'Slide 1  How High Can You Aim',
      'We can grow attendance from 2,050 to 2,200 within our ₹3L budget, with a 2,500 stretch'
    );

    // LEFT COLUMN: HERO TARGET & SCENARIOS (Prominent Numbers)
    // Primary Goal Card (Inverted Gold)
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.55, y: 1.15, w: 4.15, h: 1.55,
      rectRadius: 0.16, fill: { color: C.gold }
    });
    slide.addText('REVISED CHALLENGE TARGET', {
      x: 0.78, y: 1.28, w: 3.7, h: 0.22,
      fontFace: FONT, fontSize: 8.5, bold: true, color: C.darkText
    });
    slide.addText('2,200', {
      x: 0.75, y: 1.48, w: 2.1, h: 0.75,
      fontFace: FONT, fontSize: 40, bold: true, color: C.darkText, valign: 'middle'
    });
    slide.addText('Admitted Attendees\n₹124.5 CAC (₹2.74L ÷ 2,200)\n76.5%+ Paid Show-Up', {
      x: 2.75, y: 1.52, w: 1.8, h: 0.75,
      fontFace: FONT, fontSize: 8.5, bold: true, color: C.darkText, valign: 'middle', lineSpacing: 13
    });
    slide.addText('Achieved within existing ₹2.74L spend via ₹28K reallocation (₹0 extra budget)', {
      x: 0.78, y: 2.34, w: 3.75, h: 0.28,
      fontFace: FONT, fontSize: 7.5, color: '3D231D'
    });

    // Two Sub-Scenario Cards (Base & Stretch)
    const subTargets = [
      { label: 'REALISTIC BASE', num: '2,050', detail: '₹134 CAC\n76.2% Paid Show-Up\n₹2.74L Spend' },
      { label: 'STRETCH CEILING', num: '2,500', detail: '₹120 CAC\n83.3% Show-Up\n₹3.00L Budget' }
    ];
    subTargets.forEach((st, idx) => {
      const x = 0.55 + idx * 2.14;
      slide.addShape(pres.ShapeType.roundRect, {
        x: x, y: 2.84, w: 2.01, h: 1.22,
        rectRadius: 0.14, fill: { color: C.espressoCard }, line: { color: '3B201B', width: 1 }
      });
      slide.addText(st.label, {
        x: x + 0.15, y: 2.94, w: 1.7, h: 0.2,
        fontFace: FONT, fontSize: 7.5, bold: true, color: C.gold
      });
      slide.addText(st.num, {
        x: x + 0.15, y: 3.14, w: 1.7, h: 0.42,
        fontFace: FONT, fontSize: 22, bold: true, color: C.white
      });
      slide.addText(st.detail, {
        x: x + 0.15, y: 3.55, w: 1.7, h: 0.46,
        fontFace: FONT, fontSize: 7.5, color: C.cream, lineSpacing: 10
      });
    });

    // Bangalore Market Justification Card
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.55, y: 4.2, w: 4.15, h: 0.92,
      rectRadius: 0.14, fill: { color: C.espressoCard }, line: { color: '3B201B', width: 1 }
    });
    slide.addText('WHY BANGALORE', {
      x: 0.72, y: 4.28, w: 3.8, h: 0.2,
      fontFace: FONT, fontSize: 8, bold: true, color: C.gold
    });
    slide.addText('5.38L students (2018–19 C&W) across 1,148 colleges (AISHE 2023–24).\nNamma Metro Purple & Green lines connect priority campuses via Majestic.', {
      x: 0.72, y: 4.48, w: 3.85, h: 0.56,
      fontFace: FONT, fontSize: 8, color: C.cream, lineSpacing: 12
    });

    // RIGHT COLUMN: RELEVANT FUNNEL CHART + BOTTLENECK INSIGHT
    slide.addShape(pres.ShapeType.roundRect, {
      x: 4.92, y: 1.15, w: 4.53, h: 2.91,
      rectRadius: 0.16, fill: { color: C.espressoCard }, line: { color: '3B201B', width: 1 }
    });
    slide.addChart(pres.ChartType.bar, [
      {
        name: 'Students',
        labels: ['Reg Starts', 'Registrations', 'Confirmed', 'Admitted', 'Goal'],
        values: [3630, 2626, 2525, 2050, 2200]
      }
    ], {
      x: 5.05, y: 1.25, w: 4.28, h: 2.7,
      barDir: 'col',
      chartColors: [C.gold],
      showValue: true,
      valueColor: C.white,
      dataLabelFontSize: 8.5,
      valAxisLabelColor: C.mutedLight,
      catAxisLabelColor: C.cream,
      catAxisFontSize: 8.5,
      valAxisFontSize: 7.5,
      showLegend: false,
      title: '2025 Funnel Volume (Students)',
      titleColor: C.white,
      titleFontSize: 10,
      titleFontFace: FONT,
      plotArea: { fill: { color: C.espresso } }
    });

    // Bottleneck & Capacity Callout
    slide.addShape(pres.ShapeType.roundRect, {
      x: 4.92, y: 4.2, w: 4.53, h: 0.92,
      rectRadius: 0.14, fill: { color: '2B1412' }, line: { color: C.gold, width: 1 }
    });
    slide.addText('23.8% PAID REG-TO-ADMISSION GAP & CAPACITY ASSUMPTION', {
      x: 5.08, y: 4.28, w: 4.2, h: 0.2,
      fontFace: FONT, fontSize: 7.5, bold: true, color: C.gold
    });
    slide.addText('600 confirmed sign-ups never checked in (2,525 confirmed vs 1,925 paid admitted). 2,500 is the total admission cap; two waves (1,100 + 1,400) keep simultaneous occupancy below cap.', {
      x: 5.08, y: 4.48, w: 4.22, h: 0.56,
      fontFace: FONT, fontSize: 7.5, color: C.white, lineSpacing: 11
    });

    addFooter(slide, 1);
  }

  // ============================================================================
  // SLIDE 2 — WHERE WILL YOU PLACE YOUR BETS? (Warm Sand Light Theme)
  // ============================================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.sand };
    addActionHeader(
      slide,
      'Slide 2  Where Will You Place Your Bets',
      'Double down on campus & referral loops (₹69–₹108 CAC) and cut high-leak digital ads',
      true
    );

    // LEFT COLUMN: 5 RANKED STRATEGIC BETS (Prominent Contribution & Crisp Rationale)
    const bets = [
      {
        rank: '1', title: 'Campus Ambassadors', gain: '+420', meta: '₹45K  |  ₹108 CAC',
        rationale: '35 reps across 25 hubs with 15-attendee quotas. Pilot 10 campuses W1; track 48h velocity.'
      },
      {
        rank: '2', title: 'College Club Co-Hosting', gain: '+385', meta: '₹31K  |  ₹81 CAC',
        rationale: 'Host semi-finals at RISA for bulk contingents (91.7% show-up). Pilot 10 clubs >200 members.'
      },
      {
        rank: '3', title: 'WhatsApp Squad Pass', gain: '+310', meta: '₹21.5K  |  ₹69 CAC',
        rationale: 'Buy-3-Get-1 referral bot (k=1.24). A/B test group vs single pass; track viral k-factor.'
      },
      {
        rank: '4', title: 'Waitlist SMS Recovery', gain: '+210', meta: '₹15K  |  ₹71 CAC',
        rationale: 'Countdown QR nudges to 730 dropouts in final 72h. 50/50 holdout; target 25% recovery.'
      },
      {
        rank: '5', title: 'Metro QR Gate & Shuttles (Ops Conversion)', gain: '+150', meta: '₹12.5K  |  ₹83/recov',
        rationale: 'Operational gate fix (not new regs): 6 QR lanes + Purple Line shuttles recover hesitant confirmers.'
      }
    ];

    slide.addText('5 RANKED BETS (PLANNING ASSUMPTION: +1,475 GROSS − 1,025 OVERLAP/CAP = +450 NET)', {
      x: 0.55, y: 1.08, w: 5.6, h: 0.2,
      fontFace: FONT, fontSize: 6.8, bold: true, color: C.rust
    });

    bets.forEach((b, i) => {
      const y = 1.32 + i * 0.76;
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.55, y: y, w: 5.55, h: 0.68,
        rectRadius: 0.12, fill: { color: C.white },
        line: { color: i < 2 ? C.rust : C.sandBorder, width: i < 2 ? 1.5 : 1 }
      });

      // Rank circle
      slide.addShape(pres.ShapeType.ellipse, {
        x: 0.68, y: y + 0.16, w: 0.36, h: 0.36,
        fill: { color: i < 2 ? C.terracotta : 'EAE1D7' }
      });
      slide.addText(b.rank, {
        x: 0.68, y: y + 0.16, w: 0.36, h: 0.36,
        fontFace: FONT, fontSize: 10, bold: true, align: 'center', valign: 'middle',
        color: i < 2 ? C.gold : C.darkText
      });

      // Strategy Title & Rationale
      slide.addText([
        { text: b.title + '\n', options: { fontSize: 9.5, bold: true, color: C.darkText } },
        { text: b.rationale, options: { fontSize: 7.2, color: C.darkMuted } }
      ], {
        x: 1.14, y: y + 0.05, w: 3.75, h: 0.58,
        fontFace: FONT, valign: 'middle', lineSpacing: 10
      });

      // Prominent Incremental Gain on Right
      slide.addText([
        { text: b.gain + '\n', options: { fontSize: 15, bold: true, color: C.rust } },
        { text: b.meta.replace('  |  ', '\n'), options: { fontSize: 6.8, bold: true, color: C.darkMuted } }
      ], {
        x: 4.92, y: y + 0.04, w: 1.08, h: 0.60,
        fontFace: FONT, align: 'right', valign: 'middle', lineSpacing: 9
      });
    });

    // RIGHT COLUMN: CAC COMPARISON CHART + EXPLICIT KILL LIST
    slide.addShape(pres.ShapeType.roundRect, {
      x: 6.3, y: 1.08, w: 3.15, h: 2.35,
      rectRadius: 0.14, fill: { color: C.white }, line: { color: C.sandBorder, width: 1 }
    });
    slide.addChart(pres.ChartType.bar, [
      {
        name: 'CAC (₹)',
        labels: ['Referrals', 'Clubs', 'Ambass.', 'Paid Soc.', 'Creators'],
        values: [69, 81, 108, 274, 337]
      }
    ], {
      x: 6.36, y: 1.15, w: 3.03, h: 2.22,
      barDir: 'bar',
      chartColors: [C.emerald, C.emerald, C.gold, C.crimson, C.crimson],
      showValue: true,
      valueColor: C.darkText,
      dataLabelFontSize: 8,
      catAxisLabelColor: C.darkText,
      valAxisLabelColor: C.darkMuted,
      catAxisFontSize: 7.5,
      valAxisFontSize: 7,
      showLegend: false,
      title: 'Channel CAC (₹ per Attendee)',
      titleColor: C.darkText,
      titleFontSize: 9,
      titleFontFace: FONT,
      plotArea: { fill: { color: C.sand } }
    });

    // Explicit Kill List & Reallocation Card
    slide.addShape(pres.ShapeType.roundRect, {
      x: 6.3, y: 3.55, w: 3.15, h: 1.57,
      rectRadius: 0.14, fill: { color: C.terracotta }, line: { color: C.crimson, width: 1.5 }
    });
    slide.addText('WHAT WE STOP & WHY', {
      x: 6.46, y: 3.65, w: 2.8, h: 0.2,
      fontFace: FONT, fontSize: 8.5, bold: true, color: C.gold
    });
    slide.addText([
      { text: 'Cut Paid Social 30% (-₹28K)\n', options: { fontSize: 8.5, bold: true, color: C.white } },
      { text: '₹274 CAC, 240 no-shows (−102 attendees).\n', options: { fontSize: 7.2, color: C.cream } },
      { text: 'Freeze Creator Partners (₹59K)\n', options: { fontSize: 8.5, bold: true, color: C.white } },
      { text: '₹337 CAC (175 attendees).\n', options: { fontSize: 7.2, color: C.cream } },
      { text: 'Math: ₹28K ÷ ₹96 avg CAC = +292 − 102 = +190 net (part of +450).', options: { fontSize: 7.2, bold: true, color: C.emerald } }
    ], {
      x: 6.46, y: 3.86, w: 2.85, h: 1.22,
      fontFace: FONT, valign: 'top', lineSpacing: 10.5
    });

    addFooter(slide, 2, true);
  }

  // ============================================================================
  // SLIDE 3 — HOW WILL YOU KNOW WHAT'S WORKING? (Rich Terracotta Theme)
  // ============================================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.terracotta };
    addActionHeader(
      slide,
      'Slide 3  How Will You Know What Is Working',
      'Real-time CAC and show-up thresholds trigger immediate Scale, Change, or Stop actions'
    );

    const columns = [
      {
        tier: 'SCALE',
        heroRule: 'CAC < ₹120',
        subRule: 'Actual Show-Up > 80%',
        color: C.emerald,
        cardBg: '17261A',
        signalTitle: 'EARLY SUCCESS SIGNALS',
        signalText: 'College clubs booking bulk buses.\nSquad Pass forward rate k > 1.2.\nAmbassador 48h quota > 70%.',
        actionTitle: 'TEAM RESPONSE',
        actionText: 'Unlock +₹15K bonus ambassador pool.\nDispatch extra campus promo kits.'
      },
      {
        tier: 'CHANGE',
        heroRule: 'CAC ₹120–₹220',
        subRule: 'Actual Show-Up 60%–80%',
        color: C.gold,
        cardBg: '2B2111',
        signalTitle: 'EARLY WARNING SIGNALS',
        signalText: 'Checkout drop-off > 25%.\nAd frequency > 3.8 with flat CTR.\nHigh clicks without QR confirmation.',
        actionTitle: 'TEAM RESPONSE',
        actionText: 'Pivot copy to artist lineup reveal.\nSwitch flow to 1-tap WhatsApp RSVP.'
      },
      {
        tier: 'STOP',
        heroRule: 'CAC > ₹220',
        subRule: 'Actual Show-Up < 60%',
        color: C.crimson,
        cardBg: '2E1414',
        signalTitle: 'EARLY FAILURE SIGNALS',
        signalText: 'No-show rate > 40% of confirmed.\nZero creator promo code redemptions.\nNegative feedback on venue commute.',
        actionTitle: 'TEAM RESPONSE',
        actionText: 'Pause campaign within 4 hours.\nShift remaining budget to Clubs & Referrals.'
      }
    ];

    columns.forEach((col, idx) => {
      const x = 0.55 + idx * 3.04;
      slide.addShape(pres.ShapeType.roundRect, {
        x: x, y: 1.12, w: 2.84, h: 3.15,
        rectRadius: 0.16, fill: { color: col.cardBg }, line: { color: col.color, width: 1.5 }
      });

      // Tier Pill
      slide.addShape(pres.ShapeType.roundRect, {
        x: x + 0.18, y: 1.26, w: 1.15, h: 0.28,
        rectRadius: 0.14, fill: { color: col.color }
      });
      slide.addText(col.tier, {
        x: x + 0.18, y: 1.26, w: 1.15, h: 0.28,
        fontFace: FONT, fontSize: 8.5, bold: true, align: 'center', valign: 'middle', color: C.darkText
      });

      // Hero Threshold (Big & Prominent)
      slide.addText(col.heroRule, {
        x: x + 0.18, y: 1.62, w: 2.5, h: 0.38,
        fontFace: FONT, fontSize: 19, bold: true, color: C.white
      });
      slide.addText(col.subRule, {
        x: x + 0.18, y: 1.98, w: 2.5, h: 0.24,
        fontFace: FONT, fontSize: 9.5, bold: true, color: col.color
      });

      // Divider
      slide.addShape(pres.ShapeType.line, {
        x: x + 0.18, y: 2.28, w: 2.48, h: 0,
        line: { color: '4A302B', width: 0.75 }
      });

      // Early Signals
      slide.addText(col.signalTitle, {
        x: x + 0.18, y: 2.38, w: 2.48, h: 0.18,
        fontFace: FONT, fontSize: 7.5, bold: true, color: col.color
      });
      slide.addText(col.signalText, {
        x: x + 0.18, y: 2.56, w: 2.48, h: 0.68,
        fontFace: FONT, fontSize: 8, color: C.cream, lineSpacing: 11.5
      });

      // Action
      slide.addText(col.actionTitle, {
        x: x + 0.18, y: 3.30, w: 2.48, h: 0.18,
        fontFace: FONT, fontSize: 7.5, bold: true, color: col.color
      });
      slide.addText(col.actionText, {
        x: x + 0.18, y: 3.48, w: 2.48, h: 0.62,
        fontFace: FONT, fontSize: 8, bold: true, color: C.white, lineSpacing: 11.5
      });
    });

    // Bottom Strategic Integration Strip: Dashboard & AI Copilot
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.55, y: 4.40, w: 8.9, h: 0.75,
      rectRadius: 0.14, fill: { color: C.espresso }, line: { color: C.gold, width: 1.2 }
    });
    slide.addText('HOW THE DASHBOARD & AI COPILOT EXECUTE THIS', {
      x: 0.72, y: 4.48, w: 5.5, h: 0.2,
      fontFace: FONT, fontSize: 8, bold: true, color: C.gold
    });
    slide.addText('Open Live Command Center', {
      x: 7.1, y: 4.48, w: 2.2, h: 0.2,
      fontFace: FONT, fontSize: 8, bold: true, align: 'right', color: C.gold,
      hyperlink: { url: 'https://rudragupta-6071.github.io/risa-growth-dashboard/' }
    });
    slide.addText('Editing campaign spend recalculates blended CAC and target gaps live in the dashboard (persisted via Supabase with local-storage fallback). The Gemini Copilot reads live state to diagnose leaks and propose confirmed Task Board actions.', {
      x: 0.72, y: 4.68, w: 8.55, h: 0.42,
      fontFace: FONT, fontSize: 8, color: C.white, lineSpacing: 11
    });

    addFooter(slide, 3);
  }

  await pres.writeFile({ fileName: 'RISA_3_Slide_Strategy_Deck.pptx' });
  console.log('Successfully generated strategist deck: RISA_3_Slide_Strategy_Deck.pptx');
}

buildThreeSlideDeck().catch(console.error);
