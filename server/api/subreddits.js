const routes = require('express').Router();
const {pool} = require("../dbConfig");

/**
 * Subreddit
 */
routes.get("/", async (req, res) => {
    const result = await pool.query(
        "SELECT * from subreddit"
    );
    return res.send(result.rows);
});

/**
 * All subreddits
 */
routes.get("/subreddits", async (req, res) => {
    const result = await pool.query(
        "SELECT s.id, s.name, s.description, COUNT(s.id) as members from subreddit s left join subreddit_user su on su.subreddit_id = s.id GROUP BY s.id, s.name, s.description"
    );
    return res.send(result.rows);
});

/**
 * Moderators
 */
routes.get("/moderators", async (req, res) => {
    const result = await pool.query(
        "SELECT * from subreddit_moderator"
    );
    return res.send(result.rows);
});

/**
 * Add moderator
 */
routes.post("/moderators", async (req, res) => {
    await pool.query(
        "INSERT INTO subreddit_moderator(user_id, subreddit_id) VALUES($1, $2)",
        [req.body.user_id, req.body.subreddit_id]);
    return res.send("Successfully added new Moderator");
});

/**
 *
 */
routes.post("/", async (req, res) => {
    const isNameTaken = await pool.query(
        "SELECT * FROM subreddit WHERE name = $1", [req.body.name]
    );
    if (isNameTaken.rows.length === 0) {
        await pool.query(
            "INSERT INTO subreddit(name, description) VALUES($1, $2)", [req.body.name, req.body.description]
        );
        const id = await pool.query(
            "SELECT id from subreddit WHERE name = $1",
            [req.body.name]);
        subredditId = id.rows[0]["id"];
        await pool.query(
            "INSERT INTO subreddit_user(user_id, subreddit_id) VALUES($1, $2)", [req.body.user_id, subredditId]
        );
        const result = await pool.query(
            "INSERT INTO subreddit_moderator(user_id, subreddit_id) VALUES($1, $2)", [req.body.user_id, subredditId]
        );
        return res.send(result.rows);
    } else {
        return res.send("This name is already taken");
    }
});

routes.get("/user/:user_id", async (req, res) => {
    const result = await pool.query(
        "SELECT s.id, s.name, s.description from subreddit s inner join subreddit_user su on su.subreddit_id = s.id where su.user_id = $1", [req.params["user_id"]]
    );
    return res.send(result.rows);
});

routes.get("/:name", async (req, res) => {
    const result = await pool.query(
        "SELECT * from subreddit where name = $1", [req.params["name"]]
    );
    return res.send(result.rows);
});

routes.delete("/:name", async (req, res) => {
    const id = await pool.query(
        "SELECT id from subreddit WHERE name = $1",
        [req.params["name"]]);
    subredditId = id.rows[0]["id"];
    const id2 = await pool.query(
        "SELECT id from post WHERE subreddit_id = $1",
        [subredditId]);
    if (id2.rows.length > 0) {
        id2.rows.forEach(async (post) => {
            postId = post.id;
            await pool.query(
                "DELETE FROM post_vote WHERE post_id = $1",
                [postId]);
            await pool.query(
                "DELETE FROM comment WHERE post_id = $1",
                [postId]);
            await pool.query(
                "DELETE FROM post WHERE id = $1",
                [postId]);
            console.log(`successfully deleted post with id: ${postId}`);
        });
    }
    await pool.query(
        "DELETE FROM subreddit_user WHERE subreddit_id = $1",
        [subredditId]);
    await pool.query(
        "DELETE FROM subreddit_moderator WHERE subreddit_id = $1",
        [subredditId]);
    await pool.query(
        "DELETE FROM subreddit WHERE id = $1",
        [subredditId]);
    return res.send("Successfully deleted subreddit");
});

routes.post("/:name/join", async (req, res) => {
    if (req.user) {
        const id = await pool.query(
            "SELECT id from subreddit WHERE name = $1",
            [req.params["name"]]);
        subredditId = id.rows[0]["id"];
        await pool.query(
            "INSERT INTO subreddit_user(user_id, subreddit_id) VALUES($1, $2)",
            [req.user.id, subredditId]);
        return res.send("Successfully joined subreddit");
    } else {
        return res.send("You are not authenticated!");
    }
});

routes.delete("/:name/leave/:user_id", async (req, res) => {
    if (req.user) {
        const id = await pool.query(
            "SELECT id from subreddit WHERE name = $1",
            [req.params["name"]]);
        subredditId = id.rows[0]["id"];
        await pool.query(
            "DELETE FROM subreddit_moderator where user_id = $1 AND subreddit_id = $2",
            [req.params["user_id"], subredditId]);
        await pool.query(
            "DELETE FROM subreddit_user where user_id = $1 AND subreddit_id = $2",
            [req.params["user_id"], subredditId]);
        return res.send("Successfully left subreddit");
    } else {
        return res.send("You are not authenticated!");
    }
});

routes.get("/popular/members", async (req, res) => {
    const result = await pool.query(
        "SELECT s.id, s.name, s.description, (SELECT COUNT(id) from subreddit_user WHERE subreddit_id = s.id) as members, (SELECT COUNT(id) from post WHERE subreddit_id = s.id) as posts from subreddit s left join subreddit_user su on su.subreddit_id = s.id left join post p on p.subreddit_id = s.id GROUP BY s.id, s.name, s.description ORDER BY members DESC"
    );
    return res.send(result.rows.slice(0, 5));
});

routes.get("/popular/posts", async (req, res) => {
    const result = await pool.query(
        "SELECT s.id, s.name, s.description, (SELECT COUNT(id) from subreddit_user WHERE subreddit_id = s.id) as members, (SELECT COUNT(id) from post WHERE subreddit_id = s.id) as posts from subreddit s left join subreddit_user su on su.subreddit_id = s.id left join post p on p.subreddit_id = s.id GROUP BY s.id, s.name, s.description ORDER BY posts DESC"
    );
    return res.send(result.rows.slice(0, 5));
});

routes.get("/users/:id", async (req, res) => {
    const result = await pool.query(
        "SELECT * from subreddit_user WHERE id = $1",
        [req.params["id"]]);
    return res.send(result.rows[0]);
});

routes.get("/users/user/:user_id", async (req, res) => {
    const result = await pool.query(
        "SELECT * from subreddit_user WHERE user_id = $1",
        [req.params["user_id"]]);
    return res.send(result.rows);
});

routes.get("/moderators/user/:user_id", async (req, res) => {
    const result = await pool.query(
        "SELECT * from subreddit_moderator WHERE user_id = $1",
        [req.params["user_id"]]);
    return res.send(result.rows);
    ;
});

module.exports = routes;