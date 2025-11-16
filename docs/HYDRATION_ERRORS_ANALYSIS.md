# Hydration Errors - Grundlig Utredning

## Vad är Hydration Errors?

Hydration errors uppstår när React försöker "hydrera" HTML som renderats på servern, men HTML:en på klienten skiljer sig från servern. Detta händer i Next.js eftersom:

1. **Server-Side Rendering (SSR)**: Next.js renderar HTML på servern först
2. **Client-Side Hydration**: React tar över och "hydrerar" HTML:en på klienten
3. **Mismatch**: Om HTML:en skiljer sig → Hydration Error

## Varför händer detta ofta?

### Vanliga orsaker:

1. **Dynamiska värden som ändras mellan server och client**:
   - `new Date()` - Tiden är annorlunda när servern renderar vs när klienten hydrerar
   - `Math.random()` - Ger olika värden varje gång
   - `Date.now()` - Tidsstämplar skiljer sig
   - `window.innerWidth` - Olika på server (undefined) vs client

2. **Browser-specifik kod**:
   - `typeof window !== 'undefined'` checks som ger olika resultat
   - `window.location` - Finns inte på server
   - `document` - Finns inte på server

3. **Tredjepartsskript**:
   - Browser extensions som modifierar HTML
   - Analytics scripts
   - Chatbots (som D-ID)

## Identifierade Problem i Projektet

### ✅ FIXAT: Clock Component (`src/app/contact/page.tsx`)

**Problem:**
```typescript
const [time, setTime] = useState(new Date()); // ❌ Olika värde på server vs client
```

**Lösning:**
```typescript
const [mounted, setMounted] = useState(false);
const [time, setTime] = useState<Date | null>(null);

useEffect(() => {
  setMounted(true);
  setTime(new Date()); // ✅ Sätts bara på client
}, []);
```

**Pattern att följa:**
- Använd `mounted` state för att vänta tills komponenten är på klienten
- Visa placeholder på server
- Uppdatera med riktiga värden efter mount

### ⚠️ POTENTIELLT PROBLEM: TechShowcaseSection (`src/components/sections/TechShowcaseSection.tsx`)

**Problem:**
```typescript
// Rad 170-183: Math.random() används direkt i render
style={{
  width: `${Math.random() * 100 + 50}px`, // ❌ Olika värde varje render
  height: `${Math.random() * 100 + 50}px`,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
}}
animate={{
  x: [0, Math.random() * 100 - 50, 0], // ❌ Olika värde varje render
  y: [0, Math.random() * 100 - 50, 0],
  scale: [1, Math.random() + 0.5, 1],
}}
```

**Varför detta är problematiskt:**
- `Math.random()` anropas direkt i render-funktionen
- Varje render ger nya värden
- Server renderar med värden A, client hydrerar med värden B → Mismatch!

**Rekommenderad fix:**
```typescript
// Använd useMemo med mounted check
const particlePositions = useMemo(() => {
  if (!mounted) return []; // Returnera tom array på server
  
  return Array.from({ length: 20 }, (_, i) => {
    // Använd index som seed för deterministiska värden
    const seed = i * 0.618033988749895; // Golden ratio
    return {
      width: (seed * 100 + 50) % 150 + 50,
      height: (seed * 150 + 50) % 150 + 50,
      left: (seed * 100) % 100,
      top: ((seed * 1.618) * 100) % 100,
      // ... etc
    };
  });
}, [mounted]);
```

### ✅ BRA EXEMPEL: TransitionBridge (`src/components/animations/TransitionBridge.tsx`)

**Hur de fixade det:**
```typescript
// Rad 154-158: Använder typeof window check med fallback
const randomLeft = typeof window !== 'undefined' ? Math.random() * 100 : i * 5;
const randomTop = typeof window !== 'undefined' ? Math.random() * 100 : i * 5;
// + suppressHydrationWarning på parent element
```

**Varför detta fungerar:**
- Ger deterministiska värden på server (`i * 5`)
- Använder `suppressHydrationWarning` för att tillåta skillnader
- Random värden sätts bara på client

### ✅ BRA EXEMPEL: HeroSection (`src/components/sections/HeroSection.tsx`)

**Hur de fixade det:**
```typescript
// Rad 424-436: Använder useMemo med mounted check
const particles = useMemo(() => {
  if (!mounted) return []; // ✅ Returnera tom array på server
  return Array.from({ length: 20 }, (_, i) => {
    const seed = i * 0.618033988749895; // ✅ Deterministisk seed
    return {
      left: (seed * 100) % 100,
      top: (seed * 1.618 * 100) % 100,
      // ...
    };
  });
}, [mounted]);
```

**Varför detta fungerar:**
- `mounted` state säkerställer att random värden bara genereras på client
- Använder deterministiska seeds istället för `Math.random()`
- Samma värden varje gång baserat på index

### ✅ BRA EXEMPEL: HeaderNav (`src/components/layout/HeaderNav.tsx`)

