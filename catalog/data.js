import { latex } from "./latex.js";
import { getLanguage } from "./i18n.js";
import { localizeEntry, localizedSoundTitle } from "./content-i18n.js";
export const mathFormulas = [];
const formula = (title, explanation, sources) => {
  const equation = latex[title];
  if (!equation) throw new Error("Mathematische Formel fehlt: " + title);
  const value = { title, equation, explanation, sources };
  mathFormulas.push(value);
  return value;
};
const transform = formula(
  "Vom Bauteil zum Objekt",
  "Die Konstruktoren setzen primitive Teilgeometrien zusammen. Verschiebung, Quaternionrotation und Skalierung bringen jedes Teil in das gemeinsame Koordinatensystem. Die Formel beschreibt diese im Code verwendete Transformation.",
  ["th", "ct", "Co"],
);
const box = formula(
  "Quader & Fasen",
  "Quader bilden die Grundkörper. Ei begrenzt den Fasenradius und verschiebt die Stützpunkte eines unterteilten Quaders; ot kann die Geometrie am Boden oder im Zentrum ausrichten.",
  ["ot", "Ei"],
);
const lathe = formula(
  "Rotationskörper",
  "Eine Folge von Radius-Höhen-Paaren wird um die y-Achse gedreht. Die diskreten Winkelschritte bilden die Oberfläche von Fässern, Reifen, Rollen und Zylindern. Dies ist die mathematische Lesart der LatheGeometry-Konstruktion.",
  ["vg", "Ul", "vt"],
);
const repeat = formula(
  "Wiederholte Bauteile",
  "Schleifen erzeugen Streben, Bretter, Stufen und Rippen in festen Abständen. Die konkreten Anzahlen und Abstände stehen im jeweiligen Konstruktor.",
  [],
);
const noise = formula(
  "Deterministische Oberflächenvariation",
  "Jn interpoliert vier Gitterwerte mit Smoothstep. Seed-Generatoren wie Fl und Nl verteilen reproduzierbare Varianten; nicht jeder Konstruktor verwendet denselben Generator.",
  ["Jn", "dg", "Fl", "Nl"],
);
const tube = formula(
  "Rohre & Verbindungen",
  "Ein Zylinder erhält die Länge zwischen seinen Endpunkten, wird auf den Mittelpunkt verschoben und mit einer Quaternion auf die Verbindungsrichtung ausgerichtet. Gekrümmte Leitungen verwenden zusätzlich Splines.",
  ["V0", "bn", "ea", "Vh"],
);
const corrugation = formula(
  "Trapezförmige Containerwellung",
  "Rk beschreibt ein periodisches Trapezprofil mit Periode P, Tiefe d, flacher Breite f und Rampenbreite s. sh setzt Stützpunkte genau an die Übergänge. Dadurch bleiben die Wellblechkanten scharf.",
  ["Rk", "sh", "Pk"],
);
const ik = formula(
  "Inverse Kinematik der Beine",
  "US löst die Beinwinkel über den Kosinussatz. Die Reichweite wird begrenzt, damit unerreichbare Fußziele keine ungültigen Winkel erzeugen. Die Originalparameter stehen in Ky.",
  ["US"],
);
const spring = formula(
  "Gedämpfte Feder",
  "ll integriert Federkraft und Dämpfung mit einem semi-impliziten Euler-Schritt. Das Modell erzeugt nachgiebige Bewegungen; k ist die Steifigkeit und c die Dämpfung.",
  ["ll"],
);
const waves = formula(
  "Überlagerung von Wasserwellen",
  "Hw summiert vier gerichtete Wellen aus Og. Richtung, Wellenlänge und Amplitude stammen aus dem Spiel; eine räumliche Maske schwächt die Bewegung in der Ferne ab. Die Vorschau zeigt das Höhenfeld dieser CPU-Funktion, der Wasser-Shader ergänzt weitere Details.",
  ["Hw"],
);
const envelope = formula(
  "Hüllkurve & Frequenzverlauf",
  "ms erzeugt einen exponentiellen Attack-Decay-Verlauf; ohne Attack fällt die erste Klammer weg. ei interpoliert Frequenzen exponentiell. Die Generatoren kombinieren diese Bausteine mit Rauschen und Oszillatoren; die jeweilige Mischung steht im Quellcode.",
  ["ms", "ei", "Mn"],
);
const mix = formula(
  "Mischen, filtern, normalisieren",
  "Se addiert zeitversetzte Schichten. kt verwendet einen Biquadfilter, dessen Koeffizienten mu berechnet. j6 normalisiert den fertigen Puffer; bei fixed ist der Faktor auf höchstens 1 begrenzt. Die Hörprobe spielt genau diesen Puffer mit einstellbarer Kataloglautstärke.",
  ["Se", "mu", "kt", "j6", "K6"],
);

