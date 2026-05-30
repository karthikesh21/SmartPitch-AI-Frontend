import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Hyperspeed from '../components/Effects/Hyperspeed';
import BorderGlow from '../components/Effects/BorderGlow';
import ClickSpark from '../components/Effects/ClickSpark';
import BrandLogo from '../components/Layout/BrandLogo';
import './GeneratorPage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL;
const API = `${API_BASE_URL}/pitch/cold-mail`;

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="2" y="4" width="20" height="16" rx="3"/><path d="m2 7 10 7 10-7"/>
  </svg>
);
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
  </svg>
);
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.6 12.14a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.51 1.5h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.5 16z"/>
  </svg>
);
const AdIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M3 11l19-9-9 19-2-8-8-2z"/>
  </svg>
);


const TYPES = [
  { id: 'email',    label: 'Mail Pitch',        icon: <MailIcon />,     color: '#FF6B35', desc: 'Cold email with subject & CTA' },
  { id: 'linkedin', label: 'LinkedIn Message',  icon: <LinkedInIcon />, color: '#0077B5', desc: 'Short, high-converting DM' },
  { id: 'coldCall', label: 'Cold Call Script',  icon: <PhoneIcon />,    color: '#22C55E', desc: 'Full script with objection handler' },
  { id: 'adCopy',   label: 'Advertising',       icon: <AdIcon />,       color: '#A855F7', desc: 'Ad copy that drives clicks' },
];

const copyText = (text) => navigator.clipboard.writeText(text);

const saveTxt = (content, name) => {
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([content], { type: 'text/plain' })),
    download: name,
  });
  a.click();
  URL.revokeObjectURL(a.href);
};

const flatEmail = (e) =>
  `Subject: ${e.subject}\n\n${e.intro}\n\n${e.body}\n\n${e.cta}`;
const flatLinkedIn = (l) => `${l.hook}\n\n${l.benefit}\n\n${l.cta}`;
const flatCall = (c) =>
  [c.opening, c.problemId, c.pitch, c.objection, c.closing].join('\n\n');
const flatAd = (a) => `${a.headline}\n\n${a.body}\n\n${a.cta}`;

const F = ({ label, value }) => (
  <div className="gp-ofield">
    <span className="gp-ofield__l">{label}</span>
    <p className="gp-ofield__v">{value}</p>
  </div>
);

const Output = ({ type, data }) => {
  const [copied, setCopied] = useState('');
  const doCopy = (text, key) => { copyText(text); setCopied(key); setTimeout(() => setCopied(''), 2000); };

  if (!data || !type) return null;

  const panels = {
    email: (
      <>
        <F label="Subject Line"            value={data.email.subject} />
        <F label="Personalized Intro"      value={data.email.intro}   />
        <F label="Problem → Solution → Value" value={data.email.body} />
        <F label="Call-to-Action"          value={data.email.cta}     />
        <div className="gp-oactions">
          <button onClick={() => doCopy(flatEmail(data.email), 'e')} className="gp-btn gp-btn--copy">{copied === 'e' ? '✓ Copied' : 'Copy Email'}</button>
          <button onClick={() => window.open('https://mail.google.com/', '_blank')} className="gp-btn gp-btn--action">📧 Open Gmail</button>
        </div>
      </>
    ),
    linkedin: (
      <>
        <F label="Hook"    value={data.linkedin.hook}    />
        <F label="Benefit" value={data.linkedin.benefit} />
        <F label="Soft CTA" value={data.linkedin.cta}   />
        <div className="gp-oactions">
          <button onClick={() => doCopy(flatLinkedIn(data.linkedin), 'l')} className="gp-btn gp-btn--copy">{copied === 'l' ? '✓ Copied' : 'Copy Message'}</button>
          <button onClick={() => window.open('https://www.linkedin.com/', '_blank')} className="gp-btn gp-btn--action">💼 Open LinkedIn</button>
        </div>
      </>
    ),
    coldCall: (
      <>
        <F label="Opening Line"         value={data.coldCall.opening}   />
        <F label="Problem Identification" value={data.coldCall.problemId}/>
        <F label="Pitch"                value={data.coldCall.pitch}     />
        <F label="Objection Handler"    value={data.coldCall.objection} />
        <F label="Closing Ask"          value={data.coldCall.closing}   />
        <div className="gp-oactions">
          <button onClick={() => doCopy(flatCall(data.coldCall), 'c')} className="gp-btn gp-btn--copy">{copied === 'c' ? '✓ Copied' : 'Copy Script'}</button>
          <button onClick={() => saveTxt(flatCall(data.coldCall), 'cold-call-script.txt')} className="gp-btn gp-btn--action">💾 Save .txt</button>
        </div>
      </>
    ),
    adCopy: (
      <>
        <F label="Headline"  value={data.adCopy.headline} />
        <F label="Body Copy" value={data.adCopy.body}     />
        <F label="CTA"       value={data.adCopy.cta}      />
        <div className="gp-oactions">
          <button onClick={() => doCopy(flatAd(data.adCopy), 'a')} className="gp-btn gp-btn--copy">{copied === 'a' ? '✓ Copied' : 'Copy Ad Copy'}</button>
        </div>
      </>
    ),
  };

  const t = TYPES.find(t => t.id === type);
  return (
    <div className="gp-output" style={{ '--accent': t?.color }}>
      <div className="gp-output__head">
        <span className="gp-output__icon">{t?.icon}</span>
        <h3>{t?.label}</h3>
      </div>
      <div className="gp-output__body">{panels[type]}</div>
    </div>
  );
};

