// src/data/coreografiasMock.js
//
// Datos mock que imitan exactamente lo que devuelve el backend en:
//   GET /api/choreographies/          → array de objetos (formato abajo)
//   GET /api/choreographies/<id>/     → un solo objeto
//   GET /api/choreographies/<id>/videos/  → array de videos
//
// Cuando conectes el backend, borra este archivo y usa coreografiaService.js
// que ya hace los fetch reales a esos endpoints.
//
// ─── Forma del objeto coreografía (viene del CoreographySerializer) ─────────
// {
//   coreography_id:       number   — PK de la tabla
//   c_name:               string   — nombre de la coreografía
//   image_url:            string   — URL de la miniatura (puede ser null)
//   c_description:        string   — descripción larga
//   dificulty_level:      "basic" | "intermediate" | "advanced"
//   song_name:            string
//   song_genre:           string
//   price:                string   — el backend devuelve Decimal como string ("45000.00")
//   times_sold:           number
//   profesor_id:          number   — id del profesor principal
//   assistent_profesor_id: number | null
//   status:               "active" | "inactive"
//   creation_date:        string   — ISO 8601
// }
//
// ─── Forma del objeto video ──────────────────────────────────────────────────
// {
//   id:             number
//   coreography:    number   — FK → coreography_id
//   title:          string
//   video_url:      string   — URL del video (Vimeo, YouTube, S3, etc.)
//   order:          number   — posición dentro del paquete
// }

export const coreografiasMock = [
  {
    coreography_id: 1,
    c_name: "Cupido",
    image_url:
      "https://images.unsplash.com/photo-1547153760-18fc86324498?w=600&h=338&fit=crop",
    c_description:
      "Aprende la coreografía completa de Cupido, el hit de TINI. Pasos claros y progresivos para bailarlo en cualquier ocasión.",
    dificulty_level: "basic",
    song_name: "Cupido",
    song_genre: "Pop Latino",
    price: "45000.00",
    times_sold: 312,
    profesor_id: 1,
    assistent_profesor_id: null,
    status: "active",
    creation_date: "2025-03-10T00:00:00Z",
  },
  {
    coreography_id: 2,
    c_name: "La Noche de Anoche",
    image_url:
      "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=600&h=338&fit=crop",
    c_description:
      "Salsa urbana al estilo de Bad Bunny y Rosalía. Combina pasos de salsa tradicional con movimientos modernos.",
    dificulty_level: "intermediate",
    song_name: "La Noche de Anoche",
    song_genre: "Salsa Urbana",
    price: "65000.00",
    times_sold: 218,
    profesor_id: 2,
    assistent_profesor_id: null,
    status: "active",
    creation_date: "2025-04-01T00:00:00Z",
  },
  {
    coreography_id: 3,
    c_name: "Tití Me Preguntó",
    image_url:
      "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&h=338&fit=crop",
    c_description:
      "Reguetón puro con el sabor de Bad Bunny. Coreografía de alto impacto con giros, rebotes y sincronía grupal.",
    dificulty_level: "advanced",
    song_name: "Tití Me Preguntó",
    song_genre: "Reguetón",
    price: "80000.00",
    times_sold: 415,
    profesor_id: 3,
    assistent_profesor_id: null,
    status: "active",
    creation_date: "2025-04-15T00:00:00Z",
  },
  {
    coreography_id: 4,
    c_name: "Pepas",
    image_url:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=338&fit=crop",
    c_description:
      "El perreo de Farruko llevado a otro nivel. Pasos explosivos con transiciones rápidas y mucho ritmo.",
    dificulty_level: "intermediate",
    song_name: "Pepas",
    song_genre: "Reguetón",
    price: "60000.00",
    times_sold: 289,
    profesor_id: 1,
    assistent_profesor_id: null,
    status: "active",
    creation_date: "2025-04-20T00:00:00Z",
  },
  {
    coreography_id: 5,
    c_name: "Efecto",
    image_url:
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&h=338&fit=crop",
    c_description:
      "El merengue moderno de Bad Bunny. Sencilla de aprender, imposible de olvidar.",
    dificulty_level: "basic",
    song_name: "Efecto",
    song_genre: "Merengue",
    price: "40000.00",
    times_sold: 176,
    profesor_id: 2,
    assistent_profesor_id: null,
    status: "active",
    creation_date: "2025-05-03T00:00:00Z",
  },
  {
    coreography_id: 6,
    c_name: "Ojitos Lindos",
    image_url:
      "https://images.unsplash.com/photo-1545959570-a94084071b5d?w=600&h=338&fit=crop",
    c_description:
      "Cumbia suave y elegante con influencia caribeña. Ideal para principiantes que quieren sentir el ritmo.",
    dificulty_level: "basic",
    song_name: "Ojitos Lindos",
    song_genre: "Cumbia",
    price: "42000.00",
    times_sold: 143,
    profesor_id: 1,
    assistent_profesor_id: null,
    status: "active",
    creation_date: "2025-05-14T00:00:00Z",
  },
  {
    coreography_id: 7,
    c_name: "Moscow Mule",
    image_url:
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&h=338&fit=crop",
    c_description:
      "Reggaetón sensual con pasos sofisticados. Para quienes ya dominan lo básico y quieren un reto real.",
    dificulty_level: "intermediate",
    song_name: "Moscow Mule",
    song_genre: "Reguetón",
    price: "70000.00",
    times_sold: 201,
    profesor_id: 3,
    assistent_profesor_id: null,
    status: "active",
    creation_date: "2025-06-01T00:00:00Z",
  },
  {
    coreography_id: 8,
    c_name: "Bichota",
    image_url:
      "https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?w=600&h=338&fit=crop",
    c_description:
      "El poder y la actitud de Karol G en cada paso. Coreografía avanzada con formaciones y trabajo en equipo.",
    dificulty_level: "advanced",
    song_name: "Bichota",
    song_genre: "Reguetón",
    price: "85000.00",
    times_sold: 378,
    profesor_id: 1,
    assistent_profesor_id: null,
    status: "active",
    creation_date: "2025-06-10T00:00:00Z",
  },
  {
    coreography_id: 9,
    c_name: "El Makinon",
    image_url:
      "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&h=338&fit=crop",
    c_description:
      "Champeta con sabor barranquillero. Aprende los giros y golpes de cadera que caracterizan este género.",
    dificulty_level: "intermediate",
    song_name: "El Makinon",
    song_genre: "Champeta",
    price: "58000.00",
    times_sold: 134,
    profesor_id: 2,
    assistent_profesor_id: null,
    status: "active",
    creation_date: "2025-06-22T00:00:00Z",
  },
  {
    coreography_id: 10,
    c_name: "Provenza",
    image_url:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=338&fit=crop",
    c_description:
      "Vallenato pop llevado al escenario. Pasos fluidos que cuentan una historia con cada movimiento.",
    dificulty_level: "advanced",
    song_name: "Provenza",
    song_genre: "Vallenato Pop",
    price: "75000.00",
    times_sold: 267,
    profesor_id: 3,
    assistent_profesor_id: null,
    status: "active",
    creation_date: "2025-07-01T00:00:00Z",
  },
  {
    coreography_id: 11,
    c_name: "Gatúbela",
    image_url:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=338&fit=crop",
    c_description:
      "Karol G y Maldy juntos en una de las coreografías más divertidas. Dinámica, contagiosa y llena de actitud.",
    dificulty_level: "basic",
    song_name: "Gatúbela",
    song_genre: "Reguetón",
    price: "44000.00",
    times_sold: 198,
    profesor_id: 1,
    assistent_profesor_id: null,
    status: "active",
    creation_date: "2025-07-05T00:00:00Z",
  },
  {
    coreography_id: 12,
    c_name: "Un Verano Sin Ti",
    image_url:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=338&fit=crop",
    c_description:
      "El álbum más icónico del verano, ahora en movimiento. Coreografía avanzada que recorre varios estilos del disco.",
    dificulty_level: "advanced",
    song_name: "Un Verano Sin Ti",
    song_genre: "Plena / Reguetón",
    price: "90000.00",
    times_sold: 502,
    profesor_id: 2,
    assistent_profesor_id: null,
    status: "active",
    creation_date: "2025-07-08T00:00:00Z",
  },
];

