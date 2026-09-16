# Audit du frontend

Date de l'audit : 16 septembre 2026

Cet audit couvre les fichiers presents dans `frontend/` et les contrats exposes par `backend/src/routes/` et `backend/src/controllers/`. Aucun fichier n'a ete supprime automatiquement.

## 1. Organisation actuelle

Le frontend est une application vanilla HTML/CSS/JavaScript composee de :

- `index.html`, `index.css` et `index.js` pour l'accueil et la connexion ;
- `dashboard/` pour le tableau de bord ;
- `livres/`, `adherents/`, `auteurs/`, `categories/` et `emprunts/` pour les ecrans metier ;
- `css/` pour les variables, le reset, le layout et les composants communs ;
- `assets/img/` pour les illustrations ;
- `base.html`, qui ressemble a un gabarit mais n'est reference par aucune page ;
- `test_api.js`, script de test actuellement charge par `index.html`.

Les pages metier repetent la sidebar, le header, la navigation mobile, le bottom sheet, les tableaux et les modales. Les CSS communs sont importes par `css/main.css`, puis chaque page ajoute son propre fichier CSS.

## 2. Probleme critique : deux generations de frontend

Les HTML actuels utilisent des identifiants modernes comme `#memberForm`, `#authorForm`, `#categoryForm`, `#loanForm` et `#booksTableBody`. Les scripts `adherents.js`, `auteurs.js`, `categories.js` et `emprunts.js` ciblent encore les anciens identifiants `#adherent-form`, `#auteur-form`, `#categorie-form` et `#emprunt-form`.

Consequences :

- les anciens conteneurs sont absents, donc les fonctions CRUD ne pilotent pas les tableaux actuels ;
- les formulaires actuels ne sont pas raccordes aux scripts ;
- les fonctions de modification ne font qu'ecrire dans la console ;
- la page livres contient aussi un melange de selecteurs anciens et actuels qui provoque des erreurs immediates.

Correction recommandee : choisir une seule generation, puis supprimer ou remplacer les scripts legacy apres verification fonctionnelle.

## 3. Problemes critiques de fonctionnement

### 3.1 Selecteurs invalides dans la page livres

Fichier : `frontend/livres/livres.js`

Le script recherche notamment `#searchBook`, `#booksResultText`, `#emptyBooks`, `#bookModalOverlay`, `#moreBottomSheet`, `#headerLogout` et `#sheetLogout`. Ces identifiants ne sont pas presents dans `frontend/livres/livres.html`, qui utilise par exemple `#bookSearch`, `#booksResultCount`, `#booksEmptyState` et `#logoutButton`.

Le premier `searchBook.addEventListener(...)` sur un element nul peut interrompre tout le script au chargement.

### 3.2 Authentification absente

Les routes backend `/api/livres`, `/api/adherents`, `/api/auteurs`, `/api/categories`, `/api/emprunts` et `/api/dashboard/bibliothecaire` utilisent `authenticateToken`.

`dashboard.js` et `livres.js` ajoutent un bearer token, mais `adherents.js`, `auteurs.js`, `categories.js` et `emprunts.js` font des appels directs sans `Authorization`. Ces appels retournent donc `401` apres connexion.

### 3.3 Formats de reponse incompatibles

Le backend renvoie des enveloppes paginees :

- livres : `{ books, pagination }` ;
- auteurs : `{ authors, pagination }` ;
- categories : `{ categories, pagination }` ;
- adherents : `{ adherents, pagination }` ;
- emprunts : `{ emprunts, pagination }`.

Plusieurs scripts attendent directement un tableau. `livres.js` reconnait `livres`, mais pas `books`. `dashboard.js` lit `response.items` pour les livres.

### 3.4 Payloads incompatibles

- Categories : le frontend envoie `nom`, le backend attend `designation`.
- Emprunts : le frontend envoie `livre_id` et `adherent_id`, le backend attend `id_livre` et `id_adherent`.
- Adherents : le formulaire ne fournit pas les champs obligatoires backend `date_adhesion` et `date_expiration`.
- Auteurs : le formulaire utilise `biographie`, tandis que le controller attend `prenom`, `nom` et `nationalite`.

## 4. Securite et environnement

`frontend/index.html` charge `test_api.js`. Ce fichier execute automatiquement une connexion de test et contient des identifiants en clair. Il ne doit pas etre charge par l'application publique. Il doit etre deplace dans un espace de tests ou lance explicitement.

Le token est stocke dans `localStorage`. C'est une pratique exposee aux scripts injectes par une faille XSS. La correction robuste passe par un cookie HttpOnly gere avec le backend ; a court terme, toutes les insertions de donnees utilisateur doivent rester echappees et les scripts de test doivent etre retires du parcours utilisateur.

## 5. Navigation et HTML

Les pages repetent beaucoup de navigation. Plusieurs liens mobiles sont incorrects :

