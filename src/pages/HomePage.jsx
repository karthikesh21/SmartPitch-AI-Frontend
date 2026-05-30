import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MagicBento from '../components/Effects/MagicBento';
import FloatingLines from '../components/Effects/FloatingLines';
import BrandLogo from '../components/Layout/BrandLogo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faBullseye, faRocket, faRobot, faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';
import { faSquareLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faPaperPlane } from '@fortawesome/free-regular-svg-icons';
import './HomePage.css';

const useScrollReveal = () => {
  useEffect(() => {
    const run = () => {
      const els = document.querySelectorAll('.sr:not(.sr--in)');
      els.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 40) el.classList.add('sr--in');
      });
    };
    run();
    window.addEventListener('scroll', run, { passive: true });
    return () => window.removeEventListener('scroll', run);
  }, []);
};

const Robot = () => (
  <div className="nb-robot">
    <div className="nb-robot__glow" />
    <div className="nb-robot__antenna"><div className="nb-robot__ball" /></div>
    <div className="nb-robot__head">
      <div className="nb-robot__screen">
        <div className="nb-robot__eyes"><div className="nb-robot__eye" /><div className="nb-robot__eye" /></div>
        <div className="nb-robot__smile" />
      </div>
    </div>
    <div className="nb-robot__body">
      <div className="nb-robot__panel">
        <div className="nb-robot__led" /><div className="nb-robot__led" /><div className="nb-robot__led" />
      </div>
    </div>
    <div className="nb-robot__arm nb-robot__arm--l" />
    <div className="nb-robot__arm nb-robot__arm--r" />
    <div className="nb-robot__holo">
      {[45, 70, 55, 85, 60].map((h, i) => <div key={i} className="nb-holo__bar" style={{ '--h': h + '%', '--d': i * 0.15 + 's' }} />)}
    </div>
    <div className="nb-robot__particles">
      {[0, 1, 2, 3].map(i => <div key={i} className="nb-particle" style={{ '--i': i }} />)}
    </div>
  </div>
);

const Loader = ({ out }) => (
  <div className={`nb-loader${out ? ' nb-loader--out' : ''}`}>
    <div className="nb-loader__bot">
      <div className="nb-loader__head"><div className="nb-loader__eye" /><div className="nb-loader__eye" /></div>
      <div className="nb-loader__body" />
    </div>
    <p>SmartPitch AI warming up…</p>
  </div>
);

const HomeNavbar = ({ navigate, isLoggedIn, logout }) => (
  <nav className="nb-nav">
    <div className="nb-nav__inner">
      <div className="nb-nav__logo" onClick={() => navigate('/')}>
        <BrandLogo size={32} fontSize="1.1rem" fontWeight={800} gap="10px" />
      </div>
      <ul className="nb-nav__links">
        <li><a href="#features">Features</a></li>
        <li><a href="#how-it-works">How It Works</a></li>
        <li>
          <button className="nb-nav__gen-link" onClick={() => navigate(isLoggedIn ? '/generator' : '/login')}>
            AI Pitch Generator
          </button>
        </li>
      </ul>
      <div className="nb-nav__acts">
        {isLoggedIn ? (
          <>
            <button className="nb-btn--ghost" onClick={() => { logout(); }}>Logout</button>
          </>
        ) : (
          <>
            <button className="nb-btn--ghost" onClick={() => navigate('/login')}>Login</button>
            <button className="nb-btn--orange" onClick={() => navigate('/signup')}>Sign Up</button>
          </>
        )}
      </div>
    </div>
  </nav>
);

