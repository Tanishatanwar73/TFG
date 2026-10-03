import React, { useState } from 'react';
import { Pencil, Save, X, Upload, BadgeCheck, Check, Globe, MapPin } from 'lucide-react';

const BROWN = '#4A3328';
const GOLD = '#B8895A';
const PAPER = '#F4F2EC';

export const defaultCaseStudies = [{
  id: 'case-study-1',
  title: 'Platform expansion',
  client: 'Your flagship client',
  outcome: 'Describe the business result, transformation, or value delivered.',
  metric: 'Add a measurable result',
  year: '2026',
}];

const buildDefaults = (member = {}) => ({
  name: member?.name || 'Founder Name',
  title: member?.title || member?.role || 'CEO & Founder',
  company: member?.companyName || 'Your Company',
  sector: 'FINTECH // DECENTRALIZED PROTOCOLS',
  website: member?.subdomain ? `${member.subdomain}.thefoundergrid.com` : 'yourcompany.io',
  location: 'New York, NY',
  avatarUrl: member?.avatarUrl || '',
  summary:
    member?.bio ||
    'Describe your vision, what you are building, and why it matters. Keep it to two or three short paragraphs.',
  quote: 'The best moat is relentless execution',
  stats: [
    { value: '$4.2M', label: 'SEED ROUND' },
    { value: '140K+', label: 'ACTIVE USERS' },
    { value: '+210%', label: 'YOY ARR' },
  ],
  innovation: [
    'Proprietary product moat and highlights',
    'Product and market innovation',
    'Innovation in business strategy',
    'Community and decentralized innovation',
  ],
  milestones: ['Protocol V1 Launch', 'Series A Bridge Close', 'Community DAO Governance Initiation'],
  outlook: 'Future outlook: scaling into new markets while deepening product and community moats.',
  issue: 'ISSUE 04',
  verifiedDate: 'DECEMBER 2026',
  caseStudies: member?.caseStudies?.length ? member.caseStudies : defaultCaseStudies,
});

const loadSaved = (key, defaults) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch {
    return defaults;
  }
};

const lines = (text) => text.split('\n').map((t) => t.trim()).filter(Boolean);

/* ---------- Small form helpers ---------- */
const Field = ({ label, children }) => (
  <label className="block text-xs">
    <span className="block text-neutral-400 font-medium mb-1">{label}</span>
    {children}
  </label>
);
const inputCls =
  'w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500';

