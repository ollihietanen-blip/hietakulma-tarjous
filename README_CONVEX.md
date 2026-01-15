# Convex-tietokannan nopea aloitus

## Yksinkertaiset vaiheet

### 1. Kirjaudu Convex-tiliisi

```bash
npx convex login
```

Tämä avaa selaimen, jossa kirjaudut Convex-tilillesi.

### 2. Alusta projekti

```bash
npx convex dev
```

Tämä komento:
- Kysyy projektin nimeä (esim. "hietakulma-tarjous")
- Luo yhteyden Convex-palvelimelle
- Synkronoi tietokantakaavion
- Lisää `VITE_CONVEX_URL` `.env.local` tiedostoon

**Pidä tämä terminaali auki!** Se synkronoi muutokset automaattisesti.

### 3. Tarkista että kaikki toimii

Kun `npx convex dev` on käynnissä, näet:
- ✅ Convex Dashboard URL:n
- ✅ Synkronoitujen funktioiden listan
- ✅ Tietokantataulut (quotations, messages, jne.)

## Mitä tapahtuu?

1. **Tietokantataulut luodaan** Convex-palvelimelle:
   - `quotations` - Kaikki tarjouslaskennat
   - `messages` - Viestit
   - `communicationTasks` - Tehtävät
   - `costEntries` - Jälkilaskenta
   - `files` - Tiedostot
   - `pricingTemplates` - Hinnoittelupohjat

2. **Funktiot synkronoidaan**:
   - `convex/quotations.ts` - CRUD-operaatiot
   - `convex/messages.ts` - Viestien hallinta
   - `convex/communicationTasks.ts` - Tehtävien hallinta
   - `convex/costEntries.ts` - Kustannusten hallinta
   - `convex/files.ts` - Tiedostojen hallinta
   - `convex/pricingTemplates.ts` - Mallien hallinta

3. **Sovellus yhdistyy automaattisesti** kun `VITE_CONVEX_URL` on määritelty

## Tarkista Convex Dashboard

Avaa Convex Dashboard URL (näkyy `npx convex dev` -komennon tulosteessa):
- Näet kaikki tietokantataulut
- Voit testata funktioita
- Näet datan reaaliajassa

## Ongelmat?

1. **"Cannot prompt for input"**: Suorita komennot PowerShell/CMD:ssä, ei Cursorissa
2. **"Not logged in"**: Suorita `npx convex login` uudelleen
3. **".env.local ei päivity"**: Tarkista että `npx convex dev` on käynnissä
4. **"Schema errors"**: Tarkista `convex/schema.ts` syntaksivirheet

## Seuraavat vaiheet

Kun Convex on alustettu:
1. ✅ Tietokantataulut ovat käytettävissä
2. ✅ Voit alkaa tallentaa dataa Convexiin
3. ✅ Sovellus käyttää Convexia automaattisesti

## Tuotantokäyttöönotto

Kun olet valmis:
```bash
npm run convex:deploy
```

Tämä julkaisee funktiot tuotantoympäristöön.
