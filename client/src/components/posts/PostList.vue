<template>
    <Search
            v-on:redirectToSubreddit="redirectToSubreddit"
            :items="subreddits"
    />

    <div v-if="isAuthenticated" class="card mrgn create-post">
        <div class="card-body m-auto">
            <button @click="redirectToCreatePost" type="button" class="btn btn-primary s-bt">
                <i class="bi bi-sticky me-3"></i>Create Post
            </button>
        </div>
    </div>

    <div class="form-floating mb-3 d-flex m-auto ">

    </div>

    <div class="card mrgn">
        <div class="card-body m-auto">
            <button v-if="dateSort" v-on:click="sortByDate" type="button" class="btn btn-primary s-bt">
                <i class="bi bi-sort-down me-3"></i>Unsort
            </button>
            <button v-else v-on:click="sortByDate" type="button" class="btn btn-primary s-bt">
                <i class="bi bi-sort-up-alt me-3"></i>Sort by date
            </button>
        </div>
    </div>

    <Post
            v-on:joinSubreddit="joinSubreddit"
            v-on:leaveSubreddit="leaveSubreddit"
            v-on:rateUp="rateUp"
            v-on:rateDown="rateDown"
            v-on:rateUpDelete="rateUpDelete"
            v-on:rateDownDelete="rateDownDelete"
            v-on:deletePost="deletePost"
            v-on:makeThisUserModerator="makeThisUserModerator"
            v-bind:posts="posts"
            v-for="post in posts"
            :socket="socket"
            :subredditModerators="subredditModerators"
            :moderators="moderators"
            :comments="comments"
            :userRatings="userRatings"
            :subredditMemberships="subredditMemberships"
            :user="user"
            :key="post.id"
            :post="post"
            :isAuthenticated="isAuthenticated"
    />
</template>

<script>
    import Post from "./Post.vue";
    import Search from './../general/Search.vue';

    export default {
        name: "PostList",
        data() {
            return {
                dateSort: false,
            };
        },
        components: {
            Post,
            Search,
        },
        props: {
            posts: Array,
            comments: Array,
            subredditMemberships: Array,
            subredditModerators: Array,
            subreddits: Array,
            moderators: Array,
            userRatings: Array,
            isAuthenticated: Boolean,
            user: Object,
            socket: Object,
        },
        methods: {
            joinSubreddit(name) {
                this.$emit('joinSubreddit', name);
            },
            leaveSubreddit(name) {
                this.$emit('leaveSubreddit', name);
            },

            rateUp(post_id, user_id) {
                this.$emit('rateUp', post_id, user_id);
            },
            rateDown(post_id, user_id) {
                this.$emit('rateDown', post_id, user_id);
            },
            rateUpDelete(post_id, user_id) {
                this.$emit('rateUpDelete', post_id, user_id);
            },
            rateDownDelete(post_id, user_id) {
                this.$emit('rateDownDelete', post_id, user_id);
            },

            redirectToCreatePost() {
                this.$router.push({name: 'new-post'});
            },
            redirectToSubreddit(result) {
                this.$emit('redirectToSubreddit', result);
            },

            deletePost(post_id) {
                this.$emit('deletePost', post_id);
            },
            makeThisUserModerator(user_id, subreddit_id) {
                this.$emit('makeThisUserModerator', user_id, subreddit_id);
            },
            sortByDate() {
                this.dateSort = !this.dateSort;
                if (this.dateSort) {
                    this.$emit('sortByDate');
                } else {
                    this.$emit('normalOrder');
                }
            },
        },
    }
</script>

<style lang="scss">

    $aquamarine: #4AAE9B;

    .search-subreddits {
        width: 40vw;
    }

    .card {
        width: 40vw;
    }

    .s-bt {
        width: 26vw;
        background-color: $aquamarine;
        border-color: $aquamarine;
    }

    .s-bt:hover {
        background-color: #3c8372;
        border-color: #3c8372;
    }

    .mrgn {
        margin-top: 15px;
    }

    @media screen and (max-width: 800px) {

        .s-bt {
            width: 82vw;
        }

    }

</style>