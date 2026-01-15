# Convex-testaus ja tietokantataulut

## ✅ Mitä on tehty

1. **Testiskriptit luotu:**
   - `scripts/testConvexSimple.js` - Yksinkertainen yhteystesti
   - `scripts/createTestData.ts` - Testidatan luonti (vaatii funktiot)
   - `scripts/createTestDataDirect.js` - Ohjeet testidatan luomiseen

2. **NPM-skriptit lisätty:**
   - `npm run test:convex` - Testaa Convex-yhteyden
   - `npm run create:test-data` - Luo testidataa

## 🎯 Tietokantataulut

Convex-luokassa on määritelty seuraavat taulut (`convex/schema.ts`):

### 1. **quotations** - Tarjouslaskennat
- Kaikki tarjouslaskennat ja niiden versiot
- Sisältää: projektitiedot, asiakastiedot, hinnoittelun, elementit, tuotteet, jne.

### 2. **messages** - Viestit
- Projektiin liittyvät viestit
- Sisältää: aikaleima, kirjoittaja, teksti, tyyppi (internal/customer)

### 3. **communicationTasks** - Kommunikointitehtävät
- Tehtävälista kommunikointiin
- Sisältää: tyyppi, otsikko, kuvaus, määräaika, valmis-tila, jne.

### 4. **costEntries** - Jälkilaskenta
- Todelliset kustannukset projekteille
- Sisältää: päivämäärä, kategoria, kuvaus, summa, toimittaja, jne.

### 5. **files** - Projektitiedostot
- Projektiin liittyvät tiedostot ja liitteet
- Sisältää: nimi, koko, kategoria, latausaika, lataaja, jne.

### 6. **pricingTemplates** - Hinnoittelupohjat
- Yrityskohtaiset hinnoittelupohjat
- Sisältää: katekerroimet, provisio, ALV-tila, jne.

## 🚀 Testaa nyt

### Vaihtoehto 1: Käytä sovellusta (helpoin)

1. **Käynnistä sovellus:**
   ```bash
   npm run dev
   ```

2. **Luo uusi tarjous:**
   - Mene sovellukseen
   - Luo uusi tarjouslaskenta
   - Tallenna

3. **Tarkista Convex Dashboard:**
   - Mene: https://dashboard.convex.dev
   - Valitse projekti: **original-aardvark-584**
   - Mene **Data** -välilehteen
   - Näet `quotations` taulun ja juuri luodun tarjouksen!

### Vaihtoehto 2: Synkronoi funktiot ensin

Jos haluat käyttää testiskriptejä:

1. **Synkronoi funktiot:**
   - Avaa PowerShell/CMD (ei Cursorissa)
   - Suorita: `npx convex dev`
   - Odota että funktiot synkronoituvat

2. **Luo testidata:**
   ```bash
   npm run create:test-data
   ```

3. **Tarkista Dashboard:**
   - Mene Data-välilehteen
   - Näet kaikki taulut ja testidatan

## 📊 Tarkista taulut Convex Dashboardissa

1. Mene: https://dashboard.convex.dev
2. Valitse projekti: **original-aardvark-584**
3. Mene **Data** -välilehteen
4. Näet kaikki taulut:
   - `quotations`
   - `messages`
   - `communicationTasks`
   - `costEntries`
   - `files`
   - `pricingTemplates`

## 🔍 Testaa yhteys

```bash
npm run test:convex
```

Tämä testaa että Convex URL on saavutettavissa.

## ✅ Kun kaikki toimii

- ✅ Taulut luodaan automaattisesti kun dataa tallennetaan
- ✅ Data synkronoidaan reaaliajassa
- ✅ Kaikki käyttäjät näkevät saman datan
- ✅ Tietokanta skaalautuu automaattisesti
