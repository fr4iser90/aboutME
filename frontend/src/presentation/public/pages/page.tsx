"use client"; // Required for useEffect and useState

import React, { useEffect, useState, FC } from 'react'; // Added FC
import { Navbar } from '@/presentation/public/components/layout/Navbar';
import { config } from '@/domain/shared/utils/config';
// import { projectApi } from '@/domain/shared/utils/api';
// Import existing section components - they will be refactored later
import About from '@/presentation/public/components/sections/About';
import Projects from '@/presentation/public/components/sections/Projects';
import Skills from '@/presentation/public/components/sections/Skills';
import NixOS from '@/presentation/public/components/sections/NixOS';
import Homelab from '@/presentation/public/components/sections/Homelab';
import Angeln from '@/presentation/public/components/sections/Angeln';
import { Container } from '@/presentation/shared/ui/Container';
import { Grid } from '@/presentation/shared/ui/Grid';
import { Section } from '@/presentation/shared/ui/Section';

// Define a type for the section data we expect from the API
interface ApiSection {
  id: number;
  name: string;
  title: string;
  type: string;
  content: any;
  order: number;
  created_at: string;
  updated_at: string;
}

export const HomeView: FC = () => { // Used FC type
  const [sections, setSections] = useState<ApiSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchSections() {
      try {
        const res = await fetch(`${config.backendUrl}/api/public/sections`);
        if (!res.ok) throw new Error('Failed to fetch sections');
        const data = await res.json();
        if (isMounted) {
          setSections(data);
          setError(null);
        }
      } catch (e: any) {
        if (isMounted) {
          console.error("Failed to fetch sections:", e);
          setError(e.message || 'Failed to fetch sections');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchSections();
    return () => {
      isMounted = false;
    };
  }, []);

  // For now, we'll keep the static Hero and Contact sections
  // and render the fetched sections data or the old static components
  // This part will be heavily refactored to dynamically render sections
  const renderOldStaticSections = () => (
    <>
      <About />
      <Skills />
      <NixOS />
      <Homelab />
      <Angeln />
      <Projects />
    </>
  );

  const renderSectionContent = (content: any) => {
    if (typeof content === 'string') {
      return <div dangerouslySetInnerHTML={{ __html: content }} />;
    }
    if (typeof content === 'object' && content !== null) {
      return <pre className="page-section-pre">{JSON.stringify(content, null, 2)}</pre>;
    }
    return <div>No content available</div>;
  };

  return (
    <>
      <Navbar />
      <main className="main-page">
        {/* Hero Section */}
        <Section className="hero-section">
          <div className="page-section-stars" style={{ position: 'absolute', inset: 0 }}></div>
          <Container className="hero-container">
            <h1 className="hero-title">
              Welcome to my website
            </h1>
            <p className="hero-subtitle">
              Exploring the cosmos of code and creativity
            </p>
            <div className="hero-buttons">
              <a href="#projects" className="hero-button-primary">
                View Projects
              </a>
              <a href="#contact" className="hero-button-secondary">
                Contact Me
              </a>
            </div>
          </Container>
        </Section>

        {/* Dynamic Sections Area */}
        <Section id="dynamic-content" className="dynamic-content-section">
          <Container className="dynamic-content-container">
            {loading ? (
              <div>
                <div className="loading-spinner"></div>
                <p className="loading-text">Loading sections...</p>
              </div>
            ) : error ? (
              <div>
                <p className="error-message">Error loading sections: {error}</p>
                <p className="error-subtext">Showing static content instead</p>
              </div>
            ) : sections.length > 0 ? (
              <div className="dynamic-content-grid">
                {sections.map((section) => (
                  <div key={section.id} className="dynamic-content-card">
                    <h3 className="dynamic-content-title">{section.title}</h3>
                    <div className="dynamic-content-text">
                      {renderSectionContent(section.content)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="loading-text">No sections data found from API.</p>
            )}
          </Container>
        </Section>

        {/* Old Static Sections (for reference) */}
        <Section>
          <Container>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', textAlign: 'center' }}>Old Static Sections (for reference)</h2>
            {renderOldStaticSections()}
          </Container>
        </Section>

        {/* Contact Section */}
        <Section id="contact">
          <Container>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '3rem', textAlign: 'center' }}>Get in Touch</h2>
            <Container style={{ maxWidth: 600, margin: '0 auto' }}>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label htmlFor="name" style={{ display: 'block', fontSize: '1rem', fontWeight: 500, color: 'var(--theme-text-secondary, #b0b0b0)' }}>
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    style={{ marginTop: '0.5rem', width: '100%', borderRadius: '0.5rem', background: 'var(--color-surface, #232946)', border: '1px solid var(--color-border, #444)', color: '#fff', padding: '0.75rem', fontSize: '1rem' }}
                  />
                </div>
                <div>
                  <label htmlFor="email" style={{ display: 'block', fontSize: '1rem', fontWeight: 500, color: 'var(--theme-text-secondary, #b0b0b0)' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    style={{ marginTop: '0.5rem', width: '100%', borderRadius: '0.5rem', background: 'var(--color-surface, #232946)', border: '1px solid var(--color-border, #444)', color: '#fff', padding: '0.75rem', fontSize: '1rem' }}
                  />
                </div>
                <div>
                  <label htmlFor="message" style={{ display: 'block', fontSize: '1rem', fontWeight: 500, color: 'var(--theme-text-secondary, #b0b0b0)' }}>
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    style={{ marginTop: '0.5rem', width: '100%', borderRadius: '0.5rem', background: 'var(--color-surface, #232946)', border: '1px solid var(--color-border, #444)', color: '#fff', padding: '0.75rem', fontSize: '1rem' }}
                  ></textarea>
                </div>
                <button
                  type="submit"
                  style={{ width: '100%', padding: '1rem 2rem', background: 'var(--theme-primary, #7c3aed)', color: '#fff', borderRadius: '0.5rem', fontWeight: 500, fontSize: '1.1rem', border: 'none', transition: 'background 0.2s' }}
                >
                  Send Message
                </button>
              </form>
            </Container>
          </Container>
        </Section>
      </main>
    </>
  );
}
