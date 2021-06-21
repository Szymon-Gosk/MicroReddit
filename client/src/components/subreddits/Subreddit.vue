<template>
    <div>

        <div class="card">
            <div class="card-header">
                &nbsp;
            </div>
            <div class="card-body">
                <h5 class="card-title">{{subreddit.name}}</h5>
                <p class="card-text">{{subreddit.description}}</p>
                <button v-if="!isUserAMeber" @click="joinSubreddit(subreddit.name)" type="button"
                        class="btn btn-primary btnrd">
                    <i class="bi bi-person-plus"></i>&nbsp;&nbsp;Join
                </button>
                <button v-else @click="leaveSubreddit(subreddit.name)" type="button"
                        class="btn btn-primary btnrd btnn">
                    <i class="bi bi-person-x"></i>&nbsp;&nbsp;Leave
                </button>
            </div>
        </div>

        <div v-if="isUserAMeber" class="card mrgn create-post">
            <div class="card-body m-auto">
                <button @click="redirectToCreatePost" type="button" class="btn btn-primary s-bt">
                    <i class="bi bi-sticky me-3"></i>Create Post
                </button>
            </div>
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
                v-on:makeThisUserModerator="makeThisUserModerator"
                v-on:rateUp="rateUp"
                v-on:rateDown="rateDown"
                v-on:rateUpDelete="rateUpDelete"
                v-on:rateDownDelete="rateDownDelete"
                v-on:deletePost="deletePost"
                v-bind:posts="posts"
                v-for="post in subredditPosts"
                :user="user"
                :key="post.id"
                :post="post"
                :subredditModerators="subredditModerators"
                :subredditMemberships="subredditMemberships"
                :moderators="moderators"
                :userRatings="userRatings"
                :isSubredditPost="isSubredditPost"
                :isAuthenticated="isAuthenticated"
        />
    </div>
</template>

<script>
    import Post from "../posts/Post.vue";
    import subredditsApi from '../../api/subredditsApi.js';

    export default {
        name: "Subreddit",
        data() {
            return {
                subreddit: {},
                isSubredditPost: true,
                isMember: false,
                dateSort: false,
            };
        },
        components: {
            Post,
        },
        props: {
            posts: Array,
            subredditMemberships: Array,
            subredditModerators: Array,
            moderators: Array,
            userRatings: Array,
            name: String,
            isAuthenticated: Boolean,
            user: Object,
        },
        methods: {
            getSubreddit() {
                subredditsApi.getSubredditByName(this.name).then((response) => {
                    this.subreddit = response.data[0];
                });
            },

            joinSubreddit(name) {
                this.$emit('joinSubreddit', name);
            },
            leaveSubreddit(name) {
                this.$emit('leaveSubreddit', name);
            },
            editSubreddit(name) {
                this.$emit('editSubreddit', name)
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

            redirectToSignUp() {
                this.$router.push('/signup');
            },
            redirectToCreatePost() {
                this.$router.push({name: 'new-post', params: {subreddit: this.subreddit.id}});
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
        computed: {
            subredditPosts: function () {
                return this.posts.filter((post) => post.name === this.name);
            },
            isUserAMeber: function () {
                return this.subredditMemberships.find(({subreddit_id, user_id}) => {
                    return subreddit_id === this.subreddit.id && user_id === this.user.id
                }) !== undefined;
            },
            isUserAModerator: function () {
                return this.subredditModerators.find(({subreddit_id, user_id}) => {
                    return subreddit_id === this.subreddit.id && user_id === this.user.id
                }) !== undefined;
            },
        },
        created() {
            this.getSubreddit();
        },
    };
</script>

<style lang="scss" scoped>

    .create-post {
        width: 40vw;
    }

    .card {
        width: 40vw;
    }

    .divbtn {
        width: 40vw;
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        align-items: center;
    }

    .btnn {
        background-color: #3c8372;
        border-color: #3c8372;
    }

    @media screen and (max-width: 800px) {
        .card {
            width: 100%;
        }
        .create-post {
            width: 100%;
        }
    }

</style>