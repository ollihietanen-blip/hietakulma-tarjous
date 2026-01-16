# Claude API-avaimen asettaminen Convex-ympäristöön

## ⚠️ TURVALLISUUS

API-avain on nyt siirretty **palvelinpuolelle (Convex)** turvallisuussyistä. Tämä estää API-avaimen vuotamisen asiakaspuolelle.

## Vaiheet

### 1. Hae Claude API-avain

Jos tarvitset uuden API-avaimen:

1. Mene [Anthropic Console](https://console.anthropic.com/)
2. Kirjaudu sisään
3. Mene **API Keys** -osioon
4. Luo uusi API-avain tai kopioi olemassa oleva
5. Kopioi avain

### 2. Aseta avain Convex-ympäristöön

**Vaihtoehto A: Convex Dashboard (Suositeltu)**

1. Mene [Convex Dashboard](https://dashboard.convex.dev)
2. Valitse projekti
3. Mene **Settings** → **Environment Variables**
4. Lisää uusi ympäristömuuttuja:
   - **Nimi:** `CLAUDE_API_KEY`
   - **Arvo:** (liitä API-avain)
5. Klikkaa **Save**

**Vaihtoehto B: Convex CLI**

```bash
npx convex env set CLAUDE_API_KEY "your-api-key-here"
```

### 3. Varmista että avain on asetettu

```bash
npx convex env ls
```

Tulisi näkyä `CLAUDE_API_KEY` listassa.

### 4. Käynnistä sovellus uudelleen

Kun olet asettanut avaimen Convex-ympäristöön, käynnistä sovellus uudelleen:

```bash
npm run dev
```

## Tärkeää

- ✅ **ÄLÄ** lisää API-avainta `.env.local` tiedostoon
- ✅ **ÄLÄ** commitoi API-avainta Git-repositorioon
- ✅ **KÄYTÄ** aina Convex-ympäristömuuttujia tuotannossa
- ✅ **KIERRÄ** API-avainta säännöllisesti

## API-tiedot

- **Endpoint:** `https://api.anthropic.com/v1/messages`
- **Malli:** `claude-sonnet-4-5-20250929`
- **Max tokens:** 1024 (oletus)

## Ongelmatilanteet

### "CLAUDE_API_KEY ei ole määritelty Convex-ympäristössä"

1. Tarkista että avain on asetettu Convex Dashboardissa
2. Varmista että käytät oikeaa Convex-projektia
3. Kokeile asettaa avain uudelleen CLI:llä

### "Claude API error: 401"

1. API-avain on virheellinen tai vanhentunut
2. Tarkista että avain on oikein Convex Dashboardissa
3. Luo uusi API-avain Anthropic Consolessa tarvittaessa

## Lisätietoa

- [Convex Environment Variables](https://docs.convex.dev/production/environment-variables)
- [Anthropic API Documentation](https://docs.anthropic.com/claude/reference/messages-post)
