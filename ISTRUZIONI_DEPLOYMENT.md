# 🚀 SHADOW SELF AI v2 - DEPLOYMENT CON SUPABASE

## ✅ COSA HAI FATTO FINORA

1. ✅ Creato progetto Supabase
2. ✅ Eseguito schema SQL (tabelle create)
3. ✅ App v1 deployata su Vercel

---

## 🎯 COSA FARE ORA - AGGIORNARE L'APP

### **STEP 1: Ottieni Credenziali Supabase**

1. Vai su https://supabase.com/dashboard
2. Apri progetto `shadow-self-ai`
3. **Settings** → **API**
4. Copia questi 2 valori:

**A) Project URL:**
```
https://xxxxxxxxxxx.supabase.co
```

**B) anon public key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

SALVA questi valori - li userai tra poco!

---

### **STEP 2: Aggiorna Repository GitHub**

**2.1 - Scarica i nuovi file**

Hai ricevuto il file `shadow-self-v2.zip`. Estrailo sul tuo computer.

**2.2 - Configura variabili ambiente**

1. Nella cartella estratta, trova il file `.env.local.example`
2. **Duplicalo** e rinominalo in `.env.local`
3. Apri `.env.local` e inserisci i tuoi valori:

```
NEXT_PUBLIC_SUPABASE_URL=https://TUO-PROJECT-ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIU...TUA-CHIAVE-COMPLETA
```

ATTENZIONE: **NON caricare** il file `.env.local` su GitHub! (è già nel .gitignore)

**2.3 - Carica i nuovi file su GitHub**

**OPZIONE A - Via interfaccia web:**

1. Vai sul tuo repository GitHub `shadow-self-ai`
2. Elimina i vecchi file (app/, package.json, ecc.)
3. Carica tutti i nuovi file dalla cartella `shadow-self-v2`:
   - app/
   - components/
   - lib/
   - package.json
   - next.config.js
   - .gitignore
   - .env.local.example (questo SÌ, caricalo!)

**OPZIONE B - Via command line:**

```bash
cd shadow-self-v2
git init
git add .
git commit -m "Update to v2 with Supabase"
git remote add origin https://github.com/TUO-USERNAME/shadow-self-ai.git
git push -f origin main
```

---

### **STEP 3: Configura Vercel con Variabili Ambiente**

**IMPORTANTE:** Vercel ha bisogno delle credenziali Supabase!

1. Vai su https://vercel.com/dashboard
2. Apri il tuo progetto `shadow-self-ai`
3. Clicca **Settings** → **Environment Variables**
4. Aggiungi queste 2 variabili:

**Variabile 1:**
- Key: `NEXT_PUBLIC_SUPABASE_URL`
- Value: `https://TUO-PROJECT-ID.supabase.co`
- Environments: ✅ Production ✅ Preview ✅ Development

**Variabile 2:**
- Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: `eyJhbGciOiJIU...` (tutta la chiave)
- Environments: ✅ Production ✅ Preview ✅ Development

5. Clicca **Save**

---

### **STEP 4: Rideploy**

**Se hai usato GitHub:**
- Vercel rebuilderà automaticamente quando fai push!
- Vai su Vercel Dashboard → Vedrai "Building..."
- Attendi 1-2 minuti
- ✅ App aggiornata!

**Se hai usato CLI:**
```bash
vercel --prod
```

---

### **STEP 5: Testa l'App**

1. Apri il link Vercel: `https://shadow-self-ai.vercel.app`
2. Dovresti vedere la schermata di **Login/Signup**
3. Crea un account con la tua email
4. Supabase invierà email di conferma (controlla inbox/spam)
5. Conferma email
6. Login!
7. ✅ Fai il tuo primo check-in!

---

## 🔧 COSA È CAMBIATO (v1 → v2)

### **Nuove Funzionalità:**

✅ **Autenticazione utenti**
- Login/Signup con email
- Password reset
- Session persistente

