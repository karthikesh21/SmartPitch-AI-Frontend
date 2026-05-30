import React from 'react';
import './LandingPage.css';

const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowRightCircle = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="#fff" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const logos = [
  /* Vercel-style wordmark */
  <svg key="v" width="90" height="24" viewBox="0 0 90 24" fill="none">
    <polygon points="45,2 90,22 0,22" fill="#000" />
  </svg>,

  /* Linear-style */
  <svg key="l" width="96" height="24" viewBox="0 0 96 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="#000" />
    <path d="M6 12h12M12 6v12" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    <text x="28" y="17" fontFamily="Inter,sans-serif" fontWeight="700" fontSize="14" fill="#000">Linear</text>
  </svg>,

  /* Figma-style */
  <svg key="f" width="80" height="24" viewBox="0 0 80 24" fill="none">
    <rect x="2" y="2" width="10" height="10" rx="5" fill="#000" />
    <rect x="14" y="2" width="10" height="10" rx="5" fill="#000" />
    <rect x="2" y="14" width="10" height="10" rx="5" fill="#000" />
    <rect x="14" y="14" width="10" height="10" rx="3" fill="#000" />
    <text x="30" y="17" fontFamily="Inter,sans-serif" fontWeight="700" fontSize="14" fill="#000">Figma</text>
  </svg>,

  /* Notion-style */
  <svg key="n" width="92" height="24" viewBox="0 0 92 24" fill="none">
    <rect x="2" y="2" width="20" height="20" rx="4" fill="#000" />
    <text x="4" y="17" fontFamily="serif" fontWeight="900" fontSize="14" fill="#fff">N</text>
    <text x="28" y="17" fontFamily="Inter,sans-serif" fontWeight="700" fontSize="14" fill="#000">Notion</text>
  </svg>,

  /* Stripe-style */
  <svg key="s" width="74" height="24" viewBox="0 0 74 24" fill="none">
    <rect x="2" y="2" width="20" height="20" rx="10" fill="#000" />
    <path d="M7 14c0-2 2-3 5-3s5 1 5 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    <text x="28" y="17" fontFamily="Inter,sans-serif" fontWeight="700" fontSize="14" fill="#000">Stripe</text>
  </svg>,
];

const LandingPage = () => {
  return (
    <div className="lp-root">
      <div className="lp-bg">
        <div className="lp-bg-blob lp-bg-blob--1" />
        <div className="lp-bg-blob lp-bg-blob--2" />
      </div>

      <div className="lp-container">
        <div className="lp-navbar-wrap">
          <nav className="lp-navbar">
            <span className="lp-logo">Taskly</span>

            <ul className="lp-nav-links">
              {['Home', 'Features', 'Company', 'Pricing'].map(item => (
                <li key={item}><a href="#!">{item}</a></li>
              ))}
            </ul>

            <a href="#!" className="lp-nav-signup">
              SignUp <ArrowRight />
            </a>
          </nav>
        </div>

        <section className="lp-hero">
          <div className="lp-hero-left">
            <div className="lp-badge">
              <div className="lp-badge-stars">
                {[...Array(5)].map((_, i) => <span key={i}>★</span>)}
              </div>
              <span className="lp-badge-text">Rated 4.9/5 by 2700+ customers</span>
            </div>

            <h1 className="lp-headline">
              Work <em>smarter</em>,<br />achieve <em>faster</em>
            </h1>

            <p className="lp-subheadline">
              Effortlessly manage your projects, collaborate with your team, and achieve
              your goals with our intuitive task management tool.
            </p>

            <a href="#!" className="lp-cta">
              Get Started Now
              <span className="lp-cta-icon"><ArrowRightCircle /></span>
            </a>
          </div>

          <div className="lp-hero-right">
            <div className="lp-orb-wrap">
              <video
                className="lp-orb-video"
                src="https://future.co/images/homepage/glassy-orb/orb-purple.webm"
                autoPlay
                loop
                muted
                playsInline
              />
            </div>
          </div>
        </section>

        <div className="lp-trust">
          <span className="lp-trust-label">Trusted by Top-tier product companies</span>
          <div className="lp-trust-logos">
            {logos.map((logo, i) => (
              <div key={i} className="lp-trust-logo">{logo}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
