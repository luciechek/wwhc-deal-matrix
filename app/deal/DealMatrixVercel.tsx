'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Database, Users, User, Save, BookOpen, Gauge, Briefcase, RefreshCcw, LogOut } from 'lucide-react';


type ScoreMap = Record<string, number>;
type NoteMap  = Record<string, string>;
type TeamRow  = { evaluator: string; scores: ScoreMap; notes?: NoteMap };
type MyDeal = { dealName: string; avgScore: number; updatedAt?: string };


type DealSummary = {
  dealName: string;
  avgScore: number;     // moyenne du deal (toutes personnes confondues)
  reviewers: number;    // nb d'évaluateurs
};



const DealMatrixVercel = () => {
  // -------- UI State --------
  const [viewMode, setViewMode] = useState<'individual' | 'team'>('individual');
  const [scores, setScores]     = useState<ScoreMap>({});
  const [notes,  setNotes]      = useState<NoteMap>({});
  const [teamScores, setTeamScores] = useState<TeamRow[]>([]);
  const [dealName, setDealName]       = useState('');
  const [evaluatorName, setEvaluatorName] = useState('');
  const [loading, setLoading]   = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [myDeals, setMyDeals] = useState<MyDeal[]>([]);

  // Deals summary list
  const [deals, setDeals] = useState<DealSummary[]>([]);
  const [loadingDeals, setLoadingDeals] = useState(false);

  // -------- Refs for sticky menu scroll --------
  const howToRef   = useRef<HTMLDivElement | null>(null);
  const scoringRef = useRef<HTMLDivElement | null>(null);
  const dealsRef   = useRef<HTMLDivElement | null>(null);
  const scrollTo = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

  // -------- Criteria (monochrome version) --------
  const criteria: Record<string, { id: string; label: string; desc: string }[]> = useMemo(() => ({
    'Sponsor Quality & Track Record': [
      { id: 'sponsorDeals',       label: 'Prior Deals Completed',       desc: '5: 5+ successful deals | 4: 3-4 | 3: 1-2 | 2: 1st deal w/ co-sponsor | 1: Solo first-time' },
      { id: 'sponsorExits',       label: 'Exit Track Record',           desc: '5: Multiple 3x+ MOIC | 4: 2x+ | 3: 1.5x+ | 2: One exit | 1: No exits' },
      { id: 'sponsorCapital',     label: 'Personal Capital Commitment', desc: '5: >20% or >$2M … 1: <5% or <$250k' },
      { id: 'sponsorAngle',       label: 'Deal Sourcing Angle & Edge',  desc: '5: Unique proprietary … 1: No advantage' },
      { id: 'sponsorBackground',  label: 'Professional Background',     desc: '5: Sr PE + ops … 1: No PE/ops' },
      { id: 'sponsorCredibility', label: 'Credibility & Presence',      desc: '5: Known in market … 1: Concerning gaps' },
      { id: 'sponsorCarry',       label: 'Sponsor Carry Structure',     desc: '5: Tiered 20%+ … 1: No carry' },
    ],
    'Business Model & Competitive Position': [
      { id: 'businessRevenue',        label: 'Revenue Scale',            desc: '5: >$50M … 1: <$5M' },
      { id: 'businessCustomer',       label: 'Customer Diversification', desc: '5: Top 10 <15% … 1: >60%' },
      { id: 'businessRecurring',      label: 'Revenue Predictability',   desc: '5: >80% recurring … 1: <20%' },
      { id: 'businessRetention',      label: 'Customer Retention',       desc: '5: >95% … 1: <80%' },
      { id: 'managementTenure',       label: 'Management Tenure',        desc: '5: CEO/CFO 5+ yrs … 1: Turnover' },
      { id: 'competitiveAdvantage',   label: 'Competitive Advantage',    desc: '5: Clear moat … 1: None' },
      { id: 'productDifferentiation', label: 'Product Differentiation',  desc: '5: Highly diff … 1: Commoditized' },
    ],
    'Financial Performance & Metrics': [
      { id: 'ebitdaMargins',  label: 'EBITDA Margins',     desc: '5: >30% … 1: <10%' },
      { id: 'revenueGrowth',  label: 'Revenue CAGR (3y)',  desc: '5: >25% … 1: <5%' },
      { id: 'ebitdaGrowth',   label: 'EBITDA CAGR (3y)',   desc: '5: >30% … 1: <10%' },
      { id: 'fcfConversion',  label: 'FCF Conversion',     desc: '5: >90% … 1: <40%' },
      { id: 'capexIntensity', label: 'Capex % Revenue',    desc: '5: <2% … 1: >10%' },
      { id: 'grossMargins',   label: 'Gross Margins',      desc: '5: >60% … 1: <30%' },
      { id: 'customersConcentration', label: 'Top Customer %', desc: '5: <5% … 1: >25%' },
    ],
    'Deal Economics & Structure': [
      { id: 'dealMultiple',     label: 'EV/EBITDA Multiple', desc: '5: <5x … 1: >8x' },
      { id: 'dealLeverage',     label: 'Total Debt/EBITDA',  desc: '5: <2.5x … 1: >5.5x' },
      { id: 'dealEquityCheck',  label: 'Equity Check Size',  desc: '5: <$5M … 1: >$15M' },
      { id: 'dealDebtSeniority',label: 'Debt Position',      desc: '5: First-dollar senior … 1: Unsecured' },
      { id: 'dealRollover',     label: 'Seller Rollover',    desc: '5: ≥30% … 1: <5%' },
    ],
    'Market Dynamics & Industry': [
      { id: 'marketTam',          label: 'TAM',                  desc: '5: >$5B … 1: <$500M' },
      { id: 'marketGrowth',       label: 'Market Growth',        desc: '5: >15% … 1: Flat/declining' },
      { id: 'marketFragmentation',label: 'Fragmentation',        desc: '5: Highly frag … 1: Few dominant' },
      { id: 'regulatoryRisk',     label: 'Regulatory Risk',      desc: '5: Minimal … 1: High' },
      { id: 'tariffExposure',     label: 'Tariff Exposure',      desc: '5: Domestic only … 1: Heavy reliance' },
      { id: 'aiDisruptionRisk',   label: 'AI/Automation Risk',   desc: '5: Enhances … 1: High displacement' },
    ],
    'Execution Risk & Value Creation': [
      { id: 'ddQuality',        label: 'Diligence Quality',      desc: '5: Full QofE+legal+commercial+IT … 1: Minimal' },
      { id: 'integrationRisk',  label: 'Integration Complexity', desc: '5: Stand-alone … 1: High risk' },
      { id: 'valueCreationPlan',label: 'Value Creation Plan',    desc: '5: 100-day plan … 1: No plan' },
    ],
  }), []);

  // Blank maps helper (stable with useMemo)
  const blankMaps = useMemo(() => {
    const s: ScoreMap = {};
    const n: NoteMap  = {};
    Object.values(criteria).flat().forEach(c => { s[c.id] = 0; n[c.id] = ''; });
    return { s, n };
  }, [criteria]);

  // Init scores/notes on mount
  useEffect(() => { setScores(blankMaps.s); setNotes(blankMaps.n); }, [blankMaps]);

  // Load team when dealName changes
  useEffect(() => { if (dealName.trim()) void loadTeamScores(); }, [dealName]);

  // If user (deal+name) matches existing row, hydrate form once
  useEffect(() => {
    if (!dealName.trim() || !evaluatorName.trim() || teamScores.length === 0) return;
    const me = teamScores.find(
      ts => ts.evaluator.trim().toLowerCase() === evaluatorName.trim().toLowerCase()
    );
    if (!me) return;

    // Only apply if something is really different (avoid loops)
    const nextS = { ...blankMaps.s, ...(me.scores || {}) };
    const nextN = { ...blankMaps.n, ...(me.notes  || {}) };
    const sameScores =
      Object.keys(nextS).every(k => (scores[k] ?? 0) === (nextS[k] ?? 0));
    const sameNotes  =
      Object.keys(nextN).every(k => (notes[k] ?? '') === (nextN[k] ?? ''));

    if (!sameScores) setScores(nextS);
    if (!sameNotes)  setNotes(nextN);
    setViewMode('individual');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealName, evaluatorName, teamScores, blankMaps]);

  // ------ API helpers ------
  const loadTeamScores = async () => {
  try {
    setLoading(true);
    const res = await fetch(
      `/api/evaluations?dealName=${encodeURIComponent(dealName.trim())}`,
      { cache: 'no-store' }
    );
    if (!res.ok) { setTeamScores([]); return [] as TeamRow[]; }
    const data = (await res.json()) as TeamRow[];
    setTeamScores(data);
    return data;
  } finally {
    setLoading(false);
  }
};


  const saveScores = async () => {
    if (!dealName.trim() || !evaluatorName.trim()) {
      alert('Please enter both deal name and your name!');
      return;
    }
    setLoading(true);
    setSaveStatus('Saving…');
    try {
      const res = await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealName: dealName.trim(),
          evaluatorName: evaluatorName.trim(),
          scores,
          notes
        })
      });
      if (!res.ok) throw new Error('save failed');
      setSaveStatus('✅ Saved successfully!');
      await loadTeamScores();
      await loadDeals(); // refresh deals list too
    } catch (e) {
      setSaveStatus('❌ Save failed!');
    } finally {
      setLoading(false);
      setTimeout(() => setSaveStatus(''), 2200);
    }
  };

  const deleteMyScores = async () => {
  const dn = dealName.trim();
  const en = evaluatorName.trim();
  if (!dn || !en) {
    alert('Please enter deal name and your name first.'); 
    return;
  }

const pickMyDeal = (name: string) => {
  // mets le nom du deal
  setDealName(name);
  // repasse en vue individuelle
  setViewMode('individual');

  // nettoie les champs locaux pour éviter un affichage "fantôme"
  setScores(blankMaps.s);
  setNotes(blankMaps.n);

  // recharge l'équipe pour ce deal (après le setState)
  setTimeout(() => { void loadTeamScores(); }, 0);
};



  const ok = confirm(`Delete your scores for "${dn}"? This cannot be undone.`);
  if (!ok) return;

  setLoading(true);
  setSaveStatus('Deleting…');
  try {
    const res = await fetch('/api/evaluations', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dealName: dn, evaluatorName: en })
    });
    if (!res.ok) throw new Error('delete failed');

    // reset UI + refresh listes
    setScores(blankMaps.s);
    setNotes(blankMaps.n);
    await loadTeamScores();
    await loadDeals();
    setSaveStatus('🗑️ Deleted.');
  } catch {
    setSaveStatus('❌ Delete failed!');
  } finally {
    setLoading(false);
    setTimeout(() => setSaveStatus(''), 2200);
  }
};

  const loadMyScores = async () => {
  const name = evaluatorName.trim();
  const deal = dealName.trim();

  if (!name) { alert('Enter your name first'); return; }

  // NO DEAL NAME -> on affiche la liste de TOUS les deals de cette personne
  if (!deal) {
    const res = await fetch(`/api/my-scores?evaluator=${encodeURIComponent(name)}`, { cache: 'no-store' });
    if (res.ok) {
      const list = (await res.json()) as MyDeal[];
      setMyDeals(list);
      if (list.length === 0) alert('No saved deals for this name yet.');
    } else {
      alert('Failed to load your deals.');
    }
    return;
  }

  // DEAL NAME présent -> comportement habituel (charger mes scores pour ce deal)
  const rows = await loadTeamScores();
  const target = name.toLowerCase();
  const me = rows.find(r => (r.evaluator || '').toLowerCase() === target);
  if (!me) { alert('No saved scores for this deal + name.'); return; }

  const nextS = { ...blankMaps.s, ...(me.scores || {}) };
  const nextN = { ...blankMaps.n, ...(me.notes  || {}) };
  setScores(nextS);
  setNotes(nextN);
  setViewMode('individual');
};


  const newDeal = () => {
    setDealName(''); setEvaluatorName('');
    setScores(blankMaps.s); setNotes(blankMaps.n);
    setTeamScores([]); setViewMode('individual');
  };

  const avg = (m: ScoreMap) => {
    const v = Object.values(m).filter(x => x > 0);
    return v.length ? v.reduce((a,b)=>a+b,0)/v.length : 0;
  };
  const teamAvgFor = (id: string) => {
    const v = teamScores.map(t => t.scores?.[id] || 0).filter(x=>x>0);
    return v.length ? (v.reduce((a,b)=>a+b,0)/v.length).toFixed(1) : 'N/A';
  };
  const finalScore =
    viewMode==='individual'
      ? avg(scores)
      : (teamScores.length ? teamScores.map(t=>avg(t.scores)).reduce((a,b)=>a+b,0)/teamScores.length : 0);

  // Deals summary
  const loadDeals = async () => {
    setLoadingDeals(true);
    try {
      const res = await fetch('/api/deals', { cache: 'no-store' });
      if (res.ok) setDeals(await res.json());
    } finally {
      setLoadingDeals(false);
    }
  };

  useEffect(() => { void loadDeals(); }, []);
  const isTeamModeActive = viewMode === 'team' && teamScores.length > 0;

  async function logout() {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } finally {
      // back to the access page after we clear the cookie
      window.location.href = '/access';
    }
  }

  // ---------------- RENDER ----------------
  return (
    <div className="min-h-screen bg-white text-gray-900">
          {/* Bouton Logout */}
    <div className="absolute right-4 top-4">
      <button
  onClick={logout}
  className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
  title="Log out"
>
  <LogOut className="h-4 w-4" /> Logout
</button>

    </div>
      {/* Sticky menu */}
      <nav className="sticky top-0 z-30 border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-gray-100">
              <Database className="h-5 w-5 text-gray-700" />
            </div>
            <span className="text-base font-semibold">Deal Evaluation Matrix</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scrollTo(howToRef)} className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50">
              <BookOpen className="h-4 w-4" /> HOW TO USE
            </button>
            <button onClick={() => scrollTo(scoringRef)} className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50">
              <Gauge className="h-4 w-4" /> SCORING
            </button>
            <button onClick={() => scrollTo(dealsRef)} className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50">
              <Briefcase className="h-4 w-4" /> DEALS
            </button>
          </div>
        </div>
      </nav>

      {/* Page container */}
      <div className="mx-auto max-w-6xl px-4 py-4">
        {/* HEADER */}
        <div className="mb-1 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-gray-100">
              <Database className="h-5 w-5 text-gray-700" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Deal Evaluation Matrix</h1>
          </div>
          <Image
            src="/logo.png"
            alt="Company Logo"
            width={200}
            height={89}
            className="object-contain opacity-90 hover:opacity-100 transition-opacity"
          />
        </div>
        <p className="text-sm text-gray-500">Monochrome • Independent Sponsor IC Tool</p>

        {/* HOW TO USE */}
        <div ref={howToRef} className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <div className="mb-2 flex items-center gap-2 text-gray-800">
            <BookOpen className="h-5 w-5" />
            <span className="text-lg font-semibold">How to use</span>
          </div>
          <ol className="ml-4 list-decimal space-y-2 text-sm text-gray-700">
            <li><strong>Deal Name</strong>: everyone must type the exact same deal name (e.g., <em>“Acme Corp Acquisition”</em>) so scores merge correctly.</li>
            <li><strong>Your Name</strong>: type your full name (used to save & find your scores).</li>
            <li><strong>Sliders & Notes</strong>: move each slider (0 = N/A) and add notes if useful.</li>
            <li><strong>Save</strong>: persists your scores to the database.</li>
            <li><strong>Load my scores</strong>:
                <ul className="list-disc ml-6">
                <li>If a deal name is filled → reloads <em>your</em> scores for that deal.</li>
                <li>If the deal name is empty → shows a list of <em>all deals you rated</em> with your average; click a deal to load it.</li>
                </ul>
            </li>
            <li><strong>Delete my scores</strong>: removes <em>your</em> saved scores for the current deal.</li>
            <li><strong>Team View</strong>: combines everyone’s results for the current deal.</li>
            <li><strong>New Deal</strong>: resets the form to start a fresh evaluation.</li>
            <li>Top menu: <strong>SCORING</strong> jumps to the scoring section; <strong>DEALS</strong> lists all deals with average score & number of reviewers.</li>
          </ol>

        </div>

        {/* INPUTS + ACTIONS (SCORING HEADER) */}
        <div ref={scoringRef} className="mt-6">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-gray-600">Deal Name</label>
              <input
                value={dealName}
                onChange={(e)=>setDealName(e.target.value)}
                onBlur={loadTeamScores}
                placeholder="Acme Corp Acquisition"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-600">Your Name</label>
              <input
                value={evaluatorName}
                onChange={(e)=>setEvaluatorName(e.target.value)}
                placeholder="John Smith"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={saveScores}
              disabled={loading}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-gray-900 px-4 font-medium text-white hover:bg-black disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Saving…' : 'Save'}
            </button>

            <button
              onClick={()=>setViewMode('individual')}
              className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 font-medium ${
                viewMode==='individual'
                  ? 'border border-gray-300 bg-gray-100 text-gray-900'
                  : 'border border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              <User className="h-4 w-4" /> My Scores
            </button>

            <button
              onClick={loadMyScores}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 font-medium text-gray-700 hover:border-gray-400"
            >
              <RefreshCcw className="h-4 w-4" /> Load my scores
            </button>

            <button
              onClick={newDeal}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 font-medium text-gray-700 hover:border-gray-400"
            >
              🆕 New Deal
            </button>

            <button
                onClick={deleteMyScores}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-300 bg-white px-4 font-medium text-red-600 hover:bg-red-50"
                >
                🗑️ Delete my scores
                </button>

            <button
              onClick={()=>setViewMode('team')}
              disabled={!teamScores.length}
              className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 font-medium ${
                viewMode==='team'
                  ? 'border border-gray-300 bg-gray-100 text-gray-900'
                  : !teamScores.length
                  ? 'cursor-not-allowed border border-gray-200 bg-white text-gray-400'
                  : 'border border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              <Users className="h-4 w-4" /> Team View ({teamScores.length})
            </button>
          </div>



{myDeals.length > 0 && (
  <div className="mt-3 rounded-xl border border-gray-200 bg-white p-3">
    <div className="mb-2 flex items-center justify-between">
      <div className="text-sm font-medium text-gray-800">Your deals</div>
      <button
        onClick={() => setMyDeals([])}
        className="text-xs text-gray-500 hover:underline"
      >
        hide
      </button>
    </div>
    <div className="grid gap-2 md:grid-cols-2">
      {myDeals.map(d => (
        <button
  key={d.dealName}
  onClick={() => {
    // Sélectionne le deal et recharge les données
    setDealName(d.dealName);
    setViewMode('individual');
    setScores(blankMaps.s);
    setNotes(blankMaps.n);
    // recharge l’équipe pour ce deal après le setState
    setTimeout(() => { void loadTeamScores(); }, 0);
  }}
  className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-left hover:bg-gray-100"
>
  <span className="font-medium text-gray-800">{d.dealName}</span>
</button>

      ))}
    </div>
    <div className="mt-2 text-xs text-gray-500">
      Tip: click a deal to load your saved scores for it.
    </div>
  </div>
)}


          {saveStatus && (
            <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-center text-sm text-gray-700">
              {saveStatus}
            </div>
          )}

          {/* Team mini-cards */}
          {viewMode==='team' && teamScores.length>0 && (
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3">
              <div className="mb-2 text-sm font-medium text-gray-700">Team Members</div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {teamScores.map((ts, idx)=>(
                  <div key={`${ts.evaluator}-${idx}`} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                    <div className="text-xs text-gray-500">{ts.evaluator}</div>
                    <div className="text-xl font-semibold">{avg(ts.scores).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Final score banner */}
        <div className="mb-5 mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
          <div className="text-6xl font-extrabold tracking-tight md:text-7xl">{finalScore.toFixed(2)}</div>
          <div className="mt-1 text-sm text-gray-500">Aggregate score</div>
        </div>

        {/* CATEGORIES (SCORING BODY) */}
        {Object.entries(criteria).map(([category, items])=>(
          <div key={category} className="mb-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-3 text-base font-semibold md:text-lg">{category}</div>

            {items.map((criterion) => {
              const display =
                viewMode==='individual'
                  ? (scores[criterion.id]===0 ? 'N/A' : scores[criterion.id])
                  : teamAvgFor(criterion.id);

              return (
                <div key={criterion.id} className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-2 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{criterion.label}</div>
                      <div className="text-xs text-gray-500">{criterion.desc}</div>
                    </div>
                    <div className="min-w-[3ch] text-right text-3xl font-bold tabular-nums text-gray-900">
                      {display}
                    </div>
                  </div>

                  {/* ✅ ON AFFICHE LES INPUTS SI PAS DE TEAM VIEW ACTIVE */}
{!isTeamModeActive && (
  <>
    <input
      type="range" min={0} max={5}
      value={scores[criterion.id] || 0}
      onChange={(e)=>setScores({...scores, [criterion.id]: parseInt(e.target.value,10)})}
      className="mt-2 w-full accent-gray-600"
    />
    <textarea
      value={notes[criterion.id] || ''}
      onChange={(e)=>setNotes({...notes, [criterion.id]: e.target.value})}
      placeholder="Notes / context…"
      className="mt-2 min-h-[44px] w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-gray-900 focus:outline-none"
    />
  </>
)}

{/* ✅ ON AFFICHE LA VUE TEAM UNIQUEMENT SI ELLE EXISTE */}
{isTeamModeActive && (
  <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
    {teamScores.map((ts, idx) => {
      const s = ts.scores?.[criterion.id] || 0;
      const note = ts.notes?.[criterion.id] || '';
      return (
        <div
          key={`${criterion.id}-${ts.evaluator}-${idx}`}
          className="rounded-lg border border-gray-200 bg-white p-2"
        >
          <div className="text-xs text-gray-500">{ts.evaluator}</div>
          <div className="font-semibold">{s === 0 ? 'N/A' : s}</div>
          {note && (
            <div className="mt-1 text-[11px] text-gray-500 line-clamp-2">
              {note}
            </div>
          )}
        </div>
      );
    })}
  </div>
)}

                </div>
              );
            })}
          </div>
        ))}

        {/* DEALS LIST */}
        <div ref={dealsRef} className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Deals</h2>
            </div>
            <button
              onClick={loadDeals}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm hover:border-gray-400"
            >
              <RefreshCcw className="h-4 w-4" /> Refresh
            </button>
          </div>

          {loadingDeals ? (
            <div className="py-8 text-center text-sm text-gray-500">Loading deals…</div>
          ) : deals.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">No deals yet.</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {deals.map(d => (
                <div key={d.dealName} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-1 text-sm text-gray-500">Deal</div>
                  <div className="mb-2 text-lg font-semibold">{d.dealName}</div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Reviewers: <span className="font-semibold text-gray-900">{d.reviewers}</span>
                    </div>
                    <div className="text-2xl font-extrabold tabular-nums">{d.avgScore.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealMatrixVercel;
