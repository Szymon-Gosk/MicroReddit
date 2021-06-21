<template>
    <div class="div-form m-auto">
        <h1 class="mt-5 mb-4">Create new subreddit</h1>
        <form @submit="createPost">
            <div class="form-floating mb-3">
                <input v-model="name" type="text" class="form-control" id="floatingInput" placeholder="Name">
                <label for="floatingInput">Name</label>
            </div>

            <div class="mb-3">
                <textarea v-model="description" class="form-control" id="exampleFormControlTextarea1" rows="3"
                          placeholder="Description"></textarea>
            </div>

            <div v-if="message" class="form-group">
                <label>{{ message }}</label>
            </div>
            <button type="submit" class="btn btn-primary mt-3 wid">Create</button>
        </form>
    </div>
</template>

<script>
    import subredditsApi from '../../api/subredditsApi.js';

    export default {
        name: 'CreateSubredditForm',
        data() {
            return {
                message: "",
                name: null,
                description: null,
                subreddits: [],
            }
        },
        props: {
            errorMessage: String,
            user: Object,
        },
        methods: {
            createPost(event) {
                event.preventDefault();
                if (this.user.email) {
                    if (this.name === null || this.description === null) {
                        alert("You have to fill all fields");
                    } else {
                        this.$emit("createSubreddit", this.name, this.description, this.user.id);
                        this.$router.push(`/subreddit/${this.name}`);
                    }
                    this.name = null;
                    this.description = null;
                }
            },
            getSubreddits() {
                subredditsApi.getSubredditsForSubredditForm().then((response) => {
                    this.subreddits = response.data;
                });
            },
        },
        created() {
            this.message = this.errorMessage;
            this.getSubreddits();
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">

    .div-form {
        width: 40vw;
    }

    @media screen and (max-width: 800px) {
        .div-form {
            width: 100%;
        }
        .wid {
            width: 90vw;
        }
    }

</style>
