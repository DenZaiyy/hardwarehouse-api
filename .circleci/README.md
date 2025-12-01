# Configuration CI/CD avec CircleCI pour Next.js
Le détail de la configuration CircleCI pour le déploiement de l'application Next.js est géré dans le fichier [`.circleci/config.yml`](config.yml). Ce fichier contient les étapes nécessaires pour construire, tester et déployer l'application sur Vercel.

## Les prérequis
Avant de commencer, assurez-vous que les prérequis suivants sont en place :
- **Node.js** : Version LTS minimum.
- **NPM** : Version compatible avec Node.js.
- **Prisma** : Configuré avec un client pour la base de données.
- **Vercel** : Un compte et un projet configuré pour votre application.
- **CircleCI** : Un compte et un projet configuré pour votre dépôt Git.
- **Git** : Utilisé pour la gestion de version et les Pull Requests.

## 📁 Structure du pipeline
La pipeline est organisée par branche et comprend plusieurs jobs pour chaque étape du processus de déploiement. Chaque job est défini avec des commandes spécifiques et des dépendances pour assurer que les étapes sont exécutées dans le bon ordre.

### 🔁 Branche `dev`
- **Objectifs** : Effectuer des tests et préparer le code pour le merge vers la branche `test`.
- **Jobs exécutés** :
    - **test-node** : Exécute les tests unitaires et d'intégration.
    - **merge-to-test** : Fusion automatique vers `test` si les tests réussissent.

### 🧪 Branche `test`
- **Objectifs** : Valider la stabilité du code avant de proposer une fusion vers `main`.
- **Jobs exécutés** :
    - **test-node** : Exécute les tests unitaires et d'intégration.
    - **build-node** : Construit l'application Next.js si les tests réussissent.
    - **audit-node** : Exécute un audit de sécurité avec `npm audit` si le build réussit.
    - **lint-node** : Exécute un linter pour vérifier le code si le build réussit.
    - **typescript-check** : Vérifie les types TypeScript si l'audit et le lint réussissent.
    - **lighthouse-audit** : Exécute un audit Lighthouse pour la performance et l'accessibilité si `typescript-check` réussi.
    - **create-pr** : Crée un Pull Request vers `main` si les jobs précédents ont réussi.

### 🚀 Branche `main`
- **Objectifs** : Déployer l'application en production sur Vercel.
- **Jobs exécutés** :
    - **main-deployment** : Installe les dépendances, génère le client Prisma, met à jour la base de données, construit l'application Next.js, installe la CLI Vercel et déploie l'application sur Vercel.
- **Conditions** : Ce job est exécuté uniquement si la Pull Request a été acceptée et fusionnée dans la branche `main`.

## ⚙️ Exemple de structure du fichier config.yml
L'indentation et la structure du fichier `.circleci/config.yml` sont cruciales pour le bon fonctionnement des jobs. Voici un exemple de la structure de base :

```yaml
version: 2.1
commands: # Définition des commandes réutilisables
...
orbs: # Définition de snippets réutilisables
  node: circleci/node@7.1.0 # Orb pour les commandes Node.js
jobs: # Définition des jobs avec les étapes
...
workflows: # Définition des workflows pour organiser les jobs avec des filtres (pour une branch particulière par exemple)
...
```