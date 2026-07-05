import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  // Split content into blocks by double newlines or HTML embed boundaries
  // We want to detect HTML tags like <iframe>, <video>, <embed>, <object> and treat them as separate block entities
  const blocks: { type: 'markdown' | 'html'; value: string }[] = [];
  
  // Regex to extract iframe/video/embed blocks
  const htmlEmbedRegex = /(<iframe[^>]*>.*?<\/iframe>|<video[^>]*>.*?<\/video>|<div[^>]*>.*?<\/div>|<embed[^>]*\/?>|<object[^>]*>.*?<\/object>)/gi;
  
  const parts = content.split(htmlEmbedRegex);
  
  for (const part of parts) {
    if (!part.trim()) continue;
    if (part.trim().startsWith('<iframe') || part.trim().startsWith('<video') || part.trim().startsWith('<div') || part.trim().startsWith('<embed') || part.trim().startsWith('<object')) {
      blocks.push({ type: 'html', value: part });
    } else {
      blocks.push({ type: 'markdown', value: part });
    }
  }

  // Helper to parse inline markdown (bold, italic, links, inline code)
  const parseInline = (text: string): React.ReactNode[] => {
    // Regex for bold (**text**), italic (*text*), inline code (`code`), links ([text](url)), images (![alt](url))
    const inlineRegex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|!\[.*?\]\(.*?\)|\[.*?\]\(.*?\))/g;
    const segments = text.split(inlineRegex);
    
    return segments.map((seg, i) => {
      if (seg.startsWith('**') && seg.endsWith('**')) {
        return <strong key={i} className="font-extrabold text-white">{seg.slice(2, -2)}</strong>;
      }
      if (seg.startsWith('*') && seg.endsWith('*')) {
        return <em key={i} className="italic text-slate-300">{seg.slice(1, -1)}</em>;
      }
      if (seg.startsWith('`') && seg.endsWith('`')) {
        return <code key={i} className="px-1.5 py-0.5 rounded bg-slate-900/60 font-mono text-xs text-amber-200 border border-white/5">{seg.slice(1, -1)}</code>;
      }
      if (seg.startsWith('![') && seg.includes('](')) {
        const match = seg.match(/!\[(.*?)\]\((.*?)\)/);
        if (match) {
          return (
            <span key={i} className="block my-4 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
              <img src={match[2]} alt={match[1]} className="w-full h-auto max-h-[400px] object-cover" referrerPolicy="no-referrer" />
              {match[1] && <span className="block text-center text-xs text-slate-400 mt-2 italic">{match[1]}</span>}
            </span>
          );
        }
      }
      if (seg.startsWith('[') && seg.includes('](')) {
        const match = seg.match(/\[(.*?)\]\((.*?)\)/);
        if (match) {
          return (
            <a key={i} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-[#F4EE8E] hover:underline hover:text-amber-200 font-semibold transition-colors">
              {match[1]}
            </a>
          );
        }
      }
      return seg;
    });
  };

  // Helper to render markdown blocks
  const renderMarkdownBlock = (text: string, blockIndex: number) => {
    const lines = text.split('\n');
    let inList = false;
    let listItems: string[] = [];
    let isOrderedList = false;
    const elements: React.ReactNode[] = [];

    const flushList = (key: string) => {
      if (listItems.length > 0) {
        if (isOrderedList) {
          elements.push(
            <ol key={key} className="list-decimal pl-6 my-4 space-y-2 text-slate-300">
              {listItems.map((item, idx) => (
                <li key={idx} className="leading-relaxed">{parseInline(item)}</li>
              ))}
            </ol>
          );
        } else {
          elements.push(
            <ul key={key} className="my-4 space-y-2 text-slate-300">
              {listItems.map((item, idx) => (
                <li key={idx} className="leading-relaxed flex items-start gap-2">
                  <span className="text-[#E7C768] mt-1.5 font-bold text-xs select-none">•</span>
                  <span>{parseInline(item)}</span>
                </li>
              ))}
            </ul>
          );
        }
        listItems = [];
        inList = false;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Headers
      if (trimmed.startsWith('# ')) {
        flushList(`list-${blockIndex}-${i}`);
        elements.push(
          <h1 key={`h1-${blockIndex}-${i}`} className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] bg-clip-text text-transparent font-sans mt-8 mb-4 tracking-tight">
            {trimmed.slice(2)}
          </h1>
        );
      } else if (trimmed.startsWith('## ')) {
        flushList(`list-${blockIndex}-${i}`);
        elements.push(
          <h2 key={`h2-${blockIndex}-${i}`} className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] bg-clip-text text-transparent font-sans mt-7 mb-3.5 tracking-tight border-b border-white/5 pb-2">
            {trimmed.slice(3)}
          </h2>
        );
      } else if (trimmed.startsWith('### ')) {
        flushList(`list-${blockIndex}-${i}`);
        elements.push(
          <h3 key={`h3-${blockIndex}-${i}`} className="text-lg sm:text-xl font-bold bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] bg-clip-text text-transparent font-sans mt-6 mb-3">
            {trimmed.slice(4)}
          </h3>
        );
      } else if (trimmed.startsWith('#### ')) {
        flushList(`list-${blockIndex}-${i}`);
        elements.push(
          <h4 key={`h4-${blockIndex}-${i}`} className="text-base sm:text-lg font-bold text-slate-100 font-sans mt-5 mb-2">
            {trimmed.slice(5)}
          </h4>
        );
      }
      // Blockquotes
      else if (trimmed.startsWith('>')) {
        flushList(`list-${blockIndex}-${i}`);
        // Read further lines that start with quote to support multi-line blockquotes
        let quoteContent = trimmed.slice(1).trim();
        while (i + 1 < lines.length && lines[i + 1].trim().startsWith('>')) {
          i++;
          quoteContent += '\n' + lines[i].trim().slice(1).trim();
        }
        elements.push(
          <blockquote key={`quote-${blockIndex}-${i}`} className="border-l-4 border-[#E7C768] pl-5 italic text-slate-200 my-6 bg-gradient-to-r from-amber-400/5 to-transparent py-3 pr-4 rounded-r-2xl font-sans">
            {parseInline(quoteContent)}
          </blockquote>
        );
      }
      // Bullet lists
      else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        if (!inList || isOrderedList) {
          flushList(`list-${blockIndex}-${i}`);
          inList = true;
          isOrderedList = false;
        }
        listItems.push(trimmed.slice(2));
      }
      // Numbered lists
      else if (/^\d+\.\s/.test(trimmed)) {
        if (!inList || !isOrderedList) {
          flushList(`list-${blockIndex}-${i}`);
          inList = true;
          isOrderedList = true;
        }
        const itemText = trimmed.replace(/^\d+\.\s/, '');
        listItems.push(itemText);
      }
      // Empty line
      else if (!trimmed) {
        flushList(`list-${blockIndex}-${i}`);
      }
      // Code blocks
      else if (trimmed.startsWith('```')) {
        flushList(`list-${blockIndex}-${i}`);
        const lang = trimmed.slice(3).trim();
        let code = '';
        while (i + 1 < lines.length && !lines[i + 1].trim().startsWith('```')) {
          i++;
          code += lines[i] + '\n';
        }
        if (i + 1 < lines.length) i++; // skip closing ```
        elements.push(
          <pre key={`code-${blockIndex}-${i}`} className="p-4 rounded-xl bg-slate-900/80 border border-white/10 font-mono text-xs text-amber-200 overflow-x-auto my-5 shadow-inner">
            {lang && <span className="block text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-2 border-b border-white/5 pb-1">{lang}</span>}
            <code>{code}</code>
          </pre>
        );
      }
      // Ordinary text paragraph
      else {
        flushList(`list-${blockIndex}-${i}`);
        elements.push(
          <p key={`p-${blockIndex}-${i}`} className="leading-relaxed text-slate-200 mb-4 text-sm sm:text-base font-sans">
            {parseInline(line)}
          </p>
        );
      }
    }

    // Flush any trailing lists
    flushList(`list-trail-${blockIndex}`);

    return <div key={`markdown-block-${blockIndex}`} className="space-y-2">{elements}</div>;
  };

  return (
    <div className="space-y-6 text-slate-200 leading-relaxed font-sans" id="markdown-rendered-body">
      {blocks.map((block, index) => {
        if (block.type === 'html') {
          // Responsive video/frame container
          return (
            <div 
              key={`html-${index}`} 
              className="w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl my-6 relative aspect-video"
              dangerouslySetInnerHTML={{ __html: block.value }}
              id={`embed-container-${index}`}
            />
          );
        } else {
          return renderMarkdownBlock(block.value, index);
        }
      })}
    </div>
  );
}
