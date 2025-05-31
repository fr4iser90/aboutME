import { useEffect, useState } from 'react';
import { Button } from '@/presentation/shared/ui/button';
import { Section } from '@/domain/entities/Section';
import { useSections } from '@/application/admin/sections/useSections';

export function SectionList() {
  const { getSections } = useSections();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoading(true);
        const data = await getSections();
        setSections(data);
      } catch (err) {
        setError('Failed to load sections');
      } finally {
        setLoading(false);
      }
    };
    fetchSections();
  }, [getSections]);

  if (loading) return <div>Loading sections...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-4">Sections</h1>
      {sections.map(section => (
        <div key={section.id} className="p-4 border rounded flex justify-between items-center">
          <div>
            <div className="font-semibold">{section.title}</div>
            <div className="text-sm text-gray-500">{section.name} ({section.type})</div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">Edit</Button>
            <Button size="sm" variant="destructive">Delete</Button>
          </div>
        </div>
      ))}
      <Button className="mt-4">Add Section</Button>
    </div>
  );
} 