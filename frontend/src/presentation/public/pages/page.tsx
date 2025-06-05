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
      return <pre className="whitespace-pre-wrap">{JSON.stringify(content, null, 2)}</pre>;
    }
    return <div>No content available</div>;
  };

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh' }}>
        {/* Hero Section */}
        <Section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          <div className="stars" style={{ position: 'absolute', inset: 0 }}></div>
          <Container style={{ textAlign: 'center', position: 'relative', zIndex: 10 }}>
            <h1 style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              Welcome to My Galaxy
            </h1>
            <p style={{ fontSize: '1.5rem', color: 'var(--color-text-secondary, #b0b0b0)', marginBottom: '2rem' }}>
              Exploring the cosmos of code and creativity
            </p>
            <Grid columns={2} gap="1.5rem" style={{ justifyContent: 'center', width: 'fit-content', margin: '0 auto' }}>
              <a
                href="#projects"
                style={{ padding: '1rem 2rem', background: 'var(--color-primary, #7c3aed)', color: '#fff', borderRadius: '0.5rem', fontWeight: 500, textDecoration: 'none', transition: 'background 0.2s' }}
              >
                View Projects
              </a>
              <a
                href="#contact"
                style={{ padding: '1rem 2rem', border: '2px solid var(--color-primary, #7c3aed)', color: '#fff', borderRadius: '0.5rem', fontWeight: 500, textDecoration: 'none', background: 'transparent', transition: 'background 0.2s' }}
              >
                Contact Me
              </a>
            </Grid>
          </Container>
        </Section>

        {/* Dynamic Sections Area */}
        <Section id="dynamic-content">
          <Container>
            {loading ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', borderBottom: '2px solid var(--color-primary, #7c3aed)', margin: '0 auto', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary, #b0b0b0)' }}>Loading sections...</p>
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', color: 'red' }}>
                <p>Error loading sections: {error}</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary, #b0b0b0)', marginTop: '0.5rem' }}>Showing static content instead</p>
              </div>
            ) : sections.length > 0 ? (
              <Grid columns={1} gap="2rem">
                {sections.map((section) => (
                  <div key={section.id} style={{ background: 'var(--color-surface, #232946)', padding: '2rem', borderRadius: '1rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-text, #fff)' }}>{section.title}</h3>
                    <div style={{ color: 'var(--color-text-secondary, #b0b0b0)' }}>
                      {renderSectionContent(section.content)}
                    </div>
                  </div>
                ))}
              </Grid>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--color-text-secondary, #b0b0b0)' }}>No sections data found from API.</p>
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
                  <label htmlFor="name" style={{ display: 'block', fontSize: '1rem', fontWeight: 500, color: 'var(--color-text-secondary, #b0b0b0)' }}>
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    style={{ marginTop: '0.5rem', width: '100%', borderRadius: '0.5rem', background: 'var(--color-surface, #232946)', border: '1px solid var(--color-border, #444)', color: '#fff', padding: '0.75rem', fontSize: '1rem' }}
                  />
                </div>
                <div>
                  <label htmlFor="email" style={{ display: 'block', fontSize: '1rem', fontWeight: 500, color: 'var(--color-text-secondary, #b0b0b0)' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    style={{ marginTop: '0.5rem', width: '100%', borderRadius: '0.5rem', background: 'var(--color-surface, #232946)', border: '1px solid var(--color-border, #444)', color: '#fff', padding: '0.75rem', fontSize: '1rem' }}
                  />
                </div>
                <div>
                  <label htmlFor="message" style={{ display: 'block', fontSize: '1rem', fontWeight: 500, color: 'var(--color-text-secondary, #b0b0b0)' }}>
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
                  style={{ width: '100%', padding: '1rem 2rem', background: 'var(--color-primary, #7c3aed)', color: '#fff', borderRadius: '0.5rem', fontWeight: 500, fontSize: '1.1rem', border: 'none', transition: 'background 0.2s' }}
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
