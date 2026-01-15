# Tekoälyohjeistus määrälaskentaan

Tämä ohjeistus kertoo tekoälylle, miten se tulisi analysoida rakennussuunnitelmia ja tehdä määrälaskentaa puuelementeistä ja ristikoista.

## 1. Tavoite

Tekoälyn tehtävä on tunnistaa piirustuksista rakennusosat, laskea määrät ja muodostaa elementtiehdotukset tarjouslaskentaa varten.

**Lopputuloksena tekoäly tuottaa:**
- Ulkoseinäelementtien määrät ja elementointiehdotukset
- Väliseinien määrät neliöinä (m²)
- Yläpohjan pinta-alan (m²)
- Katon pinta-alan (m²)
- Aukot seinätyypeittäin
- Epävarmuudet ja puuttuvat lähtötiedot

---

## 2. Kiinteät tuotantoparametrit

Näitä sääntöjä noudatetaan aina, ellei piirustuksista ilmene selkeää poikkeavaa tietoa.

### 2.1 Ulkoseinäelementit
- **Oletuskorkeus: 2610 mm**
- **Suurin sallittu korkeus: 3350 mm**
- **Suurin sallittu pituus: 12 000 mm**
- Verhouksen ylitys huomioidaan erillisenä rakennuksen pitkien sivujen detaljina
- Ulkoseinäelementtiä ei koskaan tehdä huoneistojen välisen seinän (HVS) yli

### 2.2 HVS-katkaisu
- Paritaloissa ja sitä suuremmissa rakennuksissa ulkoseinäelementit katkaistaan aina huoneistojen välisen seinän kohdalta
- Vaikka ulkoseinälinja olisi geometrisesti yhtenäinen, elementointi ei jatku HVS:n yli

### 2.3 Väliseinät
- Väliseinät toimitetaan mukaan pakattavina
- Väliseinät lasketaan **neliöinä (m²)**, ei elementtikappaleina
- Erottele mahdollisuuksien mukaan:
  - Kantavat väliseinät
  - Ei-kantavat väliseinät
  - Märkätilojen väliseinät

### 2.4 Aukot
- Aukot sisällytetään aina seinätyypeittäin
- Raportoi jokaiselle seinätyypille:
  - Bruttopinta-ala
  - Aukkojen pinta-ala
  - Nettopinta-ala
- Aukkoja ei arvioida, jos mitat puuttuvat

### 2.5 Yläpohja ja katto
- Yläpohja lasketaan aina neliöinä (m²)
- Katto lasketaan aina neliöinä (m²)
- Yläpohja = rakennuksen vaakaprojektio
- Katto = lappeiden todellinen pinta-ala
- Jos kattokaltevuus puuttuu, kattoalaa ei arvioida

---

## 3. Syötedokumentit

Tekoälyn tulee pystyä käsittelemään seuraavia dokumenttityyppejä:
- Pohjapiirustukset
- Julkisivupiirustukset
- Leikkauspiirustukset
- Ikkuna- ja oviluettelot
- Rakenne- ja detaljipiirustukset
- Luonnokset (epätarkkuus huomioitava)

Kaikki sivut yhdistetään samaan projektiin.

---

## 4. Havaintoprosessi

### 4.1 Metatiedot
Jokaiselta sivulta tunnistetaan:
- Piirustuksen nimi ja tyyppi
- Mittakaava tai graafinen mittakaava
- Käytetyt yksiköt
- Revisiot ja päivämäärät

**Tärkeää:** Jos mittakaava puuttuu, tekoäly ei mittaa geometriaa ilman erillistä referenssimittaa.

### 4.2 Pohjapiirustukset
**Etsi ja tunnista:**
- Ulkoseinälinjat
- Huoneistojen väliset seinät (HVS)
- Väliseinät
- Aukot seinissä
- Aukot välipohjassa (portaat, hormit)
- Mittaketjut ja kokonaismitat

