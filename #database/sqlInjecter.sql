-- Ajouter la colonne sanctionner
ALTER TABLE adherent
ADD COLUMN sanctionner BOOLEAN DEFAULT false;

-- Sanctionner les adhérents ayant au moins 3 pénalisations
UPDATE adherent
SET sanctionner = true
WHERE penaliser >= 3;

-- Décrémenter penaliser de 1 lorsqu’elle vaut 1
UPDATE adherent
SET penaliser = penaliser - 1
WHERE penaliser = 1;

-- insertion colonne nbrLivreEmp dans table adherent
ALTER TABLE adherent ADD COLUMN nbrLivreEmp INT(11) DEFAULT 0;
UPDATE adherent a
SET nbrLivreEmp = (
    SELECT COUNT(*)
    FROM livre_emprunt le
    WHERE le.code_pers = a.id_adh
    AND le.status = 0
);

-- insertion colonne dateReelRetour dans table livre_emprunt
ALTER TABLE livre_emprunt ADD COLUMN dateReelRetour DATE DEFAULT NULL;

-- insertion colonne renouvelable dans table livre_emprunt
ALTER TABLE livre_emprunt ADD COLUMN renouvelable BOOLEAN DEFAULT true;
update livre_emprunt set renouvelable = false where status = 1;

-- insertion colonne anneeEdition dans table livre
ALTER TABLE livre ADD COLUMN anneeEdition VARCHAR(11) DEFAULT '';

-- insertion colonne disponible dans table livre
ALTER TABLE livre ADD COLUMN disponible BOOLEAN DEFAULT true;
UPDATE livre
SET disponible = false
WHERE id_livre IN (
    SELECT id_livre
    FROM livre_emprunt
    WHERE (id_livre REGEXP '^[0-9]+$' AND id_livre != '') AND status = 0
);

-- insertion colonne idOeuvre dans table livre
ALTER TABLE livre ADD COLUMN idOeuvre INT(11);

-- creation nouveau table oeuvre
CREATE TABLE oeuvre (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255),
    sous_titre VARCHAR(255),
    auteur VARCHAR(255),
    nbrExemplaire INT(11),
    nbrExemplaireDispo INT(11)
);

-- creation nouveau table dewey
CREATE TABLE dewey (
    code VARCHAR(11) PRIMARY KEY,
    titre VARCHAR(255),
    description VARCHAR(255)
);

-- insertion des livres dans oeuvre
INSERT INTO oeuvre (titre, sous_titre, auteur, nbrExemplaire, nbrExemplaireDispo)
SELECT 
    titre, 
    sous_titre, 
    auteur, 
    COUNT(*) AS nbrExemplaire,
    COUNT(*) AS nbrExemplaireDispo
FROM livre
GROUP BY LOWER(titre), LOWER(sous_titre), LOWER(auteur);

UPDATE oeuvre o
SET nbrExemplaireDispo = (
    SELECT COUNT(*)
    FROM livre l
    WHERE l.id_livre = o.id
    AND l.disponible = true
);

UPDATE livre SET sous_titre = '' WHERE sous_titre IS NULL;
UPDATE oeuvre SET sous_titre = '' WHERE sous_titre IS NULL;

-- mis a jour du colonne idOeuvre du livre AZA HADINO
UPDATE livre l
JOIN oeuvre o ON l.titre = o.titre AND l.sous_titre = o.sous_titre AND l.auteur = o.auteur
SET l.idOeuvre = o.id;


-- reinitialiser tous les tables
-- drop table oeuvre;
-- update livre set idOeuvre = 0 where true;
-- update adherent set nbrLivreEmp = 0 where true;


-- `dewey`(`id`, `titre`, `description`)

