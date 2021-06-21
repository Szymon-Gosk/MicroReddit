<template>
    <div class="card card-post">
        <img v-if="post.image_path !== null && post.image_path !== undefined" :src="post.image_path"
             class="card-img-top" alt="Alternative image">
        <ul class="list-group list-group-flush">
            <li class="list-group-item"><p class="aquamarine ms-3 mt-1">
                <span v-if="!isSubredditPost" class="subredditLink" @click="redirectSubreddit"
                      style="font-weight: bold; color: black">
                    r/{{post.name}}</span> Posted by u/{{post.nickname}}</p>
            </li>
            <li class="list-group-item aquamarine">{{(new Date(post.creation_date)).toLocaleString()}}</li>
            <li v-if="post.video_url !== null && post.video_url !== undefined && post.video_url !== 'null'"
                class="list-group-item lgi">
                <iframe :src="youtubeLink" frameborder="0" allowfullscreen
                        class="responsive-frame mx-auto d-block rf"></iframe>
            </li>
        </ul>
        <div class="card-body">
            <h5 class="card-title">{{post.title}}</h5>
            <p class="card-text">{{post.content}}</p>
        </div>
        <ul v-if="isAuthenticated" class="list-group list-group-flush post-moderator-buttons">
            <li class="list-group-item">
                <button v-on:click="editPost" v-if="isUserAModerator || user.role_name === 'administrator'"
                        type="button" id="buttonEdit" class="btn btn-primary btn-sm ms-2 aq-bt"><i
                        class="bi bi-pencil-square"></i>
                </button>
                <button v-on:click="deletePost" v-if="isUserAModerator || user.role_name === 'administrator'"
                        type="button" id="buttonDelete" class="btn btn-danger btn-sm ms-2"><i class="bi bi-trash"></i>
                </button>
                <button v-on:click="addThisUserAsModerator" v-if="isUserAModerator && !checkIfUserIsAlreadyModerator"
                        type="button" class="btn btn-success btn-sm ms-2"><i class="bi bi-person-plus "></i></button>
            </li>
        </ul>
        <div class="card-body">
            <div v-if="isAuthenticated">
                <button v-on:click="redirectToPostComments" type="button"
                        class="btn btn-secondary btn-sm bg-white text-dark"><i class="bi bi-chat me-1"></i>{{post.comments}}
                </button>
                <button v-if="checkIfUserHasRatedUp" v-on:click="rateUpDelete" type="button"
                        class="btn btn-secondary btn-sm ms-3 bgd text-white"><i class="bi bi-arrow-up ms-auto"></i>
                </button>
                <button v-else v-on:click="rateUp" type="button"
                        class="btn btn-secondary btn-sm ms-3 bg-white text-dark"><i class="bi bi-arrow-up ms-auto"></i>
                </button>
                <span class="ms-3">{{getVotes}}</span>
                <button v-if="checkIfUserHasRatedDown" v-on:click="rateDownDelete" type="button"
                        class="btn btn-secondary btn-sm ms-3 bgd text-white"><i
                        class="bi bi-arrow-down ms-auto"></i></button>
                <button v-else v-on:click="rateDown" type="button"
                        class="btn btn-secondary btn-sm ms-3 bg-white text-dark"><i
                        class="bi bi-arrow-down ms-auto"></i></button>
                <button v-if="!isSubredditPost && !isUserAMeber" @click="joinSubreddit(post.name)" type="button"
                        id="buttonJoin" class="btn btn-warning btn-sm  button1 btn-j">
                    <i class="bi bi-person-plus"></i>&nbsp;&nbsp;Join
                </button>
                <button v-if="!isSubredditPost && isUserAMeber" @click="leaveSubreddit(post.name)" type="button"
                        id="buttonLeave" class="btn btn-secondary btn-sm  button1 btn-l">
                    <i class="bi bi-person-x"></i>&nbsp;&nbsp;Leave
                </button>
            </div>
            <div v-else>
                <button v-on:click="redirectToSignUp" type="button" class="btn btn-secondary btn-sm bg-white text-dark">
                    <i class="bi bi-chat me-1"></i>{{post.comments}}
                </button>
                <button v-on:click="redirectToSignUp" type="button"
                        class="btn btn-secondary btn-sm ms-3 bg-white text-dark"><i class="bi bi-arrow-up ms-auto"></i>
                </button>
                <span class="ms-3">{{getVotes}}</span>
                <button v-on:click="redirectToSignUp" type="button"
                        class="btn btn-secondary btn-sm ms-3 bg-white text-dark"><i
                        class="bi bi-arrow-down ms-auto"></i></button>
                <button v-if="!isSubredditPost && !isUserAMeber" @click="joinSubreddit(post.name)" type="button"
                        id="buttonJoin" class="btn btn-warning btn-sm  button1 btn-j">
                    <i class="bi bi-person-plus"></i>&nbsp;&nbsp;Join
                </button>
                <button v-if="!isSubredditPost && isUserAMeber" @click="leaveSubreddit(post.name)" type="button"
                        id="buttonLeave" class="btn btn-secondary btn-sm  button1 btn-l">
                    <i class="bi bi-person-x"></i>&nbsp;&nbsp;Leave
                </button>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                commentsForPost: [],
                s: this.socket,
            }
        },
        name: "Post",
        props: {
            post: {
                id: Number,
                title: String,
                content: String,
                image_path: String,
                video_url: String,
                creation_date: Date,
                subreddit_id: Number,
                user_id: Number,
                nickname: String,
                comments: Number,
                votes: Number,
            },
            isSubredditPost: Boolean,
            isAuthenticated: Boolean,
            user: Object,
            subredditMemberships: Array,
            subredditModerators: Array,
            moderators: Array,
            userRatings: Array,
            comments: Array,
            socket: Object,
        },
        computed: {
            // User membership checks
            isUserAMeber: function () {
                return this.subredditMemberships.find(({subreddit_id, user_id}) => {
                    return subreddit_id === this.post.subreddit_id && user_id === this.user.id
                }) !== undefined;
            },
            isUserAModerator: function () {
                return this.subredditModerators.find(({subreddit_id, user_id}) => {
                    return subreddit_id === this.post.subreddit_id && user_id === this.user.id
                }) !== undefined;
            },
            checkIfUserIsAlreadyModerator: function () {
                return this.moderators.find(({subreddit_id, user_id}) => {
                    return subreddit_id === this.post.subreddit_id && user_id === this.post.user_id
                }) !== undefined;
            },

            // ratings
            checkIfUserHasRatedUp: function () {
                return this.userRatings.find(({post_id, vote}) => {
                    return post_id === this.post.id && vote === 1
                }) !== undefined;
            },
            checkIfUserHasRatedDown: function () {
                return this.userRatings.find(({post_id, vote}) => {
                    return post_id === this.post.id && vote === -1
                }) !== undefined;
            },
            getVotes: function () {
                if (this.post.votes == null || this.post.votes === undefined) {
                    return 0;
                } else {
                    return this.post.votes;
                }
            },

            youtubeLink: function () {
                const {video_url} = this.post;
                if (video_url.includes("&")) {
                    return video_url.substring(0, video_url.indexOf("&")).replace("watch?v=", "embed/");
                } else {
                    return video_url.replace("watch?v=", "embed/");
                }
            },
        },
        methods: {

            redirectSubreddit() {
                this.$router.push({name: 'subreddit', params: {name: this.post.name}, props: {name: this.post.name}});
            },
            redirectToPostComments() {
                this.$router.push({name: 'post-comments', params: {post_id: this.post.id}});
            },
            redirectToSignUp() {
                this.$router.push('/signup');
            },

            joinSubreddit(name) {
                this.$emit('joinSubreddit', name);
            },
            leaveSubreddit(name) {
                this.$emit('leaveSubreddit', name);
            },

            rateDown() {
                if (this.isAuthenticated) {
                    this.$emit('rateDown', this.post.id, this.user.id);
                }
            },
            rateDownDelete() {
                if (this.isAuthenticated) {
                    this.$emit('rateDownDelete', this.post.id, this.user.id);
                }
            },
            rateUp() {
                if (this.isAuthenticated) {
                    this.$emit('rateUp', this.post.id, this.user.id);
                }
            },
            rateUpDelete() {
                if (this.isAuthenticated) {
                    this.$emit('rateUpDelete', this.post.id, this.user.id);
                }
            },

            deletePost() {
                this.$emit('deletePost', this.post.id);
            },
            editPost() {
                this.$router.push({
                    name: 'edit-post',
                    params: {
                        title: this.post.title,
                        content: this.post.content,
                        image_path: this.post.image_path,
                        video_url: this.post.video_url,
                        post_id: this.post.id
                    }
                });
            },
            addThisUserAsModerator() {
                this.$emit('makeThisUserModerator', this.post.user_id, this.post.subreddit_id);
            },
        },
    }
