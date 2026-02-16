import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import "../Styles/HomePage.css";
import monthComparison from '../images/monthly-comparison.png';
import monthSpend from '../images/monthly-spend.png';

const features = [
  {
    title: "Extract key fields with precision",
    desc: "Billwise detects merchant name, total amount, and date automatically using OCR + object detection."
  },
  {
    title: "Turn receipts into structured records",
    desc: "Convert raw receipts into clean, searchable, and export-ready expense records."
  },
  {
    title: "Process receipts at scale",
    desc: "Upload multiple receipts and process them with logs, timestamps, and status tracking."
  },
  {
    title: "Designed to support you — now and later",
    desc: "Start simple and grow into batch uploads, analytics, and team workflows."
  }
];

const capabilities = [
  {
    title: "Receipt Scanning",
    desc: "Extract details like amount, vendor, and date from your bills automatically."
  },
  {
    title: "Visual Analytics",
    desc: "Understand your spending through intuitive graphs and trends."
  },
  {
    title: "Smart Categorization",
    desc: "Automatically sort your expenses into categories like food, travel, and utilities."
  },
  {
    title: "Organized Storage",
    desc: "Keep all your bills, invoices, and summaries securely in one place."
  }
];

function HomePage() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive(prev => (prev + 1) % features.length);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <p className="hero-label">Powered by Computer Vision & OCR</p>
            <h1 className="hero-title">
              Stop tracking expenses everywhere
            </h1>
            <p className="hero-subtitle">
              From diaries to notes to random bill photos — bring it all together with Billwise.
            </p>
            <div className="hero-actions">
              <Link to="/upload" className="btn btn-primary">
                Upload your first bill
              </Link>
              <Link to="/login" className="btn btn-secondary">
                Learn more
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat">
              <div className="stat-value">10,000+</div>
              <div className="stat-label">Bills processed</div>
            </div>
            <div className="stat">
              <div className="stat-value">98%</div>
              <div className="stat-label">Accuracy rate</div>
            </div>
            <div className="stat">
              <div className="stat-value">&lt;2s</div>
              <div className="stat-label">Processing time</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section">
        <div className="container">
          <h2 className="section-title">How it works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">01</div>
              <h3 className="step-title">Upload</h3>
              <p className="step-desc">Take a photo or upload your receipt</p>
            </div>
            <div className="step">
              <div className="step-number">02</div>
              <h3 className="step-title">Extract</h3>
              <p className="step-desc">AI extracts key details instantly</p>
            </div>
            <div className="step">
              <div className="step-number">03</div>
              <h3 className="step-title">Track</h3>
              <p className="step-desc">Monitor spending with smart analytics</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Billwise</h2>
          <p className="section-subtitle">
            Scale expense reporting with intelligent OCR and receipt detection powered by computer vision.
          </p>
          
          <div className="features-list">
            {features.map((f, i) => (
              <div
                key={i}
                onClick={() => setActive(i)}
                className={`feature-item ${i === active ? "active" : ""}`}
              >
                <div className="feature-header">
                  <h3 className="feature-title">{f.title}</h3>
                  <span className="feature-icon">{i === active ? "−" : "+"}</span>
                </div>
                {i === active && (
                  <p className="feature-desc">{f.desc}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities Grid */}
      <section className="capabilities-section">
        <div className="container">
          <h2 className="section-title">Automate your expense workflow</h2>
          <div className="capabilities-grid">
            {capabilities.map((cap, i) => (
              <div key={i} className="capability-card">
                <h3 className="capability-title">{cap.title}</h3>
                <p className="capability-desc">{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics Preview */}
      <section className="analytics-section">
        <div className="container">
          <h2 className="section-title">Visualize your spending</h2>
          <p className="section-subtitle">
            Get instant insights, monthly summaries, and spending breakdowns.
          </p>
          
          <div className="analytics-grid">
            <div className="analytics-card">
              <div className="card-header">
                <h3 className="card-title">This month's spending</h3>
              </div>
              <div className="card-image">
                <img src={monthSpend} alt="Monthly spending chart" />
              </div>
            </div>

            <div className="analytics-card">
              <div className="card-header">
                <h3 className="card-title">Receipts processed</h3>
              </div>
              <div className="card-stats">
                <div className="stat-row">
                  <span className="stat-number">124</span>
                  <span className="stat-text">Total receipts</span>
                </div>
                <div className="stat-row">
                  <span className="stat-number">9</span>
                  <span className="stat-text">This week</span>
                </div>
              </div>
            </div>

            <div className="analytics-card">
              <div className="card-header">
                <h3 className="card-title">Monthly comparison</h3>
              </div>
              <div className="card-image">
                <img src={monthComparison} alt="Monthly comparison chart" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to simplify your expense tracking?</h2>
            <p className="cta-subtitle">
              Join thousands of users who trust Billwise for accurate, automated expense management.
            </p>
            <Link to="/signup" className="btn btn-primary">
              Get started free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;