# Supabase einrichten – gastrowerke

## Problem & Lösung

Die Anmeldung und Registrierung funktionieren nicht, weil in `supabase.js`
noch die Platzhalter stehen:

```
SUPABASE_URL = 'DEINE_SUPABASE_URL'
SUPABASE_ANON_KEY = 'DEIN_SUPABASE_ANON_KEY'
```

**Solange die Platzhalter drin sind, läuft die Seite im Offline-Modus** –
Benutzer können sich registrieren und einloggen, aber alles wird nur im
Browser-localStorage gespeichert (kein echter Backend-Speicher).

---

## Schritt-für-Schritt Setup

### 1. Supabase-Projekt erstellen
1. Gehe zu https://supabase.com → "New project"
2. Wähle eine Region nahe Deutschland (z. B. Frankfurt)

### 2. API-Keys holen
Supabase Dashboard → **Project Settings** → **API**
- `Project URL` → das ist deine `SUPABASE_URL`
- `anon / public` Key → das ist dein `SUPABASE_ANON_KEY`

### 3. Keys in supabase.js eintragen
```js
const SUPABASE_URL = 'https://DEINPROJEKT.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGci...langer-Token...';
```

### 4. Datenbank-Tabellen anlegen
Führe das SQL aus `supabase-setup.sql` im Supabase SQL-Editor aus:
Dashboard → **SQL Editor** → Inhalt einfügen → Run

### 5. E-Mail-Bestätigung (optional)
Für einfacheres Testen: Dashboard → **Authentication** → **Email** →
"Confirm email" deaktivieren

---

## Tabellen-Übersicht
- `profiles` – Benutzerprofile (Name, E-Mail)
- `orders` – Bestellungen pro User
- `addresses` – Lieferadressen pro User

---

## Fallback (ohne Supabase)
Ohne echte Credentials läuft die Seite im localStorage-Modus:
- ✅ Login/Registrierung funktioniert im Browser
- ❌ Daten sind nicht geräteübergreifend
- ❌ Daten gehen beim Browser-Cache-Löschen verloren
