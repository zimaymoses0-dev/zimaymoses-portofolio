"""
Single source of truth for who Moses is — career, education, skills, languages.

Transcribed from the CV (media/cv/Moses_Zimay_CV.pdf). Feeds the About page, the
schema.org Person JSON-LD that search engines read, and /llms.txt that AI assistants
read — so the three can never drift apart. Certifications are NOT here: they live in
the Certification model (editable from Admin) and are merged in by core/seo.py.

Deliberately left out (personal, not professional): date of birth, home address,
nationality, driving licence, and the references' names/phone numbers.

Every user-facing string is a {"fr": ..., "en": ...} pair; use `localize()` to pick one.
"""

from django.utils.translation import get_language

FULL_NAME = "Moses Zegbah Zimay"
GIVEN_NAME = "Moses"
ADDITIONAL_NAME = "Zegbah"
FAMILY_NAME = "Zimay"
# Every way people (and AI models) might write the name — feeds schema.org alternateName.
ALTERNATE_NAMES = [
    "Moses Zimay",
    "Zimay Moses",
    "Moses Z. Zimay",
    "Moses Zegbah",
    "Zimay Moses Zegbah",
]

JOB_TITLES = [
    {"fr": "Assistant comptable", "en": "Accounting Assistant"},
    {"fr": "Développeur web full-stack", "en": "Full-stack web developer"},
]

SUMMARY = {
    "fr": (
        "Moses Zegbah Zimay (Moses Zimay) est assistant comptable et développeur web "
        "full-stack basé à Abidjan, en Côte d'Ivoire. Depuis 2022, il travaille au "
        "département Finance de l'Organisation Interafricaine du Café (OIAC / IACO), une "
        "organisation de 25 pays membres producteurs de café : rapprochements bancaires "
        "multi-devises (XOF, EUR), préparation des audits annuels (MNG Audit & Consulting) "
        "et de l'audit externe d'un projet GIZ (BDO), et saisie comptable sur SAGE 100. "
        "Il cumule plus de 7 ans d'expérience en finance et comptabilité (SAGE 100, "
        "QuickBooks, Xero, SYCEBNL). En parallèle, il conçoit des sites et applications "
        "web (Django, WordPress/WooCommerce, Shopify), gère des campagnes publicitaires "
        "(Facebook, Instagram, TikTok, Google Ads) et produit de la vidéo. Bilingue "
        "français–anglais."
    ),
    "en": (
        "Moses Zegbah Zimay (Moses Zimay) is an accounting assistant and full-stack web "
        "developer based in Abidjan, Côte d'Ivoire (Ivory Coast). Since 2022 he has worked "
        "in the Finance Department of the Inter-African Coffee Organization (IACO), a "
        "25-member-country coffee producers' organization: multi-currency bank "
        "reconciliations (XOF, EUR), preparing the annual statutory audit (MNG Audit & "
        "Consulting) and the external audit of a GIZ-funded project (BDO), and bookkeeping "
        "on SAGE 100. He has 7+ years of finance and accounting experience (SAGE 100, "
        "QuickBooks, Xero, SYCEBNL). Alongside that he builds websites and web apps "
        "(Django, WordPress/WooCommerce, Shopify), runs paid ad campaigns (Facebook, "
        "Instagram, TikTok, Google Ads) and produces video. Bilingual in French and English."
    ),
}

LOCATION = {"locality": "Abidjan", "country_code": "CI", "country": {"fr": "Côte d'Ivoire", "en": "Côte d'Ivoire (Ivory Coast)"}}

LANGUAGES = [
    {"code": "fr", "name": {"fr": "Français", "en": "French"}},
    {"code": "en", "name": {"fr": "Anglais", "en": "English"}},
]

