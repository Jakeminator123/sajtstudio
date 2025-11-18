# Dokumentationsunderhåll - Sajtstudio.se

**Guide för att hålla dokumentationen uppdaterad när ändringar görs.**

## Grundprincip

Dokumentationen uppdateras **manuellt** när ändringar görs. Detta är medvetet valt eftersom:
- Automatiska lösningar kan missa kontext och mening
- Dokumentation behöver vara läsbar och förståelig, inte bara teknisk
- Manuell uppdatering säkerställer kvalitet

## När Dokumentationen Behöver Uppdateras

### 1. När du lägger till ny komponent

**Vad som behöver uppdateras:**

#### SITE_STRUCTURE.md
- [ ] Lägg till komponenten i rätt kategori (layout/, sections/, ui/, animations/, shared/)
- [ ] Beskriv komponentens ansvar och funktionalitet
- [ ] Dokumentera om den är mobil/desktop/hybrid

**Exempel:**
```markdown
#### NyKomponent (`src/components/sections/NyKomponent.tsx`)
- **Ansvar**: Beskrivning av vad komponenten gör
- **Funktionalitet**: Viktiga features
- **Mobil/Desktop**: Använder responsive breakpoints / Mobil-specifik / Desktop-specifik
```

#### MOBILE_DESKTOP_INDEX.md (om relevant)
- [ ] Om komponenten är mobil/desktop-specifik, lägg till i listan
- [ ] Dokumentera responsive patterns som används

#### RESPONSIVE_DESIGN_GUIDE.md (om relevant)
- [ ] Om komponenten introducerar nya responsive patterns, dokumentera dem

### 2. När du ändrar komponentstruktur

**Vad som behöver uppdateras:**

#### SITE_STRUCTURE.md
- [ ] Uppdatera komponentens beskrivning
- [ ] Uppdatera filvägar om komponenten flyttas

#### MOBILE_DESKTOP_INDEX.md
- [ ] Uppdatera om mobil/desktop-beteende ändras
- [ ] Uppdatera filvägar om komponenten flyttas

### 3. När du lägger till ny mobil/desktop-funktionalitet

**Vad som behöver uppdateras:**

#### MOBILE_DESKTOP_INDEX.md
- [ ] Lägg till i "Snabböversikt"
- [ ] Lägg till detaljerad beskrivning i "Detaljerad Lista"
- [ ] Uppdatera "Responsive Patterns i Projektet" om nya patterns introduceras

#### Komponentens kommentarer
- [ ] Lägg till tydliga kommentarer som markerar mobil vs desktop kod
- [ ] Använd formatet:
```tsx
{/* ============================================
   DESKTOP NAVIGATION
   ============================================ */}
```

### 4. När du ändrar projektstruktur

**Vad som behöver uppdateras:**

#### SITE_STRUCTURE.md
- [ ] Uppdatera "Projektstruktur" sektionen
- [ ] Uppdatera alla filvägar
- [ ] Uppdatera komponent-hierarki

#### .cursorrules
- [ ] Uppdatera "Viktiga filer och dokumentation" om strukturen ändras betydligt

### 5. När du lägger till nya responsive patterns

**Vad som behöver uppdateras:**

#### src/lib/responsiveUtils.ts
- [ ] Lägg till nya patterns i `responsive` objektet
- [ ] Lägg till JSDoc-kommentarer

#### RESPONSIVE_DESIGN_GUIDE.md
- [ ] Dokumentera nya patterns med exempel
- [ ] Lägg till i "Vanliga Responsive Patterns"

#### MOBILE_DESKTOP_INDEX.md
- [ ] Uppdatera "Responsive Patterns i Projektet" sektionen

## Checklista för Varje Ändring

När du gör en ändring, gå igenom denna checklista:

### Komponent-ändringar
- [ ] Är det en ny komponent? → Uppdatera SITE_STRUCTURE.md
- [ ] Är den mobil/desktop-specifik? → Uppdatera MOBILE_DESKTOP_INDEX.md
- [ ] Använder den nya responsive patterns? → Uppdatera RESPONSIVE_DESIGN_GUIDE.md
- [ ] Har jag lagt till kommentarer i koden? → Lägg till tydliga kommentarer

### Struktur-ändringar
- [ ] Har jag flyttat filer? → Uppdatera alla filvägar i dokumentationen
- [ ] Har jag ändrat mappstruktur? → Uppdatera SITE_STRUCTURE.md och .cursorrules
- [ ] Har jag ändrat imports? → Kontrollera att dokumentationen stämmer

### Responsive-ändringar
- [ ] Har jag introducerat nya breakpoints? → Uppdatera RESPONSIVE_DESIGN_GUIDE.md
- [ ] Har jag skapat nya responsive utilities? → Uppdatera responsiveUtils.ts och dokumentationen
- [ ] Har jag ändrat mobil/desktop-beteende? → Uppdatera MOBILE_DESKTOP_INDEX.md

## Workflow: Efter Varje Ändring

### Steg 1: Gör din kodändring
```bash
# Gör ändringar i kod
git add .
git commit -m "feat: lägg till ny komponent"
```

