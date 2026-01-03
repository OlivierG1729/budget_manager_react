# 💰 Budget Manager

Une application moderne et élégante de gestion de budget personnel, construite avec React, Tailwind CSS et Supabase.

![Budget Manager Preview](https://via.placeholder.com/800x400/1a1a25/8b5cf6?text=Budget+Manager)

## ✨ Fonctionnalités

- **Dashboard** — Vue d'ensemble de vos dépenses avec graphiques interactifs
- **Gestion des dépenses** — Ajout, modification, suppression de transactions
- **Budget Cible** — Définissez un plafond quotidien et suivez votre solde cumulé
- **Statistiques** — Analysez vos habitudes de dépenses par catégorie, jour, etc.
- **Dépenses fixes/variables** — Distinguez loyer et abonnements de vos achats du quotidien
- **Design moderne** — Interface dark mode avec animations fluides

## 🚀 Installation

### Prérequis

- Node.js 18+ 
- npm ou yarn
- Un compte Supabase (gratuit)

### 1. Clone le projet

```bash
git clone <ton-repo>
cd budget-app
```

### 2. Installe les dépendances

```bash
npm install
```

### 3. Configure Supabase

1. Va sur [supabase.com](https://supabase.com) et connecte-toi
2. Ouvre ton projet existant (ou crée-en un nouveau)
3. Va dans **Settings → API**
4. Copie :
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon/public key** (la clé publique, pas la secret !)

### 4. Configure les variables d'environnement

Crée un fichier `.env` à la racine du projet :

```env
VITE_SUPABASE_URL=https://rjwmpufueodmnbvnllst.supabase.co
VITE_SUPABASE_ANON_KEY=ta_clé_anon_ici
```

### 5. Lance l'application

```bash
npm run dev
```

L'app sera disponible sur `http://localhost:5173` 🎉

## 📦 Build pour production

```bash
npm run build
```

Les fichiers seront générés dans le dossier `dist/`.

## 🌐 Déploiement

### Vercel (recommandé)

1. Push ton code sur GitHub
2. Va sur [vercel.com](https://vercel.com)
3. Importe ton repo
4. Ajoute les variables d'environnement :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy !

### Netlify

1. Push ton code sur GitHub
2. Va sur [netlify.com](https://netlify.com)
3. "Add new site" → "Import an existing project"
4. Configure les variables d'environnement
5. Deploy !

## 🗄️ Structure de la base de données

L'app utilise 3 tables dans Supabase :

```sql
-- Catégories
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    nom TEXT UNIQUE NOT NULL
);

-- Dépenses
CREATE TABLE depenses (
    id SERIAL PRIMARY KEY,
    montant NUMERIC(10,2) NOT NULL,
    date DATE NOT NULL,
    categorie_id INTEGER REFERENCES categories(id),
    type_depense TEXT DEFAULT 'Perso',
    commentaire TEXT,
    est_fixe BOOLEAN DEFAULT FALSE
);

-- Paramètres de budget
CREATE TABLE budget_settings (
    id SERIAL PRIMARY KEY,
    plafond_quotidien NUMERIC(10,2) DEFAULT 50.00,
    tracking_actif BOOLEAN DEFAULT FALSE,
    tracking_start_date DATE,
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🛠️ Technologies

- **React 18** — UI library
- **Vite** — Build tool ultra-rapide
- **Tailwind CSS** — Styling utility-first
- **Framer Motion** — Animations
- **Recharts** — Graphiques
- **Supabase** — Backend (PostgreSQL + API)
- **Lucide React** — Icônes

## 📁 Structure du projet

```
budget-app/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── ui.jsx           # Composants réutilisables
│   │   ├── Dashboard.jsx    # Page dashboard
│   │   ├── Expenses.jsx     # Page dépenses
│   │   ├── BudgetTracker.jsx # Page budget cible
│   │   └── Statistics.jsx   # Page statistiques
│   ├── hooks/
│   │   └── useData.js       # Hooks pour Supabase
│   ├── lib/
│   │   └── supabase.js      # Client Supabase + API
│   ├── App.jsx              # Composant principal
│   ├── main.jsx             # Point d'entrée
│   └── index.css            # Styles globaux
├── .env.example
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## 🎨 Personnalisation

### Couleurs

Modifie `tailwind.config.js` pour changer la palette :

```js
colors: {
  accent: {
    violet: '#8b5cf6',  // Couleur principale
    indigo: '#6366f1',
    emerald: '#10b981',
    // ...
  }
}
```

### Catégories par défaut

Modifie les catégories dans la table `categories` de Supabase.

## 🐛 Troubleshooting

### "Failed to fetch" ou erreurs réseau

- Vérifie que ton projet Supabase n'est pas en pause
- Vérifie les variables d'environnement
- Vérifie que RLS (Row Level Security) est désactivé ou configuré

### Les données ne s'affichent pas

- Ouvre la console du navigateur (F12) pour voir les erreurs
- Vérifie que les tables existent dans Supabase

## 📝 License

MIT — Fais-en ce que tu veux ! 🚀

---

Fait avec 💜 par un crétin des alpes (et un génie aussi 😎)
