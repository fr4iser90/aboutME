import { useEffect, useState } from 'react';
import { Button } from '@/presentation/shared/ui/button';
import { Section } from '@/domain/entities/Section';
import { useAdminSections } from '@/application/admin/sections/useSections';

interface SectionListProps {
  onEditSection?: (section: Section) => void;
}

export function SectionList({ onEditSection }: SectionListProps) {
  const { getAllSections } = useAdminSections();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoading(true);
        const data = await getAllSections();
        setSections(data);
      } catch (err) {
        setError('Failed to load sections');
      } finally {
        setLoading(false);
      }
    };
    fetchSections();
  }, []);

  if (loading) return <div>Loading sections...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="section-list">
      <h1 className="section-list-header">Sections</h1>
      {sections.map(section => (
        <div key={section.id} className="section-list-item">
          <div>
            <div className="section-list-title">{section.title}</div>
            <div className="section-list-meta">{section.name} ({section.type})</div>
          </div>
          <div className="section-list-actions">
            <Button size="sm" variant="outline" className="section-list-btn" onClick={() => onEditSection?.(section)}>Edit</Button>
            <Button size="sm" variant="destructive" className="section-list-btn">Delete</Button>
          </div>
        </div>
      ))}
      <Button className="section-list-add-btn">Add Section</Button>
    </div>
  );
} 