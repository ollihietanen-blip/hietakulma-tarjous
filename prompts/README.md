# Tekoälyohjeistukset

Tämä kansio sisältää tekoälylle annettavat ohjeistukset eri tehtäviin.

## aiAnalysisInstruction.md

Tämä tiedosto sisältää ohjeistuksen määrälaskentaan. Tekoäly käyttää tätä ohjeistusta analysoidessaan rakennussuunnitelmia ja tekessään suosituksia puuelementeistä ja ristikoista.

### Muokkaus

Voit muokata tätä tiedostoa suoraan. Muutokset otetaan käyttöön seuraavassa analyysissä.

### Sijainti

- **Lähdetiedosto**: `prompts/aiAnalysisInstruction.md` (tämä kansio)
- **Julkaistu versio**: `public/prompts/aiAnalysisInstruction.md` (kopioidaan build-vaiheessa)

### Sisältö

Ohjeistus sisältää:
- Perusohjeistuksen analysoinnille
- Tarkistettavat asiat piirustuksista
- Palautusmuodon määrittelyn (JSON)
- Tärkeät huomiot
- Esimerkkejä

### Parantaminen

Ohjeistus parantuu automaattisesti ajan myötä, kun järjestelmä kerää esimerkkejä onnistuneista tarjouslaskennoista. Nämä esimerkit tallennetaan `quotation.aiAnalysisInstruction.examples` -kenttään.