- `livres.html` pointe vers `livres.html` pour Adherents ;
- `emprunts.html` pointe vers `emprunts.html` pour Adherents ;
- `auteurs.html` pointe vers `auteurs.html` pour Adherents ;
- `categories.html` pointe vers `categories.html` pour Adherents.

`dashboard.html` importe `../CSS/main.css` avec une majuscule, alors que le dossier est `css`. Cela peut casser sur un systeme sensible a la casse.

Les modales utilisent `hidden` ou des classes d'ouverture de maniere differente selon les pages. Il manque souvent une gestion complete du focus, de `aria-expanded` et de la fermeture au clavier.

## 6. Duplication

Duplications principales :

| Zone | Fichiers | Amelioration |
|---|---|---|
| API et JWT | `dashboard.js`, `livres.js`, scripts CRUD | Creer `frontend/js/api.js` et `frontend/js/auth.js` |
| CRUD | `adherents.js`, `auteurs.js`, `categories.js`, `emprunts.js` | Centraliser les requetes et les etats d'erreur |
| Modales | Toutes les pages metier | Creer un helper commun d'ouverture/fermeture |
| Navigation | Tous les HTML metier | Utiliser un fragment ou un rendu commun |
| Messages | Tous les scripts | Unifier chargement, erreur, vide et succes |
| CSS | Tous les CSS de page | Deplacer tableaux, formulaires, boutons et modales partages dans `components.css` |

## 7. Code suspect ou ancien

- `frontend/base.html` n'est reference par aucune page visible dans le depot. Verifier avant suppression.
- `frontend/js/index.js` est supprime dans l'etat Git actuel ; verifier qu'aucune documentation ou configuration ne le reference.
- Les quatre scripts CRUD legacy ciblent des conteneurs absents. Ils semblent remplaces par les interfaces actuelles, mais doivent etre conserves jusqu'a validation des nouveaux branchements.
- `test_api.js` est un outil de test, pas un script applicatif.

## 8. Design system et responsive

Le systeme de tokens est centralise dans `frontend/css/variables.css`, mais plusieurs valeurs restent en dur dans les CSS de page : couleurs, rayons, ombres, espacements et tailles.

Les breakpoints sont repetes dans chaque feuille, principalement `1100px`, `900px`, `768px`, `520px` et `480px`. Ils devraient etre documentes et harmonises sans modifier l'apparence.

Les tableaux sont les principaux points de vigilance mobile. Ils utilisent des wrappers avec overflow, mais la lisibilite et les actions doivent etre verifiees sur petit ecran. Les formulaires et modales doivent aussi limiter leur hauteur et permettre un scroll interne.

## 9. Architecture cible sans framework

```text
frontend/
  js/
    api.js
    auth.js
    modal.js
    navigation.js
    notifications.js
    formatters.js
  pages/
    dashboard/
    livres/
    adherents/
    auteurs/
    categories/
    emprunts/
  tests/
    test_api.js
```

La priorite est de centraliser l'API et l'authentification avant tout deplacement de fichiers. Les pages peuvent rester en HTML/CSS/JS natif.

## 10. Plan de correction

### Priorite 1

1. Retirer `test_api.js` du HTML public et supprimer les secrets de test du parcours servi.
2. Corriger le chemin CSS du dashboard.
3. Corriger les selecteurs invalides de `livres.js`.
4. Centraliser ou restaurer l'envoi du JWT sur toutes les pages metier.
5. Normaliser les enveloppes de reponse paginees.
6. Corriger les noms de champs des payloads.

### Priorite 2

1. Raccorder les formulaires actuels aux controllers.
2. Implementer les modifications et retours d'emprunt.
3. Factoriser la navigation, les modales et les messages.
4. Ajouter la pagination.

### Priorite 3

1. Uniformiser les tokens CSS et breakpoints.
2. Renforcer l'accessibilite des modales et tableaux.
3. Ajouter des tests API et des tests de parcours navigateur.
4. Remplacer `localStorage` par une session HttpOnly lorsque le backend le permettra.

## 11. Corrections entamees dans ce commit

- retrait de `test_api.js` du HTML public ;
- retrait des identifiants de test et de l'execution automatique de `test_api.js` ;
- correction de l'import `../css/main.css` du dashboard ;
- correction des liens mobiles Adherents identifies comme errones ;
- ajout de `frontend/js/api.js` avec bearer token et lecture uniforme des erreurs ;
- raccordement des scripts CRUD legacy a cette couche API ;
- prise en compte des enveloppes `books`, `authors`, `categories`, `adherents` et `emprunts` ;
- correction des champs `designation`, `id_livre` et `id_adherent` ;
- correction des premiers selecteurs et de la propriete `books` dans la page livres ;
- correction de la propriete `books` utilisee pour la disponibilite du dashboard.

Ces corrections constituent une premiere tranche. Le raccordement complet des formulaires modernes, des modales et des fonctions de modification reste a poursuivre.
