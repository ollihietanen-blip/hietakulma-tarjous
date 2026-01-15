# Convex-tietokantataulut

## 📊 Yhteenveto

Convex-tietokannassa on **6 taulua**, jotka on määritelty `convex/schema.ts` tiedostossa.

## 🗂️ Taulut

### 1. **quotations** - Tarjouslaskennat
**Kuvaus:** Kaikki tarjouslaskennat ja niiden versiot

**Tärkeimmät kentät:**
- `projectId` - Viittaus eri järjestelmän projektiin
- `customerId` - Viittaus eri järjestelmän asiakkaaseen
- `status` - Tila (draft, awaiting_approval, approved, sent, accepted, rejected)
- `versions` - Versiohistoria
- `project` - Projektin tiedot (nimi, osoite, rakennustyyppi, jne.)
- `customer` - Asiakkaan tiedot (nimi, yhteystiedot, jne.)
- `pricing` - Hinnoittelulaskelma
- `elements` - Elementit
- `products` - Tuotteet (ikkunat, ovet, jne.)
- `documents` - Dokumentit
- `delivery` - Toimitus ja asennus
- `paymentSchedule` - Maksuerät

**Indeksit:**
- `by_project` - Hae projektin mukaan
- `by_customer` - Hae asiakkaan mukaan
- `by_owner` - Hae omistajan mukaan
- `by_status` - Hae tilan mukaan
- `by_created` - Hae luomisajan mukaan

---

### 2. **messages** - Viestit
**Kuvaus:** Projektiin liittyvät viestit ja kommunikointitehtävät

**Tärkeimmät kentät:**
- `quotationId` - Viittaus tarjouslaskentaan
- `timestamp` - Aikaleima
- `author` - Kirjoittaja
- `text` - Viestin sisältö
- `type` - Tyyppi (internal/customer)

**Indeksit:**
- `by_quotation` - Hae tarjouslaskennan mukaan
- `by_timestamp` - Hae aikaleiman mukaan

---

### 3. **communicationTasks** - Kommunikointitehtävät
**Kuvaus:** Tehtävälista kommunikointiin

**Tärkeimmät kentät:**
- `quotationId` - Viittaus tarjouslaskentaan
- `type` - Tyyppi (call, email, meeting, other)
- `title` - Otsikko
- `description` - Kuvaus
- `dueDate` - Määräaika
- `completed` - Valmis-tila
- `assignedTo` - Vastuuhenkilö
- `notes` - Muistiinpanot

**Indeksit:**
- `by_quotation` - Hae tarjouslaskennan mukaan
- `by_completed` - Hae valmis-tilan mukaan
- `by_due_date` - Hae määräajan mukaan

---

### 4. **costEntries** - Jälkilaskenta
**Kuvaus:** Todelliset kustannukset projekteille

**Tärkeimmät kentät:**
- `quotationId` - Viittaus tarjouslaskentaan
- `date` - Päivämäärä
- `category` - Kategoria (elements, products, trusses, installation, logistics, design, other)
- `description` - Kuvaus
- `amount` - Summa (ALV 0%)
- `supplier` - Toimittaja
- `costType` - Kustannustyyppi (material/labor)
- `laborHours` - Työtunnit (jos työkustannus)
- `laborRate` - Tuntihinta (jos työkustannus)

**Indeksit:**
- `by_quotation` - Hae tarjouslaskennan mukaan
- `by_date` - Hae päivämäärän mukaan
- `by_category` - Hae kategorian mukaan

---

### 5. **files** - Projektitiedostot
**Kuvaus:** Projektiin liittyvät tiedostot ja liitteet

**Tärkeimmät kentät:**
- `quotationId` - Viittaus tarjouslaskentaan
- `name` - Tiedoston nimi
- `size` - Koko (tavuina)
- `category` - Kategoria (Pääpiirustus, Rakennesuunnitelma, Sopimus, Asiakkaan Tiedosto, Muu Tiedosto)
- `uploadedAt` - Latausaika
- `uploader` - Lataaja
- `storageId` - Viittaus Convex Storageen

**Indeksit:**
- `by_quotation` - Hae tarjouslaskennan mukaan
- `by_category` - Hae kategorian mukaan

---

### 6. **pricingTemplates** - Hinnoittelupohjat
**Kuvaus:** Yrityskohtaiset hinnoittelupohjat ja katekerroimet

**Tärkeimmät kentät:**
- `name` - Mallin nimi
- `categoryMarkups` - Katekerroimet eri kategorioille
- `commissionPercentage` - Provisioprosentti
- `vatMode` - ALV-tila (standard/construction_service)
- `isDefault` - Onko oletusmalli

**Indeksit:**
- `by_default` - Hae oletusmallin mukaan

---

## 🔄 Miten taulut luodaan

### Automaattinen luonti
Taulut luodaan **automaattisesti** kun:
1. Funktiot synkronoidaan Convexiin (`npx convex dev`)
2. Dataa tallennetaan sovelluksessa

### Manuaalinen synkronointi
Synkronoi funktiot:
```bash
npx convex dev
```

Tämä:
- Synkronoi `convex/schema.ts` Convexiin
- Luo taulut automaattisesti
- Päivittää muutokset reaaliajassa

---

## 📊 Tarkista taulut

1. Mene Convex Dashboardiin: https://dashboard.convex.dev
2. Valitse projekti: **original-aardvark-584**
3. Mene **Data** -välilehteen
4. Näet kaikki taulut:
   - `quotations`
   - `messages`
   - `communicationTasks`
   - `costEntries`
   - `files`
   - `pricingTemplates`

---

## 🧪 Testaa taulut

### Vaihtoehto 1: Käytä sovellusta
1. Käynnistä: `npm run dev`
2. Luo tarjous → Tallenna
3. Tarkista Dashboard → Data → quotations

### Vaihtoehto 2: Synkronoi funktiot
1. Suorita PowerShell/CMD:ssä: `npx convex dev`
2. Odota synkronointia
3. Tarkista Dashboard → Data → Näet kaikki taulut

---

## ✅ Valmis!

Kaikki tietokantataulut on määritelty ja ne luodaan automaattisesti kun:
- Funktiot synkronoidaan, TAI
- Dataa tallennetaan sovelluksessa
