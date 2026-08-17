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

* La page démarre par un choix de **restaurant** (actuellement Livingston et Malkhas Jazz Club), puisque ce n'est pas encore tranché. Chaque restaurant a son propre menu.
* Une fois le restaurant choisi, chaque famille choisit ses plats → au clic sur **Հաստատել ընտրությունը**, la page envoie les données au script Apps Script, qui les écrit (ou met à jour) dans l'onglet du Google Sheet correspondant à ce restaurant.
* Le lien **« Տեսնել բոլորի ընտրությունը »** interroge le même script pour lire toutes les réponses du restaurant actuellement affiché.
* Chaque restaurant a son propre onglet dans le Sheet (`Responses – Livingston`, `Responses – Malkhas Jazz Club`), sous forme de vrai tableau : une ligne par famille, une colonne par plat (regroupées par catégorie sur la première ligne), avec la quantité choisie en valeur — rien n'est stocké en JSON, tout est directement lisible et sommable.

### Restreindre à un seul restaurant plus tard

Une fois le choix du restaurant tranché, ouvrez `index.html`, trouvez le tableau `RESTAURANTS` dans le `<script>`, et passez `enabled: false` sur celui que vous retirez. L'étape de sélection disparaît automatiquement dès qu'il ne reste qu'un seul restaurant activé — le reste du site continue de fonctionner sans autre changement.

### ⚠️ Le menu Malkhas Jazz Club est provisoire

Je n'ai pas trouvé de carte détaillée en ligne pour Malkhas Jazz Club (seulement des mentions générales : steaks, pâtes, côtelettes de porc, plateaux de fromages/olives/pain). Les plats listés dans `RESTAURANTS` (section `malkhas`, dans `index.html` **et** dans `google-apps-script.gs`) sont donc une approximation à corriger avec le vrai menu du restaurant avant d'envoyer le lien aux invités.

## Mettre à jour le script plus tard (ex. après un changement de menu)

1. Ouvrez le projet Apps Script (Extensions → Apps Script depuis le Sheet).
2. Remplacez tout le contenu par la nouvelle version de [`google-apps-script.gs`](./google-apps-script.gs).
3. **Déployer → Gérer les déploiements** → cliquez sur le crayon ✏️ à côté du déploiement existant → Version : **Nouvelle version** → **Déployer**. Cela garde la même URL `.../exec`, donc pas besoin de retoucher `SCRIPT_URL` dans `index.html`.
4. Si la structure des colonnes d'un restaurant a changé (comme lors du retrait des desserts), le script reconstruit automatiquement l'en-tête de son onglet et **efface son contenu existant** dès le prochain appel (soumission ou consultation) pour ce restaurant. Notez les réponses déjà reçues avant de mettre à jour si vous voulez les garder.
5. Si vous ajoutez/renommez/retirez un restaurant ou un plat, faites le changement **à la fois** dans `index.html` (tableau `RESTAURANTS`) et dans `google-apps-script.gs` (objet `RESTAURANTS`) — les deux doivent rester en miroir l'un de l'autre (mêmes `id`/clés/plats).
