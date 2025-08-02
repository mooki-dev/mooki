---
title: "Introduction aux Model Context Protocol (MCP)"
date: 2025-08-02
tags: [mcp, ai, llm, protocol, integration, anthropic, claude]
author: mooki
excerpt: "Découvrez MCP, le protocole ouvert qui connecte les LLM aux sources de données et outils externes : architecture, SDKs et mise en pratique"
category: outils
---

# Introduction aux Model Context Protocol (MCP)

Le Model Context Protocol (MCP) révolutionne la façon dont les LLM interagissent avec le monde extérieur. Ce protocole ouvert standardise la connexion entre les modèles d'IA et les sources de données, créant un écosystème d'intégrations réutilisables.

## Qu'est-ce que MCP ?

### Définition et vision

MCP est un protocole ouvert qui standardise la façon dont les applications d'IA fournissent du contexte aux grands modèles de langage (LLM). Think of it as **"le port USB-C pour les applications d'IA"** - une interface universelle qui permet aux LLM de se connecter à différentes sources de données et outils.

### Problème résolu

**Avant MCP :**
- Chaque intégration LLM était unique et propriétaire
- Duplication d'efforts pour connecter les mêmes services
- Pas de standardisation des interactions LLM ↔ données externes
- Écosystème fragmenté et non interopérable

**Avec MCP :**
- Protocol universel pour toutes les intégrations
- Réutilisabilité des connecteurs entre applications
- Standardisation des échanges de contexte
- Écosystème unifié et évolutif

## Architecture MCP

### Composants principaux

```
┌─────────────────┐    MCP Protocol     ┌─────────────────┐
│   MCP Client    │◄──────────────────►│   MCP Server    │
│                 │                     │                 │
│ - Application   │                     │ - Data Source   │
│ - LLM Interface │                     │ - Tool Provider │
│ - Context Mgmt  │                     │ - API Gateway   │
└─────────────────┘                     └─────────────────┘
        │                                        │
        ▼                                        ▼
┌─────────────────┐                     ┌─────────────────┐
│      User       │                     │  External APIs  │
│   Application   │                     │   Databases     │
│                 │                     │   File Systems  │
└─────────────────┘                     │   Web Services  │
                                        └─────────────────┘
```

### Rôles et responsabilités

**MCP Client :**
- Interface avec l'utilisateur et le LLM
- Gère les demandes de contexte
- Orchestre les appels aux serveurs MCP
- Traite et présente les réponses

**MCP Server :**
- Expose des sources de données via MCP
- Fournit des outils et fonctionnalités
- Gère l'authentification et l'autorisation
- Transforme les données au format MCP

## Fonctionnalités clés de MCP

### 1. Gestion du contexte

```json
{
  "jsonrpc": "2.0",
  "method": "resources/read",
  "params": {
    "uri": "file:///path/to/document.md",
    "mimeType": "text/markdown"
  },
  "id": 1
}
```

**Capacités :**
- Lecture de ressources (fichiers, documents, données)
- Injection de contexte dynamique
- Gestion des métadonnées
- Support multi-format (text, JSON, binaire)

### 2. Exécution d'outils

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "search_database",
    "arguments": {
      "query": "SELECT * FROM users WHERE status = 'active'",
      "database": "production"
    }
  },
  "id": 2
}
```

**Outils supportés :**
- Requêtes de base de données
- Appels d'API externes
- Manipulation de fichiers
- Calculs et analyses
- Intégrations tierces

### 3. Communication bidirectionnelle

```json
{
  "jsonrpc": "2.0",
  "method": "notifications/progress",
  "params": {
    "progressToken": "task-123",
    "progress": {
      "kind": "report",
      "message": "Processing file 5 of 10..."
    }
  }
}
```

## Implémentation pratique

### Configuration d'un serveur MCP

#### Installation des dépendances

```bash
# Python SDK
pip install mcp

# Node.js SDK
npm install @anthropic/mcp-sdk

# TypeScript types
npm install @types/mcp
```

#### Serveur MCP simple en Python

```python
#!/usr/bin/env python3
import asyncio
import logging
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Resource, Tool, TextContent
import aiofiles
import json

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("file-server")

