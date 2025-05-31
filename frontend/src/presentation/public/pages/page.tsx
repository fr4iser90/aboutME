"use client"; // Required for useEffect and useState

import React, { useEffect, useState, FC } from 'react'; // Added FC
import { Navbar } from '@/presentation/public/components/layout/Navbar';
import { apiRequest } from '@/domain/shared/utils/api'; // Corrected path
// Import existing section components - they will be refactored later
import About from '@/presentation/public/components/sections/About';
import Projects from '@/presentation/public/components/sections/Projects';
import Skills from '@/presentation/public/components/sections/Skills';
import NixOS from '@/presentation/public/components/sections/NixOS';
import Homelab from '@/presentation/public/components/sections/Homelab';
import Angeln from '@/presentation/public/components/sections/Angeln';

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
        const response = await apiRequest<ApiSection[]>('/api/public/sections'); // Renamed to response
        if (isMounted) {
          setSections(response.data); // Use response.data
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
      <main className="min-h-screen">
        {/* Hero Section (static for now) */}
        <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
          <div className="stars absolute inset-0"></div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h1 className="galaxy-text text-6xl md:text-7xl font-bold mb-6">
              Welcome to My Galaxy
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8">
              Exploring the cosmos of code and creativity
            </p>
            <div className="flex justify-center space-x-4">
              <a
                href="#projects"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
              >
                View Projects
              </a>
              <a
                href="#contact"
                className="px-6 py-3 border border-purple-600 hover:bg-purple-600/10 rounded-lg text-white font-medium transition-colors"
              >
                Contact Me
              </a>
            </div>
          </div>
        </section>

        {/* Dynamic Sections Area */}
        <section id="dynamic-content" className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                <p className="mt-4 text-slate-300">Loading sections...</p>
              </div>
            ) : error ? (
              <div className="text-center text-red-500">
                <p>Error loading sections: {error}</p>
                <p className="text-sm text-slate-400 mt-2">Showing static content instead</p>
              </div>
            ) : sections.length > 0 ? (
              <div className="space-y-8">
                {sections.map((section) => (
                  <div key={section.id} className="bg-slate-800 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 text-slate-200">{section.title}</h3>
                    <div className="text-slate-300">
                      {renderSectionContent(section.content)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-400">No sections data found from API.</p>
            )}
          </div>
        </section>
        
        {/* Placeholder for where dynamically rendered components will go. */}
        {/* For now, rendering the old static ones below the fetched data for comparison/layout continuity */}
        {/* This will be replaced by a dynamic renderer based on `sections` data */}
        <div className="my-10">
            <h2 className="text-3xl font-bold mb-8 galaxy-text text-center">Old Static Sections (for reference)</h2>
            {renderOldStaticSections()}
        </div>


        {/* Contact Section (static for now) */}
        <section id="contact" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold mb-12 galaxy-text text-center">Get in Touch</h2>
            <div className="max-w-2xl mx-auto">
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-300">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="mt-1 block w-full rounded-md bg-slate-900 border-slate-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="mt-1 block w-full rounded-md bg-slate-900 border-slate-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-300">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="mt-1 block w-full rounded-md bg-slate-900 border-slate-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