// Videos mock para el detalle — imita GET /api/choreographies/<id>/videos/
// El backend filtra por: ?coreography=<id>
export const videosMock = {
  1: [
    {
      id: 1,
      coreography: 1,
      title: "Calentamiento y preparación",
      video_url: "https://vimeo.com/example1",
      order: 1,
    },
    {
      id: 2,
      coreography: 1,
      title: "Sección A — pasos base",
      video_url: "https://vimeo.com/example2",
      order: 2,
    },
    {
      id: 3,
      coreography: 1,
      title: "Sección B — giros",
      video_url: "https://vimeo.com/example3",
      order: 3,
    },
    {
      id: 4,
      coreography: 1,
      title: "Rutina completa",
      video_url: "https://vimeo.com/example4",
      order: 4,
    },
  ],
  2: [
    {
      id: 5,
      coreography: 2,
      title: "Introducción a la salsa",
      video_url: "https://vimeo.com/example5",
      order: 1,
    },
    {
      id: 6,
      coreography: 2,
      title: "Pasos base",
      video_url: "https://vimeo.com/example6",
      order: 2,
    },
    {
      id: 7,
      coreography: 2,
      title: "Coreografía completa",
      video_url: "https://vimeo.com/example7",
      order: 3,
    },
  ],
};

// Profesores mock (en el backend vienen de /api/profesores/<id>/)
export const profesoresMock = {
  1: { id: 1, nombre: "Valentina Ríos" },
  2: { id: 2, nombre: "Andrés Molina" },
  3: { id: 3, nombre: "Sebastián Cruz" },
};

// Función auxiliar: imita los filtros del backend (CoreographyFilter)
// ?genero=salsa  →  filtra por song_genre (contiene, insensible a mayúsculas)
// ?nivel=basic   →  filtra por dificulty_level (exacto)
// Cuando conectes el backend estos parámetros van como query params en la URL.
export const filtrarCoreografias = ({
  genero,
  nivel,
  busqueda,
  profesorId,
} = {}) => {
  let resultado = coreografiasMock.filter((c) => c.status === "active");

  // Filtro por nivel de dificultad — equivale a ?dificulty_level=basic en el backend
  if (nivel) resultado = resultado.filter((c) => c.dificulty_level === nivel);

  // Filtro por género musical — equivale a ?song_genre=salsa (contains, insensible)
  if (genero)
    resultado = resultado.filter((c) =>
      c.song_genre.toLowerCase().includes(genero.toLowerCase()),
    );

  // Filtro por profesor_id — equivale a ?profesor_id=1 en el backend
  if (profesorId)
    resultado = resultado.filter((c) => c.profesor_id === profesorId);

  // Búsqueda libre: nombre, género o canción
  if (busqueda) {
    const q = busqueda.toLowerCase();
    resultado = resultado.filter(
      (c) =>
        c.c_name.toLowerCase().includes(q) ||
        c.song_genre.toLowerCase().includes(q) ||
        c.song_name.toLowerCase().includes(q),
    );
  }

  return resultado;
};
