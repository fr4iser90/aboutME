import { useState } from 'react';
import { Section } from '@/domain/entities/Section';
import { Button } from '@/presentation/shared/ui/button';

interface SectionEditorProps {
  section?: Section | null;
  onSave: (section: Partial<Section>) => void;
  onCancel: () => void;
}

export function SectionEditor({ section, onSave, onCancel }: SectionEditorProps) {
  const [title, setTitle] = useState(section?.title || '');
  const [name, setName] = useState(section?.name || '');
  const [type, setType] = useState(section?.type || 'text');
  const [content, setContent] = useState(section?.content || '');
  const [isVisible, setIsVisible] = useState(section?.is_visible ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...section,
      title,
      name,
      type,
      content,
      is_visible: isVisible,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded">
      <h2 className="text-xl font-bold mb-2">{section ? 'Edit Section' : 'Add Section'}</h2>
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input className="w-full border rounded p-2" value={title} onChange={e => setTitle(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Name (unique)</label>
        <input className="w-full border rounded p-2" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Type</label>
        <input className="w-full border rounded p-2" value={type} onChange={e => setType(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Content</label>
        <textarea className="w-full border rounded p-2" value={content} onChange={e => setContent(e.target.value)} rows={4} />
      </div>
      <div>
        <label className="inline-flex items-center">
          <input type="checkbox" checked={isVisible} onChange={e => setIsVisible(e.target.checked)} />
          <span className="ml-2">Visible</span>
        </label>
      </div>
      <div className="flex gap-2">
        <Button type="submit">Save</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
} 