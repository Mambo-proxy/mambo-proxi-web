/**
 * Illustration « voiture » (public/illustrations/voiture.svg, exportée de Figma) recomposée en SVG en ligne pour animer
 * la page 404 : la voiture roule, sort du cadre à droite et revient par la gauche, le marquage défile.
 * Animations désactivées si l'utilisateur réduit les mouvements (la scène reste celle de la maquette).
 */
export function CarScene({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 640 480" preserveAspectRatio="xMidYMid slice" aria-hidden className={className}>
      <defs>
        <linearGradient id="car-scene-sky" x1="0" y1="0" x2="460.8" y2="614.4" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDF4EC" />
          <stop offset="1" stopColor="#FCE7D5" />
        </linearGradient>
      </defs>
      <rect width="640" height="480" fill="url(#car-scene-sky)" />
      <circle cx="500" cy="110" r="80" fill="#F8B272" opacity="0.7" />
      <path
        d="M560 380C564 333.333 562.667 283.333 556 230"
        stroke="#46423D"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M556 230C589.333 220.667 617.333 225.333 640 244C610.667 228 582.667 223.333 556 230C522.667 223.333 496 230 476 250C502.667 230 529.333 223.333 556 230ZM556 230C536 203.333 512.667 190 486 190C512.667 196.667 536 210 556 230ZM556 230C576 200.667 600.667 187.333 630 190C600.667 195.333 576 208.667 556 230Z"
        fill="#557E1B"
        stroke="#557E1B"
        strokeWidth="10"
        strokeLinejoin="round"
      />
      <path
        d="M80 370C83.2 332.667 82.1334 292.667 76.8 250"
        stroke="#46423D"
        strokeWidth="7.2"
        strokeLinecap="round"
      />
      <path
        d="M76.8 250C103.467 242.533 125.867 246.267 144 261.2C120.533 248.4 98.1334 244.667 76.8 250C50.1334 244.667 28.8 250 12.8 266C34.1334 250 55.4667 244.667 76.8 250ZM76.8 250C60.8 228.667 42.1334 218 20.8 218C42.1334 223.333 60.8 234 76.8 250ZM76.8 250C92.8 226.533 112.533 215.867 136 218C112.533 222.267 92.8 232.933 76.8 250Z"
        fill="#7DB928"
        stroke="#7DB928"
        strokeWidth="8"
        strokeLinejoin="round"
      />
      <rect y="380" width="640" height="100" fill="#46423D" />
      <path
        d="M0 430H640"
        stroke="white"
        strokeWidth="6"
        strokeDasharray="40 30"
        className="animate-[road-dash_900ms_linear_infinite] motion-reduce:animate-none"
      />
      <g className="animate-[car-drive_7s_ease-in-out_infinite] motion-reduce:animate-none">
        <g className="animate-[car-bump_400ms_ease-in-out_infinite_alternate] motion-reduce:animate-none">
          <path
            d="M160 380C160 353.333 173.333 338 200 334L240 284C246.667 276 255.333 272 266 272H386C396.667 272 406 276 414 284L464 334C497.333 338 516 353.333 520 380H160Z"
            fill="#FF7A00"
          />
          <path d="M250 290H310V334H214L250 290ZM330 290H380L420 334H330V290Z" fill="#FDF4EC" />
          <path
            d="M492 345H484C481.791 345 480 346.791 480 349V351C480 353.209 481.791 355 484 355H492C494.209 355 496 353.209 496 351V349C496 346.791 494.209 345 492 345Z"
            fill="white"
          />
          <circle cx="285" cy="312" r="13" fill="#6B3E26" />
        </g>
        <circle cx="240" cy="384" r="30" fill="#2E2B28" />
        <circle cx="240" cy="384" r="12" fill="#E4E1DC" />
        <circle cx="420" cy="384" r="30" fill="#2E2B28" />
        <circle cx="420" cy="384" r="12" fill="#E4E1DC" />
      </g>
    </svg>
  );
}