class FileServer:
    def __init__(self):
        self.server = Server("file-server")
        self.setup_handlers()
    
    def setup_handlers(self):
        """Configuration des handlers MCP"""
        
        @self.server.list_resources()
        async def list_resources() -> list[Resource]:
            """Liste les ressources disponibles"""
            return [
                Resource(
                    uri="file:///documents",
                    name="Documents Directory",
                    description="Access to document files",
                    mimeType="inode/directory"
                )
            ]
        
        @self.server.read_resource()
        async def read_resource(uri: str) -> str:
            """Lit le contenu d'une ressource"""
            if not uri.startswith("file://"):
                raise ValueError("Only file:// URIs supported")
            
            path = uri[7:]  # Remove file:// prefix
            
            try:
                async with aiofiles.open(path, 'r', encoding='utf-8') as f:
                    content = await f.read()
                return TextContent(
                    type="text",
                    text=content
                )
            except Exception as e:
                raise RuntimeError(f"Failed to read file: {e}")
        
        @self.server.list_tools()
        async def list_tools() -> list[Tool]:
            """Liste les outils disponibles"""
            return [
                Tool(
                    name="search_files",
                    description="Search for files containing specific text",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "Text to search for"
                            },
                            "directory": {
                                "type": "string", 
                                "description": "Directory to search in"
                            }
                        },
                        "required": ["query"]
                    }
                )
            ]
        
        @self.server.call_tool()
        async def call_tool(name: str, arguments: dict) -> list[TextContent]:
            """Exécute un outil"""
            if name == "search_files":
                query = arguments["query"]
                directory = arguments.get("directory", ".")
                
                # Simulation de recherche de fichiers
                results = await self.search_files(query, directory)
                
                return [TextContent(
                    type="text",
                    text=f"Found {len(results)} files matching '{query}':\n" + 
                         "\n".join(results)
                )]
            
            raise ValueError(f"Unknown tool: {name}")
    
    async def search_files(self, query: str, directory: str) -> list[str]:
        """Recherche de fichiers (implémentation simplifiée)"""
        import os
        import re
        
        matches = []
        for root, dirs, files in os.walk(directory):
            for file in files:
                if file.endswith('.txt') or file.endswith('.md'):
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                            if re.search(query, content, re.IGNORECASE):
                                matches.append(file_path)
                    except:
                        continue
        
        return matches

async def main():
    """Point d'entrée principal"""
    file_server = FileServer()
    
    async with stdio_server() as (read_stream, write_stream):
        await file_server.server.run(
            read_stream,
            write_stream,
            file_server.server.create_initialization_options()
        )

if __name__ == "__main__":
    asyncio.run(main())
```

### Client MCP en TypeScript

```typescript
import { Client } from '@anthropic/mcp-sdk/client/index.js';
import { StdioClientTransport } from '@anthropic/mcp-sdk/client/stdio.js';

class MCPClient {
    private client: Client;
    private transport: StdioClientTransport;

    constructor() {
        // Configuration du transport
        this.transport = new StdioClientTransport({
            command: 'python',
            args: ['file-server.py']
        });

        this.client = new Client({
            name: "mcp-client",
            version: "1.0.0"
        }, {
            capabilities: {
                resources: {},
                tools: {}
            }
        });
    }

    async connect(): Promise<void> {
        await this.client.connect(this.transport);
        console.log('✅ Connecté au serveur MCP');
    }

    async listResources(): Promise<void> {
        const resources = await this.client.listResources();
        console.log('📁 Ressources disponibles:', resources);
    }

    async readFile(uri: string): Promise<string> {
        const result = await this.client.readResource({ uri });
        return result.contents[0]?.text || '';
    }

    async searchFiles(query: string, directory?: string): Promise<string> {
        const result = await this.client.callTool({
            name: 'search_files',
            arguments: { query, directory }
        });

        return result.content[0]?.text || '';
    }

    async disconnect(): Promise<void> {
        await this.client.close();
        console.log('🔌 Déconnecté du serveur MCP');
    }
}

// Utilisation
async function example() {
    const client = new MCPClient();
    
    try {
        await client.connect();
        
        // Lister les ressources
        await client.listResources();
        
        // Rechercher des fichiers
        const results = await client.searchFiles('TODO', './src');
        console.log('🔍 Résultats de recherche:', results);
        
        // Lire un fichier spécifique
        const content = await client.readFile('file:///path/to/file.txt');
        console.log('📄 Contenu du fichier:', content.substring(0, 100) + '...');
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await client.disconnect();
    }
}

example();
```

## Serveurs MCP populaires

### 1. Serveur de base de données

```python
# database-mcp-server.py
from mcp.server import Server
import asyncpg
import json

