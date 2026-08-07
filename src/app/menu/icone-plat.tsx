type Props = {
  nom: string;
  className?: string;
};

// Devine une icône simple selon des mots-clés dans le nom du plat,
// pour remplacer une icône générique de couverts par quelque chose
// d'un peu plus parlant tant qu'aucune photo n'a été ajoutée.
function deviner(nom: string): "taco" | "pizza" | "tajine" | "boisson" | "dessert" | "salade" | "defaut" {
  const n = nom.toLowerCase();
  if (n.includes("taco")) return "taco";
  if (n.includes("pizza")) return "pizza";
  if (n.includes("tajine") || n.includes("couscous")) return "tajine";
  if (
    n.includes("boisson") ||
    n.includes("jus") ||
    n.includes("thé") ||
    n.includes("the ") ||
    n.includes("soda") ||
    n.includes("eau")
  )
    return "boisson";
  if (
    n.includes("dessert") ||
    n.includes("pâtisserie") ||
    n.includes("gâteau") ||
    n.includes("baklava") ||
    n.includes("corne")
  )
    return "dessert";
  if (n.includes("salade") || n.includes("entrée")) return "salade";
  return "defaut";
}

export default function IconePlat({ nom, className }: Props) {
  const type = deviner(nom);

  const commun = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (type === "taco") {
    return (
      <svg viewBox="0 0 24 24" className={className} {...commun}>
        <path d="M4 15c0-5.5 3.6-9 8-9s8 3.5 8 9" />
        <path d="M4 15h16" />
        <path d="M7.5 15v3M12 15v4M16.5 15v3" />
      </svg>
    );
  }

  if (type === "pizza") {
    return (
      <svg viewBox="0 0 24 24" className={className} {...commun}>
        <path d="M12 3 4 20h16L12 3z" />
        <circle cx="12" cy="10.5" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="9.5" cy="15" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="14.5" cy="15" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (type === "tajine") {
    return (
      <svg viewBox="0 0 24 24" className={className} {...commun}>
        <path d="M5.5 16.5a6.5 6.5 0 0113 0" />
        <path d="M4 16.5h16" />
        <path d="M4 19h16" />
        <path d="M12 4.5v3" />
        <circle cx="12" cy="3.5" r="1" />
      </svg>
    );
  }

  if (type === "boisson") {
    return (
      <svg viewBox="0 0 24 24" className={className} {...commun}>
        <path d="M7 4h10l-1.4 14.8a1.2 1.2 0 01-1.2 1.2h-4.8a1.2 1.2 0 01-1.2-1.2L7 4z" />
        <path d="M7.6 8.5h8.8" />
      </svg>
    );
  }

  if (type === "dessert") {
    return (
      <svg viewBox="0 0 24 24" className={className} {...commun}>
        <path d="M4 20 12 5l8 15z" />
        <path d="M4 20h16" />
        <circle cx="12" cy="11" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (type === "salade") {
    return (
      <svg viewBox="0 0 24 24" className={className} {...commun}>
        <path d="M4 13a8 8 0 0116 0" />
        <path d="M3.5 13h17" />
        <path d="M8 13c0-2 1-4 1-5M12 13c0-2.5.5-5 .5-6M16 13c0-2-1-4-1-5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={className} {...commun}>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M9 7v4M9 7a1.3 1.3 0 000 2.6M15 7v10" />
    </svg>
  );
}