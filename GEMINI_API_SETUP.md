# Gemini API-avaimen asettaminen Convex-ympäristöön

## ⚠️ TURVALLISUUS

API-avain on nyt siirretty **palvelinpuolelle (Convex)** turvallisuussyistä. Tämä estää API-avaimen vuotamisen asiakaspuolelle.

## Vaiheet

### 1. Hae uusi Gemini API-avain

Jos vanha avain on vuotanut (403-virhe), sinun täytyy:

1. Mene [Google AI Studio](https://aistudio.google.com/apikey)
2. Poista vanha vuotanut avain
3. Luo uusi API-avain
4. Kopioi uusi avain

### 2. Aseta avain Convex-ympäristöön

**Vaihtoehto A: Convex Dashboard (Suositeltu)**

1. Mene [Convex Dashboard](https://dashboard.convex.dev)
2. Valitse projekti
3. Mene **Settings** → **Environment Variables**
4. Lisää uusi ympäristömuuttuja:
   - **Nimi:** `GEMINI_API_KEY`
   - **Arvo:** (liitä uusi API-avain)
5. Klikkaa **Save**

**Vaihtoehto B: Convex CLI**

```bash
npx convex env set GEMINI_API_KEY "your-new-api-key-here"
```

### 3. Varmista että avain on asetettu

```bash
npx convex env ls
```

Tulisi näkyä `GEMINI_API_KEY` listassa.

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

## Ongelmatilanteet

### "GEMINI_API_KEY ei ole määritelty Convex-ympäristössä"

1. Tarkista että avain on asetettu Convex Dashboardissa
2. Varmista että käytät oikeaa Convex-projektia
3. Kokeile asettaa avain uudelleen CLI:llä

### "API error: 403 - Your API key was reported as leaked"

1. API-avain on vuotanut ja se on merkitty turvattomaksi
2. Luo uusi API-avain Google AI Studiossa
3. Poista vanha avain
4. Aseta uusi avain Convex-ympäristöön (katso yllä)

## Lisätietoa

- [Convex Environment Variables](https://docs.convex.dev/production/environment-variables)
- [Gemini API Security Best Practices](https://ai.google.dev/gemini-api/docs/security-best-practices)
