# Convex-tietokannan asennusohjeet

## Vaihe 1: Kirjaudu Convex-tiliisi

Avaa PowerShell tai Command Prompt projektikansiossa ja suorita:

```bash
npx convex login
```

Tämä avaa selaimen, jossa sinun täytyy:
- Kirjautua Convex-tilillesi (tai luoda uusi tili osoitteessa https://dashboard.convex.dev)
- Hyväksyä oikeudet

## Vaihe 2: Alusta Convex-projekti

Kun olet kirjautunut, suorita:

```bash
npx convex dev
```

Tämä komento:
1. Kysyy projektin nimeä (tai voit luoda uuden)
2. Luo yhteyden Convex-palvelimelle
3. Generoi tarvittavat tiedostot
4. Synkronoi tietokantakaavion (`convex/schema.ts`) Convexiin
5. Lisää `VITE_CONVEX_URL` `.env.local` tiedostoon

**HUOM:** Älä sulje tätä terminaalia! Se pitää olla käynnissä kehityksen aikana.

## Vaihe 3: Tarkista yhteys

Kun `npx convex dev` on käynnissä, se näyttää:
- Convex Dashboard URL:n (esim. https://dashboard.convex.dev/team/your-team/project/your-project)
- Synkronoitujen funktioiden listan
- Mahdolliset virheet

## Vaihe 4: Tietokantataulut

Kun Convex on alustettu, seuraavat taulut luodaan automaattisesti:
- `quotations` - Tarjouslaskennat
- `messages` - Viestit
- `communicationTasks` - Kommunikointitehtävät
- `costEntries` - Jälkilaskenta
- `files` - Projektitiedostot
- `pricingTemplates` - Hinnoittelupohjat

## Vaihe 5: Vite-konfiguraatio

Kun Convex on alustettu, `.env.local` sisältää:
```
GEMINI_API_KEY=AIzaSyABysWWeP3e75YO3CF5nJguGmL3UOghRCE
VITE_CONVEX_URL=https://your-project-name.convex.cloud
```

Sovellus käyttää tätä URL:ia automaattisesti.

## Ongelmatilanteet

### Jos `npx convex dev` ei toimi:
1. Tarkista että olet kirjautunut: `npx convex login`
2. Tarkista projektin nimi: `npx convex dev --project-name your-project-name`
3. Katso Convex Dashboard: https://dashboard.convex.dev

### Jos tietokantataulut eivät synny:
1. Tarkista että `convex/schema.ts` on oikein
2. Tarkista Convex Dashboardista että skeema on synkronoitu
3. Yritä uudelleen: `npx convex dev`

### Jos `.env.local` ei päivity:
1. Tarkista että `npx convex dev` on käynnissä
2. Tarkista tiedoston oikeudet
3. Lisää manuaalisesti: `VITE_CONVEX_URL=https://your-project.convex.cloud`

## Seuraavat vaiheet

Kun Convex on alustettu:
1. Tietokantataulut ovat käytettävissä Convex Dashboardissa
2. Voit testata funktioita Convex Dashboardissa
3. Sovellus käyttää Convexia automaattisesti, kun `VITE_CONVEX_URL` on määritelty

## Tuotantokäyttöönotto

Kun olet valmis julkaisemaan:
```bash
npx convex deploy
```

Tämä julkaisee funktiot tuotantoympäristöön.
