import React from "react";

export const metadata = {
  title: "Blå Pacman",
  description: "Inbäddad HTML5-version med blått tema",
};

export default function Page() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#071427",
        color: "#a7c7ff",
        padding: "16px",
      }}
    >
      <div
        style={{
          maxWidth: "920px",
          margin: "0 auto",
        }}
      >
        <h1 style={{ fontWeight: 800, marginBottom: 8 }}>🟦 Blå Pacman</h1>
        <p style={{ opacity: 0.9, marginBottom: 12 }}>
          Detta är exakt samma spel, inlagt i <code>/public</code> och
          inbäddat med en <code>&lt;iframe&gt;</code>.
        </p>

        <div
          style={{
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid rgba(121,165,255,.25)",
            boxShadow:
              "0 14px 50px rgba(0,0,0,.5), inset 0 0 36px rgba(33,101,255,.2)",
            background: "radial-gradient(900px 600px at 50% 10%, rgba(21,59,129,.25), rgba(4,12,26,.7))",
            width: "min(92vw, 880px)",
            aspectRatio: "28 / 32",
            margin: "0 auto",
          }}
        >
          <iframe
            src="/bla-pacman.html"
            title="Blå Pacman"
            style={{ width: "100%", height: "100%", border: 0 }}
            loading="eager"
          />
        </div>

        <p style={{ marginTop: 12, opacity: 0.8, fontSize: 14 }}>
          Tips: Vill du hellre ha spelet som en ren React-komponent utan
          iframe kan jag portera koden till React (useRef/useEffect) åt dig.
        </p>
      </div>
    </main>
  );
}
