const LocalStrategy = require('passport-local').Strategy;
const {pool} = require("./dbConfig");
// hashowanie hasel
const bcrypt = require('bcryptjs');

function initialize(passport) {
    // autentykacja uzytkownika
    const authenticateUser = (username, password, done) => {
        // dajemy query do bazy
        pool.query(
                `SELECT * from reddit_user WHERE nickname = $1`, [username], async (err, result) => {
                if (err) throw err;
                // sprawdzenie czy uzytkownik zostal znaleziony
                if (result.rows.length > 0) {
                    // przypisuje do usera tego uzytkownika
                    const user = result.rows[0];
                    try {
                        // sprawdzenie hasla
                        if (await bcrypt.compare(password, user.password)) {
                            // zwraca callbacka z err=null i userem
                            return done(null, user);
                        } else {
                            // zwraca wynik jako blad (niepoprawne haslo)
                            return done(null, false, {message: "Password incorrect"});
                        }
                    } catch (e) {
                        return done(e);
                    }
                } else {
                    // nie znaleziono - error
                    return done(null, false, {message: "No user found"});
                }
            }
        );
    };
    // przekazuje lokalna strategie z przekazana funkcja euthUser
    passport.use(new LocalStrategy({usernameField: 'username'}, authenticateUser));

    // serializuje userow - przekazuje w callbacku id usera
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // deserializacja - request do backendu (odpowiad za informacje usera zwracane z backendu przy zapytaniu)
    passport.deserializeUser((id, done) => {
        pool.query(
                `SELECT u.id, u.nickname, u.activation_guid, u.activation_expire_date, u.password, u.email, r.role_name from user_role ur inner join reddit_user u on ur.user_id = u.id inner join role r on r.id=ur.role_id WHERE u.id = $1`, [id], (err, result) => {
                if (err) throw err;
                return done(null, result.rows[0]);
            }
        );
    });
}

// pozwala importowac w innych plikach
module.exports = initialize;