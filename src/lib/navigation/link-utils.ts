export function isExternalLink(href: string): boolean {
  return href.startsWith("http") || href.startsWith("mailto:");
}

export function externalLinkProps(href: string) {
  if (!href.startsWith("http")) {
    return {};
  }

  return {
    target: "_blank" as const,
    rel: "noopener noreferrer",
  };
}
