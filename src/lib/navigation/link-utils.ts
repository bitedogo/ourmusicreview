export function isExternalLink(href: string): boolean {
  return href.startsWith("http") || href.startsWith("mailto:");
}

export function externalLinkProps(href: string) {
  if (!isExternalLink(href) || href.startsWith("mailto:")) {
    return {};
  }

  return {
    target: "_blank" as const,
    rel: "noopener noreferrer",
  };
}
