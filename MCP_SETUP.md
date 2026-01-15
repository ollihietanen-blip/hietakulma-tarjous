# Convex MCP (Model Context Protocol) -konfiguraatio

## ✅ MCP on nyt konfiguroitu!

Tämä projekti käyttää nyt Convex MCP:tä, mikä mahdollistaa AI-assistenttien (kuten Cursor) käyttää Convex-tietokantaa suoraan ilman koodia.

## 🎯 Mitä MCP tarjoaa

MCP:n kautta AI-assistentit voivat:
- ✅ **Selata tietokantataulujen skeemaa** - Näe kaikki taulut ja niiden kentät
- ✅ **Kutsua Convex-funktioita** - Suorita queries, mutations ja actions
- ✅ **Lukea ja kirjoittaa dataa** - Käsittele tietokantaa suoraan
- ✅ **Tarkastella funktioita** - Katso mitä funktioita on saatavilla

## 📋 Konfiguraatio

MCP-konfiguraatio on määritelty `cursor-mcp-config.json` tiedostossa. Tämä tiedosto sisältää kaikki tarvittavat asetukset Convex MCP Serverille.

**Konfiguraatiotiedosto:** `cursor-mcp-config.json`

```json
{
  "mcpServers": {
    "convex": {
      "command": "npx",
      "args": ["-y", "convex@latest", "mcp", "start"],
      "env": {
        "CONVEX_PROJECT": "original-aardvark-584",
        "CONVEX_URL": "https://original-aardvark-584.convex.cloud"
      }
    }
  }
}
```

## 🚀 Aktivointi Cursorissa

### Vaihe 1: Tarkista Cursorin MCP-asetukset

1. Avaa Cursor Settings (Ctrl+, tai Cmd+,)
2. Etsi "MCP" tai "Model Context Protocol" -asetukset
3. Varmista että MCP on käytössä

### Vaihe 2: Lisää Convex MCP Server

**Tapa A: Kopioi konfiguraatio Cursorin asetuksiin**

1. Mene Cursor Settings → MCP
2. Lisää uusi MCP Server:
   - **Name**: `convex`
   - **Command**: `npx`
   - **Args**: `["-y", "convex@latest", "mcp", "start"]`
   - **Environment Variables**:
     - `CONVEX_PROJECT`: `original-aardvark-584`
     - `CONVEX_URL`: `https://original-aardvark-584.convex.cloud`

**Tapa B: Käytä konfiguraatiotiedostoa**

Jos Cursor tukee projektikohtaisia MCP-konfiguraatioita, kopioi `cursor-mcp-config.json` sisältö Cursorin MCP-asetuksiin.

### Vaihe 3: Uudelleenkäynnistä Cursor

Uudelleenkäynnistä Cursor, jotta MCP-konfiguraatio aktivoituu.

## ✅ Testaa MCP-toimivuus

Kun MCP on aktivoitu, voit testata sitä pyytämällä AI-assistenttia:

- "Näytä Convex-tietokantataulujen skeema"
- "Listaa kaikki quotations-taulun rivit"
- "Kutsu Convex-funktiota X"

## 🔄 MCP vs. Suora integraatio

### MCP (kehitykseen)
- ✅ AI-assistenttien käyttöön
- ✅ Kehityksen ja testauksen helpottaminen
- ✅ Skeeman ja funktioiden tarkastelu
- ✅ Nopea data-analyysi

### Suora integraatio (sovellukseen)
- ✅ React-sovellus käyttää edelleen `ConvexReactClient`:ia
- ✅ Reaaliaikainen synkronointi
- ✅ Optimistiset päivitykset
- ✅ Automaattinen cache-hallinta

**Molemmat toimivat yhdessä!** MCP on kehitystyökalu, suora integraatio on runtime-ratkaisu.

## 📚 Lisätietoja

- [Convex MCP Server dokumentaatio](https://docs.convex.dev/ai/using-cursor)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Convex dokumentaatio](https://docs.convex.dev)

## ⚠️ Huomioita

- MCP on vielä beta-vaiheessa, mutta stabiili käyttöön
- MCP vaatii Convex CLI version 1.19.5 tai uudemman (projektissa 1.31.4 ✅)
- MCP ei korvaa sovelluksen runtime-integraatiota, vaan täydentää sitä

## 🎉 Valmis!

Convex MCP on nyt konfiguroitu ja valmiina käyttöön. AI-assistentit voivat nyt käyttää Convex-tietokantaa suoraan!
