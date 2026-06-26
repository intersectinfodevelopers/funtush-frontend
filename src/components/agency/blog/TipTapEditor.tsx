"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";

interface TipTapEditorProps {
    content: string;
    onChange: (html: string) => void;
}

export function TipTapEditor({ content, onChange }: TipTapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false,
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

    if (!editor) return null;

    const addLink = () => {
        const url = prompt("Enter target hyperlink destination URL:");
        if (url) editor.chain().focus().setLink({ href: url }).run();
    };

    const addImage = () => {
        const url = prompt("Enter complete asset source Image URL:");
        if (url) editor.chain().focus().setImage({ src: url }).run();
    };

    const addYoutube = () => {
        const url = prompt("Enter standard YouTube Video Watch URL link:");
        if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
    };

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 bg-white">
            <div className="bg-slate-50 border-b border-slate-200 p-2 flex flex-wrap gap-1 items-center select-none">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`px-2 py-1 rounded text-xs font-bold ${editor.isActive("bold") ? "bg-slate-200 text-slate-800" : "text-slate-500 hover:bg-slate-100"}`}
                >
                    B
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`px-2 py-1 rounded text-xs italic font-semibold ${editor.isActive("italic") ? "bg-slate-200 text-slate-800" : "text-slate-500 hover:bg-slate-100"}`}
                >
                    I
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={`px-2 py-1 rounded text-xs font-black ${editor.isActive("heading", { level: 3 }) ? "bg-slate-200 text-slate-800" : "text-slate-500 hover:bg-slate-100"}`}
                >
                    H3
                </button>
                <div className="w-[1px] h-4 bg-slate-200 mx-1" />
                <button type="button" onClick={addLink} className="px-2 py-1 rounded text-xs font-medium text-slate-500 hover:bg-slate-100 underline">Link</button>
                <button type="button" onClick={addImage} className="px-2 py-1 rounded text-xs font-medium text-slate-500 hover:bg-slate-100">Image</button>
                <button type="button" onClick={addYoutube} className="px-2 py-1 rounded text-xs font-medium text-slate-500 hover:bg-slate-100 text-red-600">YouTube</button>
            </div>

            <EditorContent
                editor={editor}
                className="prose prose-sm max-w-none p-4 min-h-[250px] outline-hidden text-slate-700 leading-relaxed font-medium"
            />
        </div>
    );
}