<template>
    <div class="main">
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <div class="container-fluid">
                <router-link class="nav-link text-decoration-none text-dark" to="/">
                    <div class="icon-nav" v-bind:style="{ backgroundImage: 'url(./../public/apple-icon.png)' }"></div>
                    Micro Reddit
                </router-link>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                        data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                        aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                        <li v-if="isAuthenticated" class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button"
                               data-bs-toggle="dropdown" aria-expanded="false">
                                Home
                            </a>
                            <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                                <li class="search-by-content">
                                    <input v-on:keyup="filteredList" v-model="search" @blur="filteredList"
                                           class="form-control m-auto" type="search" placeholder="Filter"
                                           aria-label="Search content">
                                </li>
                                <li v-if="isAuthenticated" class="nav-item">
                                    <router-link class="nav-link" to="/new-subreddit">Create Community</router-link>
                                </li>
                                <li class="nav-item">
                                    <router-link class="nav-link" to="/popular-subreddits">Popular Subreddits
                                    </router-link>
                                </li>
                                <li v-if="myPosts" class="nav-item">
                                    <a v-on:click="switchToAllPosts" class="nav-link all-posts">All</a>
                                </li>
                                <li v-else class="nav-item">
                                    <a v-on:click="switchToAllPosts" class="nav-link all-posts">My communities</a>
                                </li>
                            </ul>
                        </li>
                    </ul>
                    <ul class="navbar-nav me-right mb-2 mb-lg-0">
                        <li v-if="isAuthenticated" class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button"
                               data-bs-toggle="dropdown" aria-expanded="false">
                                {{user.nickname}}
                            </a>
                            <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                                <li><a class="dropdown-item" href="/edit-profile">Edit profile</a></li>
                            </ul>
                        </li>
                        <li v-if="!isAuthenticated" class="nav-item">
                            <router-link class="nav-link" to="/signin">Sign in</router-link>
                        </li>
                        <li v-if="!isAuthenticated" class="nav-item">
                            <router-link class="nav-link mr-auto" to="/signup">Sign up</router-link>
                        </li>
                        <li v-if="isAuthenticated" class="nav-item">
                            <router-link class="nav-link" to="/signout">Sign out</router-link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
        <div class="container">
            <router-view
                    v-on:signup="signup"
                    v-on:signin="signin"
                    v-on:signout="signout"
                    v-on:joinSubreddit="joinSubreddit"
                    v-on:leaveSubreddit="leaveSubreddit"
                    v-on:createPost="createPost"
                    v-on:editPost="editPost"
                    v-on:rateUp="voteUp"
                    v-on:rateDown="voteDown"
                    v-on:rateUpDelete="deletVote"
                    v-on:rateDownDelete="deletVote"
                    v-on:createSubreddit="createSubreddit"
                    v-on:createComment="createComment"
                    v-on:deletePost="deletePost"
                    v-on:deleteComment="deleteComment"
                    v-on:updateComment="updateComment"
                    v-on:makeThisUserModerator="makeThisUserModerator"
                    v-on:setNewEmail="setNewEmail"
                    v-on:setNewPassword="setNewPassword"
                    v-on:sortByDate="sortByDate"
                    v-on:normalOrder="getPosts"
                    v-on:sortByMembers="getPopularSubredditsByMembers"
                    v-on:sortByPosts="getPopularSubredditsByPosts"
                    v-on:redirectToSubreddit="redirectToSubreddit"
                    v-on:editSubreddit="editSubreddit"
                    :socket="socket"
                    :comments="comments"
                    :userRatings="userRatings"
                    :subredditMemberships="subredditMemberships"
                    :subredditModerators="subredditModerators"
                    :subreddits="subreddits"
                    :popularSubreddits="popularSubreddits"
                    :moderators="moderators"
                    :user="user"
                    :isAuthenticated="isAuthenticated"
                    :posts="posts"
                    :errorMessage="errorMessage"
                    :errorRegister="errorRegister"
            />
        </div>
    </div>
</template>

