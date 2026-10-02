# Météo — application web progressive (PWA)
React (Vite) + API Open-Meteo (sans clé). Recherche de ville, géolocalisation, prévisions sur 5 jours, favoris.
**PWA** : installable (manifest + icônes), service worker, **dernières données disponibles hors connexion**.
## Lancer
`npm install` puis `npm run dev`. Pour tester la PWA : `npm run build` puis `npm run preview` (le service worker n'est actif qu'en production).
## Déploiement
Netlify / Vercel : `npm run build`, dossier `dist` (HTTPS requis pour l'installation).
