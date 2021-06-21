import axios from "axios";

export default {
    getComments() {
        return axios.get("http://localhost:8080/comment");
    },
    getCommentsByPostId(post_id) {
        return axios.get(`http://localhost:8080/comment/${post_id}`);
    },
}