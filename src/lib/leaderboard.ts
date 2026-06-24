export interface LeaderboardEntry {
  user_id: string;
  name: string;
  points: number;
  rank: number;
  isMe: boolean;
  isGhost: boolean;
  weeklyRankChange: number; // positivo = subió, negativo = bajó, 0 = igual
}

const GHOST_RUNNER_PRO = [
  { name: "Valeria Ríos", points: 580 },
  { name: "Camila Herrera", points: 540 },
  { name: "Rodrigo Fábrega", points: 510 },
  { name: "Sofía Martínez", points: 480 },
  { name: "Daniela Ábrego", points: 450 },
  { name: "Andrés Solís", points: 420 },
  { name: "Natalia Chiari", points: 390 },
  { name: "Diego Pittí", points: 360 },
  { name: "Isabella Núñez", points: 330 },
  { name: "Mariana Delgado", points: 300 },
  { name: "Carlos Góndola", points: 270 },
  { name: "Luciana Mora", points: 240 },
  { name: "Fernanda Ramos", points: 80 },
  { name: "Alejandro Espino", points: 60 },
  { name: "Carolina Ábrego", points: 40 },
];

const GHOST_TRANSFORMACION = [
  { name: "Gabriela Núñez", points: 560 },
  { name: "Paola Jiménez", points: 520 },
  { name: "Sebastián Torrijos", points: 490 },
  { name: "Andrea Pittí", points: 460 },
  { name: "Lucía Fábrega", points: 430 },
  { name: "Marcos Herrera", points: 400 },
  { name: "Valentina Solís", points: 370 },
  { name: "Iván Ábrego", points: 340 },
  { name: "Mariana Chiari", points: 310 },
  { name: "Daniela Espino", points: 280 },
  { name: "Ricardo Mora", points: 250 },
  { name: "Sofía Ramos", points: 220 },
  { name: "Felipe Góndola", points: 80 },
  { name: "Natalia Delgado", points: 60 },
  { name: "Diego Martínez", points: 40 },
];

export function buildLeaderboardRows(
  myPoints: number,
  myUserId: string,
  myName: string,
  track: string,
  weeklyRankChange: number,
  realUsers: { user_id: string; name: string; points: number }[] = []
): LeaderboardEntry[] {
  const ghosts = track === "transformacion" ? GHOST_TRANSFORMACION : GHOST_RUNNER_PRO;

  // Combinar usuarios reales + fantasmas
  const all: LeaderboardEntry[] = [
    // Usuarios reales (excepto yo)
    ...realUsers
      .filter((u) => u.user_id !== myUserId)
      .map((u) => ({
        user_id: u.user_id,
        name: u.name,
        points: u.points,
        rank: 0,
        isMe: false,
        isGhost: false,
        weeklyRankChange: 0,
      })),
    // Fantasmas
    ...ghosts.map((g, i) => ({
      user_id: `ghost-${i}`,
      name: g.name,
      points: g.points,
      rank: 0,
      isMe: false,
      isGhost: true,
      weeklyRankChange: 0,
    })),
    // Yo
    {
      user_id: myUserId,
      name: myName,
      points: myPoints,
      rank: 0,
      isMe: true,
      isGhost: false,
      weeklyRankChange,
    },
  ];

  // Ordenar por puntos descendente
  all.sort((a, b) => b.points - a.points);

  // Asignar ranks
  all.forEach((entry, i) => {
    entry.rank = i + 1;
  });

  // Encontrar mi posición
  const myIndex = all.findIndex((e) => e.isMe);

  // Retornar solo 3 filas: arriba, yo, abajo
  const rows: LeaderboardEntry[] = [];
  if (myIndex > 0) rows.push(all[myIndex - 1]);
  rows.push(all[myIndex]);
  if (myIndex < all.length - 1) rows.push(all[myIndex + 1]);

  return rows;
}
