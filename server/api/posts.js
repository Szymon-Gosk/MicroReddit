const routes = require('express').Router();
const {pool} = require("../dbConfig");
const multer = require('multer');
const fs = require("fs");
const path = require('path');
const upload = multer();

/**
 * Get posts
 */
routes.get("/", async (req, res) => {
    const result = await pool.query(
        "SELECT p.id, p.title, p.content, p.image_path, p.video_url, p.creation_date, p.subreddit_id, p.user_id, s.name, u.nickname, (SELECT COUNT(id) from comment WHERE post_id = p.id) as comments, (SELECT SUM(vote) from post_vote WHERE post_id = p.id) as votes FROM post p inner join subreddit s on s.id = p.subreddit_id inner join reddit_user u on u.id = p.user_id left join comment c on c.post_id = p.id left join post_vote pv on pv.post_id=p.id GROUP BY p.id, p.title, p.content, p.image_path, p.video_url, p.creation_date, p.subreddit_id, p.user_id, s.name, u.nickname"
    );
    return res.send(result.rows);
});

/**
 * Get post
 */
routes.get("/user/:user_id", async (req, res) => {
    const result = await pool.query(
        "SELECT p.id, p.title, p.content, p.image_path, p.video_url, p.creation_date, p.subreddit_id, p.user_id, s.name, u.nickname, (SELECT COUNT(id) from comment WHERE post_id = p.id) as comments, (SELECT SUM(vote) from post_vote WHERE post_id = p.id) as votes FROM post p inner join subreddit s on s.id = p.subreddit_id inner join reddit_user u on u.id = p.user_id left join comment c on c.post_id = p.id left join post_vote pv on pv.post_id=p.id inner join subreddit_user su on su.subreddit_id = s.id WHERE su.user_id = $1 GROUP BY p.id, p.title, p.content, p.image_path, p.video_url, p.creation_date, p.subreddit_id, p.user_id, s.name, u.nickname", [req.params["user_id"]]);
    return res.send(result.rows);
});

/**
 * Add a new post
 */
routes.post("/", upload.single('file'), async (req, res) => {
    if (req.user) {
        if (req.file !== null && req.file !== undefined) {
            fs.writeFile(`../client/public/img/${req.file.originalname}`, req.file.buffer, function (err) {
                if (err) return console.log(err);
                console.log('Image has been saved');
            });
            await pool.query(
                "INSERT INTO post(title, content, image_path, video_url, creation_date, subreddit_id, user_id) VALUES($1, $2, $3, $4, $5, $6, $7)",
                [req.body.title, req.body.content, `/img/${req.file.originalname}`, req.body.video_url, req.body.creation_date, req.body.subreddit_id, req.body.user_id]);
            return res.send("Successfully posted");
        } else {
            await pool.query(
                "INSERT INTO post(title, content, image_path, video_url, creation_date, subreddit_id, user_id) VALUES($1, $2, $3, $4, $5, $6, $7)",
                [req.body.title, req.body.content, null, req.body.video_url, req.body.creation_date, req.body.subreddit_id, req.body.user_id]);
            return res.send("Successfully posted");
        }
    } else {
        return res.send("You are not authenticated!");
    }
});

/**
 * Update a post
 */
routes.put("/", async (req, res) => {
    await pool.query(
        "UPDATE post SET title = $1, content = $2, video_url = $3 WHERE id = $4",
        [req.body.title, req.body.content, req.body.video_url, req.body.post_id]);
    return res.send("Successfully updated post");
});

routes.get("/new", async (req, res) => {
    const result = await pool.query(
        "SELECT p.id, p.title, p.content, p.image_path, p.video_url, p.creation_date, p.subreddit_id, p.user_id, s.name, u.nickname, (SELECT COUNT(id) from comment WHERE post_id = p.id) as comments, (SELECT SUM(vote) from post_vote WHERE post_id = p.id) as votes FROM post p inner join subreddit s on s.id = p.subreddit_id inner join reddit_user u on u.id = p.user_id left join comment c on c.post_id = p.id left join post_vote pv on pv.post_id=p.id GROUP BY p.id, p.title, p.content, p.image_path, p.video_url, p.creation_date, p.subreddit_id, p.user_id, s.name, u.nickname ORDER BY p.creation_date DESC"
    );
    return res.send(result.rows);
});

routes.get("/:post_id", async (req, res) => {
    const result = await pool.query(
        "SELECT p.id, p.title, p.content, p.image_path, p.video_url, p.creation_date, p.subreddit_id, p.user_id, s.name, u.nickname, (SELECT COUNT(id) from comment WHERE post_id = p.id) as comments, (SELECT SUM(vote) from post_vote WHERE post_id = p.id) as votes FROM post p inner join subreddit s on s.id = p.subreddit_id inner join reddit_user u on u.id = p.user_id left join comment c on c.post_id = p.id left join post_vote pv on pv.post_id=p.id WHERE p.id = $1 GROUP BY p.id, p.title, p.content, p.image_path, p.video_url, p.creation_date, p.subreddit_id, p.user_id, s.name, u.nickname", [req.params["post_id"]]
    );
    return res.send(result.rows);
});

routes.delete("/:post_id", async (req, res) => {
    await pool.query(
        "DELETE FROM post_vote WHERE post_id = $1", [req.params["post_id"]]
    );
    await pool.query(
        "DELETE FROM comment WHERE post_id = $1", [req.params["post_id"]]
    );
    await pool.query(
        "DELETE FROM post WHERE id = $1", [req.params["post_id"]]
    );
    return res.send("Post successfully deleted");
});

/**
 * Rate up
 */
routes.post("/rate-up", async (req, res) => {
    if (req.user) {
        await pool.query(
            "DELETE from post_vote WHERE post_id = $1 AND user_id = $2",
            [req.body.post_id, req.body.user_id]);
        await pool.query(
            "INSERT INTO post_vote(vote, user_id, post_id) VALUES($1, $2, $3)",
            [1, req.body.user_id, req.body.post_id]);
        return res.send("Successfully rated_up");
    } else {
        return res.send("You are not authenticated!");
    }
});

/**
 * Rate down
 */
routes.post("/rate-down", async (req, res) => {
    if (req.user) {
        await pool.query(
            "DELETE from post_vote WHERE post_id = $1 AND user_id = $2",
            [req.body.post_id, req.body.user_id]);
        await pool.query(
            "INSERT INTO post_vote(vote, user_id, post_id) VALUES($1, $2, $3)",
            [-1, req.body.user_id, req.body.post_id]);
        return res.send("Successfully rated_up");
    } else {
        return res.send("You are not authenticated!");
    }
});

routes.get("/rated/:user_id", async (req, res) => {
    const result = await pool.query(
        "SELECT * from post_vote WHERE user_id = $1",
        [req.params["user_id"]]);
    return res.send(result.rows);
});

routes.delete("/rated/:post_id/:user_id", async (req, res) => {
    const result = await pool.query(
        "DELETE from post_vote WHERE post_id = $1 AND user_id = $2",
        [req.params["post_id"], req.params["user_id"]]);
    return res.send(result.rows);
});

module.exports = routes;