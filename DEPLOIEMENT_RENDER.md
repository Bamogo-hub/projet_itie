# 🚀 Guide de déploiement sur Render (gratuit)

## Registre National des Bénéficiaires Effectifs
### Ministère de la Justice — République du Sénégal

---

## Étape 1 — Préparer le code sur GitHub

1. Créer un compte sur **github.com**
2. Créer un nouveau dépôt (repository) nommé `registre-beneficiaires`
3. Dans le terminal, depuis le dossier du projet :

```bash
git init
git add .
git commit -m "Initial commit — Registre Bénéficiaires Effectifs"
git branch -M main
git remote add origin https://github.com/VOTRE_NOM/registre-beneficiaires.git
git push -u origin main
```

---

## Étape 2 — Créer la base de données PostgreSQL sur Render

1. Aller sur **render.com** → Se connecter / Créer un compte
2. Cliquer **New +** → **PostgreSQL**
3. Remplir :
   - Name : `beneficiaires-db`
   - Database : `beneficiaires`
   - User : `admin_justice`
   - Region : **Frankfurt** (plus proche du Sénégal)
   - Plan : **Free**
4. Cliquer **Create Database**
5. **Copier l'Internal Database URL** (commence par `postgresql://...`)

---

## Étape 3 — Déployer l'application Web

1. Cliquer **New +** → **Web Service**
2. Connecter votre compte GitHub → Choisir le repo `registre-beneficiaires`
3. Remplir :
   - Name : `registre-beneficiaires-sn`
   - Region : **Frankfurt**
   - Branch : `main`
   - Runtime : **Python 3**
   - Build Command : `pip install -r requirements.txt && flask db upgrade`
   - Start Command : `gunicorn app:app`
   - Plan : **Free**

4. Cliquer **Advanced** → **Add Environment Variable** :

| Variable | Valeur |
|----------|--------|
| `DATABASE_URL` | (coller l'Internal Database URL copiée à l'étape 2) |
| `SECRET_KEY` | (générer : `python -c "import secrets; print(secrets.token_hex(32))"`) |
| `UPLOAD_FOLDER` | `/tmp/uploads` |

5. Cliquer **Create Web Service**

---

## Étape 4 — Initialiser la base de données

Après le premier déploiement, dans le terminal Render (Shell) :

```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

Ou simplement lancer le serveur — `init_db()` est appelé automatiquement au démarrage.

---

## Comptes par défaut (à changer immédiatement)

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Administrateur | admin@justice.sn | Admin@2024 |
| Utilisateur | user@justice.sn | User@2024 |

⚠️ **Changer ces mots de passe dès le premier accès !**

---

## ⚠️ Note sur les fichiers uploadés

Sur Render (plan gratuit), le dossier `/tmp/uploads` est **temporaire** — les fichiers sont perdus lors des redémarrages.

Pour une solution persistante, intégrer **Cloudinary** (gratuit) ou **AWS S3** pour le stockage des fichiers.

---

## Structure finale déployée

```
PostgreSQL (Render) ←→ Flask App (Render Web Service)
         ↕
   Tables : users, declarations
```

## URLs après déploiement

Votre application sera accessible sur :
`https://registre-beneficiaires-sn.onrender.com`

---

## Support

Documentation Render : https://render.com/docs
Flask-SQLAlchemy : https://flask-sqlalchemy.palletsprojects.com
Flask-Migrate : https://flask-migrate.readthedocs.io