const names = {
  container20: [
    "20-Fuß-Container",
    "Logistik",
    "A_",
    ["Pk", "Rk", "sh"],
    [corrugation, transform],
  ],
  container40: [
    "40-Fuß-Container",
    "Logistik",
    "A_",
    ["Pk", "Rk", "sh"],
    [corrugation, transform],
  ],
  container40hc: [
    "High-Cube-Container",
    "Logistik",
    "A_",
    ["Pk", "Rk", "sh"],
    [corrugation, transform],
  ],
  jersey_barrier: [
    "Betonleitwand",
    "Infrastruktur",
    "k_",
    [],
    [box, transform],
  ],
  light_mast: ["Lichtmast", "Infrastruktur", "P_", [], [tube, repeat]],
  fence_panel: ["Zaunfeld", "Infrastruktur", "I_", [], [tube, repeat]],
  guard_booth: ["Wachhäuschen", "Infrastruktur", "z_", [], [box, transform]],
  gate_arm: ["Schranke", "Infrastruktur", "D_", [], [box, transform]],
  bollard_mooring: [
    "Festmacherpoller",
    "Infrastruktur",
    "L_",
    [],
    [lathe, transform],
  ],
  bollard_post: ["Schutzpoller", "Infrastruktur", "F_", [], [lathe, transform]],
  relay_node: [
    "Uplink-Relais",
    "Technik",
    "G_",
    [],
    [
      formula(
        "Pulsierendes Signallicht",
        "Das Relais wechselt zwischen live, cutting und cut. Der Konstruktor liefert eine update-Funktion für Licht, Lüfter und die gefederte Tür. In der Vorschau lässt sich der Zustand umschalten.",
        ["G_"],
      ),
      spring,
      transform,
    ],
  ],
  shelf_rack: ["Schwerlastregal", "Logistik", "V_", [], [repeat, box]],
  stairs_metal: ["Stahltreppe", "Infrastruktur", "H_", [], [repeat, transform]],
  catwalk: ["Laufsteg", "Infrastruktur", "O_", [], [repeat, tube]],
  reefer_unit: ["Kühlaggregat", "Technik", "W_", [], [repeat, box]],
  barrel: ["Stahlfass", "Logistik", "Hk", ["nw", "Ul"], [lathe, noise]],
  pallet: ["Holzpalette", "Logistik", "Ok", ["Ag", "nw"], [repeat, noise]],
  pallet_stack: [
    "Palettenstapel",
    "Logistik",
    "Vk",
    ["Ag"],
    [repeat, transform],
  ],
  crate_wood: ["Transportkiste", "Logistik", "Wk", ["Tg"], [box, repeat]],
  crate_stack: ["Kistenstapel", "Logistik", "Gk", ["Tg"], [repeat, transform]],
  ibc_tote: ["IBC-Tank", "Logistik", "qk", [], [box, repeat]],
  forklift: ["Gabelstapler", "Technik", "sP", [], [box, lathe, transform]],
  cable_reel: ["Kabeltrommel", "Logistik", "Xk", [], [lathe, tube]],
  tire_stack: ["Reifenstapel", "Logistik", "Yk", [], [lathe, repeat]],
  dumpster: ["Abfallcontainer", "Logistik", "rP", [], [box, transform]],
  generator: ["Generator", "Technik", "oP", [], [box, lathe, transform]],
  jerry_can: ["Kanister", "Logistik", "$k", [], [box, transform]],
  traffic_cone: [
    "Verkehrskegel",
    "Infrastruktur",
    "Zk",
    [],
    [lathe, transform],
  ],
  gas_cylinders: ["Gasflaschen", "Technik", "jk", [], [lathe, repeat]],
  tarp_cargo: ["Planenladung", "Logistik", "Jk", [], [noise, box]],
  sandbags: ["Sandsäcke", "Logistik", "eP", [], [noise, repeat]],
  toolbox_cart: ["Werkstattwagen", "Technik", "aP", [], [box, repeat]],
  floodlight_stand: ["Baustrahler", "Technik", "U_", [], [tube, transform]],
  cardboard_boxes: ["Kartons", "Logistik", "tP", ["ah"], [box, noise]],
  pipe_stack: ["Rohrstapel", "Logistik", "Kk", [], [lathe, repeat]],
  sign_post: ["Hinweisschild", "Infrastruktur", "N_", [], [box, tube]],
};
const categories = [
  "Alle",
  "Logistik",
  "Infrastruktur",
  "Technik",
  "Modelle",
  "Umwelt",
  "Mathematik",
  "Sound",
];
const descriptions = {
  container20:
    "Wellblech, Eckbeschläge und bewegliche Türen. Der Körper wird aus einem parametrischen Profil aufgebaut; Farbe, Seed, Verschleiß und Türöffnung sind variabel.",
  container40:
    "Die lange Containervariante verwendet dieselbe Profilfunktion und Türgeometrie wie das 20-Fuß-Modell, mit eigenen Abmessungen.",
  container40hc:
    "Die erhöhte Containervariante: dieselbe prozedurale Bauweise, mit einer nominellen Höhe von 2,90 Metern.",
  relay_node:
    "Eine animierte Schaltanlage aus Gehäuse, Antenne, Lüfter und Signallicht. Ihre drei Zustände steuern Lichtintensität und Mechanik.",
  barrel:
    "Ein gedrehtes Fassprofil mit Bändern und Deckeldetails. Farbe, Lage und offene Bauform werden durch die Originalparameter gesteuert.",
};

