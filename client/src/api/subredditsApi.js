import axios from "axios";

export default {
    getSubreddits() {
        return axios.get("http://localhost:8080/subreddit/subreddits");
    },
    getPopularSubredditsByMembers() {
        return axios.get("http://localhost:8080/subreddit/popular/members");
    },
    getPopularSubredditsByPosts() {
        return axios.get("http://localhost:8080/subreddit/popular/posts");
    },
    createSubreddit(name, description, user_id) {
        return axios.post(`http://localhost:8080/subreddit`, {
            name: name,
            description: description,
            user_id: user_id
        }, {withCredentials: true});
    },
    makeThisUserModerator(user_id, subreddit_id) {
        return axios.post("http://localhost:8080/subreddit/moderators", {
            user_id: user_id,
            subreddit_id: subreddit_id
        }, {withCredentials: true});
    },
    getUsersSubreddits(user_id) {
        return axios.get(`http://localhost:8080/subreddit/users/user/${user_id}`, {withCredentials: true});
    },
    getUsersModerators(user_id) {
        return axios.get(`http://localhost:8080/subreddit/moderators/user/${user_id}`, {withCredentials: true});
    },
    getModerators() {
        return axios.get(`http://localhost:8080/subreddit/moderators`, {withCredentials: true});
    },
    getUserSubreddits(user_id) {
        return axios.get(`http://localhost:8080/subreddit/user/${user_id}`);
    },
    getSubredditsForSubredditForm() {
        return axios.get(`http://localhost:8080/subreddit`);
    },
    getSubredditByName(name) {
        return axios.get(`http://localhost:8080/subreddit/${name}`);
    },
}