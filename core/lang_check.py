"""Language-consistency check for the exported site, run by `manage.py build_static`.

Rule: French pages read entirely in French and /en/ pages entirely in English — visible
text, <title>, meta/Open Graph text, alt / aria-label / title attributes and the schema.org
JSON-LD that search engines and AI assistants read. The one exception is the official
title of a certificate (or of a French-language book), which keeps its original language.

The detector is a word-frequency heuristic, so it reports texts of 3+ words where one
language clearly dominates; short labels and proper nouns are deliberately ignored.
"""

import html
import json
import re
from html.parser import HTMLParser

FR_WORDS = set("""le la les des une un et est sont pour avec dans du au aux sur par qui que ce cette ces mon ma mes
ton ta tes son sa ses nos vos leur leurs je tu il elle nous vous ils elles pas plus très tout tous toute toutes être
avoir fait faire comme mais ou où donc car chaque entre après avant depuis sans sous chez vers aussi déjà encore ici
voir mise projet projets comptable comptabilité gestion réalisation création boutique marque fiches produit
optimisées formation diplôme""".split())
EN_WORDS = set("""the and for with of to is are this that these those my your our their his her its we you they not
more very all every be have has was were do does as but or so because each between after before since without under
at from into also already here see set setup project projects accounting management building store brand product
pages optimized training diploma how what why who which will can""".split())
WORD = re.compile(r"[A-Za-zÀ-ÿ'’]+")
# Proper nouns that contain accents or French words but are correct in English too.
NEUTRAL = re.compile(r"Côte d['’]Ivoire|«[^»]*»", re.I)
JSONLD_TEXT_KEYS = {"name", "description", "roleName", "genre", "jobTitle", "knowsAbout", "skills", "competencyRequired"}


def detect(text, proper_nouns=()):
    for name in proper_nouns:  # organisation / school names are the same in every language
        text = text.replace(name, " ")
    words = [w.lower().strip("'’") for w in WORD.findall(NEUTRAL.sub(" ", text))]
    fr = sum(w in FR_WORDS for w in words) + 2 * sum(bool(re.search(r"[éèêàùçôîœ]", w)) for w in words)
    en = sum(w in EN_WORDS for w in words)
    if len(words) < 3 or abs(fr - en) < 2:
        return None
    return "fr" if fr > en else "en"


class _Collector(HTMLParser):
    SKIP = {"script", "style", "template"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack, self.texts, self.jsonld, self._in_jsonld = [], [], [], False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        self.stack.append((tag, a.get("class", "") or "", a.get("lang")))
        if tag == "script" and a.get("type") == "application/ld+json":
            self._in_jsonld = True
        if tag == "meta" and (a.get("name") in ("description", "twitter:title", "twitter:description")
                              or a.get("property") in ("og:title", "og:description", "og:image:alt")):
            self.texts.append(("meta", a.get("content", "")))
        # A link written in another language on purpose (lang="…", e.g. "Passer en français").
        if not a.get("lang"):
            for attr in ("alt", "aria-label", "title"):
                if a.get(attr):
                    self.texts.append((f"{tag}[{attr}]", a[attr]))

    def handle_endtag(self, tag):
        if tag == "script":
            self._in_jsonld = False
        while self.stack:
            if self.stack.pop()[0] == tag:
                break

    def handle_data(self, data):
        if self._in_jsonld:
            self.jsonld.append(data)
            return
        if not data.strip() or any(t in self.SKIP or lang for t, _, lang in self.stack):
            return
        classes = " ".join(c for _, c, _ in self.stack)
        tags = [t for t, _, _ in self.stack]
        # Exceptions: a certificate's official title and its issuing organisation's name.
        if "certification-card" in classes and "degree-card" not in classes and (
            tags[-1:] == ["h3"] or "certification-meta" in classes
        ):
            return
        # A French-language book keeps its original title.
        if "resource-card" in classes and tags[-1:] == ["h3"]:
            return
        self.texts.append((tags[-1] if tags else "?", data))


def _jsonld_texts(blocks):
    out = []

    def walk(node, credential=False):
        if isinstance(node, dict):
            is_credential = node.get("@type") == "EducationalOccupationalCredential" and node.get("credentialCategory") == "certificate"
            for key, value in node.items():
                if key in JSONLD_TEXT_KEYS and not (is_credential and key == "name"):
                    for v in value if isinstance(value, list) else [value]:
                        if isinstance(v, str):
                            out.append(("json-ld " + key, v))
                walk(value, is_credential)
        elif isinstance(node, list):
            for item in node:
                walk(item, credential)

    for block in blocks:
        try:
            walk(json.loads(block))
        except ValueError:
            pass
    return out


def check_page(page_html, expected_language, proper_nouns=()):
    """[(where, text)] of texts that read in the other language."""
    collector = _Collector()
    collector.feed(page_html)
    found = []
    for where, text in collector.texts + _jsonld_texts(collector.jsonld):
        text = html.unescape(" ".join(text.split()))
        language = detect(text, proper_nouns)
        if language and language != expected_language:
            found.append((where, text))
    return found
