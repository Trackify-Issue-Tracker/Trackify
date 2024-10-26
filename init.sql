-- init.sql
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(255) NOT NULL,
  priority VARCHAR(255),
  date_created VARCHAR(255) NOT NULL,
  date_started VARCHAR(255),
  date_closed VARCHAR(255),
  labels VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS issues (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(255) NOT NULL,
  priority VARCHAR(255),
  date_created VARCHAR(255) NOT NULL,
  date_started VARCHAR(255),
  date_due VARCHAR(255),
  date_closed VARCHAR(255),
  labels VARCHAR(255),
  FOREIGN KEY (project_id) REFERENCES projects (id)
);


-- export interface Project {
--     id?: string; // internal
--     name: string;
--     description?: string;
--     status: ItemStatus;
--     priority?: ItemPriority;
--     date_created: string;
--     date_started?: string;
--     date_closed?: string;
--     assigned_to?: Array<string>;
--     assigned_by?: Array<string>;
--     labels?: Array<string>;
-- }

-- export interface Issue {
--     id?: string; // internal
--     project_id: string;
--     title: string;
--     description?: string;
--     type: IssueType;
--     status: ItemStatus;
--     priority?: ItemPriority;
--     date_created: string;
--     date_started?: string; // when was this issue changed to in progress
--     date_due?: string;
--     date_closed?: string;
--     assigned_to?: Array<string>;
--     assigned_by?: Array<string>;
--     labels?: Array<string>;
-- }