export const CaseStudies = ({ caseStudies = [], editable = false, onChange }) => {
  const studies = Array.isArray(caseStudies) ? caseStudies : [];
  const update = (index, field, value) => onChange?.(studies.map((study, studyIndex) => (
    studyIndex === index ? { ...study, [field]: value } : study
  )));
  const add = () => onChange?.([...studies, {
    id: `case-study-${Date.now()}`,
    title: '', client: '', outcome: '', metric: '', year: String(new Date().getFullYear()),
  }]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-neutral-100">Selected Case Studies</h2>
          <p className="text-xs text-neutral-400 mt-1">Verified work and measurable outcomes.</p>
        </div>
        {editable && <button onClick={add} className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-500 text-neutral-950 hover:bg-amber-400">Add case study</button>}
      </div>
      {studies.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 text-center text-xs text-neutral-500">No case studies added yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {studies.map((study, index) => (
            <article key={study.id || index} className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 space-y-3">
              {editable ? (
                <div className="space-y-2">
                  {['title', 'client', 'year', 'metric'].map((field) => (
                    <input key={field} className={inputCls} value={study[field] || ''} placeholder={field[0].toUpperCase() + field.slice(1)} onChange={(event) => update(index, field, event.target.value)} />
                  ))}
                  <textarea rows={4} className={inputCls} value={study.outcome || ''} placeholder="Outcome" onChange={(event) => update(index, 'outcome', event.target.value)} />
                  <button onClick={() => onChange?.(studies.filter((_, studyIndex) => studyIndex !== index))} className="text-xs text-red-400 hover:text-red-300">Remove case study</button>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-sm text-neutral-100">{study.title || 'Untitled case study'}</h3>
                    <span className="font-mono text-[10px] text-amber-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">{study.year}</span>
                  </div>
                  <div className="text-[11px] text-neutral-400">Client: <strong className="text-neutral-200">{study.client || 'Confidential'}</strong></div>
                  <p className="text-xs text-neutral-300 leading-relaxed">{study.outcome || 'Outcome not provided.'}</p>
                  {study.metric && <div className="pt-2 border-t border-neutral-800 text-xs text-emerald-400 font-semibold">Metric: {study.metric}</div>}
                </>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

/* ---------- The profile card (matches the reference design) ---------- */
const ProfileCard = ({ data, editable = false, onAvatarFile, onStartEdit }) => {
  const stats = data.stats ?? [];
  const innovation = data.innovation ?? [];
  const milestones = data.milestones ?? [];

  return (
    <div
      className="rounded-2xl border p-4 sm:p-6 shadow-2xl max-w-3xl mx-auto"
      style={{ background: PAPER, borderColor: '#D9D3C7', color: BROWN }}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: '#D9D3C7' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md grid grid-cols-2 gap-0.5 p-0.5" style={{ background: BROWN }}>
            <span className="rounded-sm bg-white/90" />
            <span className="rounded-sm" style={{ background: GOLD }} />
            <span className="rounded-sm" style={{ background: GOLD }} />
            <span className="rounded-sm bg-white/90" />
          </div>
          <div className="leading-tight">
            <div className="text-[10px] font-serif italic">The</div>
            <div className="font-serif text-lg font-bold -mt-1">Founder Grid</div>
          </div>
        </div>
        <div className="text-[11px] sm:text-xs font-semibold tracking-widest">
          EXECUTIVE PROFILE // {data.issue}
        </div>
      </div>

      {/* Identity */}
      <div className="flex items-center gap-4 sm:gap-6 py-5">
        <div
          onClick={editable ? undefined : onStartEdit}
          onKeyDown={editable ? undefined : (event) => {
            if (event.key === 'Enter' || event.key === ' ') onStartEdit?.();
          }}
          role={editable ? undefined : 'button'}
          tabIndex={editable ? undefined : 0}
          aria-label={editable ? 'Change profile photo' : 'Edit portfolio'}
          className={`relative w-24 h-24 sm:w-32 sm:h-32 rounded-full shrink-0 overflow-hidden border-4 flex items-center justify-center ${editable ? '' : 'cursor-pointer'}`}
          style={{ borderColor: GOLD, background: '#E7E1D4' }}
        >
          {data.avatarUrl ? (
            <img src={data.avatarUrl} alt={data.name} className="w-full h-full object-cover" />
          ) : (
            <span className="font-serif text-4xl font-bold" style={{ color: GOLD }}>
              {(data.name || '?').charAt(0)}
            </span>
          )}
          {editable && (
            <label className="absolute inset-0 bg-black/55 text-white text-[11px] font-semibold flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-black/70 transition-colors">
              <Upload className="w-5 h-5" />
              <span>Change photo</span>
              <input type="file" accept="image/*" className="hidden" onChange={onAvatarFile} />
            </label>
          )}
        </div>
        <div className="min-w-0">
          <div className="text-[11px] opacity-70">Founder Name</div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight break-words">{data.name}</h2>
          <div className="text-sm sm:text-lg font-medium">
            {data.title}, {data.company}
          </div>
          <div className="text-[11px] sm:text-xs font-bold tracking-wide mt-1" style={{ color: GOLD }}>
            {data.sector}
          </div>
          <div className="text-xs mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 opacity-90">
            <span className="inline-flex items-center gap-1"><Globe className="w-3 h-3" />{data.website}</span>
            <span>|</span>
            <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{data.location}</span>
          </div>
        </div>
      </div>

      {/* Summary + stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2 rounded-xl border p-4" style={{ borderColor: '#D9D3C7' }}>
          <h3 className="font-bold text-sm mb-2">Executive Summary & Vision</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <p className="text-xs leading-relaxed whitespace-pre-wrap">{data.summary}</p>
            <div className="sm:border-l sm:pl-4" style={{ borderColor: '#D9D3C7' }}>
              <span className="font-serif text-3xl leading-none" style={{ color: GOLD }}>“</span>
              <p className="font-serif text-xl sm:text-2xl font-bold leading-snug" style={{ color: GOLD }}>
                {data.quote}
              </p>
              <span className="font-serif text-3xl leading-none float-right" style={{ color: GOLD }}>”</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-1 gap-3">
          {stats.slice(0, 3).map((s, i) => (
            <div key={i} className="rounded-xl border p-3 text-center flex flex-col justify-center" style={{ borderColor: '#D9D3C7' }}>
              <div className="font-serif text-2xl sm:text-3xl font-bold">{s.value}</div>
              <div className="text-[10px] sm:text-xs font-semibold tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Innovation + milestones */}
      <div className="rounded-xl border p-4 mt-3 grid grid-cols-1 md:grid-cols-2 gap-5" style={{ borderColor: '#D9D3C7' }}>
        <div>
          <h3 className="font-bold text-sm mb-2">Product & Market Innovation</h3>
          <ul className="space-y-1.5">
            {innovation.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: GOLD }} />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:border-l md:pl-5" style={{ borderColor: '#D9D3C7' }}>
          <h3 className="font-bold text-sm mb-2">Key milestones</h3>
          <ul className="space-y-1.5 text-xs">
            {milestones.map((t, i) => (
              <li key={i}>• {t}</li>
            ))}
          </ul>
          <p className="text-xs mt-3 opacity-80">{data.outlook}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="rounded-xl border p-3 mt-3 flex items-center justify-between gap-3" style={{ borderColor: '#D9D3C7' }}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: GOLD }}>
            <BadgeCheck className="w-6 h-6 text-white" />
          </div>
          <div className="text-xs leading-tight">
            <div>Verified by</div>
            <div className="font-bold">The Founder Grid</div>
          </div>
        </div>
        <div className="text-xs font-semibold tracking-wide hidden sm:block">{data.verifiedDate}</div>
        <div className="flex items-center gap-3">
          <div className="text-xs leading-tight text-right">
            <div className="font-bold">VIEW FULL PROFILE</div>
            <div className="opacity-70">Digital PDF Pitch ready</div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- Page ---------- */
export const MyPortfolio = ({ member, onSave }) => {
  const storageKey = `portfolio:${member?.id ?? 'me'}`;
  const defaults = buildDefaults(member);

  const [saved, setSaved] = useState(() => loadSaved(storageKey, defaults));
  const [draft, setDraft] = useState(saved);
  const [isEditing, setIsEditing] = useState(false);
  const [notice, setNotice] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const set = (field, value) => setDraft((d) => ({ ...d, [field]: value }));
  const setStat = (i, field, value) =>
    setDraft((d) => ({ ...d, stats: d.stats.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)) }));

  const startEdit = () => {
    setDraft(saved);
    setIsEditing(true);
  };

  const cancel = () => {
    setDraft(saved);
    setIsEditing(false);
  };

  const save = async () => {
    setIsSaving(true);
    try {
      if (typeof onSave === 'function') await onSave(draft);
      setSaved(draft);
      try {
        localStorage.setItem(storageKey, JSON.stringify(draft));
      } catch {
        /* storage unavailable: still keep in memory */
      }
      setIsEditing(false);
      setNotice('Portfolio saved');
      setTimeout(() => setNotice(''), 3000);
    } catch (error) {
      setNotice(error.message || 'Could not save portfolio');
    } finally {
      setIsSaving(false);
    }
  };

  const onAvatarFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set('avatarUrl', String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 text-neutral-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">My Executive Portfolio & Dossier</h1>
          <p className="text-xs text-neutral-400 mt-1">Live at {saved.website}</p>
        </div>

        <div className="flex items-center gap-2">
          {notice && <span className="text-xs text-emerald-400">{notice}</span>}
          {isEditing ? (
            <>
              <button
                onClick={cancel}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 border border-neutral-700 text-neutral-300 hover:bg-neutral-800 flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
              <button
                onClick={save}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 hover:from-amber-400 hover:to-amber-500 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" /> {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button
              onClick={startEdit}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-neutral-950 hover:bg-amber-400 flex items-center gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit Portfolio
            </button>
          )}
        </div>
      </div>

      {/* Editor */}
      {isEditing && (
        <div className="bg-neutral-950 border border-amber-500/30 rounded-2xl p-5 space-y-4">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Edit your profile (preview updates below)</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Full name"><input className={inputCls} value={draft.name} onChange={(e) => set('name', e.target.value)} /></Field>
            <Field label="Job title"><input className={inputCls} value={draft.title} onChange={(e) => set('title', e.target.value)} /></Field>
            <Field label="Company"><input className={inputCls} value={draft.company} onChange={(e) => set('company', e.target.value)} /></Field>
            <Field label="Sector line"><input className={inputCls} value={draft.sector} onChange={(e) => set('sector', e.target.value)} /></Field>
            <Field label="Website"><input className={inputCls} value={draft.website} onChange={(e) => set('website', e.target.value)} /></Field>
            <Field label="Location"><input className={inputCls} value={draft.location} onChange={(e) => set('location', e.target.value)} /></Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Photo URL">
              <input className={inputCls} value={draft.avatarUrl.startsWith('data:') ? '(uploaded image)' : draft.avatarUrl} onChange={(e) => set('avatarUrl', e.target.value)} placeholder="https://..." />
            </Field>
            <Field label="Or upload a photo">
              <span className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300 cursor-pointer hover:border-amber-500">
                <Upload className="w-3.5 h-3.5" />
                <span>Choose image</span>
                <input type="file" accept="image/*" className="hidden" onChange={onAvatarFile} />
              </span>
            </Field>
          </div>

          <Field label="Executive summary & vision">
            <textarea rows={5} className={inputCls} value={draft.summary} onChange={(e) => set('summary', e.target.value)} />
          </Field>
          <Field label="Pull quote">
            <input className={inputCls} value={draft.quote} onChange={(e) => set('quote', e.target.value)} />
          </Field>

          <div>
            <div className="text-xs text-neutral-400 font-medium mb-1">Headline numbers (3)</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {draft.stats.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input className={inputCls} value={s.value} onChange={(e) => setStat(i, 'value', e.target.value)} placeholder="$4.2M" />
                  <input className={inputCls} value={s.label} onChange={(e) => setStat(i, 'label', e.target.value)} placeholder="SEED ROUND" />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Product & market innovation (one per line)">
              <textarea rows={5} className={inputCls} value={draft.innovation.join('\n')} onChange={(e) => set('innovation', lines(e.target.value).length ? e.target.value.split('\n') : [])} />
            </Field>
            <Field label="Key milestones (one per line)">
              <textarea rows={5} className={inputCls} value={draft.milestones.join('\n')} onChange={(e) => set('milestones', e.target.value.split('\n'))} />
            </Field>
          </div>

          <Field label="Future outlook">
            <input className={inputCls} value={draft.outlook} onChange={(e) => set('outlook', e.target.value)} />
          </Field>
        </div>
      )}

      {/* Live card: shows draft while editing, saved otherwise */}
      <ProfileCard
        editable={isEditing}
        onAvatarFile={onAvatarFile}
        onStartEdit={startEdit}
        data={
          isEditing
            ? { ...draft, innovation: lines(draft.innovation.join('\n')), milestones: lines(draft.milestones.join('\n')) }
            : saved
        }
      />

      {/* Case studies: editable while the page is in edit mode */}
      <CaseStudies
        caseStudies={isEditing ? draft.caseStudies : saved.caseStudies}
        editable={isEditing}
        onChange={(list) => set('caseStudies', list)}
      />
    </div>
  );
};

export default MyPortfolio;