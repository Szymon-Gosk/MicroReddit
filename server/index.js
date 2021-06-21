const express = require("express");
const fs = require("fs");
// tworzy aplikacje
const app = express();
// tworzy serwer od aplikacji
const http = require('http').Server(app);
/*
 * Definiuje corsy dla socketów
 * (http, obiekt cors{origin, methods}) - http odosi sie do serwera / przekazuje cross origina
 */
const io = require("socket.io")(http, {cors: {origin: "http://localhost:3000", methods: ["GET", "POST"]}});
// logowanie
const passport = require("passport");

const flash = require('express-flash');
// pliki cookies
const cookieParser = require("cookie-parser");
// sesja serwera
const session = require("express-session");
// globalne zapytania do bazy
const {pool} = require("./dbConfig");
// inicjalizacja passporta
const initializePassport = require('./passportConfig');

const router = express.Router();

// wywolanie inicjalizacji passporta
initializePassport(passport);
app.use(express.urlencoded({extended: true}));
// w jakim formacie beda zwracane zapytania
app.use(express.json());
// cros originy (uzywany w aplikacji - aplikacja musi miec cors i sockety musza miec cors)
var cors = require('cors');
// na jaki adres sa wysylane requesty
app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
// use() definiuje konfiguracje przypisane do aplikacji
app.use(flash());
app.use(session({
    secret: "secretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use(cookieParser("secretcode"));
app.use(passport.initialize());
app.use(passport.session());

// definicje socketow
io.sockets.on("connection", (socket) => {
    socket.on("voteUp", async (data) => {
        await pool.query(
            "DELETE from post_vote WHERE post_id = $1 AND user_id = $2",
            [data.post_id, data.user_id]);
        await pool.query(
            "INSERT INTO post_vote(vote, user_id, post_id) VALUES($1, $2, $3)",
            [1, data.user_id, data.post_id]);
        const result = await pool.query(
            "SELECT p.id, p.title, p.content, p.image_path, p.video_url, p.creation_date, p.subreddit_id, p.user_id, s.name, u.nickname, (SELECT COUNT(id) from comment WHERE post_id = p.id) as comments, (SELECT SUM(vote) from post_vote WHERE post_id = p.id) as votes FROM post p inner join subreddit s on s.id = p.subreddit_id inner join reddit_user u on u.id = p.user_id left join comment c on c.post_id = p.id left join post_vote pv on pv.post_id=p.id GROUP BY p.id, p.title, p.content, p.image_path, p.video_url, p.creation_date, p.subreddit_id, p.user_id, s.name, u.nickname"
        );
        io.emit("voted", result.rows);
    }),
        socket.on("voteDown", async (data) => {
            await pool.query(
                "DELETE from post_vote WHERE post_id = $1 AND user_id = $2",
                [data.post_id, data.user_id]);
            await pool.query(
                "INSERT INTO post_vote(vote, user_id, post_id) VALUES($1, $2, $3)",
                [-1, data.user_id, data.post_id]);
            const result = await pool.query(
                "SELECT p.id, p.title, p.content, p.image_path, p.video_url, p.creation_date, p.subreddit_id, p.user_id, s.name, u.nickname, (SELECT COUNT(id) from comment WHERE post_id = p.id) as comments, (SELECT SUM(vote) from post_vote WHERE post_id = p.id) as votes FROM post p inner join subreddit s on s.id = p.subreddit_id inner join reddit_user u on u.id = p.user_id left join comment c on c.post_id = p.id left join post_vote pv on pv.post_id=p.id GROUP BY p.id, p.title, p.content, p.image_path, p.video_url, p.creation_date, p.subreddit_id, p.user_id, s.name, u.nickname"
            );
            io.emit("voted", result.rows);
        }),
        socket.on("deleteVote", async (data) => {
            await pool.query(
                "DELETE from post_vote WHERE post_id = $1 AND user_id = $2",
                [data.post_id, data.user_id]);
            const result = await pool.query(
                "SELECT p.id, p.title, p.content, p.image_path, p.video_url, p.creation_date, p.subreddit_id, p.user_id, s.name, u.nickname, (SELECT COUNT(id) from comment WHERE post_id = p.id) as comments, (SELECT SUM(vote) from post_vote WHERE post_id = p.id) as votes FROM post p inner join subreddit s on s.id = p.subreddit_id inner join reddit_user u on u.id = p.user_id left join comment c on c.post_id = p.id left join post_vote pv on pv.post_id=p.id GROUP BY p.id, p.title, p.content, p.image_path, p.video_url, p.creation_date, p.subreddit_id, p.user_id, s.name, u.nickname"
            );
            io.emit("voted", result.rows);
        }),
        socket.on("joinSubreddit", async (data) => {
            const id = await pool.query(
                "SELECT id from subreddit WHERE name = $1",
                [data.name]);
            subredditId = id.rows[0]["id"];
            await pool.query(
                "INSERT INTO subreddit_user(user_id, subreddit_id) VALUES($1, $2)",
                [data.user_id, subredditId]);
            io.emit("joinedSubreddit");
        }),
        socket.on("leaveSubreddit", async (data) => {
            const id = await pool.query(
                "SELECT id from subreddit WHERE name = $1",
                [data.name]);
            subredditId = id.rows[0]["id"];
            await pool.query(
                "DELETE FROM subreddit_moderator where user_id = $1 AND subreddit_id = $2",
                [data.user_id, subredditId]);
            await pool.query(
                "DELETE FROM subreddit_user where user_id = $1 AND subreddit_id = $2",
                [data.user_id, subredditId]);
            io.emit("leftSubreddit");
        }),
        socket.on("createComment", async (data) => {
            const result = await pool.query(
                "INSERT INTO comment(content, parent_comment_id, user_id, post_id) VALUES($1, $2, $3, $4) RETURNING Id",
                [data.content, null, data.user_id, data.post_id]);
            const commentId = result.rows[0].id;
            const comment = await pool.query(
                "SELECT c.id, c.content, c.user_id, c.post_id, ru.nickname FROM comment c inner join reddit_user ru on ru.id = c.user_id WHERE c.id = $1", [commentId]);
            io.emit("commented", comment.rows[0]);
        }),
        socket.on("deleteComment", async (data) => {
            await pool.query(
                "DELETE FROM comment WHERE id = $1", [data.comment_id]);
            const comments = await pool.query(
                "SELECT c.id, c.content, c.user_id, c.post_id, ru.nickname FROM comment c inner join reddit_user ru on ru.id = c.user_id WHERE c.post_id = $1", [data.post_id]);
            io.emit("deletedComment", comments.rows);
        })
    socket.on("updateComment", async (data) => {
        await pool.query(
            "UPDATE comment SET content = $1 WHERE id = $2", [data.content, data.comment_id]);
        const comments = await pool.query(
            "SELECT c.id, c.content, c.user_id, c.post_id, ru.nickname FROM comment c inner join reddit_user ru on ru.id = c.user_id WHERE c.post_id = $1", [data.post_id]);
        io.emit("updatedComment", comments.rows);
    }),
        socket.on("editSubreddit", async (data) => {
            await pool.query(
                "UPDATE subreddit SET name = $1, description = $2 WHERE id = $3", [data.name, data.description, data.subreddit_id]);
            const comments = await pool.query(
                "SELECT s.name, s.description, s.id FROM subreddit s WHERE id=$1", [data.post_id]);
            io.emit("updatedComment", comments.rows);
        }),
        socket.on("deletePost", async (data) => {
            await pool.query(
                "DELETE FROM post_vote WHERE post_id = $1", [data.post_id]
            );
            await pool.query(
                "DELETE FROM comment WHERE post_id = $1", [data.post_id]
            );
            await pool.query(
                "DELETE FROM post WHERE id = $1", [data.post_id]
            );
            const result = await pool.query(
                "SELECT p.id, p.title, p.content, p.image_path, p.video_url, p.creation_date, p.subreddit_id, p.user_id, s.name, u.nickname, (SELECT COUNT(id) from comment WHERE post_id = p.id) as comments, (SELECT SUM(vote) from post_vote WHERE post_id = p.id) as votes FROM post p inner join subreddit s on s.id = p.subreddit_id inner join reddit_user u on u.id = p.user_id left join comment c on c.post_id = p.id left join post_vote pv on pv.post_id=p.id GROUP BY p.id, p.title, p.content, p.image_path, p.video_url, p.creation_date, p.subreddit_id, p.user_id, s.name, u.nickname"
            );
            io.emit("deletedPost", result.rows);
        })
});

// import definicji z /api/
const posts = require('./api/posts.js');
const comments = require('./api/comments.js');
const subreddits = require('./api/subreddits.js');
const users = require('./api/users.js');
const auth = require('./api/auth.js');

// '/cos' - adres na ktory idzie zapytanie
app.use('/post', posts);
app.use('/comment', comments);
app.use('/subreddit', subreddits);
app.use('/user', users);
app.use('/auth', auth);

require("dotenv").config();
// konfiguracja bazy danych

// pg_container
// reddit_db
// postgres
// tajne
const dbConnData = {
    // localhost
    host: process.env.PGHOST || "127.0.0.1",
    port: process.env.PGPORT || 5433,
    database: "reddit_db",
    user: "postgres",
    password: "tajne",
};

// postgres
const {Client} = require("pg");
// definicja clienta - dzieki pool mamy require(pg) globalnie
const client = new Client(dbConnData);

console.log("Connection parameters: ");
console.log(dbConnData);


client
    .connect() // klient laczy sie z baza
    .then(() => {
        console.log("Connected to PostgreSQL");
        const port = 8080;

        // stworzenie tabel (create if not exists)
        const createTable = fs.readFileSync("./redditdb.sql").toString();
        client.query(createTable);

        // jednorazowo - potem trzeba zakomentowac zeby nie insertowal predef danych za kazdym razem
        // const insert = fs.readFileSync("./insert.sql").toString();
        // client.query(insert);

        // serwer nasluchuje zapytan na podanym porcie (8080)
        http.listen(port, () => {
            console.log(`API server listening at http://localhost:${port}`);
        });
    })
    .catch(err => console.error("Connection error", err.stack));
