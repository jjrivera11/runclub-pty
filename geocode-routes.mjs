import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { realtime: { transport: ws } }
);

function buildQueries(route) {
  const clean = route.name.split(/ - | – |,/)[0].trim();
  return [
    { q: `${route.name}, ${route.zone}, ${route.city}, Panamá`, precise: true },
    { q: `${clean}, ${route.zone}, ${route.city}, Panamá`, precise: true },
    { q: `${clean}, ${route.city}, Panamá`, precise: true },
    { q: `${route.zone}, ${route.city}, Panamá`, precise: false },
  ];
}

async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=pa&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'RunClubPanama/1.0 (hola@runclubpty.com)' }
  });
  const data = await res.json();
  return data[0] ? { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) } : null;
}

async function main() {
  const { data: routes, error } = await supabase
    .from('training_spots')
    .select('id, name, city, zone')
    .is('latitude', null);

  if (error) {
    console.error('ERROR DE SUPABASE:', JSON.stringify(error, null, 2));
    process.exit(1);
  }

  console.log(`Rutas encontradas sin coordenadas: ${routes.length}`);

  let ok = 0, sinResultado = [];

  for (const route of routes) {
    let found = null;
    let usedLevel = null;

    for (const [i, attempt] of buildQueries(route).entries()) {
      const coords = await geocode(attempt.q);
      await new Promise(r => setTimeout(r, 1100));
      if (coords && attempt.precise) {
        found = coords;
        usedLevel = i + 1;
        break;
      }
      if (coords && !attempt.precise) {
        // hubo match pero solo a nivel zona/ciudad — no lo usamos como final
        break;
      }
    }

    if (found) {
      const { error: updateError } = await supabase
        .from('training_spots')
        .update({ latitude: found.lat, longitude: found.lon })
        .eq('id', route.id);
      if (updateError) {
        console.error(`ERROR actualizando ${route.name}:`, JSON.stringify(updateError, null, 2));
      } else {
        console.log(`✓ [nivel ${usedLevel}] ${route.name} → ${found.lat}, ${found.lon}`);
        ok++;
      }
    } else {
      console.log(`✗ ${route.name} — requiere pin manual`);
      sinResultado.push(route.name);
    }
  }

  console.log(`\nGeocodificadas: ${ok}/${routes.length}`);
  if (sinResultado.length) {
    console.log('\nRequieren pin manual en Google Maps:');
    sinResultado.forEach(n => console.log(`  - ${n}`));
  }
}

main().catch(err => {
  console.error('ERROR FATAL:', err);
  process.exit(1);
});
