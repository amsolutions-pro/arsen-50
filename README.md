# Դիմավորենք Արսենի 50-ամյակը — page de préférences du menu

Page à publier sur GitHub Pages. Les réponses des invités sont sauvegardées
dans un Google Sheet via un petit backend Google Apps Script (gratuit).

## 1. Créer le Google Sheet + le script

1. Allez sur [sheets.google.com](https://sheets.google.com) et créez une nouvelle feuille de calcul (par exemple nommée `Arsen 50 ans — réponses`).
2. Dans le menu, cliquez sur **Extensions → Apps Script**.
3. Supprimez le code par défaut (`function myFunction() {...}`) et collez-y tout le contenu du fichier [`google-apps-script.gs`](./google-apps-script.gs) de ce dépôt.
4. Cliquez sur l'icône disquette pour enregistrer (nommez le projet, par exemple `arsen-50-backend`).

## 2. Déployer le script comme application web

1. En haut à droite, cliquez sur **Déployer → Nouveau déploiement**.
2. Cliquez sur l'icône ⚙️ à côté de « Sélectionner le type » et choisissez **Application Web**.
3. Réglages :
   * Exécuter en tant que : **Moi (votre compte Google)**
   * Qui a accès : **Tout le monde**
4. Cliquez sur **Déployer**. Google demandera d'autoriser le script à accéder à la feuille — acceptez (c'est votre propre script).
5. Copiez l'**URL de l'application Web** affichée (elle se termine par `/exec`).

⚠️ Si vous modifiez le script plus tard, il faut créer un **nouveau déploiement** (ou gérer les déploiements → modifier) pour que les changements soient pris en compte par l'URL.

## 3. Brancher l'URL dans la page

1. Ouvrez `index.html` de ce dépôt.
2. Cherchez la ligne :
   ```js
   var SCRIPT_URL = 'PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';
   ```
3. Remplacez `PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE` par l'URL copiée à l'étape précédente (celle qui finit par `/exec`), entre les guillemets.
4. Enregistrez.

## 4. Publier sur GitHub Pages

1. Assurez-vous que `index.html` (avec l'URL branchée) est bien à la racine du dépôt.
2. Allez dans **Settings → Pages** du dépôt.
3. Sous « Build and deployment » → Source : **Deploy from a branch**.
4. Branch : `main` (ou la branche que vous utilisez), dossier `/ (root)` → **Save**.
5. Patientez une minute : l'URL du site apparaît en haut de cette page, du type
   `https://amsolutions-pro.github.io/arsen-50/`.

## Comment ça marche

* Deux restaurants sont actuellement actifs (`enabled: true`) : **Lavash** et **Kamancha** — l'étape de choix de restaurant s'affiche donc automatiquement. Livingston, Malkhas Jazz Club et Mezzo restent définis dans le code (avec leurs menus) mais désactivés (`enabled: false`).
* Chaque famille choisit ses plats → au clic sur **Հաստատել ընտրությունը**, la page envoie les données au script Apps Script, qui les écrit (ou met à jour) dans l'onglet du Google Sheet correspondant au restaurant actif.
* Le lien **« Տեսնել բոլորի ընտրությունը »** interroge le même script pour lire toutes les réponses du restaurant actuellement affiché.
* Chaque restaurant a son propre onglet dans le Sheet (`Responses – Livingston`, `Responses – Malkhas Jazz Club`, `Responses – Mezzo`, `Responses – Lavash`, `Responses – Kamancha`), sous forme de vrai tableau : une ligne par famille, une colonne par plat (regroupées par catégorie sur la première ligne), avec la quantité choisie en valeur — rien n'est stocké en JSON, tout est directement lisible et sommable.

### Menu Kamancha — entièrement vérifié

Saisi et traduit en arménien à partir du vrai PDF du menu (fourni par l'utilisateur), en 3 catégories (Աղցաններ, Հիմնական ուտեստներ, Խավարտներ — 84 plats au total). Les entrées/petit-déjeuner, soupes, desserts et boissons du PDF original n'ont pas été repris (hors périmètre demandé). Les 3 grands plateaux à partager (« assortiment de grillades grand/petit », « assortiment Kamancha ») et la truite/l'épaule d'agneau entières ont été volontairement exclus car pensés pour plusieurs personnes, incompatibles avec la logique « un plat par invité » du site.

### Réactiver le choix entre plusieurs restaurants

Ouvrez `index.html`, trouvez le tableau `RESTAURANTS` dans le `<script>`, et repassez `enabled: true` sur ceux que vous voulez réafficher. Dès que plus d'un restaurant est activé, l'étape de sélection réapparaît automatiquement.

### Menu Mezzo — vérifié

Le menu Mezzo (Աղցաններ, Հիմնական ուտեստներ, Սթեյք, Պաստա և խավարտ) a été saisi à partir des photos de la vraie carte du restaurant.

### Menu Lavash — entièrement vérifié

Saisi à partir de la vraie carte du restaurant, puis réorganisé en 3 catégories obligatoires (Աղցաններ, Հիմնական ուտեստներ, Խավարտներ — 89 plats au total) :
* Les Նախուտեստներ et Ապուրներ (entrées, soupes) ont été retirées.
* Տաք ուտեստներ, Ձկնային ուտեստներ et Խորոված ont été fusionnées en une seule catégorie **« Հիմնական ուտեստներ »** — les plats poisson et grillades y restent regroupés visuellement sous un sous-titre (« Ձկնային ուտեստներ », « Խորոված »), via le champ `group` sur chaque plat dans `RESTAURANTS`, pour que la liste ne soit pas un unique fourre-tout. Ce système `group` est réutilisable pour toute future fusion de catégories.

### ⚠️ Les menus Malkhas Jazz Club et Livingston (s'ils sont réactivés un jour)

Le menu Livingston correspond au dîner déjà testé chez eux. Le menu Malkhas Jazz Club, lui, reste une approximation basée sur des avis publics (aucune carte détaillée trouvée en ligne) — à corriger avec leur vrai menu si vous le réactivez un jour.

## Mettre à jour le script plus tard (ex. après un changement de menu)

1. Ouvrez le projet Apps Script (Extensions → Apps Script depuis le Sheet).
2. Remplacez tout le contenu par la nouvelle version de [`google-apps-script.gs`](./google-apps-script.gs).
3. **Déployer → Gérer les déploiements** → cliquez sur le crayon ✏️ à côté du déploiement existant → Version : **Nouvelle version** → **Déployer**. Cela garde la même URL `.../exec`, donc pas besoin de retoucher `SCRIPT_URL` dans `index.html`.
4. Si la structure des colonnes d'un restaurant a changé (comme lors du retrait des desserts), le script reconstruit automatiquement l'en-tête de son onglet et **efface son contenu existant** dès le prochain appel (soumission ou consultation) pour ce restaurant. Notez les réponses déjà reçues avant de mettre à jour si vous voulez les garder.
5. Si vous ajoutez/renommez/retirez un restaurant ou un plat, faites le changement **à la fois** dans `index.html` (tableau `RESTAURANTS`) et dans `google-apps-script.gs` (objet `RESTAURANTS`) — les deux doivent rester en miroir l'un de l'autre (mêmes `id`/clés/plats).
