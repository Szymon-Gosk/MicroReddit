const routes = require('express').Router();
const {pool} = require("../dbConfig");
const bcrypt = require("bcryptjs");
const passport = require("passport");

/**
 * Sign in
 */
routes.post("/signin", (req, res, next) => {
    passport.authenticate("local", (err, user) => {
        if (err) throw err;
        if (!user) res.send("No User Exists");
        else {
            req.logIn(user, (err) => {
                if (err) throw err;
                res.send("Successfully Authenticated");
            });
        }
    })(req, res, next);
});

/**
 * Sign out
 */
routes.get("/signout", (req, res) => {
    req.logOut();
    res.send("Successfully logged out");
});

/**
 * Set new email
 */
routes.post("/set-new-email", async (req, res) => {
    let errors = [];
    const result = await pool.query("SELECT * FROM reddit_user");

    result.rows.forEach(user => {
        if (req.body.email === user.email) {
            errors.push({message: "User with such email already exists"});
        }
    });

    if (errors.length === 0) {
        await pool.query(
            "UPDATE reddit_user SET email = $1 where id = $2", [req.body.email, req.body.user_id]);
        res.send("Email successfully changed");
    } else {
        res.send(errors);
    }
});

/**
 * Set new password
 */
routes.post("/set-new-password", async (req, res) => {
    let errors = [];
    const result = await pool.query("SELECT * FROM reddit_user WHERE id = $1", [req.body.user_id]);
    const user = result.rows[0];

    bcrypt.compare(req.body.old_password, user.password, async function (err, result) {
        if (result) {
            // TODO
            if (req.body.new_password !== req.body.new_password_confirm) {
                errors.push({message: "Passwords do not match"});
            }
        } else {
            errors.push({message: "Invalid password!"});
        }
        if (errors.length === 0) {
            const hashedPassword = await bcrypt.hash(req.body.new_password, 10);
            await pool.query(
                "UPDATE reddit_user SET password = $1 WHERE id = $2", [hashedPassword, req.body.user_id]);
            return res.send("Successfully changed password");
        } else {
            return res.send(errors);
        }
    });
});

/**
 * Sign up route
 */
routes.post("/signup", async (req, res) => {
    let errors = [];
    const result = await pool.query("SELECT * FROM reddit_user");

    result.rows.forEach(user => {
        if (req.body.username === user.nickname) {
            errors.push({message: "User with this nickname already exists"});
        }
        if (req.body.email === user.email) {
            errors.push({message: "User with this email already exists"});
        }
    });

    if (req.body.password !== req.body.confirmPassword) {
        errors.push({message: "Passwords do not match"});
    }

    if (errors.length === 0) {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const result = await pool.query(
            "INSERT INTO reddit_user (nickname, activation_guid, activation_expire_date, password, email) VALUES ($1, $2, $3, $4, $5) RETURNING Id",
            [req.body.username, null, null, hashedPassword, req.body.email]
        );
        req.body["id"] = result.rows[0]["id"];
        const result2 = await pool.query(
            "SELECT id from reddit_user where nickname = $1",
            [req.body.username]
        );
        const newUserId = result2.rows[0]["id"];
        await pool.query(
            "INSERT INTO user_role (user_id, role_id) VALUES ($1, $2) RETURNING Id",
            [newUserId, 3]
        );
    } else {
        res.send(errors);
    }
});

module.exports = routes;