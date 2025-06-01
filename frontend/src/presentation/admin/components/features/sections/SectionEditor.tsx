import { useState } from 'react';
import { Section } from '@/domain/entities/Section';
import { Button } from '@/presentation/shared/ui/button';

function SectionPreview({ section }: { section: Partial<Section> }) {
  let content = section.content;
  if (content && typeof content === 'object' && 'text' in content) {
    content = content.text;
  }
  // Zusätzliche Felder für Bilder, Gallery, Links
  let imageUrl = '';
  let gallery: string[] = [];
  let links: { label: string; url: string }[] = [];
  if (section.content && typeof section.content === 'object') {
    imageUrl = section.content.image_url || '';
    gallery = section.content.gallery || [];
    links = section.content.links || [];
  }
  return (
    <div className="p-4 border rounded bg-white/10">
      <h3 className="text-lg font-bold mb-2">Live Preview</h3>
      <div className="mb-2 text-xl font-semibold">{section.title || <span className="italic text-gray-400">No title</span>}</div>
      <div className="mb-2 text-sm text-gray-500">{section.name} ({section.type})</div>
      {imageUrl && <img src={imageUrl} alt="Section" className="mb-2 max-h-32 rounded" />}
      {gallery && gallery.length > 0 && (
        <div className="flex gap-2 mb-2">
          {gallery.map((url, i) => (
            <img key={i} src={url} alt={`Gallery ${i}`} className="max-h-16 rounded" />
          ))}
        </div>
      )}
      <div className="mb-2 whitespace-pre-line">{content || <span className="italic text-gray-400">No content</span>}</div>
      {links && links.length > 0 && (
        <div className="mb-2">
          <span className="font-semibold">Links:</span>
          <ul className="list-disc ml-6">
            {links.map((l, i) => (
              <li key={i}><a href={l.url} className="text-blue-400 underline" target="_blank" rel="noopener noreferrer">{l.label}</a></li>
            ))}
          </ul>
        </div>
      )}
      <div className="text-xs text-gray-400">Visible: {section.is_visible ? 'Yes' : 'No'}</div>
    </div>
  );
}

interface SectionEditorProps {
  section?: Section | null;
  onSave: (section: Partial<Section>) => void;
  onCancel: () => void;
}

export function SectionEditor({ section, onSave, onCancel }: SectionEditorProps) {
  // Content-Felder
  const [title, setTitle] = useState(section?.title || '');
  const [name, setName] = useState(section?.name || '');
  const [type, setType] = useState(section?.type || 'text');
  const [text, setText] = useState(section?.content?.text || '');
  const [imageUrl, setImageUrl] = useState(section?.content?.image_url || '');
  const [gallery, setGallery] = useState<string[]>(section?.content?.gallery || []);
  const [galleryInput, setGalleryInput] = useState('');
  const [links, setLinks] = useState<{ label: string; url: string }[]>(section?.content?.links || []);
  const [linkLabel, setLinkLabel] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isVisible, setIsVisible] = useState(section?.is_visible ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...section,
      title,
      name,
      type,
      content: {
        text,
        image_url: imageUrl,
        gallery,
        links,
      },
      is_visible: isVisible,
    });
  };

  const previewSection: Partial<Section> = {
    ...section,
    title,
    name,
    type,
    content: {
      text,
      image_url: imageUrl,
      gallery,
      links,
    },
    is_visible: isVisible,
  };

  // Handler für Gallery und Links
  const handleAddGallery = () => {
    if (galleryInput.trim()) {
      setGallery([...gallery, galleryInput.trim()]);
      setGalleryInput('');
    }
  };
  const handleRemoveGallery = (idx: number) => {
    setGallery(gallery.filter((_, i) => i !== idx));
  };
  const handleAddLink = () => {
    if (linkLabel.trim() && linkUrl.trim()) {
      setLinks([...links, { label: linkLabel.trim(), url: linkUrl.trim() }]);
      setLinkLabel('');
      setLinkUrl('');
    }
  };
  const handleRemoveLink = (idx: number) => {
    setLinks(links.filter((_, i) => i !== idx));
  };

  return (
    <div className="flex gap-8">
      <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded w-1/2 bg-white/5">
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
          <label className="block text-sm font-medium mb-1">Text</label>
          <textarea className="w-full border rounded p-2" value={text} onChange={e => setText(e.target.value)} rows={3} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Image URL</label>
          <input className="w-full border rounded p-2" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Gallery (Bild-URLs, Komma getrennt)</label>
          <div className="flex gap-2 mb-2">
            <input className="flex-1 border rounded p-2" value={galleryInput} onChange={e => setGalleryInput(e.target.value)} placeholder="Bild-URL hinzufügen" />
            <Button type="button" onClick={handleAddGallery}>Add</Button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {gallery.map((url, idx) => (
              <div key={idx} className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded">
                <img src={url} alt="Gallery" className="h-8 w-8 object-cover rounded" />
                <Button type="button" size="sm" variant="destructive" onClick={() => handleRemoveGallery(idx)}>x</Button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Links</label>
          <div className="flex gap-2 mb-2">
            <input className="flex-1 border rounded p-2" value={linkLabel} onChange={e => setLinkLabel(e.target.value)} placeholder="Label" />
            <input className="flex-1 border rounded p-2" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="URL" />
            <Button type="button" onClick={handleAddLink}>Add</Button>
          </div>
          <div className="flex flex-col gap-1">
            {links.map((l, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded">
                <span>{l.label}:</span>
                <a href={l.url} className="text-blue-400 underline" target="_blank" rel="noopener noreferrer">{l.url}</a>
                <Button type="button" size="sm" variant="destructive" onClick={() => handleRemoveLink(idx)}>x</Button>
              </div>
            ))}
          </div>
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
      <div className="w-1/2">
        <SectionPreview section={previewSection} />
      </div>
    </div>
  );
} 