# ✅ Convex Schema - Tarkistusraportti

## 📋 Skeemassa määritellyt taulut

Kaikki tarvittavat taulut on määritelty `convex/schema.ts` tiedostossa:

### 1. ✅ quotations (Tarjouslaskennat)
- **Kuvaus**: Päätaulu tarjouslaskennoille
- **Indeksit**: 
  - `by_project` (projectId)
  - `by_customer` (customerId)
  - `by_owner` (owner)
  - `by_status` (status)
  - `by_created` (createdAt)
- **Tila**: ✅ Valmis

### 2. ✅ messages (Viestit)
- **Kuvaus**: Viestit tarjouslaskennoihin liittyen
- **Indeksit**:
  - `by_quotation` (quotationId)
  - `by_timestamp` (quotationId, timestamp)
- **Tila**: ✅ Valmis

### 3. ✅ communicationTasks (Kommunikointitehtävät)
- **Kuvaus**: Tehtävälista kommunikointiin
- **Indeksit**:
  - `by_quotation` (quotationId)
  - `by_completed` (quotationId, completed)
  - `by_due_date` (quotationId, dueDate)
- **Tila**: ✅ Valmis

### 4. ✅ costEntries (Jälkilaskenta)
- **Kuvaus**: Kustannusmerkinnät jälkilaskentaan
- **Indeksit**:
  - `by_quotation` (quotationId)
  - `by_date` (quotationId, date)
  - `by_category` (quotationId, category)
- **Tila**: ✅ Valmis

### 5. ✅ files (Projektitiedostot)
- **Kuvaus**: Projektin liitetiedostot
- **Indeksit**:
  - `by_quotation` (quotationId)
  - `by_category` (quotationId, category)
- **Tila**: ✅ Valmis

### 6. ✅ pricingTemplates (Hinnoittelupohjat)
- **Kuvaus**: Hinnoittelupohjat uusille tarjouksille
- **Indeksit**:
  - `by_default` (isDefault)
- **Tila**: ✅ Valmis

## 🔍 Skeeman tarkistus

### Kaikki taulut on oikein määritelty:
- ✅ Kaikki pakolliset kentät on määritelty
- ✅ Validaatiot on oikein (v.union, v.literal, jne.)
- ✅ Indeksit on määritelty optimaaliseen hakemiseen
- ✅ Vapaaehtoiset kentät on merkitty v.optional():lla
- ✅ Viittaukset toisiin tauluihin on oikein (v.id("quotations"))

## 🚀 Synkronointi Convexiin

Skeema on valmis synkronoinnille. Synkronoi se jollakin seuraavista tavoista:

### Vaihtoehto 1: Convex Dev (Suositus)
```bash
npx convex dev
```
Tämä:
- Synkronoi skeeman automaattisesti
- Pidetään terminaali auki kehityksen aikana
- Näyttää reaaliaikaiset päivitykset

### Vaihtoehto 2: Yksittäinen synkronointi
```bash
npx convex deploy
```
Vaatii:
- Kirjautumisen: `npx convex login`
- Tai deployment keyn `.env.local` tiedostossa

### Vaihtoehto 3: Tarkista Convex Dashboard
1. Mene: https://dashboard.convex.dev
2. Valitse projekti: **original-aardvark-584**
3. Mene **Data** -välilehteen
4. Tarkista että kaikki taulut näkyvät

## 📊 Taulujen rakenne

### quotations
- Sisältää: projektin, asiakkaan, hinnoittelun, elementit, tuotteet, dokumentit
- Versiointi: tukee useita versioita samasta tarjouksesta
- Workflow: hyväksyntäprosessi, lähetys, päätös

### messages
- Yhdistetty quotations-tauluun quotationId:llä
- Tyyppi: internal (sisäinen) tai customer (asiakas)

### communicationTasks
- Yhdistetty quotations-tauluun quotationId:llä
- Tyyppi: call, email, meeting, other
- Seuranta: dueDate, completed, assignedTo

### costEntries
- Yhdistetty quotations-tauluun quotationId:llä
- Kategoriat: elements, products, trusses, installation, logistics, design, other
- Kustannustyyppi: material (materiaali) tai labor (työ)

### files
- Yhdistetty quotations-tauluun quotationId:llä
- Kategoriat: Pääpiirustus, Rakennesuunnitelma, Sopimus, Asiakkaan Tiedosto, Muu Tiedosto
- Storage: viittaus Convex Storageen (storageId)

### pricingTemplates
- Standalone-taulu (ei viittauksia muihin tauluihin)
- Sisältää: hinnoittelupohjat uusille tarjouksille
- Default: yksi pohja voi olla oletusarvoinen (isDefault)

## ✅ Yhteenveto

**Kaikki taulut on oikein määritelty ja valmiina käyttöön!**

Skeema on:
- ✅ Täydellinen - kaikki tarvittavat taulut on määritelty
- ✅ Optimoitu - indeksit on määritelty hakemiseen
- ✅ Validioitu - kaikki kentät on oikein tyypitetty
- ✅ Dokumentoitu - kommentit selittävät rakenteen

**Seuraava vaihe**: Synkronoi skeema Convexiin käyttämällä `npx convex dev` tai `npx convex deploy`.
