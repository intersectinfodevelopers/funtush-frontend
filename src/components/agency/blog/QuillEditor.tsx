"use client";

import { useTheme } from "@/context/theme";
import { useMemo } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface QuillEditorProps {
    content: string;
    onChange: (html: string) => void;
}

export function QuillEditor({ content, onChange }: QuillEditorProps) {
    const { isDark } = useTheme();

    const modules = useMemo(() => ({
        toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ["bold", "italic", "underline", "strike", "code"],
            [{ color: [] }, { background: [] }],
            [{ align: [] }],
            [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
            ["blockquote", "code-block"],
            ["link", "image", "formula"],
            ["clean"],
        ],
    }), []);

    const formats = [
        "header",
        "bold",
        "italic",
        "underline",
        "strike",
        "code",
        "list",
        "blockquote",
        "link",
        "image",
        "color",
        "background",
        "align",
        "code-block",
        "formula",
        "indent",
        "direction",
        "size",
    ];

    // Match the app's shared neutral/brand palette instead of custom
    // hardcoded blue/ink values.
    const containerClass = isDark
        ? "bg-neutral-900 text-neutral-50 border border-neutral-700 shadow-sm quill-dark"
        : "bg-white text-neutral-900 border border-neutral-200 shadow-sm quill-light";

    return (
        <div className={`rounded-xl overflow-hidden transition-colors duration-200 ${containerClass}`}>
            <ReactQuill
                theme="snow"
                value={content}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder="Write something amazing..."
                className="min-h-[28rem] flex flex-col"
            />

            {/* Global style overrides that follow the app color system. */}
            <style jsx global>{`
                .quill-dark .ql-toolbar.ql-snow {
                    background-color: #111827;
                    border-color: #374151;
                    border-top: none;
                    border-left: none;
                    border-right: none;
                }
                .quill-light .ql-toolbar.ql-snow {
                    background-color: #f9fafb;
                    border-color: #e5e7eb;
                    border-top: none;
                    border-left: none;
                    border-right: none;
                }
                .quill-dark .ql-container.ql-snow {
                    border: none;
                    background: transparent;
                    color: #f3f4f6;
                }
                .quill-light .ql-container.ql-snow {
                    border: none;
                    background: transparent;
                    color: #111827;
                }
                .quill-dark .ql-stroke {
                    stroke: #d1d5db !important;
                }
                .quill-dark .ql-fill {
                    fill: #d1d5db !important;
                }
                .quill-dark .ql-picker {
                    color: #d1d5db !important;
                }
                .quill-dark .ql-picker-options {
                    background-color: #1f2937 !important;
                    border-color: #374151 !important;
                }
                .ql-editor {
                    min-h: 250px;
                    font-size: 0.875rem;
                    line-height: 1.6;
                }
                .ql-editor.ql-blank::before {
                    color: #9ca3af !important;
                    font-style: normal !important;
                }
            `}</style>
        </div>
    );
}