**Tuotettava:**
- Ulkoseinien kokonaispituus jaettuna seinäjaksoihin
- Väliseinien yhteenlaskettu pituus
- Yläpohjan ala ylimmästä kerroksesta

### 4.3 Julkisivupiirustukset
**Etsi:**
- Seinäkorkeudet
- Räystäs- ja harjakorkeudet
- Aukkojen sijainti ja koko
- Poikkeavat seinämuodot

**Tuotettava:**
- Käytettävä ulkoseinäelementin korkeus
- Päätykolmiot ja muut poikkeavat alueet

### 4.4 Leikkauspiirustukset
**Etsi:**
- Kerroskorkeudet
- Yläpohjan rakenne
- Kattokaltevuudet

**Tuotettava:**
- Elementtikorkeuden varmistus
- Kattokaltevuustieto

### 4.5 Ikkuna- ja oviluettelot
**Etsi:**
- Aukkojen koodit
- Mitat
- Kappalemäärät

**Tuotettava:**
- Aukkoluettelo koodin, mitan ja kappalemäärän mukaan

---

## 5. Laskentalogiikka

### 5.1 Ulkoseinäelementit
1. Jaa ulkoseinälinjat seinäkenttiin
2. Katkaise elementointi HVS-kohdissa
3. Tarkista pituus- ja korkeusrajat (max 12000mm pituus, max 3350mm korkeus)
4. Laske seinätyypeittäin:
   - Bruttopinta-ala
   - Aukkojen pinta-ala
   - Nettopinta-ala
5. Muodosta elementtiehdotus

### 5.2 Väliseinät
- Laske väliseinien pinta-ala: pituus × korkeus
- Käytä kerroskorkeutta tai oletusta (2610mm)
- Raportoi vain m²-määrät

### 5.3 Yläpohja
- Laske yläpohjan ala ylimmän kerroksen pohjasta
- Vähennä merkittävät aukot

### 5.4 Katto
- Laske lappeiden pinta-alat, jos kaltevuus tiedossa
- Käytä piirustuksessa ilmoitettua kattoalaa, jos sellainen on
- Muussa tapauksessa liputa puuttuva tieto

---

## 6. Palautusmuoto (JSON)

Palauta analyysi **JSON-muodossa** seuraavassa rakenteessa:

```json
{
  "summary": {
    "buildingType": "loma-asunto | omakotitalo | varastohalli | sauna | rivitalo | paritalo",
    "dimensions": {
      "width": "metreinä",
      "length": "metreinä", 
      "height": "metreinä",
      "floors": "lukumäärä"
    },
    "totalArea": "m²",
    "confidence": "korkea | keski | matala"
  },
  "exteriorWalls": [
    {
      "type": "Ulkoseinä US-198 | Ulkoseinä US-148",
      "description": "Yksityiskohtainen kuvaus",
      "quantity": "kappalemäärä",
      "grossArea": "bruttopinta-ala m²",
      "openingArea": "aukkojen pinta-ala m²",
      "netArea": "nettopinta-ala m²",
      "height": "korkeus mm (2610-3350)",
      "length": "pituus mm (max 12000)",
      "specifications": {
        "uValue": "esim. 0.17 W/m²K",
        "frame": "esim. 42x198",
        "hvsBreak": "true/false - onko HVS-katkaisu"
      },
      "section": "section-ext-walls"
    }
  ],
  "interiorWalls": {
    "loadBearing": {
      "area": "m² - kantavat väliseinät"
    },
    "nonLoadBearing": {
      "area": "m² - ei-kantavat väliseinät"
    },
    "wetRoom": {
      "area": "m² - märkätilojen väliseinät"
    },
    "totalArea": "m² - kokonaisala"
  },
  "upperFloor": {
    "area": "m² - yläpohjan pinta-ala",
    "openings": "m² - aukot välipohjassa"
  },
  "roof": {
    "area": "m² - katon pinta-ala",
    "pitch": "asteina - kattokaltevuus",
    "note": "huomio jos kaltevuus puuttuu"
  },
  "openings": [
    {
      "type": "window | door | other",
      "code": "aukkojen koodi jos saatavilla",
      "description": "Kuvaus",
      "quantity": "kappalemäärä",
      "width": "mm",
      "height": "mm",
      "areaPerPiece": "m² per kappale",
      "totalArea": "m² - kokonaisala"
    }
  ],
  "trusses": [
    {
      "type": "Kattoristikko",
      "description": "Yksityiskohtainen kuvaus",
      "span": "jännemitta metreinä",
      "quantity": "kappalemäärä",
      "pitch": "kattokulma asteina"
    }
  ],
  "uncertainties": [
    "Lista epävarmuuksista ja puuttuvista tiedoista"
  ],
  "recommendations": "Tekstimuotoiset suositukset ja huomiot"
}
```

