import axios from "axios";

export default {
    getUser() {
        return axios.get("http://localhost:8080/user", {withCredentials: true});
    },
}