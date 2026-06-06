# models.py — Modèles SQLAlchemy (PostgreSQL)
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

db = SQLAlchemy()

def gen_id():
    return str(uuid.uuid4())[:8].upper()

class User(db.Model):
    __tablename__ = 'users'
    id               = db.Column(db.String(8),   primary_key=True, default=gen_id)
    email            = db.Column(db.String(255),  unique=True, nullable=False)
    password_hash    = db.Column(db.String(512),  nullable=False)
    nom              = db.Column(db.String(100),  nullable=False)
    prenom           = db.Column(db.String(100),  nullable=False)
    role             = db.Column(db.String(20),   default='user')  # 'admin' | 'user'
    export_autorise  = db.Column(db.Boolean,      default=False)
    created_at       = db.Column(db.DateTime,     default=datetime.utcnow)

    declarations = db.relationship('Declaration', backref='user', lazy=True)

    def to_dict(self):
        return {
            'id': self.id, 'email': self.email,
            'nom': self.nom, 'prenom': self.prenom,
            'role': self.role, 'export_autorise': self.export_autorise,
            'created_at': self.created_at.isoformat() if self.created_at else '',
        }


class Declaration(db.Model):
    __tablename__ = 'declarations'

    # ── Identifiants ──────────────────────────────────────────
    id              = db.Column(db.String(8),   primary_key=True, default=gen_id)
    date_saisie     = db.Column(db.DateTime,    default=datetime.utcnow)
    date_modification = db.Column(db.DateTime,  nullable=True)
    utilisateur_id  = db.Column(db.String(8),   db.ForeignKey('users.id'), nullable=False)
    statut          = db.Column(db.String(50),  default='Soumis')

    # ── Section A — Entité déclarante ─────────────────────────
    denomination_sociale   = db.Column(db.String(300))
    ninea                  = db.Column(db.String(20), unique=True)
    rccm                   = db.Column(db.String(100))
    forme_juridique        = db.Column(db.String(50))
    pays                   = db.Column(db.String(100))
    ville                  = db.Column(db.String(100))
    departement            = db.Column(db.String(100))
    siege_social           = db.Column(db.Text)
    greffe                 = db.Column(db.String(100))
    telephone              = db.Column(db.String(30))
    email_entreprise       = db.Column(db.String(255))
    cotee_bourse           = db.Column(db.String(20), default='Non')
    filiale_cotee          = db.Column(db.String(20), default='Non')
    entreprise_etat        = db.Column(db.String(20), default='Non')
    autre_type_entite      = db.Column(db.String(20), default='Non')
    cotee_100              = db.Column(db.String(20), default='Non')
    nom_maison_mere        = db.Column(db.String(300))
    place_boursiere        = db.Column(db.String(200))
    numero_isin            = db.Column(db.String(50))
    pourcentage_participation_mere = db.Column(db.Numeric(5,2))

    # ── Section B — Bénéficiaire effectif ─────────────────────
    beneficiaire_nom       = db.Column(db.String(200))
    beneficiaire_prenom    = db.Column(db.String(200))
    sexe                   = db.Column(db.String(20))
    date_naissance         = db.Column(db.Date)
    lieu_naissance         = db.Column(db.String(200))
    nationalite            = db.Column(db.String(200))
    pays_residence         = db.Column(db.String(100))
    adresse_personnelle    = db.Column(db.Text)
    adresse_professionnelle= db.Column(db.Text)
    numero_cni             = db.Column(db.String(20))
    numero_passeport       = db.Column(db.String(30))
    telephone_ben          = db.Column(db.String(30))
    ppe                    = db.Column(db.String(20), default='Non')
    relation_ppe           = db.Column(db.String(20), default='Non')
    categorie_ppe          = db.Column(db.String(200))
    fonction_ppe           = db.Column(db.String(200))
    date_debut_fonction    = db.Column(db.Date)
    date_fin_fonction      = db.Column(db.Date)
    date_acquisition_propriete = db.Column(db.Date)
    nature_relation_ppe    = db.Column(db.Text)

    # ── Section C — Participation ─────────────────────────────
    parts_directes                  = db.Column(db.String(20), default='Non')
    nombre_parts_directes           = db.Column(db.Integer)
    pourcentage_participation        = db.Column(db.Numeric(5,2))
    droits_vote_directs             = db.Column(db.String(20), default='Non')
    nombre_voix                     = db.Column(db.Integer)
    pourcentage_voix                = db.Column(db.Numeric(5,2))
    parts_indirectes                = db.Column(db.String(20), default='Non')
    nombre_parts_indirectes         = db.Column(db.Integer)
    pourcentage_participation_indirecte = db.Column(db.Numeric(5,2))
    representant_legal              = db.Column(db.String(20), default='Non')
    autres_beneficiaires            = db.Column(db.String(20), default='Non')
    date_beneficiaire               = db.Column(db.Date)

    # Intermédiaires (JSON)
    intermediaires     = db.Column(db.Text)  # JSON stringifié

    # ── Section D — Documents ─────────────────────────────────
    fichier_zip        = db.Column(db.String(500))
    fichiers_json      = db.Column(db.Text)   # JSON: liste des fichiers

    # Certification
    certification_par      = db.Column(db.String(200))
    certification_fonction = db.Column(db.String(200))

    def to_dict(self):
        import json
        return {
            'id': self.id,
            'date_saisie': self.date_saisie.isoformat() if self.date_saisie else '',
            'date_modification': self.date_modification.isoformat() if self.date_modification else '',
            'utilisateur_id': self.utilisateur_id,
            'utilisateur_nom': f"{self.user.prenom} {self.user.nom}" if self.user else '',
            'utilisateur_email': self.user.email if self.user else '',
            'statut': self.statut,
            'denomination_sociale': self.denomination_sociale or '',
            'ninea': self.ninea or '',
            'rccm': self.rccm or '',
            'forme_juridique': self.forme_juridique or '',
            'pays': self.pays or '',
            'ville': self.ville or '',
            'departement': self.departement or '',
            'siege_social': self.siege_social or '',
            'greffe': self.greffe or '',
            'telephone': self.telephone or '',
            'email_entreprise': self.email_entreprise or '',
            'cotee_bourse': self.cotee_bourse or 'Non',
            'filiale_cotee': self.filiale_cotee or 'Non',
            'entreprise_etat': self.entreprise_etat or 'Non',
            'autre_type_entite': self.autre_type_entite or 'Non',
            'nom_maison_mere': self.nom_maison_mere or '',
            'place_boursiere': self.place_boursiere or '',
            'numero_isin': self.numero_isin or '',
            'pourcentage_participation_mere': str(self.pourcentage_participation_mere or ''),
            'beneficiaire_nom': self.beneficiaire_nom or '',
            'beneficiaire_prenom': self.beneficiaire_prenom or '',
            'sexe': self.sexe or '',
            'date_naissance': self.date_naissance.isoformat() if self.date_naissance else '',
            'lieu_naissance': self.lieu_naissance or '',
            'nationalite': self.nationalite or '',
            'pays_residence': self.pays_residence or '',
            'adresse_personnelle': self.adresse_personnelle or '',
            'adresse_professionnelle': self.adresse_professionnelle or '',
            'numero_cni': self.numero_cni or '',
            'numero_passeport': self.numero_passeport or '',
            'telephone_ben': self.telephone_ben or '',
            'ppe': self.ppe or 'Non',
            'relation_ppe': self.relation_ppe or 'Non',
            'categorie_ppe': self.categorie_ppe or '',
            'fonction_ppe': self.fonction_ppe or '',
            'nature_relation_ppe': self.nature_relation_ppe or '',
            'parts_directes': self.parts_directes or 'Non',
            'nombre_parts_directes': self.nombre_parts_directes or '',
            'pourcentage_participation': str(self.pourcentage_participation or ''),
            'droits_vote_directs': self.droits_vote_directs or 'Non',
            'nombre_voix': self.nombre_voix or '',
            'pourcentage_voix': str(self.pourcentage_voix or ''),
            'parts_indirectes': self.parts_indirectes or 'Non',
            'nombre_parts_indirectes': self.nombre_parts_indirectes or '',
            'pourcentage_participation_indirecte': str(self.pourcentage_participation_indirecte or ''),
            'representant_legal': self.representant_legal or 'Non',
            'autres_beneficiaires': self.autres_beneficiaires or 'Non',
            'date_beneficiaire': self.date_beneficiaire.isoformat() if self.date_beneficiaire else '',
            'fichier_zip': self.fichier_zip or '',
            'fichiers': json.loads(self.fichiers_json) if self.fichiers_json else [],
            'certification_par': self.certification_par or '',
            'certification_fonction': self.certification_fonction or '',
        }
