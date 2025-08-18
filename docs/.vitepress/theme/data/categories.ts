export interface CategoryMetadata {
  id: string;
  label: string;
  description?: string;
}

/**
 * Métadonnées des catégories
 * Ce fichier contient les informations de présentation des catégories
 */
export const categoriesMetadata: CategoryMetadata[] = [
  {
    id: "ai",
    label: "AI & Machine Learning",
    description: "Intelligence artificielle, outils d'IA et automatisation pour développeurs",
  },
  {
    id: "backend",
    label: "Backend Development",
    description: "APIs, microservices, bases de données et technologies serveur",
  },
  {
    id: "devops",
    label: "DevOps & Infrastructure",
    description: "CI/CD, conteneurisation, monitoring et déploiement",
  },
  {
    id: "ux-design",
    label: "UX/UI Design",
    description: "Expérience utilisateur, interfaces et design d'interaction",
  },
  {
    id: "frontend",
    label: "Frontend Development", 
    description: "Interfaces utilisateur, frameworks frontend et expérience utilisateur",
  },
  {
    id: "linux",
    label: "Linux & System Administration",
    description: "Configuration système, outils en ligne de commande et administration Linux",
  },
  {
    id: "security",
    label: "Security & Best Practices",
    description: "Sécurité informatique, bonnes pratiques et défense",
  },
  {
    id: "software-design-architecture",
    label: "Software Architecture & Design",
    description: "Patterns architecturaux, conception logicielle et principes de développement",
  },
];

/**
 * Map pour accès rapide aux métadonnées par ID
 */
export const categoriesMetadataMap = new Map<string, CategoryMetadata>(
  categoriesMetadata.map((category) => [category.id, category]),
);