class DatabaseMCPServer:
    def __init__(self, connection_string: str):
        self.server = Server("database-server")
        self.connection_string = connection_string
        self.setup_handlers()
    
    def setup_handlers(self):
        @self.server.list_tools()
        async def list_tools():
            return [
                Tool(
                    name="execute_query",
                    description="Execute a SQL query",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "query": {"type": "string"},
                            "params": {
                                "type": "array",
                                "items": {"type": "string"}
                            }
                        },
                        "required": ["query"]
                    }
                )
            ]
        
        @self.server.call_tool()
        async def call_tool(name: str, arguments: dict):
            if name == "execute_query":
                query = arguments["query"]
                params = arguments.get("params", [])
                
                conn = await asyncpg.connect(self.connection_string)
                try:
                    if query.strip().upper().startswith('SELECT'):
                        rows = await conn.fetch(query, *params)
                        result = [dict(row) for row in rows]
                    else:
                        result = await conn.execute(query, *params)
                    
                    return [TextContent(
                        type="text",
                        text=json.dumps(result, indent=2, default=str)
                    )]
                finally:
                    await conn.close()
```

### 2. Serveur API REST

```python
# api-mcp-server.py
import aiohttp
import json
from mcp.server import Server

class APIMCPServer:
    def __init__(self, base_url: str, api_key: str = None):
        self.server = Server("api-server")
        self.base_url = base_url
        self.api_key = api_key
        self.setup_handlers()
    
    def setup_handlers(self):
        @self.server.list_tools()
        async def list_tools():
            return [
                Tool(
                    name="api_request",
                    description="Make HTTP request to API",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "method": {
                                "type": "string",
                                "enum": ["GET", "POST", "PUT", "DELETE"]
                            },
                            "endpoint": {"type": "string"},
                            "data": {"type": "object"},
                            "headers": {"type": "object"}
                        },
                        "required": ["method", "endpoint"]
                    }
                )
            ]
        
        @self.server.call_tool()
        async def call_tool(name: str, arguments: dict):
            if name == "api_request":
                method = arguments["method"]
                endpoint = arguments["endpoint"]
                data = arguments.get("data")
                headers = arguments.get("headers", {})
                
                if self.api_key:
                    headers["Authorization"] = f"Bearer {self.api_key}"
                
                url = f"{self.base_url}/{endpoint.lstrip('/')}"
                
                async with aiohttp.ClientSession() as session:
                    async with session.request(
                        method, url, json=data, headers=headers
                    ) as response:
                        result = await response.json()
                        
                        return [TextContent(
                            type="text",
                            text=json.dumps({
                                "status": response.status,
                                "data": result
                            }, indent=2)
                        )]
```

## Intégration avec Claude et autres LLM

### Configuration Claude Desktop

**~/.config/claude-desktop/claude_desktop_config.json**
```json
{
  "mcpServers": {
    "file-server": {
      "command": "python",
      "args": ["/path/to/file-server.py"],
      "env": {
        "WORKSPACE_PATH": "/home/user/projects"
      }
    },
    "database-server": {
      "command": "python", 
      "args": ["/path/to/database-server.py"],
      "env": {
        "DATABASE_URL": "postgresql://user:pass@localhost/db"
      }
    },
    "github-server": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your-token"
      }
    }
  }
}
```

### Utilisation avec Claude

Une fois configuré, vous pouvez demander à Claude :

```
🧠 "Peux-tu chercher tous les fichiers TODO dans mon projet 
   et me faire un résumé des tâches à faire ?"

🧠 "Exécute une requête SQL pour trouver tous les utilisateurs 
   créés cette semaine"

🧠 "Récupère les issues GitHub ouvertes sur mon repository 
   et classe-les par priorité"
```

Claude utilisera automatiquement les serveurs MCP appropriés pour répondre.

## Serveurs MCP officiels

### Installation et configuration

```bash
# Serveur GitHub
npx @anthropic/mcp-server-github

# Serveur filesystem
npx @anthropic/mcp-server-filesystem

# Serveur SQLite
npx @anthropic/mcp-server-sqlite

# Serveur Brave Search
npx @anthropic/mcp-server-brave-search

# Serveur Google Drive
npx @anthropic/mcp-server-gdrive
```

### Configuration complète

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-filesystem", "/path/to/allowed/files"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
      }
    },
    "sqlite": {
      "command": "npx", 
      "args": ["-y", "@anthropic/mcp-server-sqlite", "/path/to/database.db"]
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "your-brave-api-key"
      }
    }
  }
}
```

## Cas d'usage avancés

### 1. Serveur de monitoring