const HistoryList = ({ history, onRestore }) => {
  if (!history.length) return null;
  return (
    <div className="gp-history">
      <h3>Recent Generations</h3>
      <div className="gp-history__list">
        {history.map(item => (
          <div key={item.id} className="gp-history__item" onClick={() => onRestore(item)}>
            <span className="gp-history__type">{TYPES.find(t => t.id === item.type)?.label}</span>
            <span className="gp-history__name">{item.serviceName}</span>
            <span className="gp-history__time">{new Date(item.timestamp).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const GeneratorPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();
  const [form, setForm] = useState({ serviceName: '', description: '' });
  const [activeType, setActiveType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('pitchHistory') || '[]'));
  const nameRef = useRef(null);
  const outputRef = useRef(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const generate = async (typeId) => {
    if (!form.serviceName.trim()) { nameRef.current?.focus(); return; }
    setActiveType(typeId);
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: form.serviceName,
          productDescription: form.description,
          targetRole: 'potential clients and decision makers',
          problem: `Challenges related to ${form.serviceName}`,
          valueProposition: form.description || form.serviceName,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.errors?.[0]?.msg || json.error || 'API error');
      setResult(json.data);

      const item = { id: Date.now(), type: typeId, ...form, data: json.data, timestamp: new Date().toISOString() };
      const next = [item, ...history].slice(0, 10);
      setHistory(next);
      localStorage.setItem('pitchHistory', JSON.stringify(next));

      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const restore = (item) => {
    setForm({ serviceName: item.serviceName, description: item.description });
    setActiveType(item.type);
    setResult(item.data);
  };

  return (
    <div className="gp-page">
      <div className="gp-bg"><Hyperspeed /></div>

      <nav className="gp-nav">
        <div className="gp-nav__inner">
          <div className="gp-nav__logo" onClick={() => navigate('/')}>
            <BrandLogo size={30} fontSize="1rem" fontWeight={800} gap="9px" />
          </div>
          <div className="gp-nav__acts">
            <button className="gp-nav__back" onClick={() => navigate('/')}>← Home</button>
            {isLoggedIn ? (
              <button className="gp-nav__logout" onClick={() => { logout(); navigate('/'); }}>Logout</button>
            ) : (
              <button className="gp-nav__login" onClick={() => navigate('/login')}>Login</button>
            )}
          </div>
        </div>
      </nav>

      <div className="gp-content">
        <div className="gp-hero">
          <h1>⚡ AI Pitch Generator</h1>
          <p>Describe your product — get 4 pitch formats powered by Groq AI.</p>
        </div>

        <div className="gp-form">
          <div className="gp-form__row">
            <div className="gp-form__group">
              <label>Service / App Name *</label>
              <input
                ref={nameRef}
                type="text"
                placeholder="e.g. SmartPitch AI"
                value={form.serviceName}
                onChange={e => set('serviceName', e.target.value)}
              />
            </div>
            <div className="gp-form__group gp-form__group--wide">
              <label>What does it do?</label>
              <input
                type="text"
                placeholder="Brief description of your product / service…"
                value={form.description}
                onChange={e => set('description', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="gp-cards">
          {TYPES.map(t => (
            <BorderGlow
              key={t.id}
              edgeSensitivity={30}
              glowColor="40 80 80"
              backgroundColor="#060010"
              borderRadius={28}
              glowRadius={40}
              glowIntensity={1}
              coneSpread={25}
              animated={false}
              colors={['#c084fc', '#f472b6', '#38bdf8']}
            >
              <ClickSpark sparkColor="#fff" sparkSize={10} sparkRadius={15} sparkCount={8} duration={400}>
                <div
                  className={`gp-card ${activeType === t.id ? 'gp-card--active' : ''} ${loading && activeType === t.id ? 'gp-card--loading' : ''}`}
                  onClick={() => !loading && generate(t.id)}
                  style={{ '--card-color': t.color }}
                >
                  <div className="gp-card__icon">{t.icon}</div>
                  <strong>{t.label}</strong>
                  <span>{t.desc}</span>
                  {loading && activeType === t.id && <div className="gp-card__spinner" />}
                </div>
              </ClickSpark>
            </BorderGlow>
          ))}
        </div>

        {error && <div className="gp-error">⚠️ {error}</div>}

        <div ref={outputRef}>
          <Output type={activeType} data={result} />
        </div>

        <HistoryList history={history} onRestore={restore} />
      </div>
    </div>
  );
};

export default GeneratorPage;
