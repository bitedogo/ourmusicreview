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
    overflow: visible !important;
  }
  .toastui-editor-defaultUI-toolbar {
    height: auto !important;
    min-height: 45px !important;
    padding: 0 12px !important;
  }
  .toastui-editor-toolbar {
    height: auto !important;
    min-height: 46px !important;
  }
  .toastui-editor-popup,
  .toastui-editor-popup.toastui-editor-popup-add-image,
  .toastui-editor-popup.toastui-editor-popup-add-link {
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    right: auto !important;
    bottom: auto !important;
    margin: 0 !important;
    transform: translate(-50%, -50%) !important;
    width: min(400px, calc(100vw - 24px)) !important;
    max-width: calc(100vw - 24px) !important;
    z-index: 80 !important;
  }
  .toastui-editor-popup-body input[type='text'] {
    width: 100% !important;
    box-sizing: border-box !important;
  }
  @media (max-width: 767px) {
    .toastui-editor-defaultUI-toolbar {
      padding: 0 6px !important;
    }
    .toastui-editor-toolbar-divider {
      margin: 14px 4px !important;
    }
    .toastui-editor-defaultUI-toolbar button {
      width: 28px !important;
      min-width: 28px !important;
      height: 28px !important;
      margin: 8px 2px !important;
    }
    .toastui-editor-dropdown-toolbar {
      left: 0 !important;
      right: auto !important;
      transform: none !important;
      max-width: min(320px, calc(100vw - 24px)) !important;
      z-index: 20 !important;
    }
    .toastui-editor-popup {
      width: min(340px, calc(100vw - 24px)) !important;
      max-width: calc(100vw - 24px) !important;
      z-index: 80 !important;
    }
    .toastui-editor-popup-body {
      padding: 12px !important;
      font-size: 11px !important;
    }
    .toastui-editor-popup-body label {
      margin: 12px 0 4px !important;
    }
    .toastui-editor-popup-body .toastui-editor-button-container {
      margin-top: 12px !important;
    }
    .toastui-editor-popup-add-image .toastui-editor-tabs .tab-item {
      font-size: 12px !important;
      padding: 8px 10px !important;
    }
    .toastui-editor-popup-add-image .toastui-editor-file-select-button {
      width: 150px !important;
      height: 30px !important;
      line-height: 28px !important;
      font-size: 12px !important;
    }
  }
`;

export interface TuiEditorRef {
  getHTML: () => string;
  getMarkdown: () => string;
  setHTML: (html: string) => void;
  setMarkdown: (markdown: string) => void;
}

interface TuiEditorInstance {
  getHTML: () => string;
  getMarkdown: () => string;
  setHTML: (html: string) => void;
  setMarkdown: (markdown: string) => void;
}

interface TuiEditorRuntimeRef {
  getInstance: () => TuiEditorInstance;
}

interface TuiEditorProps {
  initialValue?: string;
  height?: string;
  onChange?: (html: string) => void;
  showMediaTools?: boolean;
}

export const TuiEditor = forwardRef<TuiEditorRef, TuiEditorProps>(
  ({ initialValue = "", height = "400px", onChange, showMediaTools = true }, ref) => {
    const editorRef = useRef<TuiEditorRuntimeRef | null>(null);

    function normalizeHtml(value: string): string {
      return value.replace(/<p><\/p>/g, "<p><br></p>");
    }

    function getEditorInstance(): TuiEditorInstance | null {
      return editorRef.current?.getInstance() ?? null;
    }

    useImperativeHandle(ref, () => ({
      getHTML: () => {
        const html = getEditorInstance()?.getHTML() || "";
        return normalizeHtml(html);
      },
      getMarkdown: () => {
        return getEditorInstance()?.getMarkdown() || "";
      },
      setHTML: (html: string) => {
        getEditorInstance()?.setHTML(html);
      },
      setMarkdown: (markdown: string) => {
        getEditorInstance()?.setMarkdown(markdown);
      },
    }));

    useEffect(() => {
      const instance = getEditorInstance();
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
            if (onChange) {
              const html = normalizeHtml(getEditorInstance()?.getHTML() || "");
              onChange(html);
            }
          }}
          toolbarItems={
            showMediaTools
              ? [
                  ["bold", "italic", "strike"],
                  ["quote"],
                  ["ul"],
                  ["image", "link"],
                ]
              : [
                  ["bold", "italic", "strike"],
                  ["quote"],
                  ["ul"],
                ]
          }
        />
      </div>
    );
  }
);

TuiEditor.displayName = "TuiEditor";
