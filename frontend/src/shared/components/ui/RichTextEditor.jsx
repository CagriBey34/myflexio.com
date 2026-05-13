import { useEffect, useRef } from 'react';
import {
    Bold, Italic, Underline, List, ListOrdered,
    Link, Image, Video, AlignLeft, AlignCenter, AlignRight,
    Heading1, Heading2, Heading3, Quote, Minus, Undo, Redo
} from 'lucide-react';

function ToolbarButton({ onClick, title, children, active }) {
    return (
        <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onClick(); }}
            title={title}
            className={`p-2 rounded-lg transition-colors text-slate-600 hover:bg-slate-100 hover:text-slate-900 ${active ? 'bg-blue-50 text-blue-600' : ''}`}
        >
            {children}
        </button>
    );
}

function Divider() {
    return <div className="w-px h-6 bg-slate-200 mx-1 self-center" />;
}

export default function RichTextEditor({ value, onChange, placeholder }) {
    const editorRef = useRef(null);
    // Track whether we set the content initially
    const isInitialized = useRef(false);

    // Initialize content only once on mount or when id changes
    useEffect(() => {
        if (editorRef.current && !isInitialized.current) {
            editorRef.current.innerHTML = value || '';
            isInitialized.current = true;
        }
    }, []);

    // When value is externally set (e.g. edit mode loads article), sync it once
    useEffect(() => {
        if (editorRef.current && value && !editorRef.current.innerHTML) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    const exec = (command, val = null) => {
        editorRef.current?.focus();
        document.execCommand(command, false, val);
        syncContent();
    };

    const syncContent = () => {
        if (onChange && editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const insertLink = () => {
        const selection = window.getSelection();
        const selectedText = selection?.toString() || '';
        const url = prompt('Link URL\'sini girin:', 'https://');
        if (url) {
            if (selectedText) {
                exec('createLink', url);
            } else {
                const anchor = `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
                exec('insertHTML', anchor);
            }
        }
    };

    const insertImage = () => {
        const url = prompt('Resim URL\'sini girin:', 'https://');
        if (url) {
            exec('insertHTML', `<img src="${url}" alt="görsel" style="max-width:100%;border-radius:8px;margin:8px 0;" />`);
        }
    };

    const insertVideo = () => {
        const url = prompt('Video linkini girin (YouTube veya doğrudan URL):', 'https://www.youtube.com/watch?v=');
        if (!url) return;

        // YouTube embed dönüşümü
        let embedHtml = '';
        const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (ytMatch) {
            const videoId = ytMatch[1];
            embedHtml = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:12px 0;">
  <iframe src="https://www.youtube.com/embed/${videoId}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen loading="lazy"></iframe>
</div>`;
        } else {
            embedHtml = `<video src="${url}" controls style="max-width:100%;border-radius:8px;margin:8px 0;"></video>`;
        }
        exec('insertHTML', embedHtml);
    };

    const insertQuote = () => {
        exec('formatBlock', '<blockquote>');
    };

    const insertHr = () => {
        exec('insertHTML', '<hr style="border:none;border-top:2px solid #e2e8f0;margin:16px 0;" />');
    };

    const handleKeyDown = (e) => {
        // Tab tuşu: 2 boşluk ekle
        if (e.key === 'Tab') {
            e.preventDefault();
            exec('insertHTML', '&nbsp;&nbsp;');
        }
    };

    const showPlaceholder = !value || value === '<br>' || value === '';

    return (
        <div className="border-2 border-slate-100 rounded-2xl overflow-hidden focus-within:border-blue-300 transition-colors">
            {/* Toolbar */}
            <div className="bg-slate-50 border-b border-slate-100 p-2 flex flex-wrap gap-0.5 items-center">
                {/* Başlıklar */}
                <ToolbarButton onClick={() => exec('formatBlock', '<h1>')} title="Başlık 1">
                    <Heading1 size={17} />
                </ToolbarButton>
                <ToolbarButton onClick={() => exec('formatBlock', '<h2>')} title="Başlık 2">
                    <Heading2 size={17} />
                </ToolbarButton>
                <ToolbarButton onClick={() => exec('formatBlock', '<h3>')} title="Başlık 3">
                    <Heading3 size={17} />
                </ToolbarButton>

                <Divider />

                {/* Biçimlendirme */}
                <ToolbarButton onClick={() => exec('bold')} title="Kalın (Ctrl+B)">
                    <Bold size={17} />
                </ToolbarButton>
                <ToolbarButton onClick={() => exec('italic')} title="İtalik (Ctrl+I)">
                    <Italic size={17} />
                </ToolbarButton>
                <ToolbarButton onClick={() => exec('underline')} title="Altı Çizili (Ctrl+U)">
                    <Underline size={17} />
                </ToolbarButton>

                <Divider />

                {/* Hizalama */}
                <ToolbarButton onClick={() => exec('justifyLeft')} title="Sola Hizala">
                    <AlignLeft size={17} />
                </ToolbarButton>
                <ToolbarButton onClick={() => exec('justifyCenter')} title="Ortala">
                    <AlignCenter size={17} />
                </ToolbarButton>
                <ToolbarButton onClick={() => exec('justifyRight')} title="Sağa Hizala">
                    <AlignRight size={17} />
                </ToolbarButton>

                <Divider />

                {/* Listeler */}
                <ToolbarButton onClick={() => exec('insertUnorderedList')} title="Madde İşaretli Liste">
                    <List size={17} />
                </ToolbarButton>
                <ToolbarButton onClick={() => exec('insertOrderedList')} title="Numaralı Liste">
                    <ListOrdered size={17} />
                </ToolbarButton>

                <Divider />

                {/* Alıntı & Ayırıcı */}
                <ToolbarButton onClick={insertQuote} title="Alıntı Ekle">
                    <Quote size={17} />
                </ToolbarButton>
                <ToolbarButton onClick={insertHr} title="Yatay Çizgi Ekle">
                    <Minus size={17} />
                </ToolbarButton>

                <Divider />

                {/* Medya */}
                <ToolbarButton onClick={insertLink} title="Link Ekle">
                    <Link size={17} />
                </ToolbarButton>
                <ToolbarButton onClick={insertImage} title="Resim URL Ekle">
                    <Image size={17} />
                </ToolbarButton>
                <ToolbarButton onClick={insertVideo} title="Video Linki Ekle (YouTube destekli)">
                    <Video size={17} />
                </ToolbarButton>

                <Divider />

                {/* Geri al / İleri al */}
                <ToolbarButton onClick={() => exec('undo')} title="Geri Al (Ctrl+Z)">
                    <Undo size={17} />
                </ToolbarButton>
                <ToolbarButton onClick={() => exec('redo')} title="İleri Al (Ctrl+Y)">
                    <Redo size={17} />
                </ToolbarButton>
            </div>

            {/* Editable Alan */}
            <div className="relative">
                {showPlaceholder && (
                    <div className="absolute top-5 left-5 text-slate-300 text-sm font-medium pointer-events-none select-none">
                        {placeholder || 'Bilgi ve deneyimlerinizi buraya dökün...'}
                    </div>
                )}
                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={syncContent}
                    onKeyDown={handleKeyDown}
                    className="p-5 min-h-[420px] max-h-[680px] overflow-y-auto focus:outline-none text-slate-700 text-sm leading-relaxed prose prose-slate max-w-none
                        prose-headings:font-black prose-headings:text-slate-900 prose-headings:tracking-tight
                        prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                        prose-blockquote:border-l-4 prose-blockquote:border-blue-300 prose-blockquote:bg-blue-50 prose-blockquote:p-4 prose-blockquote:rounded-r-xl prose-blockquote:not-italic
                        prose-a:text-blue-600 prose-a:underline
                        prose-img:rounded-xl prose-img:shadow-md
                        prose-li:my-1"
                    style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                />
            </div>

            {/* İpucu */}
            <div className="bg-slate-50 border-t border-slate-100 px-5 py-2 flex flex-wrap gap-4">
                <span className="text-[10px] text-slate-400 font-medium">Tab = girinti · Ctrl+B = kalın · Ctrl+I = italik</span>
                <span className="text-[10px] text-slate-400 font-medium">Video butonu ile YouTube embed ekleyebilirsiniz</span>
            </div>
        </div>
    );
}