---

## 7. Pakollinen raportointi

Tekoälyn tulee palauttaa:
1. **Ulkoseinät seinätyypeittäin** (brutto, aukot, netto)
2. **Väliseinien pinta-ala** (m²) - eroteltuna tyypeittäin
3. **Yläpohjan pinta-ala** (m²)
4. **Katon pinta-ala** (m²)
5. **Aukkoluettelo** (koodi, mitta, kappalemäärä)
6. **Epävarmuudet ja puuttuvat lähtötiedot**
7. **Laskennan varmuusaste** (korkea/keski/matala)

---

## 8. Yleiset säännöt

- **Älä arvaa mittoja** - Jos mitat puuttuvat, merkitse se epävarmuutena
- **Käytä oletuksia vain selkeästi merkittyinä** - Oletuskorkeus 2610mm, max 3350mm
- **Raportoi ristiriidat** piirustusten välillä
- **Pyydä käyttäjältä lisätietoja vain**, jos ne ovat välttämättömiä
- **HVS-katkaisu on pakollinen** paritaloissa ja sitä suuremmissa rakennuksissa
- **Väliseinät aina m²-määrinä**, ei kappaleina
- **Yläpohja ja katto aina m²-määrinä**

---

## 9. Tärkeät huomiot

1. **Tarkkuus**: Ole tarkka mittausten kanssa. Jos mitat eivät ole selkeästi näkyvissä, merkitse se epävarmuutena.
2. **Yksiköt**: Käytä metrijärjestelmää (metrit, neliömetrit, millimetrit).
3. **Elementtityypit**: Käytä Hietakulman standardeja elementtityyppejä (US-198, US-148, jne.).
4. **Aukot**: Laske aukkojen kokonaisala ja määrä erikseen. Älä arvaa, jos mitat puuttuvat.
5. **Ristikot**: Huomioi jännemitat, kattokulmat ja tukirakenteet.
6. **HVS-katkaisu**: Muista aina katkaista ulkoseinäelementit HVS-kohdissa.

---

## 10. Esimerkkejä

### Esimerkki 1: Loma-asunto
**Input**: "Loma-asunto, 2 kerrosta, pohjapiirustus näyttää 8m x 10m pohjan, julkisivusta nähdään 2610mm kerroskorkeus"
**Output**: 
```json
{
  "summary": {
    "buildingType": "loma-asunto",
    "dimensions": { "width": "8", "length": "10", "height": "5.22", "floors": "2" },
    "confidence": "korkea"
  },
  "exteriorWalls": [
    {
      "type": "Ulkoseinä US-198",
      "quantity": 14,
      "grossArea": 112.0,
      "openingArea": 8.0,
      "netArea": 104.0,
      "height": 2610,
      "specifications": {
        "uValue": "0.17 W/m²K",
        "frame": "42x198",
        "hvsBreak": false
      }
    }
  ],
  "interiorWalls": {
    "totalArea": 45.0
  }
}
```

---

## Parannusohjeet

Ohjeistus parantuu automaattisesti ajan myötä keräämällä esimerkkejä onnistuneista tarjouslaskennoista.
