'use client';

import { useState, useEffect } from 'react';
import { Theme } from '@/domain/entities/Theme';
import { AdminThemeApi } from '@/infrastructure/api/admin/themes';

export default function ThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeThemeId, setActiveThemeId] = useState<number | null>(null);

  const themeApi = new AdminThemeApi();

  useEffect(() => {
    loadThemes();
  }, []);

  const loadThemes = async () => {
    try {
      setLoading(true);
      const themesData = await themeApi.getAll();
      setThemes(themesData);
      
      // Find active theme
      const activeTheme = themesData.find((t: Theme) => t.is_active);
      setActiveThemeId(activeTheme?.id || null);
    } catch (err) {
      setError('Failed to load themes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const activateTheme = async (themeId: number) => {
    try {
      // Deactivate all themes first
      await Promise.all(
        themes.map(theme => 
          themeApi.update(theme.id!.toString(), { is_active: false })
        )
      );
      
      // Activate the selected theme
      await themeApi.update(themeId.toString(), { is_active: true });
      
      setActiveThemeId(themeId);
      await loadThemes(); // Reload to get updated data
    } catch (err) {
      setError('Failed to activate theme');
      console.error(err);
    }
  };

  const deleteTheme = async (themeId: number) => {
    if (!confirm('Are you sure you want to delete this theme?')) return;
    
    try {
      await themeApi.delete(themeId.toString());
      await loadThemes();
    } catch (err) {
      setError('Failed to delete theme');
      console.error(err);
    }
  };

  if (loading) return <div className="p-8">Loading themes...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Theme Management</h1>
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => window.location.href = '/admin/themes/new'}
        >
          Create New Theme
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {themes.map((theme) => (
          <div 
            key={theme.id} 
            className={`border rounded-lg p-6 ${
              theme.is_active ? 'border-green-500 bg-green-50' : 'border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">{theme.name}</h3>
              {theme.is_active && (
                <span className="bg-green-500 text-white px-2 py-1 rounded text-sm">
                  Active
                </span>
              )}
            </div>
            
            <p className="text-gray-600 mb-4">{theme.description}</p>
            
            {/* Theme Preview */}
            <div className="mb-4 p-3 rounded border" style={{
              background: theme.style_properties.colors.background,
              color: theme.style_properties.colors.foreground,
              borderColor: theme.style_properties.colors.cardBorder
            }}>
              <div className="text-sm">
                <div style={{ color: theme.style_properties.colors.primary }}>Primary</div>
                <div style={{ color: theme.style_properties.colors.secondary }}>Secondary</div>
                <div style={{ color: theme.style_properties.colors.accent }}>Accent</div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.location.href = `/admin/themes/${theme.id}`}
                className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
              >
                Edit
              </button>
              
              {!theme.is_active && (
                <button
                  onClick={() => activateTheme(theme.id!)}
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                >
                  Activate
                </button>
              )}
              
              {!theme.is_active && (
                <button
                  onClick={() => deleteTheme(theme.id!)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 