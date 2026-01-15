# Convex - Nopea aloitus (3 vaihetta)

## ⚡ Nopea aloitus

### Vaihe 1: Kirjaudu (30 sekuntia)
```bash
npx convex login
```
→ Avaa selaimen → Kirjaudu → Valmis!

### Vaihe 2: Alusta projekti (1 minuutti)
```bash
npx convex dev
```
→ Valitse projektin nimi → Odota synkronointia → Valmis!

### Vaihe 3: Tarkista (10 sekuntia)
Avaa Convex Dashboard URL (näkyy terminaalissa) → Näet tietokantataulut → Valmis!

---

## 📋 Mitä tapahtuu automaattisesti?

Kun `npx convex dev` on käynnissä:

✅ **Tietokantataulut luodaan:**
- `quotations` - Tarjouslaskennat
- `messages` - Viestit  
- `communicationTasks` - Tehtävät
- `costEntries` - Jälkilaskenta
- `files` - Tiedostot
- `pricingTemplates` - Hinnoittelupohjat

✅ **Funktiot synkronoidaan:**
- `createQuotation`, `updateQuotation`, `getQuotation`
- `addMessage`, `getMessages`
- `createTask`, `updateTask`, `completeTask`
- `addCostEntry`, `getCostEntries`
- `uploadFile`, `getFiles`
- `createPricingTemplate`, `getDefaultTemplate`

✅ **Ympäristömuuttujat päivittyvät:**
- `.env.local` → `VITE_CONVEX_URL=https://your-project.convex.cloud`

✅ **Sovellus yhdistyy automaattisesti:**
- Ei tarvitse tehdä mitään, kunhan `VITE_CONVEX_URL` on määritelty

---

## 🎯 Tarkista että kaikki toimii

1. **Convex Dashboard** (näkyy terminaalissa):
   ```
   https://dashboard.convex.dev/team/your-team/project/your-project
   ```
   → Näet kaikki tietokantataulut
   → Voit testata funktioita
   → Näet datan reaaliajassa

2. **Sovellus:**
   - Käynnistä: `npm run dev`
   - Tarkista konsoli: Ei virheitä Convex-yhteydestä
   - Testaa: Luo uusi tarjous → Tallenna → Tarkista Convex Dashboardista

---

## ❓ Ongelmat?

### "Cannot prompt for input"
→ Suorita komennot PowerShell/CMD:ssä, ei Cursorissa

### "Not logged in"  
→ Suorita `npx convex login` uudelleen

### ".env.local ei päivity"
→ Tarkista että `npx convex dev` on käynnissä
→ Tarkista tiedoston oikeudet

### "Schema errors"
→ Tarkista `convex/schema.ts` syntaksivirheet
→ Katso Convex Dashboardista virheet

---

## 🚀 Seuraavat vaiheet

Kun Convex on alustettu:
1. ✅ Tietokantataulut ovat käytettävissä
2. ✅ Voit alkaa tallentaa dataa Convexiin
3. ✅ Sovellus käyttää Convexia automaattisesti
4. ✅ Data synkronoidaan reaaliajassa kaikille käyttäjille

---

## 📚 Lisätietoja

- Yksityiskohtaiset ohjeet: `README_CONVEX.md`
- Setup-skripti: `setup-convex.ps1`
- Convex dokumentaatio: https://docs.convex.dev
