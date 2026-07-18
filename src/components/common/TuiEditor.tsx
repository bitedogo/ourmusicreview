"use client";
/** TOAST UI 에디터 래퍼 */

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import dynamic from "next/dynamic";
import { normalizeHtml } from "@/src/lib/utils/editor";

const Editor = dynamic(() => import("@toast-ui/react-editor").then((mod) => mod.Editor), {
  ssr: false,
  loading: () => <div className="h-96 w-full animate-pulse rounded-xl bg-zinc-100" />,
});

import "@toast-ui/editor/dist/toastui-editor.css";

const TOOLBAR_WITH_MEDIA: string[][] = [
  ["bold", "italic", "strike"],
  ["quote"],
  ["ul"],
  ["image", "link"],
];

const TOOLBAR_BASIC: string[][] = [
  ["bold", "italic", "strike"],
  ["quote"],
  ["ul"],
];

const TOOLBAR_SELECTOR = ".toastui-editor-defaultUI-toolbar, .toastui-editor-toolbar";
const LINK_BUTTON_SELECTOR =
  "button[aria-label*='link' i], button[title*='link' i], button[aria-label*='링크'], button[title*='링크']";

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
  .tui-audio-tool-button {
    width: 28px;
    min-width: 28px;
    height: 28px;
    margin: 8px 2px;
    border: 0;
    background: transparent;
    color: #52525b;
    font-size: 40px;
    font-weight: 600;
    line-height: 1;
    cursor: pointer;
  }
  .tui-audio-tool-button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
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
  showAudioTool?: boolean;
  isAudioUploading?: boolean;
  onAudioToolClick?: () => void;
  onReady?: () => void;
}

const customHTMLRenderer = {
  htmlBlock: {
    audio(node: { attrs?: Record<string, string> }) {
      return [
        {
          type: "openTag",
          tagName: "audio",
          outerNewLine: true,
          attributes: node.attrs ?? {},
        },
        { type: "closeTag", tagName: "audio", outerNewLine: true },
      ];
    },
  },
};

export const TuiEditor = forwardRef<TuiEditorRef, TuiEditorProps>(
  (
    {
      initialValue = "",
      height = "400px",
      onChange,
      showMediaTools = true,
      showAudioTool = false,
      isAudioUploading = false,
      onAudioToolClick,
      onReady,
    },
    ref
  ) => {
    const editorRef = useRef<TuiEditorRuntimeRef | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [editorReady, setEditorReady] = useState(false);

    const getEditorInstance = useCallback((): TuiEditorInstance | null => {
      return editorRef.current?.getInstance() ?? null;
    }, []);

    const blurEditorBeforeUpdate = useCallback(() => {
      const root = containerRef.current;
      if (!root) return;
      const active = document.activeElement as HTMLElement | null;
      if (active && root.contains(active)) {
        active.blur();
      }
    }, []);

    const safeSetHTML = useCallback(
      (html: string) => {
        blurEditorBeforeUpdate();
        requestAnimationFrame(() => {
          getEditorInstance()?.setHTML(html);
        });
      },
      [blurEditorBeforeUpdate, getEditorInstance]
    );

    useImperativeHandle(
      ref,
      () => ({
        getHTML: () => {
          const html = getEditorInstance()?.getHTML() || "";
          return normalizeHtml(html);
        },
        getMarkdown: () => getEditorInstance()?.getMarkdown() || "",
        setHTML: safeSetHTML,
        setMarkdown: (markdown: string) => getEditorInstance()?.setMarkdown(markdown),
      }),
      [getEditorInstance, safeSetHTML]
    );

    useEffect(() => {
      if (!editorReady) return;
      const instance = getEditorInstance();
      if (!instance || !initialValue) return;
      blurEditorBeforeUpdate();
      requestAnimationFrame(() => {
        instance.setHTML(initialValue);
      });
    }, [initialValue, editorReady, getEditorInstance, blurEditorBeforeUpdate]);

    useEffect(() => {
      const rootEl = containerRef.current;
      if (!rootEl) {
        return;
      }

      const existingButton = rootEl.querySelector(
        "[data-audio-tool='true']"
      ) as HTMLButtonElement | null;

      if (!showAudioTool || !onAudioToolClick) {
        existingButton?.remove();
        return;
      }

      const button = existingButton ?? document.createElement("button");
      button.type = "button";
      button.className = "tui-audio-tool-button";
      button.setAttribute("data-audio-tool", "true");
      button.setAttribute("title", "음원 삽입");
      button.setAttribute("aria-label", "음원 삽입");
      button.textContent = "🎵";
      button.onclick = onAudioToolClick;
      button.disabled = isAudioUploading;

      const toolbar = rootEl.querySelector(TOOLBAR_SELECTOR) as HTMLElement | null;
      if (!toolbar) {
        return;
      }

      if (!existingButton) {
        const linkButton = toolbar.querySelector(LINK_BUTTON_SELECTOR) as HTMLElement | null;
        if (linkButton) {
          linkButton.insertAdjacentElement("afterend", button);
        } else {
          toolbar.appendChild(button);
        }
      }
    }, [showAudioTool, onAudioToolClick, isAudioUploading, editorReady]);

    const handleEditorChange = useCallback(() => {
      if (onChange) {
        const html = normalizeHtml(getEditorInstance()?.getHTML() || "");
        onChange(html);
      }
    }, [onChange, getEditorInstance]);

    const toolbarItems = useMemo(
      () => (showMediaTools ? TOOLBAR_WITH_MEDIA : TOOLBAR_BASIC),
      [showMediaTools]
    );

    return (
      <div ref={containerRef} className="w-full tui-editor-custom-container">
        <style dangerouslySetInnerHTML={{ __html: editorOverrideStyles }} />
        <Editor
          ref={editorRef}
          onLoad={() => {
            setEditorReady(true);
            onReady?.();
          }}
          initialValue={initialValue}
          height={height}
          initialEditType="wysiwyg"
          previewStyle="tab"
          useCommandShortcut={true}
          hideModeSwitch={true}
          usageStatistics={false}
          autofocus={false}
          customHTMLRenderer={customHTMLRenderer as never}
          onChange={handleEditorChange}
          toolbarItems={toolbarItems}
        />
      </div>
    );
  }
);

TuiEditor.displayName = "TuiEditor";
