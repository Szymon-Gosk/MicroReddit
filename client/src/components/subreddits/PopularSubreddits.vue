<template>
    <div>
        <div class="card">
            <div class="card-body m-auto">
                <button v-on:click="sortByMembers" type="button" class="btn btn-primary btns">
                    <i class="bi bi-funnel me-3"></i>Sort by members
                </button>
            </div>
        </div>
        <div class="card">
            <div class="card-body m-auto">
                <button v-on:click="sortByPosts" type="button" class="btn btn-primary btns">
                    <i class="bi bi-funnel-fill me-3"></i>Sort by posts
                </button>
            </div>
        </div>
        <div v-for="subreddit in popularSubreddits" :key="subreddit.id" class="card">
            <div class="card-header">
                posts: {{subreddit.posts}} | members: {{subreddit.members}}
            </div>
            <div class="card-body">
                <h5 class="card-title">{{subreddit.name}}</h5>
                <p class="card-text">{{subreddit.description}}</p>
                <button @click="redirectToSubbreddit(subreddit.name)" type="button"
                        class="btn btn-primary btnrd">
                    <i class="bi bi-box-arrow-in-right me-3"></i>Enter
                </button>
            </div>
        </div>
    </div>
</template>

<script>

    export default {
        name: "PopularSubreddits",
        data() {
            return {};
        },
        props: {
            popularSubreddits: Array,
            isAuthenticated: Boolean,
            user: Object,
        },
        methods: {
            sortByMembers() {
                this.$emit('sortByMembers');
            },
            sortByPosts() {
                this.$emit('sortByPosts');
            },
            redirectToSubbreddit(name) {
                this.$router.push({name: 'subreddit', params: {name: name}, props: {name: name}});
            },
        },
    };
</script>

<style lang="scss">

    .card {
        width: 40vw;
    }

    .btns {
        width: 37vw;
    }

    .btnrd {
        width: 100%;
    }

    @media screen and (max-width: 800px) {
        .card {
            width: 100%;
        }

        .wdps {
            width: 84vw;
        }

        .btns {
            width: 84vw;
        }
    }

</style>