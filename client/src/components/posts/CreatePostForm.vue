<template>
    <div class="div-form m-auto">
        <h1 class="mt-5 mb-4">Create a post</h1>
        <form @submit="createPost">
            <select v-model="subreddit_id" class="form-select mb-3" aria-label="Choose community">
                <option selected>Choose community</option>
                <option v-for="subreddit in subreddits" :key="subreddit.id" :value="subreddit.id">{{subreddit.name}}
                </option>
            </select>

            <div class="form-floating mb-3">
                <input v-model="title" type="text" class="form-control" id="floatingInput"
                       placeholder="name@example.com">
                <label for="floatingInput">Title</label>
            </div>

            <div class="mb-3">
                <textarea v-model="content" class="form-control" id="exampleFormControlTextarea1" rows="3"
                          placeholder="Text (optional)"></textarea>
            </div>

            <div class="mb-3">
                <label for="formFile" accept="image/*" class="form-label">Images & Video (optional)</label>
                <input v-on:change="processFile($event)" class="form-control" type="file" id="formFile">
            </div>

            <div class="form-floating mb-3">
                <input v-model="video_url" type="url" class="form-control" id="floatingInput2"
                       placeholder="name@example.com">
                <label for="floatingInput2">Url (optional)</label>
            </div>

            <div v-if="message" class="form-group">
                <label>{{ message }}</label>
            </div>
            <button type="submit" class="btn btn-primary mt-3">Post</button>
        </form>
    </div>
</template>

<script>
    import subredditsApi from '../../api/subredditsApi.js';
    import userApi from '../../api/userApi.js';

    export default {
        name: 'CreatePostForm',
        data() {
            return {
                message: "",
                title: null,
                content: null,
                image_path: "",
                video_url: null,
                creation_date: null,
                subreddit_id: "Choose community",
                user_id: null,
                subreddits: [],
                selectedFile: null,
                subredditName: "",
                temp_user: null,
            }
        },
        props: {
            errorMessage: String,
            subredditMemberships: Array,
            subreddit: String,
            user: Object,
        },
        methods: {
            createPost(event) {
                event.preventDefault();
                if (this.user !== undefined) {
                    if (this.subreddit_id !== "Choose community") {
                        let date = new Date();
                        this.creation_date = date.toISOString();
                        this.user_id = this.user.id;
                        if (this.title === null || this.creation_date === null || this.subreddit_id === null || this.user.id === null) {
                            alert("Something went wrong!");
                        } else {
                            this.$emit("createPost", this.title, this.content, this.selectedFile, this.video_url, this.creation_date, this.subreddit_id, this.user.id);
                            if (this.subreddit !== undefined) {
                                this.subreddit_id = parseInt(this.subreddit);
                            }
                            this.subredditName = this.subreddits.filter((s) => s.id === this.subreddit_id)[0].name;
                            this.$router.push(`/subreddit/${this.subredditName}`);
                            this.title = null;
                            this.content = null;
                            this.image_path = null;
                            this.video_url = null;
                            this.creation_date = null;
                            this.subreddit_id = null;
                            this.user_id = null;
                        }
                    }
                }
            },
            getSubreddits() {
                if (this.user.id !== undefined) {
                    subredditsApi.getUserSubreddits(this.user.id).then((response) => {
                        this.subreddits = response.data;
                    });
                } else if (this.temp_user.id !== undefined) {
                    subredditsApi.getUserSubreddits(this.temp_user.id).then((response) => {
                        this.subreddits = response.data;
                    });
                }
            },
            processFile(event) {
                const file = event.target.files[0];
                this.selectedFile = file;
                this.imageName = this.selectedFile.name;
            },
            getUser() {
                userApi.getUser().then((response) => {
                    this.temp_user = response.data;
                    this.getSubreddits();
                });
            }
        },
        created() {
            this.getUser();
            this.message = this.errorMessage;
            if (this.subreddit != undefined) {
                this.subreddit_id = this.subreddit;
            }
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
    }

</style>
