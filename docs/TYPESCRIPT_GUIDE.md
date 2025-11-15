# TypeScript Guide - Sajtstudio.se

**Enkel guide till vad TypeScript är och hur det fungerar i ditt projekt.**

## Vad är TypeScript?

**TypeScript är JavaScript med typer.**

### Enkelt förklarat:

- **JavaScript** = Språket som webbläsaren förstår
- **TypeScript** = JavaScript + extra information om vad variabler innehåller

### Exempel:

**JavaScript (utan typer):**

```javascript
function add(a, b) {
  return a + b;
}

add(5, 3); // Fungerar: 8
add("hej", "du"); // Fungerar: "hejdu" (men kanske inte vad du ville)
add(5, "hej"); // Fungerar: "5hej" (fel!)
```

**TypeScript (med typer):**

```typescript
function add(a: number, b: number): number {
  return a + b;
}

add(5, 3); // ✅ Fungerar: 8
add("hej", "du"); // ❌ Fel! TypeScript säger: "Detta är inte ett nummer"
add(5, "hej"); // ❌ Fel! TypeScript säger: "Detta är inte ett nummer"
```

## Varför använda TypeScript?

### Fördelar:

1. **Fångar fel tidigt** - TypeScript hittar problem innan du kör koden
2. **Bättre autocomplete** - Editor vet vad variabler innehåller
3. **Lättare att läsa kod** - Du ser direkt vad funktioner förväntar sig
4. **Mindre buggar** - Typfel upptäcks direkt

### Exempel från ditt projekt:

**Utan TypeScript:**

```javascript
// Vad är "props"? Vad finns i den?
function Button(props) {
  return <button>{props.text}</button>; // Fungerar detta? Ingen vet!
}
```

**Med TypeScript:**

```typescript
// Nu vet vi exakt vad Button förväntar sig!
interface ButtonProps {
  text: string;
  onClick?: () => void;
}

function Button(props: ButtonProps) {
  return <button onClick={props.onClick}>{props.text}</button>;
}
```

## Hur fungerar TypeScript i ditt projekt?

### 1. Filändelser

- **`.ts`** = TypeScript-filer (vanlig kod)
- **`.tsx`** = TypeScript + React (komponenter)
- **`.js`** = JavaScript (fungerar också, men rekommenderas inte)

### 2. TypeScript Language Server

**Vad är det?**

- En "tjänst" som körs i bakgrunden i Cursor
- Analyserar din kod och hittar fel
- Ger dig autocomplete och förslag

**Hur startar man om den?**

1. Tryck `Ctrl+Shift+P` (Windows) / `Cmd+Shift+P` (Mac)
2. Skriv: `TypeScript: Restart TS Server`
3. Tryck Enter

**Varför behöver man starta om den?**

- När du installerar nya paket
- När TypeScript inte hittar moduler
- När fel inte försvinner

### 3. tsconfig.json

**Vad är det?**

- Konfigurationsfil för TypeScript
- Berättar för TypeScript hur den ska fungera
- Finns i roten av projektet

**Viktiga inställningar:**

```json
{
  "compilerOptions": {
    "strict": true, // Aktiverar strikt typning
    "jsx": "react-jsx", // Hantera React-komponenter
    "paths": {
      "@/*": ["./src/*"] // Kortare imports (@/ istället för ../../)
    }
  }
}
```

## Vanliga TypeScript-fel och lösningar

### Fel 1: "Cannot find module 'react'"

**Vad betyder det?**

- TypeScript kan inte hitta React-paketet

**Lösning:**

```bash
# Installera dependencies
npm install

# Starta om TypeScript Language Server
# Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### Fel 2: "Property 'children' is missing"

**Vad betyder det?**

- En komponent förväntar sig en `children` prop men får ingen

**Exempel:**

```typescript
// Button kräver children
<Button href="/contact">  {/* ❌ Saknar children */}
  Starta projekt
</Button>  {/* ✅ Nu har den children */}
```

### Fel 3: "Type 'X' is not assignable to type 'Y'"

**Vad betyder det?**

- Du försöker använda fel typ

**Exempel:**

```typescript
// Förväntar sig string
const name: string = 123; // ❌ Fel! 123 är inte en string

// Rätt:
const name: string = "Sajtstudio"; // ✅
```

## TypeScript i ditt projekt

### Alla dina komponenter använder TypeScript:

- `HeaderNav.tsx` - TypeScript + React
- `Button.tsx` - TypeScript + React
- `MobileMenu.tsx` - TypeScript + React
- Alla andra `.tsx` filer

### Exempel från din kod:

**Button.tsx:**

```typescript
// Definierar vad Button kan ta emot
interface ButtonProps {
  children: ReactNode; // Innehåll i knappen
  href?: string; // Länk (valfritt)
  variant?: "primary" | "secondary" | "outline" | "cta";
  size?: "sm" | "md" | "lg";
  // ... fler props
}

// Använder interface
export default function Button({
  children,
  href,
  variant = "primary",
}: ButtonProps) {
  // ...
}
```

**HeaderNav.tsx:**

```typescript
// Använder Button med typer
<Button
  href="/contact" // ✅ String
  variant="cta" // ✅ En av de tillåtna värdena
  size="sm" // ✅ En av de tillåtna värdena
  ariaLabel="Starta projekt" // ✅ String
>
  Starta projekt // ✅ children (ReactNode)
</Button>
```

## Praktiska tips

### 1. Låt TypeScript hjälpa dig

- När du skriver kod, låt autocomplete visa vad som finns
- Om något är rött, fixa det direkt
- TypeScript försöker hjälpa dig, inte störa dig!

### 2. Använd typer när du skapar nya funktioner

```typescript
// Bra:
function calculateTotal(items: { price: number; quantity: number }[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Mindre bra (fungerar men ingen typning):
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
```

### 3. Om TypeScript klagar, lyssna på den

- TypeScript hittar ofta problem innan de blir buggar
- Om något är rött, fixa det
- Om du är osäker, fråga AI-agenten!

## Sammanfattning

- **TypeScript = JavaScript + typer**
- **Hjälper dig hitta fel tidigt**
- **Ger bättre autocomplete**
- **Används i hela ditt projekt**

## Ytterligare resurser

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript för React](https://react-typescript-cheatsheet.netlify.app/)

## Snabbreferens

```bash
# Om TypeScript inte fungerar:
npm install                    # Installera dependencies
# Ctrl+Shift+P → "TypeScript: Restart TS Server"

# Vanliga typer:
string        # Text
number        # Nummer
boolean       # true/false
string[]      # Array av strings
{ key: value } # Objekt
() => void    # Funktion
```