<script>

    import io from 'socket.io-client';
    // import axiosa postApi
    import postsApi from './api/postsApi.js';
    import subredditsApi from "./api/subredditsApi.js";
    import commentsApi from "./api/commentsApi.js";
    import authApi from "./api/authApi.js";
    import userApi from "./api/userApi.js";

    export default {
        name: "App",
        data() {
            return {
                // lista postów (poczatkowo pusta, uzupelniana przez getPosts() )
                posts: [],
                comments: [],
                subredditMemberships: [],
                subredditModerators: [],
                subreddits: [],
                popularSubreddits: [],
                moderators: [],
                userRatings: [],
                user: {},
                isAuthenticated: false,
                search: "",
                errorMessage: "",
                errorRegister: "",
                userRole: "",
                socket: {},
                myPosts: true,
            };
        },
        methods: {
            // metoda dla wszystkich postow
            filteredList() {
                if (this.search === '') {
                    this.getPosts();
                }
                this.posts = this.posts.filter(element => {
                    return element.content.toLowerCase().includes(this.search.toLowerCase())
                })
            },
            redirectToSubreddit(result) {
                this.myPosts = false;
                this.getPosts();
                this.$router.push({name: 'subreddit', params: {name: result, posts: this.posts}});
            },
            sortByDate() {
                postsApi.sortByDate().then((response) => {
                    this.posts = response.data;
                    this.getComments();
                });
            },
            getPosts() {
                if (this.isAuthenticated && this.myPosts) {
                    postsApi.getUserPosts(this.user.id).then((response) => {
                        this.posts = response.data;
                    });
                } else {
                    postsApi.getPosts().then((response) => {
                        this.posts = response.data;
                    });
                }
                this.getComments();
            },
            switchToAllPosts() {
                this.myPosts = !this.myPosts;
                this.getUser();
            },
            getPopularSubredditsByMembers() {
                subredditsApi.getPopularSubredditsByMembers().then((response) => {
                    this.popularSubreddits = response.data;
                });
            },
            getPopularSubredditsByPosts() {
                subredditsApi.getPopularSubredditsByPosts().then((response) => {
                    this.popularSubreddits = response.data;
                });
            },
            getSubreddits() {
                subredditsApi.getSubreddits().then((response) => {
                    this.subreddits = response.data;
                });
            },
            getComments() {
                commentsApi.getComments().then((response) => {
                    this.comments = response.data;
                });
            },
            createPost(title, content, image_path, video_url, creation_date, subreddit_id, user_id) {
                if (this.isAuthenticated) {
                    postsApi.createPost(title, content, image_path, video_url, creation_date, subreddit_id, user_id).then(() => {
                        this.getUser();
                        this.getPosts();
                    });
                }
            },
            editPost(title, content, video_url, post_id) {
                if (this.isAuthenticated) {
                    postsApi.editPost(title, content, video_url, post_id).then(() => {
                        this.getUser();
                        this.getPosts();
                    });
                }
            },
            deletePost(post_id) {
                if (this.isAuthenticated) {
                    this.socket.emit("deletePost", {post_id: post_id});
                }
            },
            createSubreddit(name, description, user_id) {
                if (this.isAuthenticated) {
                    subredditsApi.createSubreddit(name, description, user_id).then((response) => {
                        if (response.data === "This name is already taken") {
                            this.errorMessage = response.data;
                            this.$router.push('/new-subreddit');
                        }
                        this.getUser();
                        this.getPosts();
                    });
                }
            },
            voteUp(post_id, user_id) {
                if (this.isAuthenticated) {
                    this.socket.emit("voteUp", {post_id: post_id, user_id: user_id});
                }
            },
            voteDown(post_id, user_id) {
                if (this.isAuthenticated) {
                    this.socket.emit("voteDown", {post_id: post_id, user_id: user_id});
                }
            },
            deletVote(post_id, user_id) {
                if (this.isAuthenticated) {
                    this.socket.emit("deleteVote", {post_id: post_id, user_id: user_id});
                }
            },
            joinSubreddit(name) {
                if (this.isAuthenticated) {
                    console.log(this.socket);
                    this.socket.emit("joinSubreddit", {name: name, user_id: this.user.id});
                }
            },
            leaveSubreddit(name) {
                if (this.isAuthenticated) {
                    this.socket.emit("leaveSubreddit", {name: name, user_id: this.user.id});
                }
            },
            createComment(content, user_id, post_id) {
                if (this.isAuthenticated) {
                    this.socket.emit("createComment", {content: content, user_id: user_id, post_id: post_id});
                }
            },
            deleteComment(comment_id, post_id) {
                if (this.isAuthenticated) {
                    this.socket.emit("deleteComment", {comment_id: comment_id, post_id: post_id});
                }
            },
            updateComment(comment_id, content, post_id) {
                if (this.isAuthenticated) {
                    this.socket.emit("updateComment", {comment_id: comment_id, content: content, post_id: post_id});
                }
            },
            makeThisUserModerator(user_id, subreddit_id) {
                subredditsApi.makeThisUserModerator(user_id, subreddit_id).then(() => {
                    this.getPosts();
                    this.getUser();
                });
            },
            signup(username, email, password, confirmPassword) {
                authApi.signup(username, email, password, confirmPassword).then((response) => {
                    if (response.data.length > 0) {
                        this.errorRegister = response.data[0].message;
                        this.$router.push('/signup');
                    }
                });
            },
            signin(username, password) {
                authApi.signin(username, password).then((response) => {
                    if (response.data === "No User Exists") {
                        this.errorMessage = response.data;
                        this.$router.push('/signin');
                    }
                    this.getUser();
                });
            },
            setNewEmail(email, user_id) {
                authApi.setNewEmail(email, user_id).then((response) => {
                    if (response.data[0].message === "User with this email already exists") {
                        this.errorMessage = response.data[0].message;
                        this.$router.push('/edit-profile');
                    } else {
                        this.errorMessage = "";
                    }
                    this.$router.push('/edit-profile');
                    this.getUser();
                });
            },
            setNewPassword(old_password, new_password, new_password_confirm, user_id) {
                authApi.setNewPassword(old_password, new_password, new_password_confirm, user_id).then((response) => {
                    console.log(response.data);
                    if (response.data[0].message === "Passwords do not match") {
                        this.errorMessage = response.data[0].message;
                        this.$router.push('/edit-profile');
                    } else if (response.data[0].message === "Invalid password!") {
                        this.errorMessage = response.data[0].message;
                        this.$router.push('/edit-profile');
                    } else {
                        this.errorMessage = "";
                        this.signout();
                        this.$router.push('/signin');
                    }
                });
            },
            getUser() {
                userApi.getUser().then(async (response) => {
                    this.user = response.data;
                    if (this.user.email) {
                        this.isAuthenticated = true;
                        this.userRole = this.user.role_name;
                        this.getPosts();
                        this.getModerators();
                        this.getUserRatings(this.user.id);
                        this.getUsersSubreddits(this.user.id);
                        this.getUsersModerators(this.user.id);
                        this.getSubreddits();
                    } else {
                        this.isAuthenticated = false;
                        this.user = {};
                        this.subredditMemberships = [];
                        this.subredditModerators = [];
                        this.userRatings = [];
                        this.getSubreddits();
                        this.getPosts();
                    }
                });
            },
            getUsersSubreddits(user_id) {
                if (this.isAuthenticated) {
                    subredditsApi.getUsersSubreddits(user_id).then((response) => {
                        this.subredditMemberships = response.data;
                    });
                }
            },
            getUsersModerators(user_id) {
                if (this.isAuthenticated) {
                    subredditsApi.getUsersModerators(user_id).then((response) => {
                        this.subredditModerators = response.data;
                    });
                }
            },
            getModerators() {
                if (this.isAuthenticated) {
                    subredditsApi.getModerators().then((response) => {
                        this.moderators = response.data;
                    });
                }
            },
            getUserRatings(user_id) {
                if (this.isAuthenticated) {
                    postsApi.getUserRatings(user_id).then((response) => {
                        this.userRatings = response.data;
                    });
                }
            },
            signout() {
                authApi.signout().then(() => {
                    this.getUser();
                });
            },
            editSubreddit(name) {
                if (this.isAuthenticated) {
                    console.log(this.socket);
                    this.socket.emit("editSubreddit", {name: name, user_id: this.user.id});
                }
            },
        },
        mounted() {
            this.socket.on("voted", () => {
                this.getUser();
            });

            this.socket.on("joinedSubreddit", () => {
                this.getPosts();
                this.getUser();
            });

            this.socket.on("leftSubreddit", () => {
                this.getPosts();
                this.getUser();
            });

            this.socket.on("deletedPost", (data) => {
                this.posts = data;
                this.getUser();
            });
        },
        created() {
            this.socket = io('http://localhost:8080', {transports: ['websocket']});

            this.getUser();
            this.getPopularSubredditsByMembers();
        },
    };
</script>

<style lang="scss">

    $backgroundColor: rgb(209, 209, 209);

    body {
        background-color: $backgroundColor;
        margin: 0;
        padding: 0;
    }

    .main {
        margin: 0;
        padding: 0;
    }

    .container {
        padding-top: 15px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .icon-nav {
        width: 3vw;
        height: 100%;
    }

    .search-by-content {
        width: 15vw;
    }

    .all-posts:hover {
        cursor: pointer;
    }

    @media screen and (max-width: 800px) {
        .search-by-content {
            width: 40vw;
        }
    }

</style>