# Newest first. `start`/`end` are ISO dates for schema.org; `period` is what humans see.
EXPERIENCE = [
    {
        "title": {"fr": "Assistant Comptable — Département Finance (CDI)", "en": "Accounting Assistant — Finance Department (permanent contract)"},
        "organization": {"fr": "Organisation Interafricaine du Café (OIAC / IACO)", "en": "Inter-African Coffee Organization (IACO)"},
        "organization_description": {
            "fr": "Organisation interafricaine de 25 pays membres producteurs de café, qui promeut la consommation domestique de café en Afrique.",
            "en": "Inter-African organization of 25 coffee-producing member countries that promotes domestic coffee consumption in Africa.",
        },
        "location": "Abidjan, Côte d'Ivoire",
        "start": "2024-01-01",
        "end": None,
        "period": {"fr": "Janv. 2024 — Aujourd'hui", "en": "Jan 2024 — Present"},
        "highlights": [
            {"fr": "Enregistrement précis des opérations financières dans le système comptable (SAGE 100).", "en": "Accurately recording financial transactions in the accounting system (SAGE 100)."},
            {"fr": "Participation à la préparation des états financiers, des budgets et des rapports.", "en": "Helping prepare financial statements, budgets and reports."},
            {"fr": "Préparation de l'audit annuel des comptes de l'OIAC (XOF, EUR, amortissement des immobilisations) par MNG Audit & Consulting — comptes certifiés sincères et conformes pour les campagnes caféières 2022-2023 et 2023-2024.", "en": "Preparing the annual audit of IACO's accounts (XOF, EUR, asset depreciation) by MNG Audit & Consulting — accounts certified true and compliant for coffee years 2022-2023 and 2023-2024."},
            {"fr": "Préparation de l'audit externe du projet GIZ « Facilitation de la mise en œuvre des engagements de revenu vital et prospère », réalisé par BDO — comptes certifiés sincères et conformes.", "en": "Preparing the external audit of the GIZ project 'Facilitation of the implementation of the living prosperous income commitments', conducted by BDO — accounts certified true and compliant."},
            {"fr": "Préparation de la documentation financière de l'Assemblée Générale annuelle (campagnes 2022-2023 / 2023-2024).", "en": "Preparing the financial documentation for the Annual General Meeting (coffee years 2022-2023 / 2023-2024)."},
            {"fr": "Rapprochements bancaires mensuels multi-comptes et multi-devises (BICICI XOF & RECA, ECOBANK EUR & XOF, comptes GIZ et OIC) et suivi de la trésorerie.", "en": "Monthly multi-account, multi-currency bank reconciliations (BICICI XOF & RECA, ECOBANK EUR & XOF, GIZ and ICO accounts) and cash-flow monitoring."},
            {"fr": "Journaux de banque et écritures de caisse sur SAGE ; traitement des factures, paiements et dépenses ; classement et archivage des pièces.", "en": "Bank journals and petty-cash entries on SAGE; handling invoices, payments and expenses; filing and archiving supporting documents."},
            {"fr": "Gestion de la caisse : retraits bancaires pour la petite caisse et les per diem des missions du personnel.", "en": "Cash management: bank withdrawals for petty cash and per-diem allowances for staff missions."},
            {"fr": "Inventaire des fournitures trois fois par an et procès-verbal d'inventaire de fin d'année.", "en": "Stock counts of office and hygiene supplies three times a year, with the official year-end inventory report (procès-verbal)."},
            {"fr": "Suivi de la conformité aux règles et procédures financières.", "en": "Monitoring compliance with financial regulations and policies."},
        ],
    },
    {
        "title": {"fr": "Stagiaire Assistant Comptable — Département Finance", "en": "Intern Accounting Assistant — Finance Department"},
        "organization": {"fr": "Organisation Interafricaine du Café (OIAC / IACO)", "en": "Inter-African Coffee Organization (IACO)"},
        "organization_description": None,
        "location": "Abidjan, Côte d'Ivoire",
        "start": "2022-01-17",
        "end": "2023-12-31",
        "period": {"fr": "Janv. 2022 — Déc. 2023", "en": "Jan 2022 — Dec 2023"},
        "highlights": [
            {"fr": "Journaux de banque et écritures de caisse sur SAGE ; rapprochements bancaires mensuels (BICICI, ECOBANK, GIZ, OIC).", "en": "Bank journals and petty-cash entries on SAGE; monthly bank reconciliations (BICICI, ECOBANK, GIZ, ICO)."},
            {"fr": "Mise à jour du registre des immobilisations par inventaire physique, fiabilisant le calcul des amortissements trimestriels et la conformité des états financiers intermédiaires.", "en": "Updated the fixed-asset register through a physical count, making quarterly depreciation reliable and keeping interim financial statements compliant."},
            {"fr": "Préparation des audits internes et externes et constitution des pièces justificatives.", "en": "Preparing internal and external audits and compiling the supporting documents requested."},
            {"fr": "Préparation de la documentation financière de l'Assemblée Générale.", "en": "Preparing the financial documentation for the Annual General Meeting."},
            {"fr": "Suivi de la conformité aux règlements et politiques financières internes ; classement et archivage.", "en": "Monitoring compliance with internal financial policies and regulations; filing and archiving."},
            {"fr": "Création de visuels promotionnels pour le recrutement d'un stagiaire Community Management (« Coffee Essay Writing Competition 2024 »).", "en": "Designed promotional visuals to recruit a Community Management intern for the 'Coffee Essay Writing Competition 2024'."},
        ],
    },
    {
        "title": {"fr": "Assistant Comptable (stage puis poste)", "en": "Accounting Assistant (internship, then role)"},
        "organization": {"fr": "International Fellowship of Christians (IFC)", "en": "International Fellowship of Christians (IFC)"},
        "organization_description": {
            "fr": "Église internationale anglophone d'Abidjan fondée par des missionnaires, rassemblant plus de 40 nationalités.",
            "en": "International English-speaking church in Abidjan founded by missionaries, bringing together 40+ nationalities.",
        },
        "location": "Abidjan, Côte d'Ivoire",
        "start": "2019-02",
        "end": "2019-05",
        "period": {"fr": "Févr. — Mai 2019", "en": "Feb — May 2019"},
        "highlights": [
            {"fr": "Tenue de la comptabilité sur QuickBooks : saisie des opérations, contrôle de l'exhaustivité des pièces.", "en": "Bookkeeping on QuickBooks: posting transactions and checking supporting documents are complete."},
            {"fr": "Clôture de l'exercice 2018, participation au budget annuel, au reporting de fin d'année et au bilan.", "en": "Closing the 2018 financial year; contributing to the annual budget, year-end reporting and balance sheet."},
            {"fr": "Rapprochements bancaires mensuels sur Excel et QuickBooks (GT Bank, Banque Atlantique).", "en": "Monthly bank reconciliations on Excel and QuickBooks (GT Bank, Banque Atlantique)."},
            {"fr": "Vérification des actifs et mise à jour du registre des immobilisations par inventaire physique.", "en": "Asset verification and updating the fixed-asset register through a physical count."},
            {"fr": "Préparation des audits internes et externes.", "en": "Preparing internal and external audits."},
        ],
    },
    {
        "title": {"fr": "Administrateur & Monteur vidéo", "en": "Administrator & Video Editor"},
        "organization": {"fr": "Children's Fruit", "en": "Children's Fruit"},
        "organization_description": {
            "fr": "Organisation de jeunesse chrétienne : films, écoles bibliques de vacances et concerts gospel.",
            "en": "Christian youth organization: films, vacation Bible schools and gospel concerts.",
        },
        "location": "Abidjan, Côte d'Ivoire",
        "start": "2017-01",
        "end": "2019-02",
        "period": {"fr": "Janv. 2017 — Févr. 2019", "en": "Jan 2017 — Feb 2019"},
        "highlights": [
            {"fr": "Préparation et coordination des diffusions en direct sur OBS (Open Broadcaster Software).", "en": "Preparing and running live streams on OBS (Open Broadcaster Software)."},
            {"fr": "Proposition du budget annuel et contrôle de la trésorerie.", "en": "Annual budget proposal and treasury control."},
            {"fr": "Montage vidéo, graphisme et tournage de vidéos d'évangélisation pour YouTube ; acteur.", "en": "Video editing, graphic design and filming evangelism videos for YouTube; actor."},
            {"fr": "Organisation de concerts et préparation des écoles bibliques de vacances.", "en": "Planning and running concerts and vacation Bible schools."},
        ],
    },
]