export function buildEntries(api, language = getLanguage()) {
  const entries = Object.entries(api.sizes).map(([id, size]) => {
    const [title, category, builder, helpers, formulas] = names[id] || [
      id,
      "Logistik",
      "fv",
      [],
      [transform],
    ];
    const surface = size[4];
    const impact = {
      metal: "impact_metal",
      wood: "impact_wood",
      concrete: "impact_concrete",
      rubber: "impact_wood",
      dirt: "impact_concrete",
    }[surface];
    return {
      id,
      title,
      category,
      kind: "prop",
      builder,
      sources: [
        builder,
        ...helpers,
        ...new Set(formulas.flatMap((f) => f.sources)),
      ],
      formulas,
      size: size.slice(0, 3),
      material: size[3],
      surface,
      description:
        descriptions[id] ||
        `Das Hafenobjekt wird vollständig aus Geometrie im Konstruktor ${builder} aufgebaut. Die Vorschau verwendet diese Originalfunktion und die prozeduralen Materialien des Spiels.`,
      sounds:
        id === "relay_node"
          ? ["relay_hum", "relay_cut"]
          : id === "gas_cylinders"
            ? ["explosion_big", impact]
            : id === "barrel"
              ? [impact, "explosion"]
              : [impact],
      soundNote:
        id === "relay_node"
          ? "Eigene Relaisklänge aus der Soundbank."
          : id === "barrel"
            ? "Metalltreffer; die Explosion ist im Spiel dem roten, geschlossenen, stehenden Fass zugeordnet."
            : id === "gas_cylinders"
              ? "Metalltreffer und Explosionsklang der Gasflaschen."
              : "Materialklang aus der Trefferzuordnung des Spiels. Statische Objekte besitzen keinen eigenen Dauerton.",
    };
  });
  entries.push(
    {
      id: "rifle",
      title: "PAC-9 Longshore",
      category: "Modelle",
      kind: "weapon",
      builder: "TE",
      sources: ["TE", "wS", "I5"],
      constants: ["wn"],
      formulas: [lathe, box, transform],
      description:
        "Das originale Geometriemodell des Gewehrs, einschließlich separater Teile für Verschluss und Magazin. Die Vorschau zeigt die Geometrie ohne Spielerhände.",
      sounds: [
        "rifle_shot",
        "rifle_tail_out",
        "rifle_tail_in",
        "reload_magout",
        "reload_maginsert",
        "reload_magin",
        "reload_boltback",
        "reload_bolt",
        "rifle_dry",
      ],
    },
    {
      id: "pistol",
      title: "PAC-4 Bosun",
      category: "Modelle",
      kind: "weapon",
      builder: "CS",
      sources: ["CS", "zS", "I5"],
      constants: ["G0"],
      formulas: [box, lathe, transform],
      description:
        "Das originale Pistolenmodell mit getrennten Geometrien für Rahmen, Schlitten, Lauf und Magazin. Die zugehörigen Geräusche lassen sich einzeln anhören.",
      sounds: [
        "pistol_shot",
        "pistol_tail_out",
        "pistol_tail_in",
        "pistol_magout",
        "pistol_maginsert",
        "pistol_magin",
        "pistol_slide",
        "pistol_dry",
      ],
    },
    {
      id: "hound",
      title: "Hound / Bodenroboter",
      category: "Modelle",
      kind: "robot",
      builder: "VS",
      sources: ["VS", "US", "jS", "ll"],
      constants: ["Ky"],
      formulas: [ik, spring],
      description:
        "Der vierbeinige Bodenroboter besitzt ein prozedurales Skelett und eine Lösung für die Beinwinkel. Die Vorschau zeigt das originale Modell in seiner Bindepose; die Laufsteuerung steht im Quellcode.",
      sounds: [
        "hound_servo",
        "hound_step",
        "hound_fire",
        "hound_die",
        "telegraph",
      ],
    },
    {
      id: "gull",
      title: "Gull / Flugroboter",
      category: "Modelle",
      kind: "robot",
      builder: "WS",
      sources: ["WS", "qD", "XS"],
      constants: ["N5"],
      formulas: [lathe, transform],
      description:
        "Vier Rotoren, Sensoraufhängung und Waffenmodul werden als Skelettmodell aufgebaut. Die Vorschau zeigt die Bindepose mit animierten Rotoren; Flugsteuerung und Absturz stehen in XS.",
      sounds: ["gull_rotor", "gull_fire", "gull_die", "alert", "telegraph"],
    },
    {
      id: "hands",
      title: "Hand / Fingerrig",
      category: "Modelle",
      kind: "hands",
      builder: "Fh",
      sources: ["Fh", "Sh", "TD"],
      formulas: [
        formula(
          "Gelenkkette der Finger",
          "Die Finger bilden hierarchische Gelenkketten. Die Formel beschreibt die Verkettung der lokalen Verschiebungen und Drehungen; die Originalfunktionen legen Gelenkpositionen, Pose und Hautgewichte fest.",
          ["Fh", "Sh"],
        ),
        transform,
      ],
      description:
        "Die prozedurale rechte Spielerhand mit artikulierten Fingern. Gelenkpositionen, Posen und die zugehörigen Geometrien werden im Code konstruiert.",
      sounds: ["gear_rustle"],
    },
    {
      id: "crane",
      title: "Portalkran / Saltline 04",
      category: "Umwelt",
      kind: "backdrop",
      builder: "Dg",
      sources: ["Dg", "kw", "Ua", "ia"],
      formulas: [
        tube,
        formula(
          "Schwingung des Spreaders",
          "kw überlagert langsame Sinusschwingungen für das hängende Lastaufnahmemittel. Die Vorschau nutzt diese Update-Funktion.",
          ["kw"],
        ),
      ],
      description:
        "Ein aus Trägern, Kabinen und Seilen aufgebauter Hafenkran. Der Spreader pendelt nach der Originalfunktion.",
      sounds: [],
      soundNote: "Für den Kran ist kein eigener Klanggenerator zugeordnet.",
    },
    {
      id: "ship",
      title: "Frachtschiff / Kittiwake",
      category: "Umwelt",
      kind: "backdrop",
      builder: "ww",
      sources: ["ww", "N0", "Ba", "fu", "kw"],
      formulas: [
        formula(
          "Parametrische Rumpffläche",
          "N0 berechnet die Rumpfposition und ergänzt Heckverjüngung sowie Längsversatz. Ba ermittelt Normalen über das Kreuzprodukt zweier Differenzen. Die Darstellung ist ein Auszug; die vollständige Fläche steht im Code.",
          ["N0", "Ba", "fu"],
        ),
        transform,
      ],
      description:
        "Der Schiffsrumpf entsteht als parametrische Fläche. Aufbauten, Container und Radar werden geometrisch ergänzt.",
      sounds: ["foghorn", "halyard"],
      soundNote:
        "Atmosphärenklänge des Hafens, keine direkt am Schiff ausgelösten Objektgeräusche.",
    },
    {
      id: "boat",
      title: "Extraktionsboot",
      category: "Umwelt",
      kind: "backdrop",
      builder: "Ew",
      sources: ["Ew", "kw"],
      formulas: [
        formula(
          "Rollen & Stampfen",
          "Die Originalfunktion kw bewegt die Rumpfgruppe mit zwei überlagerten Schwingungen. Im Showcase bleibt die mittlere Bootshöhe fest.",
          ["kw"],
        ),
        transform,
      ],
      description:
        "Ein prozedurales Schlauchboot mit Innenraum und Motor. Die Vorschau übernimmt das Rollen und Stampfen der Originalanimation.",
      sounds: ["sea"],
      soundNote:
        "Zugehörige Hafenatmosphäre; das Boot besitzt keinen eigenen Motorloop im Audiokatalog.",
    },
    {
      id: "sea-waves",
      title: "Wasser / Wellenfeld",
      category: "Umwelt",
      kind: "waves",
      builder: "Hw",
      sources: ["Hw", "Ow"],
      constants: ["Og", "Kn"],
      formulas: [waves],
      description:
        "Vier gerichtete Wellen bilden die bewegte Wasserhöhe. Die Vorschau wertet die originale Höhenfunktion über einem Ausschnitt vor dem Kai aus.",
      sounds: ["sea", "wind", "rain"],
    },
    {
      id: "math-box",
      title: "Quader & Transformation",
      category: "Mathematik",
      kind: "primitive",
      primitive: "box",
      builder: "ot",
      sources: ["ot", "Ei", "th", "ct"],
      formulas: [box, transform],
      description:
        "Die grundlegenden Geometriefunktionen hinter Gehäusen, Trägern und Containern.",
      sounds: [],
    },
    {
      id: "math-lathe",
      title: "Profilrotation & Zylinder",
      category: "Mathematik",
      kind: "primitive",
      primitive: "lathe",
      builder: "vg",
      sources: ["vg", "vt", "Ul"],
      formulas: [lathe],
      description:
        "Radius-Höhen-Profile werden zu dreidimensionalen Rotationskörpern.",
      sounds: [],
    },
    {
      id: "math-tube",
      title: "Spline & Rohr",
      category: "Mathematik",
      kind: "primitive",
      primitive: "tube",
      builder: "bn",
      sources: ["bn", "V0", "Vh"],
      formulas: [tube],
      description:
        "Gekrümmte Rohrgeometrie entlang einer Catmull-Rom-Kurve sowie ausgerichtete Zylinder zwischen Endpunkten.",
      sounds: [],
    },
    {
      id: "math-noise",
      title: "Value Noise & Seeds",
      category: "Mathematik",
      kind: "plot",
      plot: "noise",
      builder: "Jn",
      sources: ["Jn", "dg", "Fl", "Nl", "su"],
      formulas: [noise],
      description:
        "Ein räumlich stetiges Rauschfeld aus der originalen Funktion Jn. Der Seed und die gewählte Zeile verändern den gezeigten Ausschnitt.",
      sounds: [],
    },
    {
      id: "math-spring",
      title: "Gedämpfte Feder",
      category: "Mathematik",
      kind: "plot",
      plot: "spring",
      builder: "ll",
      sources: ["ll"],
      formulas: [spring],
      description:
        "Sprungantwort der originalen Federfunktion ll mit k = 45, c = 8 und Δt = 1/120 s. Der Zielwert springt bei t = 0 auf 1.",
      sounds: [],
    },
    {
      id: "math-ik",
      title: "Inverse Kinematik",
      category: "Mathematik",
      kind: "robot",
      model: "hound",
      builder: "US",
      sources: ["US", "VS"],
      constants: ["Ky"],
      formulas: [ik],
      description:
        "Die Winkellösung für die Hound-Beine. Das 3D-Modell zeigt das zugehörige Skelett in seiner Bindepose; der Algorithmus ist in US vollständig einsehbar.",
      sounds: [],
    },
    {
      id: "math-dsp",
      title: "Audiosynthese / DSP",
      category: "Mathematik",
      kind: "plot",
      plot: "envelope",
      builder: "K6",
      sources: [
        "K6",
        "J6",
        "j6",
        "e0",
        "mu",
        "kt",
        "y0",
        "Mn",
        "Se",
        "fi",
        "Gv",
        "as",
      ],
      formulas: [envelope, mix],
      description:
        "Rauschen, exponentielle Hüllkurven, Biquadfilter und verzögerte Schichten bilden die Bausteine der Soundbank. Der Graph zeigt ms mit Attack 0,01 s und Decay 0,12 s.",
      sounds: ["rifle_shot", "impact_metal", "sea"],
    },
  );
  for (const [id, spec] of Object.entries(api.audioBank)) {
    entries.push({
      id: "sound-" + id,
      soundId: id,
      title: soundTitle(id, language),
      category: "Sound",
      kind: "sound",
      builder: spec.gen.name,
      sources: [spec.gen.name, "K6", "j6"],
      spec,
      constants: id.startsWith("rifle")
        ? ["QP"]
        : id.startsWith("pistol")
          ? ["eI"]
          : [],
      formulas: [envelope, mix],
      description: spec.ir
        ? "Originale synthetische Impulsantwort für den Faltungshall. Die Hörprobe spielt den Impulspuffer selbst; im Spiel wird er zur Faltung anderer Klänge verwendet."
        : `Prozeduraler ${spec.loop ? "Loop" : "Einzelklang"} aus der Original-Soundbank. Alle ${spec.n} Varianten entstehen deterministisch aus Klangname und Variantenindex.`,
      sounds: [id],
    });
  }
  return entries.map((entry, index) =>
    localizeEntry(
      {
        ...entry,
        number: String(index + 1).padStart(3, "0"),
        sources: [...new Set(entry.sources)].filter((n) => api.functions[n]),
      },
      language,
    ),
  );
}

export function soundTitle(id, language = getLanguage()) {
  return localizedSoundTitle(id, language);
}
export { categories };
