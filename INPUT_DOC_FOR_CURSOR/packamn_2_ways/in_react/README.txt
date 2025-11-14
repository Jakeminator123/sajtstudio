# Blå Pacman – Next.js (App Router) snabb-integration

Detta paket innehåller:
- `public/bla-pacman.html` — den fristående HTML-filen med spelet.
- `app/pacman/page.tsx` — en Next.js-sida som bäddar in spelet via <iframe>.

## Steg
1) Packa upp hela mappen i din Next-apps rot (så att `public/` och `app/` hamnar på rätt plats).
2) Starta dev-servern: `npm run dev` eller `pnpm dev`
3) Surfa till `http://localhost:3000/pacman`

Alternativ:
- Vill du ha en Reactifierad version utan iframe? Be så får du en `components/BluePacman.tsx` + hook som kör spelet direkt i en <canvas>.