### Steg 2: Uppdatera dokumentation (SAMMA commit eller direkt efter)
```bash
# Uppdatera relevanta .md-filer
# Commit dokumentationsändringar
git add *.md .cursorrules
git commit -m "docs: uppdatera dokumentation för ny komponent"
```

**Tips:** Gör dokumentationsuppdateringar i samma commit eller direkt efter kodändringar så glömmer du inte bort dem.

## Automatiska Påminnelser (Valfritt)

Du kan skapa en enkel checklista-fil som du kan öppna när du gör ändringar:

### Skapa `.docs-checklist.md` (valfritt)
```markdown
# Dokumentationschecklista

När du gör ändringar, kolla denna lista:

- [ ] SITE_STRUCTURE.md uppdaterad?
- [ ] MOBILE_DESKTOP_INDEX.md uppdaterad? (om mobil/desktop-relaterat)
- [ ] RESPONSIVE_DESIGN_GUIDE.md uppdaterad? (om responsive-relaterat)
- [ ] .cursorrules uppdaterad? (om strukturen ändras)
- [ ] Kommentarer i kod lagda till? (om mobil/desktop-kod)
```

## Best Practices

### 1. Uppdatera Dokumentationen Samtidigt
**Gör det INTE:**
```bash
# Ändra kod
git commit -m "feat: ny komponent"

# ... två veckor senare ...
# "Åh, jag glömde uppdatera dokumentationen"
```

**Gör det SÅ:**
```bash
# Ändra kod
# Uppdatera dokumentation SAMMA dag
git commit -m "feat: ny komponent + dokumentation"
```

### 2. Använd Commit Messages
När du uppdaterar dokumentation, använd tydliga commit messages:
```bash
git commit -m "docs: uppdatera SITE_STRUCTURE.md för ny komponent"
git commit -m "docs: lägg till mobil/desktop info i MOBILE_DESKTOP_INDEX.md"
```

### 3. Review Dokumentation vid Code Review
Om du gör code reviews, inkludera dokumentationen:
- Kolla att nya komponenter är dokumenterade
- Kolla att filvägar stämmer
- Kolla att mobil/desktop-kod är markerad

### 4. Periodisk Review
Varje månad eller efter större features:
- Gå igenom alla komponenter i `src/components/`
- Kolla att de finns i SITE_STRUCTURE.md
- Kolla att mobil/desktop-kod är korrekt dokumenterad

## Vad Som INTE Behöver Uppdateras

### Små ändringar som INTE behöver dokumentation:
- Bugfixar (om de inte ändrar beteende)
- Styling-ändringar (om de inte ändrar struktur)
- Performance-optimeringar (om de inte ändrar API)
- Refactoring (om funktionaliteten är densamma)

### När du INTE behöver uppdatera:
- Du ändrar bara färger → INTE behöver uppdatera dokumentation
- Du fixar en bugg → INTE behöver uppdatera dokumentation
- Du optimerar kod → INTE behöver uppdatera dokumentation (om API är samma)

## Snabbreferens: Vilken Fil Uppdaterar Jag?

| Ändring | Fil att uppdatera |
|---------|-------------------|
| Ny komponent | SITE_STRUCTURE.md |
| Komponent flyttas | SITE_STRUCTURE.md, MOBILE_DESKTOP_INDEX.md (om relevant) |
| Ny mobil/desktop-funktionalitet | MOBILE_DESKTOP_INDEX.md, komponentens kommentarer |
| Nytt responsive pattern | RESPONSIVE_DESIGN_GUIDE.md, responsiveUtils.ts |
| Strukturändring | SITE_STRUCTURE.md, .cursorrules |
| Ny mapp/kategori | SITE_STRUCTURE.md, .cursorrules |

## Exempel: Komplett Workflow

### Scenario: Lägga till ny sektion-komponent

```bash
# 1. Skapa komponenten
src/components/sections/NySektion.tsx

# 2. Uppdatera SITE_STRUCTURE.md
# Lägg till i "Sektion-komponenter" sektionen:
#### NySektion (`src/components/sections/NySektion.tsx`)
- **Ansvar**: Beskrivning
- **Funktionalitet**: Features

# 3. Om den har mobil/desktop-specifik kod:
# Uppdatera MOBILE_DESKTOP_INDEX.md
# Lägg till i "Hybrid-komponenter" eller "Mobil-specifika"

# 4. Lägg till kommentarer i komponenten
{/* ============================================
   DESKTOP VERSION
   ============================================ */}

# 5. Commit allt
git add .
git commit -m "feat: lägg till NySektion + dokumentation"
```

## Tips för att Komma Ihåg

1. **Lägg dokumentationsuppdatering i samma commit** som kodändringen
2. **Använd en checklista** (t.ex. `.docs-checklist.md`) som du öppnar när du gör ändringar
3. **Review dokumentation** vid code review
4. **Periodisk audit** - gå igenom dokumentationen varje månad

## Automatisering (Framtida Möjlighet)

För framtiden kan du överväga:
- Pre-commit hooks som påminner om dokumentation
- Script som kontrollerar att komponenter finns i dokumentationen
- CI/CD checks som validerar dokumentation

Men för nu: **Manuell uppdatering är bäst** eftersom dokumentation behöver vara läsbar och meningsfull, inte bara teknisk.

