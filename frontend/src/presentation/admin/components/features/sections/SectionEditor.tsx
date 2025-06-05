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
    <div className="section-preview">
      <h3 className="section-preview__title">Live Preview</h3>
      <div className="section-preview__section-title">{section.title || <span className="section-preview__placeholder">No title</span>}</div>
      <div className="section-preview__meta">{section.name} ({section.type})</div>
      {imageUrl && <img src={imageUrl} alt="Section" className="section-preview__image" />}
      {gallery && gallery.length > 0 && (
        <div className="section-preview__gallery">
          {gallery.map((url, i) => (
            <img key={i} src={url} alt={`Gallery ${i}`} className="section-preview__gallery-image" />
          ))}
        </div>
      )}
      <div className="section-preview__content">{content || <span className="section-preview__placeholder">No content</span>}</div>
      {links && links.length > 0 && (
        <div className="section-preview__links-container">
          <span className="section-preview__links-label">Links:</span>
          <ul className="section-preview__links-list">
            {links.map((l, i) => (
              <li key={i}><a href={l.url} className="section-editor__link" target="_blank" rel="noopener noreferrer">{l.label}</a></li>
            ))}
          </ul>
        </div>
      )}
      <div className="section-preview__visibility">Visible: {section.is_visible ? 'Yes' : 'No'}</div>
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
    <div className="section-editor">
      <form onSubmit={handleSubmit} className="section-editor__form">
        <h2 className="section-editor__title">{section ? 'Edit Section' : 'Add Section'}</h2>
        <div>
          <label className="section-editor__label">Title</label>
          <input className="section-editor__input" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="section-editor__label">Name (unique)</label>
          <input className="section-editor__input" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label className="section-editor__label">Type</label>
          <input className="section-editor__input" value={type} onChange={e => setType(e.target.value)} required />
        </div>
        <div>
          <label className="section-editor__label">Text</label>
          <textarea className="section-editor__textarea" value={text} onChange={e => setText(e.target.value)} rows={3} />
        </div>
        <div>
          <label className="section-editor__label">Image URL</label>
          <input className="section-editor__input" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
        </div>
        <div>
          <label className="section-editor__label">Gallery (Bild-URLs, Komma getrennt)</label>
          <div className="section-editor__input-group">
            <input className="section-editor__input" value={galleryInput} onChange={e => setGalleryInput(e.target.value)} placeholder="Bild-URL hinzufügen" />
            <Button type="button" onClick={handleAddGallery}>Add</Button>
          </div>
          <div className="section-editor__tag-container">
            {gallery.map((url, idx) => (
              <div key={idx} className="section-editor__tag">
                <img src={url} alt="Gallery" className="section-editor__tag-image" />
                <Button type="button" size="sm" variant="destructive" onClick={() => handleRemoveGallery(idx)}>x</Button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="section-editor__label">Links</label>
          <div className="section-editor__input-group">
            <input className="section-editor__input" value={linkLabel} onChange={e => setLinkLabel(e.target.value)} placeholder="Label" />
            <input className="section-editor__input" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="URL" />
            <Button type="button" onClick={handleAddLink}>Add</Button>
          </div>
          <div className="section-editor__link-list">
            {links.map((l, idx) => (
              <div key={idx} className="section-editor__link-item">
                <span>{l.label}:</span>
                <a href={l.url} className="section-editor__link" target="_blank" rel="noopener noreferrer">{l.url}</a>
                <Button type="button" size="sm" variant="destructive" onClick={() => handleRemoveLink(idx)}>x</Button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="section-editor__checkbox-label">
            <input type="checkbox" checked={isVisible} onChange={e => setIsVisible(e.target.checked)} />
            <span>Visible</span>
          </label>
        </div>
        <div className="section-editor__actions">
          <Button type="submit">Save</Button>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
      <div className="section-editor__preview-container">
        <SectionPreview section={previewSection} />
      </div>
    </div>
  );
}
