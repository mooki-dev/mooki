<template>
  <div class="mermaid-container">
    <div v-if="loading" class="mermaid-loading">
      <span>Chargement du diagramme...</span>
    </div>
    <div v-else class="mermaid-wrapper">
      <div class="mermaid-controls">
        <button @click="zoomIn" class="zoom-btn" title="Zoom avant">🔍+</button>
        <button @click="zoomOut" class="zoom-btn" title="Zoom arrière">🔍-</button>
        <button @click="resetZoom" class="zoom-btn" title="Taille originale">↺</button>
        <button @click="toggleFullscreen" class="zoom-btn" title="Plein écran">⛶</button>
      </div>
      <div 
        ref="mermaidRef" 
        class="mermaid-diagram"
        :class="{ 'fullscreen': isFullscreen }"
        :style="{ 
          transform: `scale(${zoomLevel})`, 
          transformOrigin: isFullscreen ? 'center center' : 'top left' 
        }"
        @wheel="handleWheel"
      >
      </div>
      <!-- Contrôles pour le mode plein écran -->
      <div v-if="isFullscreen" class="fullscreen-controls">
        <div class="fullscreen-zoom-controls">
          <button @click="zoomIn" class="zoom-btn fullscreen-btn" title="Zoom avant">🔍+</button>
          <span class="zoom-indicator">{{ Math.round(zoomLevel * 100) }}%</span>
          <button @click="zoomOut" class="zoom-btn fullscreen-btn" title="Zoom arrière">🔍-</button>
          <button @click="resetZoom" class="zoom-btn fullscreen-btn" title="Taille originale">↺</button>
        </div>
        <button 
          @click="toggleFullscreen" 
          class="fullscreen-close"
          title="Fermer le plein écran (Échap)"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watchEffect } from 'vue'

interface Props {
  code: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  id: () => `mermaid-${Math.random().toString(36).substr(2, 9)}`
})

const mermaidRef = ref<HTMLElement>()
const loading = ref(true)
const zoomLevel = ref(1)
const isFullscreen = ref(false)
let mermaidInstance: any = null
let savedScrollPosition = 0

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
        fontSize: 16, // Augmenté pour meilleure lisibilité
        // Configuration globale pour tous les diagrammes
        themeCSS: `
          .node rect, .node circle, .node ellipse, .node polygon, .node path { font-size: 16px; }
          .edgeLabel { font-size: 14px; }
        `,
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
  
  // Ajouter l'écoute des événements clavier
  document.addEventListener('keydown', handleKeydown)
})

// Nettoyer les événements au démontage
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  // Restaurer le scroll si le composant est démonté en mode plein écran
  if (isFullscreen.value) {
    document.body.style.overflow = ''
    // Restaurer aussi la position de scroll (sans animation car composant démonté)
    window.scrollTo(0, savedScrollPosition)
  }
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

// Fonctions de zoom et plein écran
function zoomIn() {
  zoomLevel.value = Math.min(zoomLevel.value + 0.2, 3)
}

function zoomOut() {
  zoomLevel.value = Math.max(zoomLevel.value - 0.2, 0.5)
}

function resetZoom() {
  zoomLevel.value = 1
}

function toggleFullscreen() {
  if (!isFullscreen.value) {
    // Entrer en mode plein écran : sauvegarder la position actuelle
    savedScrollPosition = window.pageYOffset || document.documentElement.scrollTop
    isFullscreen.value = true
    document.body.style.overflow = 'hidden'
  } else {
    // Quitter le mode plein écran : restaurer la position
    isFullscreen.value = false
    document.body.style.overflow = ''
    
    // Restaurer la position avec un petit délai pour laisser le DOM se mettre à jour
    setTimeout(() => {
      window.scrollTo({
        top: savedScrollPosition,
        behavior: 'smooth'
      })
    }, 50)
  }
}

function handleWheel(event: WheelEvent) {
  if (event.ctrlKey || event.metaKey) {
    event.preventDefault()
    if (event.deltaY < 0) {
      zoomIn()
    } else {
      zoomOut()
    }
  }
}

function handleKeydown(event: KeyboardEvent) {
  // Fermer le mode plein écran avec la touche Échap
  if (event.key === 'Escape' && isFullscreen.value) {
    event.preventDefault()
    toggleFullscreen()
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
  position: relative;
}

.mermaid-wrapper {
  position: relative;
}

.mermaid-controls {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 10;
  display: flex;
  gap: 0.25rem;
  background: var(--vp-c-bg);
  padding: 0.25rem;
  border-radius: 6px;
  border: 1px solid var(--vp-c-border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.zoom-btn {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  color: var(--vp-c-text-1);
}

.zoom-btn:hover {
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-brand);
  transform: translateY(-1px);
}

.zoom-btn:active {
  transform: translateY(0);
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
  transition: transform 0.3s ease;
  cursor: grab;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mermaid-diagram:active {
  cursor: grabbing;
}

.mermaid-diagram.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--vp-c-bg);
  z-index: 1000;
  padding: 2rem;
  overflow: auto;
  /* Pas de transform: none pour permettre le zoom */
}

.fullscreen-controls {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1001;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.fullscreen-zoom-controls {
  display: flex;
  gap: 0.25rem;
  background: var(--vp-c-bg);
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-border);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.fullscreen-btn {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
  color: var(--vp-c-text-1);
}

.fullscreen-btn:hover {
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-brand);
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.zoom-indicator {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  border-radius: 6px;
  min-width: 3rem;
  justify-content: center;
}

.fullscreen-close {
  background: var(--vp-c-bg);
  border: 2px solid var(--vp-c-border);
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.5rem;
  color: var(--vp-c-text-1);
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.fullscreen-close:hover {
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-brand);
  transform: scale(1.1);
  color: var(--vp-c-brand);
}

.fullscreen-close:active {
  transform: scale(0.95);
}

.mermaid-diagram :deep(svg) {
  max-width: 100%;
  height: auto;
  min-width: 400px; /* Taille minimale pour éviter les diagrammes trop petits */
}

/* Instructions d'utilisation */
.mermaid-container::after {
  content: "💡 Ctrl+molette pour zoomer • Boutons en haut à droite • Échap pour quitter le plein écran";
  display: block;
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  text-align: center;
  margin-top: 0.5rem;
  font-style: italic;
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