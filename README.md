# 📋 Documentation d'installation
## Registre National des Bénéficiaires Effectifs
### Ministère de la Justice — République du Sénégal

---

## 🏗️ Structure du projet

```
beneficiaires/
├── app.py                    # Application Flask principale
├── requirements.txt          # Dépendances Python
├── data/                     # Données (créé automatiquement)
│   ├── declarations.json     # Base de données JSON
│   ├── users.json            # Utilisateurs
│   └── declarations.xlsx     # Export Excel automatique
├── uploads/                  # Fichiers uploadés
├── templates/
│   ├── base.html             # Template de base (navbar)
│   ├── login.html            # Page de connexion
│   ├── dashboard.html        # Tableau de bord
│   ├── declaration.html      # Formulaire déclaration
│   ├── liste.html            # Liste / base de données
│   ├── detail.html           # Détail d'une déclaration
│   └── admin.html            # Administration utilisateurs
└── static/
    ├── css/style.css         # Styles CSS
    └── js/app.js             # JavaScript
```

---

## ⚙️ Installation locale

### Prérequis
- Python 3.8+
- pip

### Étapes

```bash
# 1. Aller dans le dossier du projet
cd beneficiaires

# 2. Créer un environnement virtuel
python -m venv venv
source venv/bin/activate      # Linux/Mac
venv\Scripts\activate         # Windows

# 3. Installer les dépendances
pip install -r requirements.txt

# 4. Lancer l'application
python app.py
```

L'application sera accessible sur : **http://localhost:5000**

---

## 🔐 Comptes par défaut

| Rôle          | Email                  | Mot de passe  |
|---------------|------------------------|---------------|
| Administrateur| admin@justice.sn       | Admin@2024    |
| Utilisateur   | user@justice.sn        | User@2024     |

> ⚠️ **Changer ces mots de passe en production !**

---

## 🌐 Déploiement sur serveur (production)

### Option 1 : Gunicorn + Nginx

```bash
# Installer gunicorn
pip install gunicorn

# Lancer avec gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# Configuration Nginx (exemple)
server {
    listen 80;
    server_name votre-domaine.sn;
    
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /static {
        alias /chemin/vers/beneficiaires/static;
    }
}
```

### Option 2 : Heroku

```bash
# Créer Procfile
echo "web: gunicorn app:app" > Procfile

# Déployer
heroku create registre-beneficiaires-sn
git push heroku main
```

### Option 3 : Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

---

## 🗄️ Migration vers PostgreSQL

Pour évoluer vers PostgreSQL, installez SQLAlchemy :

```bash
pip install flask-sqlalchemy psycopg2-binary
```

Puis modifiez `app.py` pour utiliser SQLAlchemy à la place du JSON.

---

## 📊 Fonctionnalités

### Authentification
- Connexion par email/mot de passe
- Mots de passe chiffrés (Werkzeug)
- Sessions sécurisées
- Rôles : Administrateur / Utilisateur

### Formulaire de déclaration
- **Section A** : Informations sur l'entité déclarante
- **Section B** : Bénéficiaire effectif (avec détection PPE)
- **Section C** : Participation et contrôle
- **Section D** : Documents justificatifs (PDF, ZIP, DOCX, XLSX, max 100 Mo)

### Tableau de bord
- Statistiques (total, aujourd'hui, PPE)
- Graphique mensuel des déclarations
- Répartition par forme juridique
- Déclarations récentes

### Base de données nationale
- Recherche multi-critères (NINEA, RCCM, nom)
- Filtres (PPE, forme juridique)
- Export Excel
- Actions (voir, modifier, supprimer)

### Administration
- Gestion des utilisateurs
- Création/suppression de comptes
- Attribution des rôles

---

## 🔒 Sécurité

- Mots de passe hashés (Werkzeug PBKDF2)
- Sessions Flask sécurisées
- Contrôle d'accès basé sur les rôles (RBAC)
- Validation des fichiers uploadés (extension + taille)
- Validation NINEA unique

---

## 📞 Support

Ministère de la Justice — Direction des Affaires Civiles
Dakar, République du Sénégal
