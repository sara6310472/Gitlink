DELIMITER $$

CREATE TRIGGER tr_user_soft_delete
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    IF OLD.is_active = 1 AND NEW.is_active = 0 THEN
        UPDATE developers 
        SET is_active = 0 
        WHERE user_id = NEW.id;

        UPDATE recruiters 
        SET is_active = 0 
        WHERE user_id = NEW.id;

        UPDATE passwords 
        SET is_active = 0 
        WHERE user_id = NEW.id;

        UPDATE job_applications 
        SET is_active = 0 
        WHERE user_id = NEW.id;

        UPDATE messages 
        SET is_active = 0 
        WHERE user_id = NEW.id;
        
        UPDATE jobs 
        SET is_active = 0 
        WHERE username = NEW.username;
        
        UPDATE projects 
        SET is_active = 0 
        WHERE username = NEW.username;
        
        UPDATE project_ratings 
        SET is_active = 0 
        WHERE username = NEW.username;
    END IF;
END$$

DELIMITER ;

DELIMITER $

CREATE TRIGGER tr_job_soft_delete
AFTER UPDATE ON jobs
FOR EACH ROW
BEGIN
    IF OLD.is_active = 1 AND NEW.is_active = 0 THEN
        
        UPDATE job_applications 
        SET is_active = 0 
        WHERE job_id = NEW.id;
        
    END IF;
END$

CREATE TRIGGER tr_job_hard_delete
AFTER DELETE ON jobs
FOR EACH ROW
BEGIN
    DELETE FROM job_applications WHERE job_id = OLD.id;
END$

DELIMITER ;

DELIMITER $

CREATE TRIGGER tr_project_soft_delete
AFTER UPDATE ON projects
FOR EACH ROW
BEGIN
    IF OLD.is_active = 1 AND NEW.is_active = 0 THEN
        
        UPDATE project_ratings 
        SET is_active = 0 
        WHERE project_id = NEW.id;
        
    END IF;
END$

CREATE TRIGGER tr_project_hard_delete
AFTER DELETE ON projects
FOR EACH ROW
BEGIN
    DELETE FROM project_ratings WHERE project_id = OLD.id;
END$

DELIMITER ;

-- קשה
-- DELIMITER $$

-- CREATE TRIGGER tr_user_hard_delete
-- AFTER DELETE ON users
-- FOR EACH ROW
-- BEGIN    
--     DELETE FROM developers WHERE user_id = OLD.id;
--     DELETE FROM recruiters WHERE user_id = OLD.id;
--     DELETE FROM passwords WHERE user_id = OLD.id;
--     DELETE FROM job_applications WHERE user_id = OLD.id;
--     DELETE FROM messages WHERE user_id = OLD.id;
--     DELETE FROM jobs WHERE username = OLD.username;
--     DELETE FROM projects WHERE username = OLD.username;
--     DELETE FROM project_ratings WHERE username = OLD.username;
-- END$$

-- DELIMITER ;