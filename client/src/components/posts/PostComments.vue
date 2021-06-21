<template>
    <div class="mt-3">

        <Post
                v-on:makeThisUserModerator="makeThisUserModerator"
                v-on:joinSubreddit="joinSubreddit"
                v-on:leaveSubreddit="leaveSubreddit"
                v-on:rateUp="rateUp"
                v-on:rateDown="rateDown"
                v-on:rateUpDelete="rateUpDelete"
                v-on:rateDownDelete="rateDownDelete"
                v-on:deletePost="deletePost"
                :subredditModerators="subredditModerators"
                :userRatings="userRatings"
                :moderators="moderators"
                :subredditMemberships="subredditMemberships"
                :user="user"
                :post="post"
                :isAuthenticated="isAuthenticated"
        />

        <CreateCommentForm
                v-if="checkIfUserIsMember"
                v-on:createComment="createComment"
                :user="user"
                :post="post"
        />

        <Comment
                v-on:makeThisUserModerator="makeThisUserModerator"
                v-on:deleteComment="deleteComment"
                v-on:updateComment="updateComment"
                v-bind:comments="comments"
                v-for="comment in comments"
                :key="comment.id"
                :comment="comment"
                :subredditMemberships="subredditMemberships"
                :subredditModerators="subredditModerators"
                :moderators="moderators"
                :user="user"
                :post="post"
        />

    </div>
</template>

<script>
    import Comment from "../comments/Comment.vue";
    import CreateCommentForm from "../comments/CreateCommentForm.vue";
    import Post from "./Post.vue";
    import postsApi from '../../api/postsApi.js';
    import commentsApi from '../../api/commentsApi.js';

    export default {
        data() {
            return {
                post: {},
                comments: [],
                isMember: false,
                isModerator: false,
                hasRatedUp: false,
                hasRatedDown: false,
                s: this.socket,
            }
        },
        components: {
            Comment,
            Post,
            CreateCommentForm,
        },
        name: "PostComment",
        props: {
            post_id: String,
            isAuthenticated: Boolean,
            user: Object,
            subredditMemberships: Array,
            subredditModerators: Array,
            moderators: Array,
            userRatings: Array,
            socket: Object,
        },
        computed: {
            checkIfUserIsMember: function () {
                this.subredditMemberships.forEach((subreddit) => {
                    if (subreddit.subreddit_id === this.post.subreddit_id && subreddit.user_id === this.user.id) {
                        this.isMember = true;
                    }
                });
                return this.isMember;
            },
        },
        methods: {
            getPost() {
                postsApi.getPostById(this.post_id).then((response) => {
                    this.post = response.data[0];
                    this.getComments();
                });
            },
            getComments() {
                commentsApi.getCommentsByPostId(this.post_id).then((response) => {
                    this.comments = response.data;
                });
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
            createComment(content, user_id, post_id) {
                this.$emit('createComment', content, user_id, post_id);
            },
            deletePost(post_id) {
                this.$emit('deletePost', post_id);
            },
            deleteComment(comment_id, post_id) {
                this.$emit('deleteComment', comment_id, post_id);
            },
            updateComment(comment_id, content, post_id) {
                this.$emit('updateComment', comment_id, content, post_id);
            },
            makeThisUserModerator(user_id, subreddit_id) {
                this.$emit('makeThisUserModerator', user_id, subreddit_id);
            },
        },
        mounted() {
            this.getPost();

            this.s.on("commented", (data) => {
                this.comments.push(data);
                this.getPost();
            });

            this.s.on("deletedComment", (data) => {
                this.comments = data;
                this.getPost();
            });

            this.s.on("updatedComment", (data) => {
                this.comments = data;
                this.getPost();
            });

            this.s.on("voted", () => {
                this.getPost();
            });
        },
        created() {
            this.getPost();
        },
    };
</script>

<style lang="scss">
</style>