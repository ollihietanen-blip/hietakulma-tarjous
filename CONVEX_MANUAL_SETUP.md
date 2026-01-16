# Convex - Manuaalinen asennus (selain ei avautunut)

## ✅ Helpoin tapa: Kirjaudu manuaalisesti selaimessa

### Vaihe 1: Avaa Convex Dashboard
1. Avaa selaimessa: **https://dashboard.convex.dev**
2. Klikkaa "Sign in" tai "Get started"
3. Kirjaudu Google/GitHub-tilillä tai luo uusi tili

### Vaihe 2: Luo projekti
1. Dashboardissa klikkaa "New Project"
2. Anna projektin nimi: **hietakulma-tarjous**
3. Valitse team (tai luo uusi)
4. Klikkaa "Create"

### Vaihe 3: Kopioi projektin URL
Dashboard näyttää projektin URL:n, esim:
```
https://your-project-name.convex.cloud
```

### Vaihe 4: Lisää URL .env.local tiedostoon
1. Avaa `.env.local` tiedosto projektikansiossa
2. Lisää rivi:
   ```
   VITE_CONVEX_URL=https://your-project-name.convex.cloud
   ```
3. Korvaa `your-project-name` oikealla projektin nimellä

### Vaihe 5: Hae deployment key
1. Dashboardissa: Settings → Deployment
2. Kopioi "Deployment Key"
3. Lisää se `.env.local` tiedostoon:
   ```
   CONVEX_DEPLOYMENT_KEY=your-deployment-key-here
   ```

### Vaihe 6: Synkronoi skeema
Kun olet lisännyt URL:n ja avaimen, suorita:
```bash
npx convex dev --once
```

Tämä synkronoi tietokantakaavion Convexiin.

---

## 🔄 Vaihtoehtoinen tapa: Käytä Convex CLI:tä

Jos haluat kokeilla CLI:tä uudelleen:

1. **Avaa PowerShell/CMD erikseen** (ei Cursorissa)
2. Siirry projektikansioon:
   ```bash
   cd C:\Cursor\hietakulma-tarjous
   ```
3. Suorita:
   ```bash
   npx convex login
   ```
4. Jos selain ei avaudu, kopioi URL terminaalista ja avaa se manuaalisesti

---

## 📋 Tarkista että kaikki toimii

Kun olet lisännyt `VITE_CONVEX_URL` `.env.local` tiedostoon:

1. **Tarkista .env.local:**
   ```
   VITE_CONVEX_URL=https://your-project.convex.cloud
   ```
   
   **HUOM:** Claude API-avain asetetaan Convex-ympäristöön, ei .env.local tiedostoon.
   Katso ohjeet: [CLAUDE_API_SETUP.md](CLAUDE_API_SETUP.md)

2. **Synkronoi skeema:**
   ```bash
   npx convex dev --once
   ```

3. **Tarkista Convex Dashboard:**
   - Mene Dashboardiin
   - Valitse projekti
   - Tarkista että taulut ovat luotu (quotations, messages, jne.)

4. **Testaa sovellus:**
   ```bash
   npm run dev
   ```
   - Tarkista konsoli: Ei virheitä Convex-yhteydestä
   - Testaa: Luo uusi tarjous → Tallenna → Tarkista Dashboardista

---

## ❓ Ongelmat?

### "Cannot prompt for input"
→ Käytä manuaalista tapaa (Dashboard selaimessa)

### "VITE_CONVEX_URL not found"
→ Tarkista että `.env.local` on oikeassa paikassa ja sisältää URL:n

### "Schema errors"
→ Tarkista `convex/schema.ts` syntaksivirheet
→ Katso Convex Dashboardista virheet

---

## 🎯 Nopea checklist

- [ ] Kirjauduttu Convex Dashboardiin
- [ ] Luotu projekti Dashboardissa
- [ ] Kopioitu projektin URL
- [ ] Lisätty `VITE_CONVEX_URL` `.env.local` tiedostoon
- [ ] Suoritettu `npx convex dev --once`
- [ ] Tarkistettu että taulut ovat luotu Dashboardissa
- [ ] Testattu sovellus (`npm run dev`)
