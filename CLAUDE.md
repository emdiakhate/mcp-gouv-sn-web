# Interface MCP ANSD Sénégal

## Architecture

- Framework : Next.js 16 + React 19 + TypeScript + Tailwind CSS v4
- MCP connecté : ansd-senegal (serveur MCP via JSON-RPC sur `/mcp`)
- LLM : OpenRouter (anthropic/claude-sonnet-4 par défaut)
- Visualisation : Chart.js + react-chartjs-2 + SheetJS (xlsx)
- Markdown : react-markdown + remark-gfm

## Structure du projet

```
src/
├── app/
│   ├── api/chat/route.ts    # Route API SSE (streaming) — orchestre LLM + MCP tools
│   ├── globals.css           # Variables CSS (light/dark) + styles messages
│   ├── layout.tsx
│   └── page.tsx              # Page principale — gestion conversations, état, streaming
├── components/
│   ├── ChatInput.tsx         # Zone de saisie avec auto-resize
│   ├── ChatMessages.tsx      # Rendu des messages + tool status + intégration VizRenderer
│   ├── VizRenderer.tsx       # Composant de visualisation (bar, line, pie, stat, table, grouped-bar)
│   ├── SectorChips.tsx       # Chips sectoriels (Santé, Économie, etc.)
│   ├── SenegalFlag.tsx       # Drapeau SVG
│   ├── Sidebar.tsx           # Historique conversations + thème
│   └── ThemeProvider.tsx     # Provider light/dark mode
├── config/
│   └── systemPrompt.ts      # System prompt avec règles de visualisation
├── constants/
│   └── colors.ts             # Palette de couleurs pour les graphiques
└── utils/
    ├── parseViz.ts           # Parse les blocs <viz> dans les réponses
    └── exportExcel.ts        # Export Excel côté client (SheetJS)
```

## Système de visualisation

Le system prompt demande à Claude de retourner un bloc `<viz type="...">` JSON après chaque réponse avec données.

Types supportés : `bar` | `line` | `pie` | `stat` | `table` | `grouped-bar`

Le composant `VizRenderer` (`src/components/VizRenderer.tsx`) parse et affiche le bon composant.

### Flux :
1. La réponse LLM contient du texte markdown + un bloc `<viz type="...">{ JSON }</viz>`
2. `parseMessageWithViz()` sépare texte et blocs viz
3. `ChatMessages` rend le markdown avec ReactMarkdown puis les viz avec `VizRenderer`
4. Chaque viz a des boutons "Copier" et "Télécharger Excel"

## Règles de développement

- Toujours tester avec une vraie réponse MCP avant de merger
- Les couleurs des graphiques sont définies dans `src/constants/colors.ts` — ne jamais les hardcoder dans les composants
- Le system prompt est dans `src/config/systemPrompt.ts`
- Les variables CSS (thème light/dark) sont dans `src/app/globals.css`
- Le nettoyage des artefacts XML se fait dans `page.tsx` (regex sur `<function_calls>` etc.)

## Commandes utiles

```bash
npm run dev       # Démarrer en mode développement (http://localhost:3000)
npm run build     # Build de production
npm run lint      # Linter ESLint
```

## Variables d'environnement

```bash
OPENROUTER_API_KEY=sk-or-v1-...    # Requis — clé OpenRouter
OPENROUTER_MODEL=anthropic/claude-sonnet-4  # Optionnel — modèle LLM
MCP_SERVER_URL=https://mcp-gouv-sn-production.up.railway.app  # Optionnel — serveur MCP
```
