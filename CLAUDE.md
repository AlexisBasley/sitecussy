# Principes de travail — Karpathy Skills

Source : https://github.com/forrestchang/andrej-karpathy-skills

## 1. Réfléchir avant de coder

- Énoncer les hypothèses explicitement plutôt que de les choisir silencieusement
- Présenter plusieurs interprétations quand la demande est ambiguë
- Demander une clarification avant de procéder si c'est incertain
- Suggérer des approches plus simples et challenger si approprié
- Nommer la confusion plutôt que de continuer à tâtons

## 2. Simplicité d'abord

- Écrire uniquement le code qui résout le problème posé — pas de fonctionnalités non demandées
- Pas d'abstractions pour un usage unique
- Pas de "flexibilité" ou "configurabilité" spéculative
- Pas de gestion d'erreurs défensive pour des situations impossibles
- Condenser : si le code peut faire 50 lignes au lieu de 200, le faire

Test : "Un senior engineer appellerait-il ça trop compliqué ?" → Si oui, simplifier.

## 3. Modifications chirurgicales

- Modifier uniquement ce que la demande requiert explicitement
- Respecter le style et les patterns existants
- Ne pas reformater, améliorer les commentaires ou corriger le style dans les sections non concernées
- Signaler le code mort créé par les changements — le supprimer ; ne pas toucher au code mort préexistant
- Chaque ligne modifiée doit se tracer directement à la demande de l'utilisateur

## 4. Exécution orientée objectif

- Transformer les demandes vagues en critères de succès vérifiables
  - "Ajouter une validation" → "Écrire des tests pour les entrées invalides, les faire passer"
  - "Corriger le bug" → "Écrire un test qui reproduit le bug, puis le faire passer"
- Énoncer un plan bref avec des étapes et des points de vérification
- Définir des critères de succès testables avant de commencer
