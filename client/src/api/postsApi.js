import axios from "axios";

export default {
    getPosts() {
        return axios.get("http://localhost:8080/post");
    },
    getUserPosts(user_id) {
        return axios.get(`http://localhost:8080/post/user/${user_id}`);
    },
    sortByDate() {
        return axios.get("http://localhost:8080/post/new");
    },
    createPost(title, content, image_path, video_url, creation_date, subreddit_id, user_id) {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('file', image_path);
        formData.append('video_url', video_url);
        formData.append('creation_date', creation_date);
        formData.append('subreddit_id', subreddit_id);
        formData.append('user_id', user_id);
        return axios.post(`http://localhost:8080/post`, formData, {withCredentials: true});
    },
    editPost(title, content, video_url, post_id) {
        return axios.put(`http://localhost:8080/post`, {
            title: title,
            content: content,
            video_url: video_url,
            post_id: post_id
        }, {withCredentials: true});
    },
    deletePost(post_id) {
        return axios.delete(`http://localhost:8080/post/${post_id}`, {post_id: post_id}, {withCredentials: true});
    },
    getUserRatings(user_id) {
        return axios.get(`http://localhost:8080/post/rated/${user_id}`, {withCredentials: true});
    },
    getPostById(post_id) {
        return axios.get(`http://localhost:8080/post/${post_id}`);
    },
}