const Hero = ({ navigate, isLoggedIn }) => {
  const [nums, setNums] = useState({ u: 0, p: 0 });
  useEffect(() => {
    let raf; let s = null;
    const run = ts => {
      if (!s) s = ts;
      const p = Math.min((ts - s) / 1600, 1);
      setNums({ u: Math.floor(p * 2700), p: Math.floor(p * 12000) });
      if (p < 1) raf = requestAnimationFrame(run);
    };
    const t = setTimeout(() => { raf = requestAnimationFrame(run); }, 1900);
    return () => { clearTimeout(t); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section className="nb-hero">
      <div className="nb-hero__shapes" aria-hidden>
        <div className="nb-shape nb-shape--1" /><div className="nb-shape nb-shape--2" /><div className="nb-shape nb-shape--3" />
      </div>
      <div className="nb-hero__left">
        <h1 className="nb-h1">
          Nail Every<br />
          <span className="nb-orange">Pitch Instantly</span><br />
          with AI.
        </h1>
        <p className="nb-hero__sub">
          Describe your product once and let SmartPitch AI generate high converting cold emails, LinkedIn outreach, ad copy, and call scripts in seconds.
        </p>
        <button className="nb-cta-btn" onClick={() => navigate(isLoggedIn ? '/generator' : '/login')}>
          {isLoggedIn ? '  Click to Generate Pitches' : 'Create Your First Pitch ⚡'}
        </button>
        <div className="nb-stats">
          <div className="nb-stat"><span className="nb-stat__n">{nums.u.toLocaleString()}+</span><span>Happy Customers</span></div>
          <div className="nb-stat__div" />
          <div className="nb-stat"><span className="nb-stat__n">{nums.p.toLocaleString()}+</span><span>Pitches Generated</span></div>
          <div className="nb-stat__div" />
          <div className="nb-stat"><span className="nb-stat__n">4.9⭐</span><span>Avg Rating</span></div>
        </div>
      </div>
      <div className="nb-hero__right"><Robot /></div>
    </section>
  );
};

const FEATURES_CARDS = [
  {
    icon: <FontAwesomeIcon icon={faEnvelope} />,
    title: 'High Converting Cold Emails',
    description: 'Generate personalized, attention grabbing email sequences designed to bypass the spam folder and secure meetings.',
    tag: 'Email',
  },
  {
    icon: <FontAwesomeIcon icon={faSquareLinkedin} />,
    title: 'LinkedIn Outreach',
    description: 'Craft optimized direct messages and professional posts that resonate with your target audience on the world\'s largest professional network.',
    tag: 'LinkedIn',
  },
  {
    icon: <FontAwesomeIcon icon={faPaperPlane} />,
    title: 'Ad Copy',
    description: 'Create compelling, click-worthy ad variants for social media and search campaigns to drive targeted traffic to your service.',
    tag: 'Advertisement',
  },
  {
    icon: <FontAwesomeIcon icon={faPhone} />,
    title: 'Structured Cold Call Scripts',
    description: 'Get structured, objection-handling phone scripts that help you pitch your application confidently and turn cold calls into warm leads.',
    tag: 'Call Script',
  },
];

const HOW_IT_WORKS_CARDS = [
  {
    color: '#060010',
    icon: <FontAwesomeIcon icon={faPencil} />,
    title: 'Define Your Vision',
    description: 'Input your application name and a brief description. Tell our AI exactly what makes your product unique and who your target audience is.',
    label: 'Step 1',
  },
  {
    color: '#060010',
    icon: <FontAwesomeIcon icon={faBullseye} />,
    title: 'Choose Your Channel',
    description: 'Select your battlefield. Whether you need a high converting Cold Email, a professional LinkedIn intro, a Advertisement copy, or a direct Cold Call script, we have you covered.',
    label: 'Step 2',
  },
  {
    color: '#060010',
    icon: <FontAwesomeIcon icon={faRobot} />,
    title: 'AI Magic',
    description: 'Our advanced models instantly process your inputs to craft tailored, persuasive sales pitches designed to bypass gatekeepers and win meetings.',
    label: 'Step 3',
  },
  {
    color: '#060010',
    icon: <FontAwesomeIcon icon={faRocket} />,
    title: 'Execute',
    description: 'Export your scripts directly to your clipboard or instantly open Gmail and LinkedIn to start connecting with prospects immediately. History is saved for easy access.',
    label: 'Step 4',
  },
];

const FeaturesSection = () => (
  <section id="features" className="nb-features-section">
    <h2 className="nb-section-title sr">Four Channels. One AI. Zero Guesswork.</h2>
    <p className="nb-section-sub sr">
      Describe your app or service once & get targeted pitch copy for every channel that matters.
    </p>
    <div className="nb-features-grid">
      {FEATURES_CARDS.map(({ icon, title, description, tag }, i) => (
        <div key={i} className="nb-feature-card sr" style={{ '--delay': i * 0.08 + 's' }}>
          <div className="nb-feature-card__tag">{tag}</div>
          <div className="nb-feature-card__icon">{icon}</div>
          <h3 className="nb-feature-card__title">{title}</h3>
          <p className="nb-feature-card__desc">{description}</p>
        </div>
      ))}
    </div>
  </section>
);

const HowItWorksSection = () => (
  <section id="how-it-works" className="nb-features-bento">
    <h2 className="nb-section-title sr">How It Works</h2>
    <p className="nb-section-sub sr">
      Four pitch formats. One click.
    </p>
    <MagicBento
      cards={HOW_IT_WORKS_CARDS}
      textAutoHide={true}
      enableStars={true}
      enableSpotlight={true}
      enableBorderGlow={true}
      enableTilt={false}
      enableMagnetism={false}
      clickEffect={true}
      spotlightRadius={400}
      particleCount={12}
      glowColor="132, 0, 255"
      disableAnimations={false}
    />
  </section>
);

const TESTI = [
  { name: 'Soma K.', role: 'VP Sales, Acme SaaS', quote: 'SmartPitch cut my pitch prep from 2 hours to 5 minutes. Reply rates up 40%.', avatar: '' },
  { name: 'Marcus S.', role: 'Founder, GrowthLoop', quote: 'The AI nails the tone every time. Cold emails finally feel human — and they convert.', avatar: '' },
  { name: 'Priya A.', role: 'AE, Series B Startup', quote: 'Four pitch formats in one click. I use the LinkedIn version daily. Game changer.', avatar: '' },
];
const Testimonials = () => (
  <section id="testimonials" className="nb-testi">
    <h2 className="nb-section-title sr">Loved by Sales Teams</h2>
    <div className="nb-testi__grid">
      {TESTI.map(({ name, role, quote, avatar }, i) => (
        <div key={i} className="nb-testi__card sr" style={{ '--delay': i * 0.1 + 's' }}>
          <p className="nb-testi__quote">"{quote}"</p>
          <div className="nb-testi__author">
            <span className="nb-testi__avatar">{avatar}</span>
            <div><strong>{name}</strong><small>{role}</small></div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const Footer = ({ navigate }) => (
  <footer className="nb-footer">
    <div className="nb-footer__inner">
      <div className="nb-footer__brand">
        <BrandLogo size={28} fontSize="1.1rem" fontWeight={800} gap="10px" />
      </div>
      <div className="nb-footer__links">
        <div><strong>Product</strong><a href="#features">Features</a><button className="nb-footer__link-btn" onClick={() => navigate('/generator')}>Generator</button></div>
        <div><strong>Company</strong><a href="#about">About</a><a href="mailto:karthikes004h@gmail.com">Contact</a></div>
        <div><strong>Legal</strong><a href="#privacy">Privacy</a><a href="#terms">Terms</a></div>
      </div>
    </div>
    <div className="nb-footer__bottom"><p>© 2026 SmartPitchAI. All rights reserved.</p></div>
  </footer>
);

const HomePage = () => {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();
  const [loaderOut, setLoaderOut] = useState(false);
  const [showPage, setShowPage] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLoaderOut(true), 1600);
    const t2 = setTimeout(() => setShowPage(true), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useScrollReveal();

  return (
    <div className="nb-page">

      <div className="nb-floatinglines-bg">
        <FloatingLines
          linesGradient={['#5c0aff', '#8b00ff', '#ff3cac', '#ff6b00']}
          enabledWaves={['top', 'middle', 'bottom']}
          lineCount={[8, 10, 6]}
          lineDistance={[4, 5, 6]}
          animationSpeed={0.6}
          interactive={true}
          bendRadius={4.0}
          bendStrength={-0.4}
          parallax={true}
          parallaxStrength={0.06}
          mixBlendMode="screen"
        />
      </div>

      {!showPage && <Loader out={loaderOut} />}
      {showPage && (
        <>
          <HomeNavbar navigate={navigate} isLoggedIn={isLoggedIn} logout={logout} />
          <Hero navigate={navigate} isLoggedIn={isLoggedIn} />
          <FeaturesSection />
          <HowItWorksSection />
          <Testimonials />
          <Footer navigate={navigate} />
        </>
      )}
    </div>
  );
};

export default HomePage;
