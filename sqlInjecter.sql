-- insertion colonne sanctionner dans table adherent
ALTER TABLE adherent ADD COLUMN sanctionner BOOLEAN DEFAULT false;
update adherent set sanctionner = true where penaliser >= 3;

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
    id INT(11) PRIMARY KEY AUTO_INCREMENT,
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

-- N'OUBLIE PAS D'EDITER lE LIVRE KONAKY

-- mis a jour du colonne idOeuvre du livre
UPDATE livre l
JOIN oeuvre o ON l.titre = o.titre AND l.sous_titre = o.sous_titre AND l.auteur = o.auteur
SET l.idOeuvre = o.id;


-- reinitialiser tous les tables
-- drop table oeuvre;
-- update livre set idOeuvre = 0 where true;
-- update adherent set nbrLivreEmp = 0 where true;



`dewey`(`id`, `titre`, `description`)

`adherent`(`id_adh`, `categorie`, `date_reinscription`, `date_fin`, `type`, `id_pers`, `penaliser`, `sanctionner`, `nbrLivreEmp`)

`app_logs`(`log_id`, `Timestamp`, `Action`, `TableName`, `RecordID`, `SqlQuery`, `UserID`, `ServerIP`, `RequestUrl`, `RequestData`, `RequestCompleted`, `RequestMsg`)

`livre`(`id_livre`, `Type`, `titre`, `sous_titre`, `auteur`, `editeur`, `deway`, `cote`, `ISBN`, `langue_pays`, `dimension`, `nbre_page`, `etat`, `status`, `date_status`, `photo`, `anneeEdition`, `disponible`, `idOeuvre`)

`livre_emprunt`(`id`, `code_pers`, `id_livre`, `date_emprunt`, `date_retour`, `status`, `dateReelRetour`, `renouvelable`)

`oeuvre`(`id`, `titre`, `sous_titre`, `auteur`, `nbrExemplaire`, `nbrExemplaireDispo`)

`personne`(`id`, `code`, `nom`, `prenom`, `date_nais`, `lieu`, `CIN`, `adresse`, `profession`, `departement`, `tel`, `date_inscription`, `photo`)

