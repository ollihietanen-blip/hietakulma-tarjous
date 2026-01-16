# Convex - Seuraavat vaiheet

## ✅ Tehty
- Deployment URL lisätty `.env.local` tiedostoon: `https://original-aardvark-584.convex.cloud`

## 📋 Seuraavat vaiheet

### Vaihe 1: Hae Deployment Key (tarvitaan synkronointiin)

1. Mene Convex Dashboardiin: https://dashboard.convex.dev
2. Valitse projekti: **original-aardvark-584**
3. Mene: **Settings** → **Deployment**
4. Klikkaa: **"Generate Production Deploy Key"** (sininen nappi)
5. Kopioi avain

### Vaihe 2: Lisää Deployment Key

Lisää avain `.env.local` tiedostoon:
```
CONVEX_DEPLOYMENT_KEY=your-deployment-key-here
```

### Vaihe 3: Synkronoi skeema

Kun deployment key on lisätty, suorita PowerShell/CMD:ssä:
```bash
npx convex dev --once
```

Tämä synkronoi tietokantakaavion Convexiin.

### Vaihtoehto: Käytä Convex Dashboardia

Jos `npx convex dev` ei toimi, voit:
1. Mene Dashboardiin → **Data** → **Schema**
2. Convex luo taulut automaattisesti kun funktiot synkronoidaan
3. Tai käytä Dashboardin **Functions** -välilehteä testataksesi funktioita

## 🎯 Tarkista että kaikki toimii

1. **Tarkista .env.local:**
   ```
   VITE_CONVEX_URL=https://original-aardvark-584.convex.cloud
   CONVEX_DEPLOYMENT_KEY=your-key-here
   ```
   
   **HUOM:** Claude API-avain asetetaan Convex-ympäristöön, ei .env.local tiedostoon.
   Katso ohjeet: [CLAUDE_API_SETUP.md](CLAUDE_API_SETUP.md)

2. **Testaa sovellus:**
   ```bash
   npm run dev
   ```
   - Tarkista konsoli: Ei virheitä Convex-yhteydestä
   - Sovellus yhdistyy automaattisesti Convexiin

3. **Tarkista Convex Dashboard:**
   - Mene Dashboardiin
   - Valitse projekti
   - Tarkista **Data** -välilehti: Taulut luodaan automaattisesti kun dataa tallennetaan

## 📝 Huomio

- **Deployment URL** = `https://original-aardvark-584.convex.cloud` ✅ (lisätty)
- **HTTP Actions URL** = `https://original-aardvark-584.convex.site` (ei tarvita nyt)
- **Deploy Keys** = Tarvitaan synkronointiin

## 🚀 Kun kaikki on valmis

Sovellus käyttää Convexia automaattisesti:
- ✅ Tarjouslaskennat tallennetaan Convexiin
- ✅ Viestit synkronoidaan reaaliajassa
- ✅ Data on saatavilla kaikille käyttäjille
- ✅ Tietokantataulut luodaan automaattisesti
