# Dokumentationsguide - Sajtstudio.se

**Detta dokument förklarar hur dokumentationen är organiserad och hur AI-agenter och utvecklare ska använda den.**

## Dokumentationsstruktur

### Huvuddokumentation (Läs i denna ordning)

1. **README.md** - Startpunkt med länkar till all dokumentation
2. **SITE_STRUCTURE.md** - Komplett översikt över projektstruktur och komponenter
3. **MOBILE_DESKTOP_INDEX.md** - Snabb index för mobil vs desktop-kod
4. **RESPONSIVE_DESIGN_GUIDE.md** - Detaljerad guide för responsiv design

### Konfigurationsfiler

- **.cursorrules** - Cursor-specifika regler som refererar till dokumentationen
- **sajtstudio_roadmap.txt** - Projektplan och designvision

## Hur Cursor/AI-agenter läser dokumentationen

### Automatisk läsning

1. **`.cursorrules` läses automatiskt** vid varje Cursor-session

   - Denna fil refererar till alla viktiga dokumentationsfiler
   - AI-agenter får automatiskt kontext om var dokumentationen finns

2. **När du nämner nyckelord** som:

   - "mobil", "desktop", "responsive"
   - "struktur", "komponenter"
   - "design system", "breakpoints"

   Så bör AI-agenter automatiskt referera till relevanta dokument.

### Manuell sökning

Om AI-agenter behöver hitta specifik information:

1. **Sök efter filnamn**:

   - "MOBILE_DESKTOP_INDEX" → Hitta mobil/desktop-kod
   - "SITE_STRUCTURE" → Hitta projektstruktur
   - "RESPONSIVE_DESIGN_GUIDE" → Hitta responsive patterns

2. **Sök efter nyckelord i kod**:
   - "DESKTOP" eller "MOBILE" i stora bokstäver → Kommentarer i komponenter
   - "lg:hidden" eller "hidden lg:" → Responsive patterns
   - "MobileMenu" → Mobil-specifik komponent

## Dokumentationsflöde

```
.cursorrules (läses automatiskt)
    ↓
Refererar till:
    ├── SITE_STRUCTURE.md
    ├── MOBILE_DESKTOP_INDEX.md
    └── RESPONSIVE_DESIGN_GUIDE.md

**Alla dokument finns nu i `docs/` mappen.**
    ↓
README.md länkar till alla dokument
```

## Best Practices för AI-agenter

### När du behöver förstå projektstruktur:

1. Läs `SITE_STRUCTURE.md` först
2. Kolla `.cursorrules` för snabböversikt
3. Använd `README.md` för länkar

### När du behöver hitta mobil/desktop-kod:

1. Läs `MOBILE_DESKTOP_INDEX.md` först
2. Sök efter kommentarer med "DESKTOP" eller "MOBILE"
3. Kolla filnamn (t.ex. `MobileMenu.tsx`)

### När du behöver implementera responsiv design:

1. Läs `RESPONSIVE_DESIGN_GUIDE.md`
2. Använd `src/lib/responsiveUtils.ts` för vanliga patterns
3. Följ mobile-first approach

## Uppdatering av dokumentation

När du lägger till ny funktionalitet:

1. **Uppdatera relevant dokumentation**:

   - Ny komponent → Uppdatera `SITE_STRUCTURE.md`
   - Ny mobil/desktop-kod → Uppdatera `MOBILE_DESKTOP_INDEX.md`
   - Nytt responsive pattern → Uppdatera `RESPONSIVE_DESIGN_GUIDE.md`

2. **Uppdatera `.cursorrules`** om strukturen ändras betydligt

3. **Lägg till kommentarer i kod** som markerar mobil vs desktop

## Tips för utvecklare

- **Läs README.md först** när du börjar arbeta med projektet
- **Använd dokumentationen som referens** när du är osäker
- **Uppdatera dokumentationen** när du gör större ändringar
- **Följ mönstren** som dokumenteras för konsistens
