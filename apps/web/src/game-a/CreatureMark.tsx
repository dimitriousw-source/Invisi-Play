import type { ChampionDefinition } from "./world";

export function CreatureMark({
  champion,
  size = 120,
}: {
  champion: ChampionDefinition;
  size?: number;
}) {
  const common = {
    fill: champion.palette.primary,
    stroke: champion.palette.accent,
    strokeWidth: 4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  const shape = (() => {
    switch (champion.model) {
      case "mantis":
        return (
          <>
            <ellipse cx="60" cy="68" rx="18" ry="30" {...common} />
            <circle cx="60" cy="32" r="13" {...common} />
            <path d="M48 54 L22 37 L12 55 M72 54 L98 37 L108 55" fill="none" {...common} />
            <path d="M49 88 L28 112 M71 88 L92 112 M55 20 L45 7 M65 20 L76 7" fill="none" {...common} />
          </>
        );
      case "spider":
        return (
          <>
            <ellipse cx="70" cy="67" rx="25" ry="29" {...common} />
            <circle cx="39" cy="64" r="16" {...common} />
            {[24, 39, 54, 69].map((y, index) => (
              <g key={y}>
                <path d={`M34 ${y + 18} L14 ${y + (index < 2 ? 3 : 26)} L5 ${y + (index < 2 ? 9 : 20)}`} fill="none" {...common} />
                <path d={`M78 ${y + 18} L101 ${y + (index < 2 ? 3 : 26)} L114 ${y + (index < 2 ? 9 : 20)}`} fill="none" {...common} />
              </g>
            ))}
          </>
        );
      case "pillbug":
        return (
          <>
            <ellipse cx="60" cy="65" rx="42" ry="31" {...common} />
            {[35, 47, 59, 71, 83].map((x) => (
              <path key={x} d={`M${x} 39 Q${x - 6} 65 ${x} 91`} fill="none" stroke={champion.palette.secondary} strokeWidth="5" />
            ))}
            <circle cx="92" cy="58" r="4" fill={champion.palette.accent} />
          </>
        );
      case "bear":
        return (
          <>
            <ellipse cx="57" cy="72" rx="33" ry="28" {...common} />
            <circle cx="85" cy="48" r="22" {...common} />
            <circle cx="72" cy="31" r="8" {...common} />
            <circle cx="98" cy="31" r="8" {...common} />
            <path d="M34 90 L28 112 M53 94 L50 114 M74 94 L77 114 M89 88 L98 108" fill="none" {...common} />
          </>
        );
      case "wolf":
        return (
          <>
            <ellipse cx="53" cy="72" rx="34" ry="22" {...common} />
            <path d="M72 60 L98 43 L108 58 L94 72 Z" {...common} />
            <path d="M93 45 L94 28 L103 41" {...common} />
            <path d="M24 70 Q3 58 9 43" fill="none" {...common} />
            <path d="M34 88 L28 111 M57 90 L53 113 M75 87 L81 110" fill="none" {...common} />
          </>
        );
      case "ram":
        return (
          <>
            <ellipse cx="55" cy="72" rx="34" ry="24" {...common} />
            <circle cx="89" cy="60" r="19" {...common} />
            <path d="M85 52 C109 22 119 55 101 68" fill="none" {...common} />
            <path d="M79 50 C60 26 58 55 73 65" fill="none" {...common} />
            <path d="M34 90 L31 113 M56 93 L54 114 M75 89 L80 111" fill="none" {...common} />
          </>
        );
      case "gecko":
        return (
          <>
            <ellipse cx="58" cy="67" rx="30" ry="15" {...common} />
            <circle cx="89" cy="60" r="13" {...common} />
            <path d="M29 67 Q5 55 9 35" fill="none" {...common} />
            <path d="M45 72 L25 92 M68 72 L83 95 M48 59 L29 42 M69 60 L84 44" fill="none" {...common} />
          </>
        );
      case "turtle":
        return (
          <>
            <ellipse cx="58" cy="67" rx="39" ry="27" {...common} />
            <ellipse cx="58" cy="67" rx="28" ry="18" fill={champion.palette.secondary} stroke={champion.palette.accent} strokeWidth="3" />
            <circle cx="101" cy="63" r="12" {...common} />
            <path d="M31 83 L20 101 M72 86 L82 104 M30 50 L18 37 M73 49 L86 34" fill="none" {...common} />
          </>
        );
      case "serpent":
        return (
          <>
            <path d="M14 92 C28 42 61 107 83 61 C99 29 111 47 104 67" fill="none" stroke={champion.palette.primary} strokeWidth="20" strokeLinecap="round" />
            <circle cx="104" cy="57" r="13" {...common} />
            <path d="M112 61 L120 65" fill="none" {...common} />
          </>
        );
      case "falcon":
        return (
          <>
            <ellipse cx="61" cy="68" rx="17" ry="31" {...common} />
            <circle cx="62" cy="34" r="14" {...common} />
            <path d="M47 57 L12 71 L42 82 M75 57 L109 71 L79 82" {...common} />
            <path d="M58 95 L49 113 M65 95 L72 113" fill="none" {...common} />
          </>
        );
      case "owl":
        return (
          <>
            <ellipse cx="60" cy="69" rx="31" ry="35" {...common} />
            <circle cx="48" cy="49" r="10" fill={champion.palette.secondary} stroke={champion.palette.accent} strokeWidth="3" />
            <circle cx="72" cy="49" r="10" fill={champion.palette.secondary} stroke={champion.palette.accent} strokeWidth="3" />
            <circle cx="48" cy="49" r="3" fill={champion.palette.accent} />
            <circle cx="72" cy="49" r="3" fill={champion.palette.accent} />
            <path d="M37 25 L48 37 M83 25 L72 37 M45 96 L38 113 M75 96 L82 113" fill="none" {...common} />
          </>
        );
      default:
        return (
          <>
            <ellipse cx="60" cy="70" rx="23" ry="31" {...common} />
            <circle cx="62" cy="36" r="15" {...common} />
            <path d="M45 59 L14 72 L41 82 M77 59 L108 72 L80 82" {...common} />
            <path d="M57 98 L49 114 M67 98 L74 114" fill="none" {...common} />
          </>
        );
    }
  })();

  return (
    <svg
      className="creature-mark"
      viewBox="0 0 120 120"
      width={size}
      height={size}
      aria-hidden="true"
    >
      {shape}
    </svg>
  );
}
