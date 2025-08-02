import type MarkdownIt from 'markdown-it'

interface MermaidPluginOptions {
  theme?: string
}

export function mermaidPlugin(md: MarkdownIt, options: MermaidPluginOptions = {}): void {
  const fence = md.renderer.rules.fence

  md.renderer.rules.fence = (tokens, idx, opts, env, renderer) => {
    const token = tokens[idx]
    const info = token.info ? token.info.trim() : ''
    const langName = info ? info.split(/\s+/g)[0] : ''

    if (langName === 'mermaid') {
      const code = token.content.trim()
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`
      
      // Échapper le code pour l'attribut HTML en préservant l'UTF-8
      const escapedCode = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
      
      return `<MermaidDiagram id="${id}" code="${escapedCode}" />`
    }

    // Utiliser le rendu par défaut pour les autres langages
    return fence ? fence(tokens, idx, opts, env, renderer) : ''
  }
}