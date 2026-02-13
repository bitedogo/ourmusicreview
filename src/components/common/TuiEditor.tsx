"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@toast-ui/react-editor").then((mod) => mod.Editor), {
  ssr: false,
  loading: () => <div className="h-96 w-full animate-pulse rounded-xl bg-zinc-100" />,
});

import "@toast-ui/editor/dist/toastui-editor.css";

const editorOverrideStyles = `
  .toastui-editor-tabs {
    display: none !important;
  }
  .toastui-editor-md-header,
  .toastui-editor-ww-header {
    display: none !important;
  }
  .toastui-editor-defaultUI {
    border: 1px solid #e5e7eb !important;
    border-radius: 12px !important;
    overflow: hidden !important;
  }
`;

export interface TuiEditorRef {
  getHTML: () => string;
  getMarkdown: () => string;
  setHTML: (html: string) => void;
  setMarkdown: (markdown: string) => void;
}

interface TuiEditorProps {
  initialValue?: string;
  height?: string;
  onChange?: (html: string) => void;
}

export const TuiEditor = forwardRef<TuiEditorRef, TuiEditorProps>(
  ({ initialValue = "", height = "400px", onChange }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Toast UI Editor instance
    const editorRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      getHTML: () => {
        const html = editorRef.current?.getInstance()?.getHTML() || "";
        return html.replace(/<p><\/p>/g, "<p><br></p>");
      },
      getMarkdown: () => {
        return editorRef.current?.getInstance()?.getMarkdown() || "";
      },
      setHTML: (html: string) => {
        editorRef.current?.getInstance()?.setHTML(html);
      },
      setMarkdown: (markdown: string) => {
        editorRef.current?.getInstance()?.setMarkdown(markdown);
      },
    }));

    useEffect(() => {
      const instance = editorRef.current?.getInstance();
      if (instance && initialValue) {
        instance.setHTML(initialValue);
      }
    }, [initialValue]);

    return (
      <div className="w-full tui-editor-custom-container">
        <style dangerouslySetInnerHTML={{ __html: editorOverrideStyles }} />
        <Editor
          ref={editorRef}
          initialValue={initialValue}
          height={height}
          initialEditType="wysiwyg"
          previewStyle="tab"
          useCommandShortcut={true}
          hideModeSwitch={true}
          usageStatistics={false}
          autofocus={false}
          onChange={() => {
            if (onChange && editorRef.current) {
              let html = editorRef.current.getInstance()?.getHTML() || "";
              html = html.replace(/<p><\/p>/g, "<p><br></p>");
              onChange(html);
            }
          }}
          toolbarItems={[
            ["heading", "bold", "italic", "strike"],
            ["hr", "quote"],
            ["ul", "ol", "task", "indent", "outdent"],
            ["table", "image", "link"],
            ["code", "codeblock"],
          ]}
        />
      </div>
    );
  }
);

TuiEditor.displayName = "TuiEditor";
