# Convex-tietokantataulut - Yhteenveto

## 📊 6 Tietokantataulua

### 1. **quotations** 
**Mitä:** Kaikki tarjouslaskennat
- Projektitiedot, asiakastiedot, hinnoittelu, elementit, tuotteet
- Versiohistoria, workflow-tila, sopimustiedot
- **Indeksit:** project, customer, owner, status, created

### 2. **messages**
**Mitä:** Viestit projekteihin
- Aikaleima, kirjoittaja, teksti, tyyppi (internal/customer)
- **Indeksit:** quotation, timestamp

### 3. **communicationTasks**
**Mitä:** Kommunikointitehtävät
- Puhelut, sähköpostit, tapaamiset
- Määräaika, valmis-tila, vastuuhenkilö
- **Indeksit:** quotation, completed, due_date

### 4. **costEntries**
**Mitä:** Jälkilaskenta (todelliset kustannukset)
- Päivämäärä, kategoria, summa, toimittaja
- Materiaali/työ-kustannukset
- **Indeksit:** quotation, date, category

### 5. **files**
**Mitä:** Projektitiedostot
- Pääpiirustukset, rakennesuunnitelmat, sopimukset
- Convex Storage -viittaus
- **Indeksit:** quotation, category

### 6. **pricingTemplates**
**Mitä:** Hinnoittelupohjat
- Katekerroimet, provisio, ALV-tila
- Oletusmalli
- **Indeksit:** default

---

## 🚀 Miten taulut luodaan

### Automaattinen luonti (suositus)
Taulut luodaan **automaattisesti** kun:
1. **Käytät sovellusta:**
   ```bash
   npm run dev
   ```
   - Luo tarjous → Tallenna
   - Data tallennetaan Convexiin
   - Taulut luodaan automaattisesti

2. **Synkronoit funktiot:**
   ```bash
   npx convex dev
   ```
   - Synkronoi `convex/schema.ts` Convexiin
   - Luo taulut automaattisesti

### Tarkista Dashboard
1. Mene: https://dashboard.convex.dev
2. Valitse: **original-aardvark-584**
3. Mene: **Data** -välilehti
4. Näet kaikki taulut

---

## ✅ Testaa nyt

### Helpoin tapa:
```bash
npm run dev
```
→ Luo tarjous → Tallenna → Tarkista Dashboard

### Synkronoi funktiot:
```bash
npx convex dev
```
→ Odota synkronointia → Tarkista Dashboard

---

## 📋 Tiedostot

- `convex/schema.ts` - Tietokantakaavio (määrittää kaikki taulut)
- `convex/quotations.ts` - CRUD-funktiot quotations-tauluun
- `convex/messages.ts` - Viestien hallinta
- `convex/communicationTasks.ts` - Tehtävien hallinta
- `convex/costEntries.ts` - Kustannusten hallinta
- `convex/files.ts` - Tiedostojen hallinta
- `convex/pricingTemplates.ts` - Mallien hallinta

---

## 🎯 Valmis!

Kaikki tietokantataulut on määritelty ja ne luodaan automaattisesti kun dataa tallennetaan!
