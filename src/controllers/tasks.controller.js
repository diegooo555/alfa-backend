import { pool } from "../app.js";

export const getTask = async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query("SELECT * FROM tasks WHERE user_id = $1 AND id = $2", [req.user.id, id]);
  if( rows.length === 0) return res.status(404).json({message: "Task not found"});

   res.json(rows[0]);
}

export const getTasks = async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM tasks WHERE user_id = $1", [
    req.user.id,
  ]);
  if (rows.length === 0) return res.status(404).json({ message: "Not tasks found" });
  
  res.json(rows);
};

export const createTask = async (req, res) => {
  const { title, description, datestart, dateend } = req.body;

  try {
    const { rows } = await pool.query(
      "INSERT INTO tasks (user_id, title, description, datestart, dateend) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [req.user.id, title, description, datestart, dateend]
    );

    const newTask = rows[0];

    res.json(newTask);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
};

export const deleteTask = async (req, res) => {
  const { id } = req.params;
  const { rowCount } = await pool.query(
    "DELETE FROM tasks WHERE id = $1 RETURNING *",
    [id]
  );
  if (rowCount === 0) {
    return res.status(404).json({ message: "Task not found" });
  }

  return res.sendStatus(204);
};

export const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, datestart, dateend } = req.body;
  try {
    const { rows } = await pool.query(
      "UPDATE tasks SET title = $1, description = $2, datestart = $3, dateend = $4 WHERE id = $5 RETURNING *",
      [title, description, datestart, dateend, id]
    );
    const updateTask = rows[0];
    res.json(updateTask);
  } catch (error) {
    console.log(error);
    res.status(404).json({message: "Error in update Task"});

  }
};

export const createTableTask = async (req, res) => {
  const queryCreateTable = `CREATE TABLE
    tasks(
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        datestart VARCHAR(255) NOT NULL,
        dateend VARCHAR(255) NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );`;
  try {
    await pool.query(queryCreateTable);
    console.log("Tasks table create");
  } catch (error) {
    console.log(error);
  }
};