**Hur de fixade det:**
```typescript
// Rad 83-106: Math.random() används bara i useEffect (efter mount)
useEffect(() => {
  // Small delay to ensure hydration is complete
  const timeout = setTimeout(() => {
    shimmerIntervalRef.current = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * navLinks.length);
      setShimmeringIndex(randomIndex);
      // ...
    }, 8000);
  }, 100); // ✅ Väntar tills hydration är klar
}, [navLinks.length]);
```

**Varför detta fungerar:**
- `Math.random()` anropas bara i `useEffect` (efter mount)
- Ingen random värde i initial render
- Delay säkerställer att hydration är klar

## Best Practices för att Undvika Hydration Errors

### 1. Använd `useMounted` Hook (Rekommenderat)

```typescript
import { useMounted } from '@/hooks/useMounted';

const mounted = useMounted();

// Använd mounted för att vänta med dynamiska värden
if (!mounted) {
  return <Placeholder />; // Samma på server och client
}
```

**Eller manuellt:**

```typescript
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

// Använd mounted för att vänta med dynamiska värden
if (!mounted) {
  return <Placeholder />; // Samma på server och client
}
```

### 2. Använd Deterministiska Värden på Server

```typescript
// ❌ DÅLIGT
const value = Math.random();

// ✅ BRA
const value = typeof window !== 'undefined' 
  ? Math.random() 
  : 0.5; // Deterministiskt fallback

// ✅ BÄST: Använd seed baserat på index
const seed = index * 0.618033988749895;
const value = (seed * 100) % 100;
```

### 3. Använd `useMemo` med `mounted` Check

```typescript
const randomValues = useMemo(() => {
  if (!mounted) return []; // Tom array på server
  return generateRandomValues(); // Random bara på client
}, [mounted]);
```

### 4. Använd `suppressHydrationWarning` för Acceptabla Skillnader

```typescript
<div suppressHydrationWarning>
  {typeof window !== 'undefined' ? <ClientOnlyContent /> : <ServerContent />}
</div>
```

### 5. Flytta Random Logic till `useEffect`

```typescript
// ❌ DÅLIGT: Random i render
<div style={{ left: `${Math.random() * 100}%` }} />

// ✅ BRA: Random i useEffect
const [left, setLeft] = useState(0);
useEffect(() => {
  setLeft(Math.random() * 100);
}, []);
```

## Checklista för Nya Komponenter

När du skapar nya komponenter, kolla:

- [ ] Använder jag `new Date()`, `Date.now()`, eller `Math.random()`?
- [ ] Använder jag `window` eller `document` direkt?
- [ ] Renderar jag olika innehåll baserat på `typeof window !== 'undefined'`?
- [ ] Använder jag dynamiska värden i `useState` initialiserare?
- [ ] Använder jag `useMemo` eller `useEffect` för dynamiska värden?

Om något av ovanstående är sant → Använd `mounted` pattern!

## Verifiering mot Next.js Officiella Dokumentation

Alla fixes följer Next.js officiella rekommendationer:

### ✅ Solution 1: Using useEffect to run on the client only
- **Använt i**: `useMounted()` hook, Clock component, TechShowcaseSection
- **Pattern**: `useState(false)` + `useEffect(() => setMounted(true), [])`
- **Resultat**: Samma content på server och client initialt, uppdateras efter mount

### ✅ Solution 2: Disabling SSR on specific components
- **Använt i**: OpticScrollShowcase (`ssr: false` i dynamic import)
- **Pattern**: `dynamic(() => import(...), { ssr: false })`
- **Resultat**: Komponent renderas bara på client

### ✅ Solution 3: Using suppressHydrationWarning
- **Använt i**: TransitionBridge, TechShowcaseSection (particles)
- **Pattern**: `<div suppressHydrationWarning>`
- **Resultat**: Accepterar skillnader i specifika element där det är oundvikligt

### ⚠️ TransitionBridge - Acceptabelt men kan förbättras
- **Nuvarande**: Använder `typeof window !== 'undefined'` i render med `suppressHydrationWarning`
- **Status**: Fungerar men följer inte Next.js rekommendation helt
- **Rekommendation**: Byt till `useMounted()` pattern för konsistens

## Windows 11 - Specifika Noteringar

- ✅ **iOS telefonnummer-detektion**: Inte relevant för Windows 11
- ✅ **Browser extensions**: Kan fortfarande orsaka problem, men Next.js hanterar detta automatiskt
- ✅ **Alla fixes är kompatibla**: Fungerar på alla plattformar

## Nästa Steg

1. ✅ **Fix TechShowcaseSection** - Använd `mounted` pattern för Math.random() - **KLART**
2. ✅ **Skapa utility hook** - `useMounted()` för återanvändning - **KLART**
3. **Förbättra TransitionBridge** - Byt från `typeof window` till `useMounted()` (valfritt, fungerar redan)
4. **Lägg till linting regel** - Varna för Math.random() i render (framtida förbättring)

