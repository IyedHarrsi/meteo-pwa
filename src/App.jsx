import { useState, useEffect } from 'react';
const W = { 0: ['Ciel dégagé', '☀️'], 1: ['Plutôt dégagé', '🌤️'], 2: ['Partiellement nuageux', '⛅'], 3: ['Couvert', '☁️'], 45: ['Brouillard', '🌫️'], 48: ['Brouillard givrant', '🌫️'], 51: ['Bruine légère', '🌦️'], 53: ['Bruine', '🌦️'], 55: ['Bruine dense', '🌦️'], 61: ['Pluie faible', '🌧️'], 63: ['Pluie', '🌧️'], 65: ['Forte pluie', '🌧️'], 71: ['Neige faible', '🌨️'], 73: ['Neige', '🌨️'], 75: ['Forte neige', '❄️'], 80: ['Averses', '🌦️'], 81: ['Averses fortes', '🌧️'], 82: ['Averses violentes', '⛈️'], 95: ['Orage', '⛈️'], 96: ['Orage et grêle', '⛈️'], 99: ['Orage violent', '⛈️'] };
const wx = c => W[c] || ['Conditions variables', '🌡️'];
const jget = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const URL_W = (p) => `https://api.open-meteo.com/v1/forecast?latitude=${p.lat}&longitude=${p.lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=6`;

export default function App() {
  const [place, setPlace] = useState(() => jget('place', { name: 'Tunis', lat: 36.8065, lon: 10.1815 })), [data, setData] = useState(() => jget('wx', null)), [off, setOff] = useState(null), [q, setQ] = useState(''), [res, setRes] = useState([]), [favs, setFavs] = useState(() => jget('favs', [])), [err, setErr] = useState('');
  useEffect(() => {
    localStorage.setItem('place', JSON.stringify(place)); setOff(null); setErr('');
    fetch(URL_W(place)).then(r => r.json()).then(d => { if (!d.current) throw new Error(); const x = { place: place.name, at: Date.now(), d }; setData(x); localStorage.setItem('wx', JSON.stringify(x)); })
      .catch(() => { const c = jget('wx', null); if (c) { setData(c); setOff(c.at); } else setErr('Impossible de charger la météo. Vérifiez votre connexion.'); });
  }, [place]);
  useEffect(() => { localStorage.setItem('favs', JSON.stringify(favs)); }, [favs]);
  const search = async e => { e.preventDefault(); if (q.trim().length < 2) return; try { const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=fr`).then(r => r.json()); setRes(r.results || []); if (!r.results) setErr('Aucune ville trouvée.'); else setErr(''); } catch { setErr('Recherche impossible hors connexion.'); } };
  const pick = r => { setPlace({ name: r.name + (r.country ? ', ' + r.country : ''), lat: r.latitude, lon: r.longitude }); setRes([]); setQ(''); };
  const locate = () => navigator.geolocation?.getCurrentPosition(p => setPlace({ name: 'Ma position', lat: p.coords.latitude, lon: p.coords.longitude }), () => setErr('Localisation refusée.'));
  const d = data?.d, cur = d?.current, isFav = favs.some(f => f.name === place.name);
  return (<main>
    <form className="bar" onSubmit={search}><input placeholder="Rechercher une ville" value={q} onChange={e => setQ(e.target.value)} aria-label="Ville" /><button>OK</button><button type="button" className="ghost" onClick={locate} aria-label="Ma position">📍</button></form>
    {res.length > 0 && <div className="res">{res.map(r => <button key={r.id} onClick={() => pick(r)}>{r.name} <span className="mute">{[r.admin1, r.country].filter(Boolean).join(', ')}</span></button>)}</div>}
    {err && <div className="off" role="alert">{err}</div>}
    {off && <div className="off">Hors connexion : dernière mise à jour à {new Date(off).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>}
    {favs.length > 0 && <div className="favs">{favs.map(f => <button key={f.name} className="ghost" onClick={() => setPlace(f)}>{f.name.split(',')[0]}</button>)}</div>}
    {cur && <><div className="now"><div className="mute">{data.place}</div><div className="ico">{wx(cur.weather_code)[1]}</div><div className="t">{Math.round(cur.temperature_2m)}°</div><div className="c">{wx(cur.weather_code)[0]}</div>
      <button className="ghost" style={{ marginTop: '.8rem' }} onClick={() => setFavs(isFav ? favs.filter(f => f.name !== place.name) : [...favs, place])}>{isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}</button></div>
      <div className="stats"><div><small>Ressenti</small>{Math.round(cur.apparent_temperature)}°</div><div><small>Humidité</small>{cur.relative_humidity_2m} %</div><div><small>Vent</small>{Math.round(cur.wind_speed_10m)} km/h</div></div>
      {d.daily.time.slice(1).map((t, i) => <div className="day" key={t}><b>{new Date(t).toLocaleDateString('fr-FR', { weekday: 'short' })}</b><span>{wx(d.daily.weather_code[i + 1])[1]}</span><span className="mute">{d.daily.precipitation_probability_max[i + 1] ?? 0} % pluie</span><span>{Math.round(d.daily.temperature_2m_max[i + 1])}° <span className="mute">{Math.round(d.daily.temperature_2m_min[i + 1])}°</span></span></div>)}</>}
    {!cur && !err && <p className="mute">Chargement…</p>}</main>);
}
