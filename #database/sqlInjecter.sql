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

-- Conserver la date du premier emprunt lorsqu'un emprunt est renouvele.
-- La valeur reste NULL tant que l'emprunt n'a jamais ete renouvele.
ALTER TABLE livre_emprunt
ADD COLUMN date_emprunt_initiale DATE DEFAULT NULL AFTER date_emprunt;

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


-- ============================================================
-- Nettoyage des adherents orphelins et cascade personne -> adherent
-- IMPORTANT : faire une sauvegarde complete de la base avant execution.
-- Les emprunts sont sauvegardes ci-dessous avant leur suppression.
-- ============================================================

-- 1. Sauvegarder les adherents orphelins et leurs emprunts.
CREATE TABLE IF NOT EXISTS backup_adherents_orphelins_20260824 LIKE adherent;

INSERT IGNORE INTO backup_adherents_orphelins_20260824
SELECT a.*
FROM adherent a
LEFT JOIN personne p ON p.id = a.id_pers
WHERE p.id IS NULL;

CREATE TABLE IF NOT EXISTS backup_emprunts_orphelins_20260824 LIKE livre_emprunt;

INSERT IGNORE INTO backup_emprunts_orphelins_20260824
SELECT le.*
FROM livre_emprunt le
JOIN adherent a
    ON le.code_pers REGEXP '^[0-9]+$'
   AND CAST(le.code_pers AS UNSIGNED) = a.id_adh
LEFT JOIN personne p ON p.id = a.id_pers
WHERE p.id IS NULL;

-- 2. Nettoyer les donnees liees dans une transaction.
START TRANSACTION;

CREATE TEMPORARY TABLE tmp_adherents_orphelins (
    id_adh INT PRIMARY KEY
);

INSERT INTO tmp_adherents_orphelins (id_adh)
SELECT a.id_adh
FROM adherent a
LEFT JOIN personne p ON p.id = a.id_pers
WHERE p.id IS NULL;

-- Memoriser les livres des emprunts actifs qui vont etre supprimes.
CREATE TEMPORARY TABLE tmp_livres_orphelins_actifs (
    id_livre INT PRIMARY KEY
);

INSERT IGNORE INTO tmp_livres_orphelins_actifs (id_livre)
SELECT CAST(le.id_livre AS UNSIGNED)
FROM livre_emprunt le
JOIN tmp_adherents_orphelins t
    ON le.code_pers REGEXP '^[0-9]+$'
   AND CAST(le.code_pers AS UNSIGNED) = t.id_adh
WHERE le.status = 0
  AND le.id_livre REGEXP '^[0-9]+$';

-- Supprimer tous les emprunts des adherents orphelins.
DELETE le
FROM livre_emprunt le
JOIN tmp_adherents_orphelins t
    ON le.code_pers REGEXP '^[0-9]+$'
   AND CAST(le.code_pers AS UNSIGNED) = t.id_adh;

-- Remettre un livre a disposition seulement s'il ne possede plus
-- aucun autre emprunt actif.
UPDATE livre l
JOIN tmp_livres_orphelins_actifs t ON t.id_livre = l.id_livre
SET l.disponible = TRUE
WHERE NOT EXISTS (
    SELECT 1
    FROM livre_emprunt le
    WHERE le.status = 0
      AND le.id_livre REGEXP '^[0-9]+$'
      AND CAST(le.id_livre AS UNSIGNED) = l.id_livre
);

-- Supprimer les adherents devenus inutiles.
DELETE a
FROM adherent a
JOIN tmp_adherents_orphelins t ON t.id_adh = a.id_adh;

COMMIT;

DROP TEMPORARY TABLE IF EXISTS tmp_livres_orphelins_actifs;
DROP TEMPORARY TABLE IF EXISTS tmp_adherents_orphelins;

-- 3. Cette verification doit retourner 0 avant l'ajout de la contrainte.
SELECT COUNT(*) AS nombre_adherents_orphelins
FROM adherent a
LEFT JOIN personne p ON p.id = a.id_pers
WHERE p.id IS NULL;

-- 4. Appliquer la cascade uniquement entre personne et adherent.
ALTER TABLE adherent
ADD CONSTRAINT fk_adherent_personne
FOREIGN KEY (id_pers) REFERENCES personne(id)
ON UPDATE CASCADE
ON DELETE CASCADE;


-- ============================================================
-- Index de performance du projet gestionBibliothequeCCSP
-- Executes et verifies avec EXPLAIN le 27/08/2026 sur MariaDB 10.4.
-- IF NOT EXISTS permet de rejouer ce bloc sans erreur de doublon.
-- ============================================================

-- Liste des emprunts non rendus, triee par identifiant recent.
CREATE INDEX IF NOT EXISTS idx_le_status_id
ON livre_emprunt (status, id);

-- Classement des livres selon leur nombre d'emprunts.
CREATE INDEX IF NOT EXISTS idx_le_id_livre
ON livre_emprunt (id_livre);

-- Classement des adherents sur une periode d'emprunt.
CREATE INDEX IF NOT EXISTS idx_le_date_code_pers
ON livre_emprunt (date_emprunt, code_pers);

-- Evolution mensuelle des inscriptions et reinscriptions.
CREATE INDEX IF NOT EXISTS idx_adherent_date_reinscription
ON adherent (date_reinscription);


-- ============================================================
-- Sessions persistantes du backend Node.js
-- Execute et verifie le 28/08/2026 sur MariaDB 10.4.
-- La table est independante des donnees metier.
-- ============================================================

CREATE TABLE IF NOT EXISTS app_sessions (
    session_id VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
    expires_at DATETIME(3) NOT NULL,
    session_data LONGTEXT NOT NULL,
    updated_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (session_id),
    INDEX idx_app_sessions_expires_at (expires_at)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_general_ci;


-- ============================================================
-- Archivage des journaux applicatifs de plus d'un an
-- Execute le 28/08/2026 : 27 291 lignes archivees sans perte.
-- La page Historique systeme permet de consulter les deux tables.
-- ============================================================

CREATE TABLE IF NOT EXISTS app_logs_archive LIKE app_logs;

ALTER TABLE app_logs_archive
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP NOT NULL
DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_app_logs_timestamp
ON app_logs (Timestamp);

CREATE INDEX IF NOT EXISTS idx_app_logs_archive_timestamp
ON app_logs_archive (Timestamp);

START TRANSACTION;

INSERT IGNORE INTO app_logs_archive (
    log_id, Timestamp, Action, TableName, RecordID, SqlQuery,
    UserID, ServerIP, RequestUrl, RequestData,
    RequestCompleted, RequestMsg
)
SELECT
    log_id, Timestamp, Action, TableName, RecordID, SqlQuery,
    UserID, ServerIP, RequestUrl, RequestData,
    RequestCompleted, RequestMsg
FROM app_logs
WHERE Timestamp < DATE_FORMAT(
    DATE_SUB(NOW(), INTERVAL 365 DAY),
    '%Y-%m-%d %H:%i:%s'
);

-- Une ligne active n'est retiree que si sa copie existe dans l'archive.
DELETE activeLog
FROM app_logs activeLog
INNER JOIN app_logs_archive archivedLog
    ON archivedLog.log_id = activeLog.log_id
WHERE activeLog.Timestamp < DATE_FORMAT(
    DATE_SUB(NOW(), INTERVAL 365 DAY),
    '%Y-%m-%d %H:%i:%s'
);

COMMIT;

-- Compacter les pages InnoDB apres le deplacement massif et actualiser
-- les statistiques utilisees par l'optimiseur SQL.
OPTIMIZE TABLE app_logs, app_logs_archive;