# Freelance work shown alongside the employment history (projects live in CaseStudy).
FREELANCE = {
    "title": {"fr": "Développeur web full-stack & consultant comptable — Indépendant", "en": "Full-stack web developer & accounting consultant — Freelance"},
    "period": {"fr": "En parallèle", "en": "Alongside"},
    "highlights": [
        {"fr": "Plateforme full-stack Django pour Children's Fruit (WebTV, communauté, dons).", "en": "Full-stack Django platform for Children's Fruit (web TV, community, donations)."},
        {"fr": "Boutiques WordPress/WooCommerce et Shopify, fiches produit optimisées SEO.", "en": "WordPress/WooCommerce and Shopify stores, SEO-optimized product pages."},
        {"fr": "Comptabilité e-commerce, campagnes publicitaires et branding pour des marques sur Shopify.", "en": "E-commerce bookkeeping, ad campaigns and branding for Shopify brands."},
    ],
}

EDUCATION = [
    {
        "degree": {"fr": "Licence 3 — Finance, Comptabilité et Gestion des entreprises", "en": "Bachelor's degree (Licence 3) — Finance, Accounting and Business Management"},
        "school": "Groupe CEFIAT Plateau",
        "location": "Abidjan, Côte d'Ivoire",
        "period": "2020 — 2021",
        "credential_category": "degree",
    },
    {
        "degree": {"fr": "BTS Finance-Comptabilité", "en": "BTS (Higher National Diploma) in Finance and Accounting"},
        "school": "ESIM Yopougon",
        "location": "Abidjan, Côte d'Ivoire",
        "period": "2020 — 2021",
        "credential_category": "degree",
    },
    {
        "degree": {"fr": "Baccalauréat série D", "en": "Baccalauréat, series D (science)"},
        "school": "Nangui Abrogoua II",
        "location": "Abidjan, Côte d'Ivoire",
        "period": "2016 — 2017",
        "credential_category": "high school diploma",
    },
]

