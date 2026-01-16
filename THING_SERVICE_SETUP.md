# Thing-service API - Asennusohjeet

## Ympäristömuuttujat Convex Dashboardissa

Aseta seuraavat ympäristömuuttujat Convex Dashboardissa:

1. Avaa Convex Dashboard: https://dashboard.convex.dev
2. Valitse projekti: **original-aardvark-584**
3. Mene: **Settings** → **Environment Variables**
4. Lisää seuraavat muuttujat:

### THING_SERVICE_TOKEN
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnQiOiJiNmJmZGEyYi1jZDcwLTRlZWEtOTk4NC03ODBiMWExYjZjMmIiLCJpZCI6MTAwMDEsImlhdCI6MTY4MzY1MTk3N30.gLWZsv1qna0g_T0KUv5N8Q9PbkDubXCWjtsPqmj6u9o
```

### THING_SERVICE_TENANT_ID
```
b6bfda2b-cd70-4eea-9984-780b1a1b6c2b
```

### THING_SERVICE_BASE_URL (valinnainen)
```
https://api.ggjb.fi
```
**Huom:** Jos et aseta tätä, käytetään oletusarvoa `https://api.ggjb.fi`

---

## Tarkista että kaikki toimii

1. **Varmista että Convex dev on käynnissä:**
   ```bash
   npm run convex:dev
   ```

2. **Tarkista että funktiot on synkronoitu:**
   - Convex Dashboard → **Functions** → Näet `thingService:getCustomers`

3. **Testaa sovelluksessa:**
   - Avaa sovellus: `npm run dev`
   - Mene **Asiakkaat**-välilehteen
   - Asiakkaiden pitäisi ladata automaattisesti Thing-service API:sta

---

## API-ohjeet

Thing-service API käyttää seuraavaa endpointia:

- **Method:** `POST`
- **URL:** `https://api.ggjb.fi/v3/customers`
- **Headers:**
  - `Authorization: Bearer <THING_SERVICE_TOKEN>`
  - `token-id-type: tenant`
  - `token-id: <THING_SERVICE_TENANT_ID>`
  - `Content-Type: application/json`
- **Body:**
  ```json
  {
    "action": "get-customers",
    "filter": {
      "active": true
    }
  }
  ```

### Tuetut filter-kentät:
- `active`: boolean (true = aktiiviset, false = päättyneet)
- `sysId`: string/number (tarkka haku)
- `sysIds`: array (useita ID:itä)
- `businessId`: string (Y-tunnus)
- `deleted`: boolean

---

## Ongelmatilanteet

### "THING_SERVICE_TOKEN ei ole määritelty"
- Tarkista että olet lisännyt ympäristömuuttujan Convex Dashboardissa
- Varmista että muuttujan nimi on täsmälleen `THING_SERVICE_TOKEN`

### "401 Unauthorized"
- Tarkista että token on oikein
- Varmista että `THING_SERVICE_TENANT_ID` vastaa JWT:n sisältämää tenant-ID:tä

### "Asiakkaiden haku epäonnistui"
- Tarkista että Convex dev on käynnissä
- Katso Convex Dashboard → **Logs** virheilmoituksista
- Testaa API-kutsu suoraan curl-komennolla (katso alla)

---

## Testaus curl-komennolla

```bash
curl -X POST "https://api.ggjb.fi/v3/customers" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnQiOiJiNmJmZGEyYi1jZDcwLTRlZWEtOTk4NC03ODBiMWExYjZjMmIiLCJpZCI6MTAwMDEsImlhdCI6MTY4MzY1MTk3N30.gLWZsv1qna0g_T0KUv5N8Q9PbkDubXCWjtsPqmj6u9o" \
  -H "token-id-type: tenant" \
  -H "token-id: b6bfda2b-cd70-4eea-9984-780b1a1b6c2b" \
  -H "Content-Type: application/json" \
  -d '{"action":"get-customers","filter":{"active":true}}'
```

---

## Tietoturva

**TÄRKEÄÄ:** 
- Token ja tenant-ID ovat salaisia tietoja
- Älä koskaan commitoi niitä git:iin
- Älä näytä niitä käyttäjille tai lokitiedoissa
- Pidä ne turvassa Convex Dashboardissa
