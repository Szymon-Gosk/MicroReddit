const routes = require('express').Router();
const {pool} = require("../dbConfig");

/**
 * New comment
 */
routes.post("/", async (req, res) => {
    if (req.user) {
        await client.query(
            "INSERT INTO comment(content, parent_comment_id, user_id, post_id) VALUES($1, $2, $3, $4)",
            [req.body.content, null, req.body.user_id, req.body.post_id]);
        return res.send("Successfully commented");
    } else {
        return res.send("You are not authenticated!");
    }
});

/**
 * Edit comment
 */
routes.put("/", async (req, res) => {
    await client.query(
        "UPDATE comment SET content = $1 WHERE id = $2", [req.body.content, req.body.comment_id]);
    return res.send("Successfully updated comment");
});

/**
 * Delete comment
 */
routes.delete("/:comment_id", async (req, res) => {
    await pool.query(
        "DELETE FROM comment WHERE id = $1", [req.params["comment_id"]]
    );
    return res.send("Comment successfully deleted");
});

/**
 * Get comments
 */
routes.get("/", async (req, res) => {
    const result = await pool.query(
        "SELECT id, content, user_id, post_id FROM comment"
    );
    return res.send(result.rows);
});

/**
 * Get comment
 */
routes.get("/:post_id", async (req, res) => {
    const result = await pool.query(
        "SELECT c.id, c.content, c.user_id, c.post_id, ru.nickname FROM comment c inner join reddit_user ru on ru.id = c.user_id WHERE c.post_id = $1",
        [req.params["post_id"]]
    );
    return res.send(result.rows);
});

module.exports = routes;