```python
# monitoring-mcp-server.py
import psutil
import docker
from mcp.server import Server

class MonitoringMCPServer:
    def __init__(self):
        self.server = Server("monitoring-server")
        self.docker_client = docker.from_env()
        self.setup_handlers()
    
    def setup_handlers(self):
        @self.server.list_tools()
        async def list_tools():
            return [
                Tool(name="system_stats", description="Get system statistics"),
                Tool(name="docker_stats", description="Get Docker container statistics"),
                Tool(name="process_list", description="List running processes")
            ]
        
        @self.server.call_tool()
        async def call_tool(name: str, arguments: dict):
            if name == "system_stats":
                stats = {
                    "cpu_percent": psutil.cpu_percent(interval=1),
                    "memory": psutil.virtual_memory()._asdict(),
                    "disk": psutil.disk_usage('/')._asdict(),
                    "network": psutil.net_io_counters()._asdict()
                }
                return [TextContent(type="text", text=json.dumps(stats, indent=2))]
            
            elif name == "docker_stats":
                containers = []
                for container in self.docker_client.containers.list():
                    stats = container.stats(stream=False)
                    containers.append({
                        "name": container.name,
                        "status": container.status,
                        "cpu_usage": self.calculate_cpu_percent(stats),
                        "memory_usage": stats['memory_stats']['usage']
                    })
                return [TextContent(type="text", text=json.dumps(containers, indent=2))]
```

### 2. Serveur de développement

```python
# dev-tools-mcp-server.py
import subprocess
import os
from mcp.server import Server

class DevToolsMCPServer:
    def __init__(self, project_root: str):
        self.server = Server("dev-tools-server")
        self.project_root = project_root
        self.setup_handlers()
    
    def setup_handlers(self):
        @self.server.list_tools()
        async def list_tools():
            return [
                Tool(name="run_tests", description="Run project tests"),
                Tool(name="git_status", description="Get Git repository status"),
                Tool(name="build_project", description="Build the project"),
                Tool(name="lint_code", description="Run code linting")
            ]
        
        @self.server.call_tool()
        async def call_tool(name: str, arguments: dict):
            os.chdir(self.project_root)
            
            commands = {
                "run_tests": ["npm", "test"],
                "git_status": ["git", "status", "--porcelain"],
                "build_project": ["npm", "run", "build"],
                "lint_code": ["npm", "run", "lint"]
            }
            
            if name in commands:
                result = subprocess.run(
                    commands[name], 
                    capture_output=True, 
                    text=True
                )
                
                output = f"Exit code: {result.returncode}\n"
                output += f"STDOUT:\n{result.stdout}\n"
                if result.stderr:
                    output += f"STDERR:\n{result.stderr}"
                
                return [TextContent(type="text", text=output)]
```

## Debug et troubleshooting

### Logging et debugging

```python
import logging
import sys

# Configuration du logging pour MCP
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stderr)  # Important: utiliser stderr pour MCP
    ]
)

logger = logging.getLogger("mcp-server")

class DebuggableMCPServer:
    def __init__(self):
        self.server = Server("debug-server")
        self.setup_handlers()
    
    def setup_handlers(self):
        @self.server.call_tool()
        async def call_tool(name: str, arguments: dict):
            logger.info(f"Tool called: {name} with arguments: {arguments}")
            
            try:
                # Logique du tool
                result = await self.process_tool(name, arguments)
                logger.info(f"Tool {name} completed successfully")
                return result
            except Exception as e:
                logger.error(f"Tool {name} failed: {e}", exc_info=True)
                raise
```

### Validation des schémas

```python
import jsonschema
from mcp.types import Tool

def create_validated_tool(name: str, description: str, schema: dict) -> Tool:
    """Crée un tool avec validation du schéma"""
    
    # Validation du schéma JSON
    try:
        jsonschema.Draft7Validator.check_schema(schema)
    except jsonschema.SchemaError as e:
        raise ValueError(f"Invalid schema for tool {name}: {e}")
    
    return Tool(
        name=name,
        description=description,
        inputSchema=schema
    )

# Utilisation
search_tool = create_validated_tool(
    name="search_files",
    description="Search for files",
    schema={
        "type": "object",
        "properties": {
            "query": {"type": "string", "minLength": 1},
            "directory": {"type": "string"}
        },
        "required": ["query"]
    }
)
```

## Bonnes pratiques et sécurité

### Sécurité des serveurs MCP