# Grouped for display; flattened into schema.org knowsAbout for search engines.
SKILLS = [
    {
        "group": {"fr": "Comptabilité & finance", "en": "Accounting & finance"},
        "items": [
            "SAGE 100 Comptabilité", "QuickBooks", "Xero",
            {"fr": "SYCEBNL (comptabilité des ONG)", "en": "SYCEBNL (non-profit accounting)"},
            {"fr": "Rapprochement bancaire multi-devises", "en": "Multi-currency bank reconciliation"},
            {"fr": "États financiers", "en": "Financial statements"},
            {"fr": "Budgétisation", "en": "Budgeting"},
            {"fr": "Préparation d'audit", "en": "Audit preparation"},
            {"fr": "Registre des immobilisations & amortissements", "en": "Fixed-asset register & depreciation"},
            {"fr": "Trésorerie & petite caisse", "en": "Treasury & petty cash"},
            {"fr": "Gestion des stocks", "en": "Inventory management"},
            {"fr": "Conformité financière", "en": "Financial compliance"},
            {"fr": "Unit economics", "en": "Unit economics"},
        ],
    },
    {
        "group": {"fr": "Web & développement", "en": "Web & development"},
        "items": [
            {"fr": "Applications web full-stack", "en": "Full-stack web apps"},
            "Python / Django", "WordPress", "WooCommerce", "Shopify",
            {"fr": "SEO", "en": "SEO"},
            {"fr": "Intégrations API & automatisation", "en": "API integrations & automation"},
        ],
    },
    {
        "group": {"fr": "Marketing & publicité", "en": "Marketing & ads"},
        "items": [
            "Facebook Ads", "Instagram", "TikTok Ads", "Google Ads", "Google Analytics",
            {"fr": "E-mailing (Klaviyo)", "en": "Email marketing (Klaviyo)"},
            "Niche Scraper", "DropPoint",
        ],
    },
    {
        "group": {"fr": "Design, vidéo & outils", "en": "Design, video & tools"},
        "items": [
            "Adobe Premiere Pro", "Adobe Photoshop", "Canva",
            {"fr": "Diffusion en direct (OBS)", "en": "Live streaming (OBS)"},
            {"fr": "Montage vidéo", "en": "Video editing"},
            {"fr": "Graphisme", "en": "Graphic design"},
            "Microsoft Excel", "Microsoft Word", "Microsoft PowerPoint",
        ],
    },
    {
        "group": {"fr": "Savoir-être", "en": "Strengths"},
        "items": [
            {"fr": "Sens des responsabilités", "en": "Sense of responsibility"},
            {"fr": "Aisance relationnelle", "en": "Interpersonal skills"},
            {"fr": "Initiative et proactivité", "en": "Initiative and proactivity"},
        ],
    },
]


def localize(value, lang=None):
    """Recursively resolve {"fr":..., "en":...} pairs to one language."""
    lang = lang or (get_language() or "fr")[:2]
    if isinstance(value, dict):
        if set(value) == {"fr", "en"}:
            return value.get(lang) or value["fr"]
        return {k: localize(v, lang) for k, v in value.items()}
    if isinstance(value, list):
        return [localize(v, lang) for v in value]
    return value


def get_profile(lang=None):
    """Everything above, resolved to one language — what templates and seo.py consume."""
    return localize(
        {
            "full_name": FULL_NAME,
            "alternate_names": ALTERNATE_NAMES,
            "job_titles": JOB_TITLES,
            "summary": SUMMARY,
            "location": LOCATION,
            "languages": LANGUAGES,
            "experience": EXPERIENCE,
            "freelance": FREELANCE,
            "education": EDUCATION,
            "skills": SKILLS,
        },
        lang,
    )
