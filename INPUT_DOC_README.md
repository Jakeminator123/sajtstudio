# INPUT_DOC_FOR_CURSOR - Användarguide

## Översikt

`INPUT_DOC_FOR_CURSOR` mappen är din "drop zone" för filer som ska integreras i projektet. När du lägger filer här kan AI-assistenten eller scriptet automatiskt flytta dem till rätt plats och uppdatera relevanta referenser.

## Hur det Fungerar

1. **Lägg filer i `INPUT_DOC_FOR_CURSOR/`**
2. **Kör scriptet** (eller låt AI-assistenten hantera det):
   ```bash
   npm run process-input-docs
   ```
3. **Filer flyttas automatiskt** till rätt plats i projektet
4. **Referenser uppdateras** i relevanta komponenter

## Filtyper som Stöds

### Bilder
- **Format**: `.jpg`, `.jpeg`, `.png`, `.webp`, `.svg`, `.gif`
- **Destination**: `public/images/[kategori]/`
- **Kategorier** (identifieras från filnamn):
  - `hero-*.jpg` → `public/images/hero/`
  - `portfolio-*.png` → `public/images/portfolio/`
  - `feature-*.svg` → `public/images/features/`
  - Annat → `public/images/general/`

### Loggor
- **Format**: `.svg`, `.png` (med "logo" i filnamnet)
- **Destination**: `public/logos/[kategori]/`
- **Kategorier**:
  - `logo-client-*.svg` eller `logo-kund-*.svg` → `public/logos/clients/`
  - `logo-*.svg` → `public/logos/sajtstudio/`

### Texter
- **Format**: `.txt`, `.md`
- **Destination**: `src/config/content/`
- **Användning**: Parsas och integreras i content-filer

### JSON-data
- **Format**: `.json`
- **Destination**: `src/data/`
- **Användning**: Importeras där de behövs

## Namngivningskonventioner

### Bilder
```
hero-main.jpg          → public/images/hero/hero-main.jpg
portfolio-project1.png → public/images/portfolio/portfolio-project1.png
feature-ai.svg         → public/images/features/feature-ai.svg
```

### Loggor
```
logo-sajtstudio.svg           → public/logos/sajtstudio/logo-sajtstudio.svg
logo-client-acme.svg          → public/logos/clients/logo-client-acme.svg
logo-kund-exempel.png         → public/logos/clients/logo-kund-exempel.png
```

### Texter
```
usps.txt              → src/config/content/usps.txt
services.md           → src/config/content/services.md
```

### JSON
```
projects.json         → src/data/projects.json
aiFeatures.json       → src/data/aiFeatures.json
```

## Exempel

### Exempel 1: Lägga till Hero-bild

1. Lägg `hero-background.jpg` i `INPUT_DOC_FOR_CURSOR/`
2. Kör `npm run process-input-docs`
3. Filen flyttas till `public/images/hero/hero-background.jpg`
4. Använd i kod:
   ```tsx
   import Image from 'next/image';
   
   <Image src="/images/hero/hero-background.jpg" alt="Hero" />
   ```

### Exempel 2: Lägga till Kundlogga

1. Lägg `logo-client-acme.svg` i `INPUT_DOC_FOR_CURSOR/`
2. Kör scriptet
3. Filen flyttas till `public/logos/clients/logo-client-acme.svg`
4. Använd i kod:
   ```tsx
   <img src="/logos/clients/logo-client-acme.svg" alt="Acme" />
   ```

### Exempel 3: Lägga till Textinnehåll

1. Lägg `usps.txt` i `INPUT_DOC_FOR_CURSOR/`
2. Kör scriptet
3. Filen flyttas till `src/config/content/usps.txt`
4. Importera i komponenter:
   ```tsx
   import uspContent from '@/config/content/usps';
   ```

## AI-assistent Integration

När du använder AI-assistenten (t.ex. Cursor):

1. **Lägg filen i `INPUT_DOC_FOR_CURSOR/`**
2. **Säg till AI-assistenten**: "Jag har lagt [filnamn] i INPUT_DOC_FOR_CURSOR, integrera den i projektet"
3. **AI-assistenten kommer**:
   - Läsa filen
   - Identifiera typ och kategori
   - Flytta till rätt plats
   - Uppdatera relevanta komponenter/kod

## Tips

### ✅ Gör så här:
- Använd beskrivande filnamn (`hero-main.jpg` istället för `img1.jpg`)
- Inkludera kategori i filnamnet (`portfolio-project1.png`)
- Använd konsekvent namngivning

### ❌ Undvik:
- Generiska namn (`image.jpg`, `file.png`)
- Specialtecken i filnamn (använd bindestreck istället)
- Stora filer utan optimering (komprimera bilder först)

## Felsökning

### Filen flyttas inte
- Kontrollera att filtypen stöds
- Kontrollera att filnamnet följer konventioner
- Kör scriptet manuellt: `npm run process-input-docs`

### Fel kategori
- Filnamnet avgör kategorin
- Lägg till kategori i filnamnet (`hero-`, `portfolio-`, etc.)
- Du kan manuellt flytta filen efteråt om nödvändigt

### Referenser uppdateras inte
- Vissa filtyper kräver manuell uppdatering
- Kontrollera `src/lib/assetManager.ts` för helper-funktioner
- Använd `getImagePath()` för att generera korrekta sökvägar

## Ytterligare Hjälp

- Se `TEMPLATE_GUIDE.md` för mall-struktur
- Se `PROJECT_DOCUMENTATION.md` för teknisk dokumentation
- Se `src/lib/inputDocProcessor.ts` för tekniska detaljer

---

**Viktigt**: Efter att filer har processats kan du ta bort dem från `INPUT_DOC_FOR_CURSOR/` mappen. De finns nu på rätt plats i projektet.

