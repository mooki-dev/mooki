<template>
  <div class="mermaid-container">
    <div v-if="loading" class="mermaid-loading">
      <span>Chargement du diagramme...</span>
    </div>
    <div v-else ref="mermaidRef" class="mermaid-diagram">
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue'

interface Props {
  code: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  id: () => `mermaid-${Math.random().toString(36).substr(2, 9)}`
})

const mermaidRef = ref<HTMLElement>()
const loading = ref(true)
let mermaidInstance: any = null

// Fonction pour charger Mermaid de façon asynchrone
async function loadMermaid() {
  if (!mermaidInstance) {
    try {
      const { default: mermaid } = await import('mermaid')
      mermaidInstance = mermaid
      
      // Initialiser Mermaid avec configuration complète
      mermaidInstance.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        fontFamily: 'inherit',
        fontSize: 14,
        // Support pour tous les types de diagrammes
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
          curve: 'basis'
        },
        sequence: {
          useMaxWidth: true,
          diagramMarginX: 50,
          diagramMarginY: 10
        },
        gantt: {
          useMaxWidth: true,
          leftPadding: 75,
          gridLineStartPadding: 35
        },
        pie: {
          useMaxWidth: true
        },
        git: {
          useMaxWidth: true,
          mainBranchName: 'main'
        },
        timeline: {
          useMaxWidth: true
        },
        mindmap: {
          useMaxWidth: true
        },
        gitGraph: {
          useMaxWidth: true,
          mainBranchName: 'main'
        },
        // Configuration pour les nouveaux types
        xyChart: {
          useMaxWidth: true
        }
      })
    } catch (error) {
      console.error('Erreur lors du chargement de Mermaid:', error)
      throw error
    }
  }
  return mermaidInstance
}

onMounted(async () => {
  await loadMermaid()
  loading.value = false
  await renderDiagram()
})

watchEffect(async () => {
  if (mermaidRef.value && props.code && !loading.value) {
    await renderDiagram()
  }
})

async function renderDiagram() {
  if (!mermaidRef.value || !mermaidInstance) return

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
      .trim()
    
    // Debug: vérifier le code (désactivé en production)
    // console.log('Code Mermaid à rendre:', code)
    
    // Vérifier que le code n'est pas vide
    if (!code) {
      throw new Error('Code Mermaid vide')
    }
    
    // Nettoyer le contenu précédent
    mermaidRef.value.innerHTML = ''
    
    // Note: La validation parse() peut ne pas être disponible dans toutes les versions
    // On tente directement le rendu avec gestion d'erreur
    
    // Valider et rendre le diagramme
    const { svg } = await mermaidInstance.render(props.id, code)
    mermaidRef.value.innerHTML = svg
    
    // console.log('Diagramme Mermaid rendu avec succès')
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
      .trim()
    
    mermaidRef.value.innerHTML = `
      <div class="mermaid-error">
        <h4>❌ Erreur lors du rendu du diagramme Mermaid</h4>
        <p><strong>Erreur:</strong> ${error.message}</p>
        <details>
          <summary>Code source (cliquez pour voir)</summary>
          <pre><code>${unescapedCode}</code></pre>
        </details>
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

.mermaid-loading {
  text-align: center;
  padding: 2rem;
  color: var(--vp-c-text-2);
  font-style: italic;
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