# Browser Error Logging - Automatisk Felrapportering

Detta system loggar automatiskt alla fel från webbläsaren till en fil som AI-agenten kan läsa direkt.

## Hur det fungerar

1. **Automatisk felinsamling**: Alla fel från webbläsaren (console.error, unhandled rejections, window.onerror) loggas automatiskt
2. **API endpoint**: Fel skickas till `/api/errors` som sparar dem i `logs/browser-errors.json`
3. **AI-agent läsbar**: AI-agenten kan läsa `logs/browser-errors.json` direkt för att se alla fel

## Vad som loggas

- **React Error Boundaries**: Fel som fångas av ErrorBoundary
- **Console errors**: Alla console.error() anrop (förutom filtrerade D-ID/antivirus-fel)
- **Console warnings**: Alla console.warn() anrop (förutom filtrerade)
- **Unhandled rejections**: Ohanterade promise rejections
- **Window errors**: Alla window.onerror events

## Filtrering

Följande fel filtreras bort och loggas INTE:

- D-ID chatbot-relaterade fel (CORS, network errors)
- Antivirus-blockerade requests
- Kända tredjepartsskript-fel

## Loggfil

Alla fel sparas i: `logs/browser-errors.json`

Format:

```json
[
  {
    "timestamp": "2024-01-01T12:00:00.000Z",
    "type": "error",
    "message": "Error message",
    "stack": "Error stack trace",
    "source": "filename.js",
    "url": "https://example.com/page",
    "userAgent": "Browser user agent"
  }
]
```

## Användning för AI-agent

### Automatisk felrapportering

När du ser fel i webbläsaren:

1. **Kör kommandot**: `npm run check:errors`
   - Detta skapar en sammanfattning i `logs/errors-summary.txt`
   - AI-agenten läser automatiskt denna fil när du nämner fel

2. **Säg till AI-agenten**:
   - "Jag har fel i webbläsaren" → AI-agenten läser automatiskt `logs/errors-summary.txt`
   - "Kolla browser-errors.json" → AI-agenten läser fullständig logg
   - "Analysera felen" → AI-agenten läser och analyserar alla fel

3. **AI-agenten gör automatiskt**:
   - Läser `logs/errors-summary.txt` eller `logs/browser-errors.json`
   - Analyserar stack traces
   - Identifierar problem
   - Föreslår fixes
   - Uppdaterar kod automatiskt

### Filstruktur

- `logs/browser-errors.json` - Fullständig logg med alla fel (JSON-format)
- `logs/errors-summary.txt` - Automatisk sammanfattning (uppdateras med `npm run check:errors`)

## API Endpoints

### POST `/api/errors`

Loggar ett nytt fel.

Request body:

```json
{
  "type": "error" | "warning" | "unhandled" | "boundary",
  "message": "Error message",
  "stack": "Stack trace (optional)",
  "source": "Source file (optional)",
  "componentStack": "React component stack (optional)"
}
```

### GET `/api/errors`

Hämtar alla loggade fel.

Response:

```json
{
  "errors": [...]
}
```

## Konfiguration

Loggfilen begränsas till de senaste 100 felen för att förhindra att filen blir för stor.

## Utveckling

I development mode loggas fel även till konsolen. I production loggas fel endast till filen.
