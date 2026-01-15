# 🚀 Convex MCP - Nopea aloitus

## ✅ MCP on konfiguroitu!

Convex MCP (Model Context Protocol) on nyt valmiina käyttöön. Tämä mahdollistaa AI-assistenttien käyttää Convex-tietokantaa suoraan.

## 📝 Aktivointi 3 vaiheessa

### 1. Avaa Cursor Settings
- Paina `Ctrl+,` (Windows) tai `Cmd+,` (Mac)
- Etsi "MCP" tai "Model Context Protocol"

### 2. Lisää Convex MCP Server
Kopioi seuraavat asetukset:

- **Name**: `convex`
- **Command**: `npx`
- **Args**: `["-y", "convex@latest", "mcp", "start"]`
- **Environment Variables**:
  - `CONVEX_PROJECT` = `original-aardvark-584`
  - `CONVEX_URL` = `https://original-aardvark-584.convex.cloud`

### 3. Uudelleenkäynnistä Cursor
Uudelleenkäynnistä Cursor, jotta MCP aktivoituu.

## ✅ Testaa

Kun MCP on aktiivinen, kokeile:
- "Näytä Convex-tietokantataulujen skeema"
- "Listaa quotations-taulun kaikki rivit"

## 📚 Tarkemmat ohjeet

Katso `MCP_SETUP.md` tiedostosta yksityiskohtaiset ohjeet.