✅ **Database cloud (Supabase)**
- Dati salvati nel cloud, non più localStorage
- Accessibili da qualsiasi dispositivo
- Backup automatico

✅ **Multi-utente**
- Ogni utente ha i suoi dati privati
- RLS (Row Level Security) attivo
- Impossibile vedere dati altrui

✅ **Streak tracking automatico**
- Calcolo automatico streak consecutive
- Best streak salvato
- Trigger database che gestisce tutto

---

## 📧 CONFIGURAZIONE EMAIL SUPABASE

Supabase invia email per:
- Conferma registrazione
- Password reset

### **Email di Default (Supabase)**

Funzionano subito ma hanno il branding Supabase. Va bene per MVP!

### **Custom Email (Opzionale)**

Se vuoi email personalizzate:

1. Supabase → **Authentication** → **Email Templates**
2. Personalizza i template
3. Usa il tuo SMTP (es: SendGrid, Mailgun)

Per ora, usa le email default - funzionano perfettamente!

---

## 🎨 PROSSIMO STEP - VERA AI CLAUDE

Attualmente l'AI è "simulata" (risposte pre-programmate).

**Fase 2.3** aggiungeremo:
- ✅ Vera AI Claude via API
- ✅ Analisi personalizzate intelligenti
- ✅ Pattern recognition avanzato
- ✅ Weekly reports generati da AI

Ma prima testiamo che tutto funzioni!

---

## 🆘 TROUBLESHOOTING

### **Errore: "Missing Supabase environment variables"**

**Causa:** Variabili ambiente non configurate su Vercel

**Soluzione:**
1. Vercel → Settings → Environment Variables
2. Aggiungi `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Rideploy

### **Errore: "Invalid login credentials"**

**Causa:** Password sbagliata o email non confermata

**Soluzione:**
- Controlla email di conferma (anche spam)
- Clicca link di conferma
- Riprova login

### **Errore: "Failed to fetch"**

**Causa:** URL Supabase errato

**Soluzione:**
- Verifica che `NEXT_PUBLIC_SUPABASE_URL` sia corretto
- Deve essere: `https://[project-id].supabase.co`
- NO trailing slash

### **Dati non si salvano**

**Causa:** RLS policies non attive o user_id errato

**Soluzione:**
1. Supabase → Table Editor → check_ins → RLS deve essere ON (🔒)
2. SQL Editor: `SELECT * FROM check_ins LIMIT 10;`
3. Vedi dati? Se no, verifica che lo script SQL sia stato eseguito

---

## ✅ CHECKLIST FINALE

Prima di dare l'app ai clienti:

- [ ] Variabili ambiente configurate su Vercel
- [ ] App rebuildata e deployata
- [ ] Creato account di test
- [ ] Fatto check-in di test → dati salvati
- [ ] Logout/Login → dati ancora presenti
- [ ] Dashboard mostra grafici
- [ ] Journal funziona
- [ ] Email conferma ricevuta

**Tutto OK?** → **APP PRONTA!** 🎉

---

## 📱 INTEGRAZIONE CON SYSTEMA.IO

Il link è sempre lo stesso:
```
https://shadow-self-ai.vercel.app
```

Ma ora:
1. Utente clicca link
2. Vede schermata login/signup
3. Si registra
4. Riceve email conferma
5. Login e usa l'app!

**Thank You Page Systema.io:**
```html
<h1>🌑 Benvenuto in Shadow Self AI!</h1>

<p>Accedi alla tua webapp:</p>

<a href="https://shadow-self-ai.vercel.app">
  ACCEDI ALL'APP
</a>

<p><strong>Primo accesso:</strong></p>
<ol>
  <li>Clicca "Sign Up"</li>
  <li>Usa l'email con cui hai acquistato</li>
  <li>Crea una password</li>
  <li>Conferma la tua email</li>
  <li>Inizia il tuo percorso shadow!</li>
</ol>
```

---

**Domande?** Chiedi pure! 🌑