```python
import os
import hashlib
from pathlib import Path

class SecureMCPServer:
    def __init__(self, allowed_paths: list[str]):
        self.allowed_paths = [Path(p).resolve() for p in allowed_paths]
        self.server = Server("secure-server")
        self.setup_handlers()
    
    def validate_path(self, path: str) -> bool:
        """Valide qu'un chemin est autorisé"""
        try:
            resolved_path = Path(path).resolve()
            return any(
                resolved_path.is_relative_to(allowed) 
                for allowed in self.allowed_paths
            )
        except:
            return False
    
    def setup_handlers(self):
        @self.server.read_resource()
        async def read_resource(uri: str) -> str:
            if not uri.startswith("file://"):
                raise ValueError("Only file:// URIs supported")
            
            path = uri[7:]
            
            # Validation sécurisée du chemin
            if not self.validate_path(path):
                raise PermissionError(f"Access denied to path: {path}")
            
            # Lecture sécurisée
            try:
                with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                return TextContent(type="text", text=content)
            except Exception as e:
                raise RuntimeError(f"Failed to read file: {e}")

# Configuration avec limitations
secure_server = SecureMCPServer([
    "/home/user/projects",
    "/home/user/documents"
])
```

### Rate limiting et quotas

```python
import asyncio
import time
from collections import defaultdict

class RateLimitedMCPServer:
    def __init__(self, requests_per_minute: int = 60):
        self.server = Server("rate-limited-server")
        self.requests_per_minute = requests_per_minute
        self.request_history = defaultdict(list)
        self.setup_handlers()
    
    async def check_rate_limit(self, client_id: str) -> bool:
        """Vérifie les limites de débit"""
        now = time.time()
        minute_ago = now - 60
        
        # Nettoyer l'historique
        self.request_history[client_id] = [
            timestamp for timestamp in self.request_history[client_id]
            if timestamp > minute_ago
        ]
        
        # Vérifier la limite
        if len(self.request_history[client_id]) >= self.requests_per_minute:
            return False
        
        # Enregistrer la nouvelle requête
        self.request_history[client_id].append(now)
        return True
    
    def setup_handlers(self):
        @self.server.call_tool()
        async def call_tool(name: str, arguments: dict):
            client_id = arguments.get("client_id", "anonymous")
            
            if not await self.check_rate_limit(client_id):
                raise RuntimeError("Rate limit exceeded. Please try again later.")
            
            # Traitement normal du tool
            return await self.process_tool(name, arguments)
```

## Ressources et écosystème

### Documentation officielle
- [Model Context Protocol](https://modelcontextprotocol.io/) - Site officiel
- [MCP Specification](https://spec.modelcontextprotocol.io/) - Spécification complète
- [Python SDK](https://github.com/anthropics/python-mcp-sdk) - SDK Python officiel
- [TypeScript SDK](https://github.com/anthropics/typescript-mcp-sdk) - SDK TypeScript

### Serveurs MCP officiels
- [@anthropic/mcp-server-filesystem](https://github.com/anthropics/mcp-server-filesystem) - Accès aux fichiers
- [@anthropic/mcp-server-github](https://github.com/anthropics/mcp-server-github) - Intégration GitHub
- [@anthropic/mcp-server-sqlite](https://github.com/anthropics/mcp-server-sqlite) - Base SQLite
- [@anthropic/mcp-server-brave-search](https://github.com/anthropics/mcp-server-brave-search) - Recherche web

### Communauté et outils
- [MCP Hub](https://github.com/anthropics/mcp-hub) - Registre des serveurs communautaires
- [MCP Examples](https://github.com/anthropics/mcp-examples) - Exemples d'implémentation
- [Claude Desktop](https://claude.ai/download) - Client officiel avec support MCP

## Conclusion

MCP révolutionne l'écosystème des LLM en 2025 :

**Avantages clés :**
- **Standardisation** : Protocol universel pour toutes les intégrations
- **Réutilisabilité** : Serveurs MCP utilisables par toutes les applications
- **Sécurité** : Contrôle granulaire des accès et permissions
- **Évolutivité** : Écosystème ouvert et extensible

**Impact sur le développement :**
- Connectivité LLM ↔ données externes simplifiée
- Réduction drastique du temps de développement d'intégrations
- Écosystème unifié et interopérable
- Nouveaux workflows d'automatisation possibles

**Adoption recommandée :**
1. **Commencer** par utiliser les serveurs MCP existants
2. **Développer** des serveurs custom pour vos besoins spécifiques
3. **Intégrer** MCP dans vos applications existantes
4. **Contribuer** à l'écosystème open source

MCP est l'avenir de l'intégration LLM - adoptez-le dès maintenant pour rester à la pointe de l'IA conversationnelle.