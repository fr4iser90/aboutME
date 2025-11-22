'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UserData {
  username: string;
  name: string;
  bio: string;
  avatar: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  html_url: string;
}

export default function PortfolioPreview() {
  const [user, setUser] = useState<UserData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Listen for live updates from editor
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'UPDATE_PORTFOLIO') {
        console.log('📡 Received portfolio update:', event.data.data);
        setUser(event.data.data);
        setLastUpdate(new Date());
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading initial data for preview...');
      
      // Load user data
      const userRes = await fetch(`${window.location.origin}/data/user/user.json`);
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
        console.log('✅ User data loaded');
      }

      // Load projects data
      const projectsRes = await fetch(`${window.location.origin}/data/projects/projects.json`);
      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(projectsData);
        console.log('✅ Projects data loaded');
      }

    } catch (error) {
      console.error('❌ Error loading initial data:', error);
    } finally {
      setLoading(false);
      console.log('✅ Initial data loading completed');
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#0a0a0a',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '20px' }}>🔄</div>
          <div>Loading Portfolio Preview...</div>
          <div style={{ fontSize: '12px', marginTop: '10px', color: '#888' }}>
            User: {user ? '✅' : '❌'} | Projects: {projects.length}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      {/* Preview Header */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        padding: '8px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        zIndex: 1000,
        color: '#888',
        borderBottom: '1px solid #333'
      }}>
        <span>👁️ Live Portfolio Preview</span>
        <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
      </div>

      <div style={{ marginTop: '40px' }}>
        {/* User Info */}
        {user && (
          <div style={{
            textAlign: 'center',
            marginBottom: '40px',
            padding: '20px',
            background: '#1a1a1a',
            borderRadius: '8px'
          }}>
            <h1 style={{ color: '#00d4ff', marginBottom: '10px' }}>{user.name}</h1>
            <p style={{ color: '#888', marginBottom: '20px' }}>@{user.username}</p>
            <p style={{ fontSize: '14px' }}>{user.bio}</p>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ 
              textAlign: 'center', 
              marginBottom: '20px',
              color: '#00d4ff'
            }}>
              Projects ({projects.length})
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {projects.slice(0, 6).map((project) => (
                <div key={project.id} style={{
                  background: '#1a1a1a',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid #333'
                }}>
                  <h3 style={{ color: '#ffffff', marginBottom: '10px' }}>
                    {project.name}
                  </h3>
                  <p style={{ color: '#888', fontSize: '14px', marginBottom: '15px' }}>
                    {project.description}
                  </p>
                  <a 
                    href={project.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      color: '#00d4ff',
                      textDecoration: 'none',
                      fontSize: '12px'
                    }}
                  >
                    View on GitHub →
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status */}
        <div style={{
          textAlign: 'center',
          padding: '20px',
          background: '#1a1a1a',
          borderRadius: '8px',
          border: '1px solid #333'
        }}>
          <div style={{ color: '#00ff88', marginBottom: '10px' }}>
            ✅ Preview is working!
          </div>
          <div style={{ fontSize: '12px', color: '#888' }}>
            User: {user ? '✅' : '❌'} | Projects: {projects.length} | Last Update: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}