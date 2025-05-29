"use client"; // Required for useEffect and useState

import React, { useEffect, useState, FC } from 'react'; // Added FC
import Navbar from '@/components/layout/Navbar';
import { apiRequest } from '@/lib/api';
// Import existing section components - they will be refactored later
import About from '@/components/sections/About';
import Projects from '@/components/sections/Projects';
import Skills from '@/components/sections/Skills';
import NixOS from '@/components/sections/NixOS';
import Homelab from '@/components/sections/Homelab';
import Angeln from '@/components/sections/Angeln';

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

const Home: FC = () => { // Used FC type
  const [sections, setSections] = useState<ApiSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSections() {
      try {
        const data = await apiRequest('/api/public/sections') as ApiSection[];
        setSections(data);
      } catch (e: any) {
        setError(e.message);
        console.error("Failed to fetch sections:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchSections();
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
            <h2 className="text-3xl font-bold mb-8 galaxy-text text-center">Fetched Sections Data</h2>
            {loading && <p className="text-center text-slate-300">Loading sections...</p>}
            {error && <p className="text-center text-red-500">Error loading sections: {error}</p>}
            {!loading && !error && sections.length > 0 && (
              <div className="bg-slate-800 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-2 text-slate-200">API Response:</h3>
                <pre className="text-sm text-slate-300 whitespace-pre-wrap">
                  {JSON.stringify(sections, null, 2)}
                </pre>
              </div>
            )}
            {!loading && !error && sections.length === 0 && (
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

export default Home;