</script>

<style lang="scss">

    $aquamarine: #4AAE9B;
    $aquamarine-d: #3c8372;

    .card {
        margin-top: 40px;
    }

    .card-post {
        width: 35vw;
    }

    .list-group {
        text-align: center;
    }

    .card-title {
        text-align: center;
    }

    .card-text {
        text-align: justify;
    }

    .aquamarine {
        color: $aquamarine;
    }

    .aquamarine-back {
        background-color: $aquamarine;
    }

    .btn-secondary:hover {
        background-color: $aquamarine;
        border-color: $aquamarine;
    }

    .btn {
        background-color: $aquamarine;
        border-color: $aquamarine;
    }

    .btn:hover {
        background-color: $aquamarine-d;
        border-color: $aquamarine-d;
    }

    .aq-bt {
        background-color: $aquamarine;
    }

    .aq-bt:hover {
        background-color: $aquamarine-d;
    }

    .btn-j {
        color: white;
        margin-left: 20.3vw;
    }

    .btn-l {
        margin-left: 20.3vw;
        border-color: $aquamarine-d;
        background-color: $aquamarine-d;
    }

    .bgd {
        background-color: $aquamarine;
    }

    @media screen and (max-width: 800px) {
        .card-post {
            width: 90vw;
        }

        .btn-j {
            margin-left: 19vw;
        }

        .btn-l {
            margin-left: 16vw;
        }
    }

</style>