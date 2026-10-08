'use client';

/**
 * Dernier recours si le gabarit lui-même échoue : page minimale, sans dépendance au reste du site
 * (styles en ligne, couleurs des tokens).
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'grid',
          placeItems: 'center',
          background: '#f8f7f5',
          color: '#1c1a18',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          padding: 20,
        }}
      >
        <main>
          <h1 style={{ fontSize: 28, margin: '0 0 12px' }}>Un imprévu sur la route.</h1>
          <p style={{ color: '#5e5952', margin: '0 0 24px' }}>Une erreur est survenue. Merci de réessayer.</p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              background: '#ff7a00',
              color: '#1c1a18',
              border: 0,
              borderRadius: 12,
              padding: '12px 24px',
              font: 'inherit',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Réessayer
          </button>
        </main>
      </body>
    </html>
  );
}
