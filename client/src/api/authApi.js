import axios from "axios";

export default {
    signup(username, email, password, confirmPassword) {
        return axios.post("http://localhost:8080/auth/signup", {
            username: username,
            email: email,
            password: password,
            confirmPassword: confirmPassword
        }, {withCredentials: true});
    },
    signin(username, password) {
        return axios.post("http://localhost:8080/auth/signin", {
            username: username,
            password: password
        }, {withCredentials: true});
    },
    setNewEmail(email, user_id) {
        return axios.post("http://localhost:8080/auth/set-new-email", {
            email: email,
            user_id: user_id
        }, {withCredentials: true});
    },
    setNewPassword(old_password, new_password, new_password_confirm, user_id) {
        return axios.post("http://localhost:8080/auth/set-new-password", {
            old_password: old_password,
            new_password: new_password,
            new_password_confirm: new_password_confirm,
            user_id: user_id
        }, {withCredentials: true});
    },
    signout() {
        return axios.get("http://localhost:8080/auth/signout", {withCredentials: true});
    },
}