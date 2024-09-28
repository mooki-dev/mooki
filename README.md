mooki


git checkout -b develop

Créer une nouvelle branche pour une fonctionnalité
git checkout -b feature/nouvelle-fonctionnalite develop

Faire des modifications, ajouter et valider
git add .
git commit -m "Ajout de la nouvelle fonctionnalité"

Pousser la branche vers GitHub
git push origin feature/nouvelle-fonctionnalite

Une fois que la fonctionnalité est terminée, faire un merge
git checkout develop
git merge feature/nouvelle-fonctionnalite

Pousser les modifications vers la branche develop
git push origin develop

Quand tout est prêt pour la production, faire un merge vers main
git checkout main
git merge develop
git push origin main
