"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import { 
    Bold, 
    Italic, 
    Underline as UnderlineIcon, 
    Strikethrough, 
    List, 
    ListOrdered, 
    Quote, 
    Link as LinkIcon, 
    Image as ImageIcons, 
    Undo2, 
    Redo2, 
    ChevronDown, 
    MoreVertical 
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface TipTapEditorProps {
    content: string;
    onChange: (html: string) => void;
}

export function TipTapEditor({ content, onChange }: TipTapEditorProps) {
    const [isParagraphOpen, setIsParagraphOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false,
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: 'text-blue-500 underline cursor-pointer' },
            }),
            Image.configure({ HTMLAttributes: { class: 'max-w-full h-auto rounded-lg my-2' } }),
            Youtube.configure({ width: 480, height: 270, HTMLAttributes: { class: 'aspect-video rounded-lg my-2 mx-auto max-w-full' } }),
        ],
        content: content,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsParagraphOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!editor) return null;

    const addLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = prompt("Enter target hyperlink destination URL:", previousUrl);
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const addImage = () => {
        const url = prompt("Enter complete asset source Image URL:");
        if (url) editor.chain().focus().setImage({ src: url }).run();
    };

    const getCurrentBlockLabel = () => {
        if (editor.isActive("heading", { level: 1 })) return "Heading 1";
        if (editor.isActive("heading", { level: 2 })) return "Heading 2";
        if (editor.isActive("heading", { level: 3 })) return "Heading 3";
        return "Paragraphs";
    };

    return (
        <div className="border border-[#1b2a47] rounded-xl overflow-hidden bg-[#0d1b32] text-slate-200 shadow-lg">
            {/* Toolbar Container */}
            <div className="bg-[#10223d] border-b border-[#1b2a47] p-2 flex flex-wrap gap-1.5 items-center justify-between select-none">
                
                {/* Left side formatting controls */}
                <div className="flex flex-wrap gap-1.5 items-center">
                    
                    {/* Paragraph / Heading Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsParagraphOpen(!isParagraphOpen)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#162947] hover:bg-[#1f365c] text-xs font-medium text-slate-300 transition-colors border border-[#233a5e]"
                        >
                            <span>{getCurrentBlockLabel()}</span>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        </button>

                        {isParagraphOpen && (
                            <div className="absolute left-0 mt-1 w-36 bg-[#162947] border border-[#233a5e] rounded-lg shadow-xl z-20 py-1">
                                <button
                                    type="button"
                                    onClick={() => { editor.chain().focus().setParagraph().run(); setIsParagraphOpen(false); }}
                                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#1f365c] ${editor.isActive("paragraph") ? "text-blue-400 font-semibold" : "text-slate-300"}`}
                                >
                                    Paragraph
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { editor.chain().focus().toggleHeading({ level: 1 }).run(); setIsParagraphOpen(false); }}
                                    className={`w-full text-left px-3 py-1.5 text-xs font-bold hover:bg-[#1f365c] ${editor.isActive("heading", { level: 1 }) ? "text-blue-400" : "text-slate-300"}`}
                                >
                                    Heading 1
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { editor.chain().focus().toggleHeading({ level: 2 }).run(); setIsParagraphOpen(false); }}
                                    className={`w-full text-left px-3 py-1.5 text-xs font-bold hover:bg-[#1f365c] ${editor.isActive("heading", { level: 2 }) ? "text-blue-400" : "text-slate-300"}`}
                                >
                                    Heading 2
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { editor.chain().focus().toggleHeading({ level: 3 }).run(); setIsParagraphOpen(false); }}
                                    className={`w-full text-left px-3 py-1.5 text-xs font-bold hover:bg-[#1f365c] ${editor.isActive("heading", { level: 3 }) ? "text-blue-400" : "text-slate-300"}`}
                                >
                                    Heading 3
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="w-[1px] h-5 bg-[#233a5e] mx-1" />

                    {/* Bold */}
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`p-1.5 rounded-lg transition-colors ${editor.isActive("bold") ? "bg-[#1f365c] text-white" : "text-slate-400 hover:bg-[#162947] hover:text-slate-200"}`}
                        title="Bold"
                    >
                        <Bold className="w-4 h-4" />
                    </button>

                    {/* Italic */}
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`p-1.5 rounded-lg transition-colors ${editor.isActive("italic") ? "bg-[#1f365c] text-white" : "text-slate-400 hover:bg-[#162947] hover:text-slate-200"}`}
                        title="Italic"
                    >
                        <Italic className="w-4 h-4" />
                    </button>

                    {/* Underline */}
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        className={`p-1.5 rounded-lg transition-colors ${editor.isActive("underline") ? "bg-[#1f365c] text-white" : "text-slate-400 hover:bg-[#162947] hover:text-slate-200"}`}
                        title="Underline"
                    >
                        <UnderlineIcon className="w-4 h-4" />
                    </button>

                    {/* Strikethrough */}
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        className={`p-1.5 rounded-lg transition-colors ${editor.isActive("strike") ? "bg-[#1f365c] text-white" : "text-slate-400 hover:bg-[#162947] hover:text-slate-200"}`}
                        title="Strikethrough"
                    >
                        <Strikethrough className="w-4 h-4" />
                    </button>

                    {/* Bullet List */}
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={`p-1.5 rounded-lg transition-colors ${editor.isActive("bulletList") ? "bg-[#1f365c] text-white" : "text-slate-400 hover:bg-[#162947] hover:text-slate-200"}`}
                        title="Bullet List"
                    >
                        <List className="w-4 h-4" />
                    </button>

                    {/* Ordered List */}
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={`p-1.5 rounded-lg transition-colors ${editor.isActive("orderedList") ? "bg-[#1f365c] text-white" : "text-slate-400 hover:bg-[#162947] hover:text-slate-200"}`}
                        title="Ordered List"
                    >
                        <ListOrdered className="w-4 h-4" />
                    </button>

                    {/* Blockquote */}
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={`p-1.5 rounded-lg transition-colors ${editor.isActive("blockquote") ? "bg-[#1f365c] text-white" : "text-slate-400 hover:bg-[#162947] hover:text-slate-200"}`}
                        title="Blockquote"
                    >
                        <Quote className="w-4 h-4" />
                    </button>

                    {/* Link */}
                    <button
                        type="button"
                        onClick={addLink}
                        className={`p-1.5 rounded-lg transition-colors ${editor.isActive("link") ? "bg-[#1f365c] text-white" : "text-slate-400 hover:bg-[#162947] hover:text-slate-200"}`}
                        title="Insert Link"
                    >
                        <LinkIcon className="w-4 h-4" />
                    </button>

                    {/* Image */}
                    <button
                        type="button"
                        onClick={addImage}
                        className={`p-1.5 rounded-lg transition-colors ${editor.isActive("image") ? "bg-[#1f365c] text-white" : "text-slate-400 hover:bg-[#162947] hover:text-slate-200"}`}
                        title="Insert Image"
                    >
                        <ImageIcons className="w-4 h-4" />
                    </button>
                </div>

                {/* Right side history & extra controls */}
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-[#162947] hover:text-slate-200 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                        title="Undo"
                    >
                        <Undo2 className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-[#162947] hover:text-slate-200 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                        title="Redo"
                    >
                        <Redo2 className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-[#162947] hover:text-slate-200 transition-colors"
                        title="More options"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Editor Content Area */}
            <EditorContent
                editor={editor}
                className="prose prose-invert prose-sm max-w-none p-4 min-h-[250px] outline-hidden text-slate-300 leading-relaxed font-normal [&_.is-editor-empty:first-child::before]:text-slate-500 [&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.is-editor-empty:first-child::before]:float-left [&_.is-editor-empty:first-child::before]:pointer-events-none"
            />
        </div>
    );
}