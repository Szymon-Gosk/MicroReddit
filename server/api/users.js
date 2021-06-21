const routes = require('express').Router();
const {pool} = require("../dbConfig");

routes.get("/users", async (req, res) => {
    const result = await pool.query(
        "SELECT * from reddit_user"
    );
    return res.send(result.rows);
});

routes.delete("/users/:id", async (req, res) => {
    await pool.query(
        "DELETE from user_role WHERE user_id = $1",
        [req.params["id"]]);
    const result = await pool.query(
        "DELETE from reddit_user WHERE id = $1",
        [req.params["id"]]);
    return res.send(result.rows[0]);
});

routes.get("/user-roles", async (req, res) => {
    const result = await pool.query(
        "SELECT * from user_role"
    );
    return res.send(result.rows);
});

routes.get("/", (req, res) => {
    res.send(req.user);
});

module.exports = routes;