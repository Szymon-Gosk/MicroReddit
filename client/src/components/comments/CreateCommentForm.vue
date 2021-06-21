<template>
    <div class="div-form">
        <div class="m-auto mb-5">
            <h1 class="mt-5 mb-4 m-auto">Comment this post</h1>
            <form @submit="createComment" class="m-auto">

                <div class="form-floating mb-3 m-auto">
                    <input v-model="content" type="text" class="form-control" id="floatingInput" placeholder="Comment">
                    <label for="floatingInput">Comment</label>
                </div>

                <div v-if="message" class="form-group m-auto">
                    <label>{{ message }}</label>
                </div>
                <button type="submit" class="btn btn-primary mt-3 cmf">Comment</button>
            </form>
        </div>
    </div>
</template>

<script>

    export default {
        name: 'CreateCommentForm',
        data() {
            return {
                message: "",
                content: null,
                user_id: null,
                post_id: null,
            }
        },
        props: {
            errorMessage: String,
            user: Object,
            post: Object,
        },
        computed: {},
        methods: {
            createComment(event) {
                event.preventDefault();
                if (this.user !== undefined) {
                    this.user_id = this.user.id;
                    this.post_id = this.post.id;
                    if (this.content === null) {
                        alert("Fill the comment with text");
                    } else {
                        this.$emit("createComment", this.content, this.user_id, this.post_id);
                        this.content = null;
                        this.user_id = null;
                        this.post_id = null;
                        this.$router.push(`/post-comments/${this.post.id}`);
                    }
                }
            }
        },
        created() {
            this.message = this.errorMessage;
        }
    }
</script>

<style lang="scss">

    .div-form {
        width: 40vw;
        margin: auto;
    }

    @media screen and (max-width: 800px) {
        .div-form {
            width: 100%;
        }

        .cmf {
            width: 90vw;
        }
    }

</style>
