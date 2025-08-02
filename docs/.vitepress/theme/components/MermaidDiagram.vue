<template>
  <div class="mermaid-container">
    <div ref="mermaidRef" class="mermaid-diagram">
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue'
import mermaid from 'mermaid'

interface Props {
  code: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  id: () => `mermaid-${Math.random().toString(36).substr(2, 9)}`
})

const mermaidRef = ref<HTMLElement>()

onMounted(async () => {
  // Initialiser Mermaid
  mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'inherit',
    fontSize: 14,
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true
    },
    sequence: {
      useMaxWidth: true
    },
    gantt: {
      useMaxWidth: true
    }
  })

  await renderDiagram()
})

watchEffect(async () => {
  if (mermaidRef.value && props.code) {
    await renderDiagram()
  }
})

async function renderDiagram() {
  if (!mermaidRef.value) return

  try {
    // Désechapper le code HTML
    const code = props.code
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
    
    // Nettoyer le contenu précédent
    mermaidRef.value.innerHTML = ''
    
    // Valider et rendre le diagramme
    const { svg } = await mermaid.render(props.id, code)
    mermaidRef.value.innerHTML = svg
  } catch (error) {
    console.error('Erreur lors du rendu Mermaid:', error)
    // Désechapper pour l'affichage d'erreur aussi
    const unescapedCode = props.code
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
    
    mermaidRef.value.innerHTML = `
      <div class="mermaid-error">
        <p>Erreur lors du rendu du diagramme Mermaid</p>
        <pre><code>${unescapedCode}</code></pre>
      </div>
    `
  }
}
</script>

<style scoped>
.mermaid-container {
  margin: 1rem 0;
  padding: 1rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  overflow-x: auto;
}

.mermaid-diagram {
  text-align: center;
  line-height: 1.4;
}

.mermaid-diagram :deep(svg) {
  max-width: 100%;
  height: auto;
}

.mermaid-error {
  color: var(--vp-c-danger);
  text-align: left;
}

.mermaid-error pre {
  background: var(--vp-c-bg);
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  margin-top: 0.5rem;
}

.mermaid-error code {
  font-family: var(--vp-font-family-mono);
  font-size: 0.9em;
}

/* Styles pour les diagrammes Mermaid en mode sombre */
@media (prefers-color-scheme: dark) {
  .mermaid-container {
    background: var(--vp-c-bg-alt);
  }
  
  .mermaid-diagram :deep(.node rect),
  .mermaid-diagram :deep(.node circle),
  .mermaid-diagram :deep(.node ellipse),
  .mermaid-diagram :deep(.node polygon) {
    fill: var(--vp-c-bg-soft);
    stroke: var(--vp-c-border);
  }
  
  .mermaid-diagram :deep(.edgeLabel) {
    background-color: var(--vp-c-bg);
    color: var(--vp-c-text-1);
  }
  
  .mermaid-diagram :deep(.cluster rect) {
    fill: var(--vp-c-bg-alt);
    stroke: var(--vp-c-border);
  }
  
  .mermaid-diagram :deep(text) {
    fill: var(--vp-c-text-1) !important;
  }
  
  .mermaid-diagram :deep(.edgePath path) {
    stroke: var(--vp-c-text-2);
  }
  
  .mermaid-diagram :deep(.arrowheadPath) {
    fill: var(--vp-c-text-2);
  }
}
</style>