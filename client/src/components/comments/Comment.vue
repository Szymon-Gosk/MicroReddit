<template>
    <div>
        <div class="card text-white bg-secondary mb-3">
            <div class="card-header">{{comment.nickname}}
                <button v-if="checkIfUserIsModerator" v-on:click="setToEditing" type="button"
                        class="btn btn-primary btn-sm ms-3"><i class="bi bi-pencil"></i></button>
                <button v-if="checkIfUserIsModerator" v-on:click="deleteComment" type="button"
                        class="btn btn-danger btn-sm ms-2"><i class="bi bi-archive"></i></button>
                <button v-if="checkIfUserIsModerator && !checkIfUserIsAlreadyModerator"
                        v-on:click="addThisUserAsModerator" type="button" class="btn btn-success btn-sm ms-2"><i
                        class="bi bi-person-plus"></i></button>
            </div>
            <div v-if="isEditing === false" class="card-body">
                <p class="card-text">{{comment.content}}</p>
            </div>
            <div class="h6 flex-grow-1 mb-0" v-else>
                <input
                        v-model="newContent"
                        type="comment"
                        class="form-control"
                        id="floatingInputEdit"
                        @blur="updateComment"
                        v-on:keyup.enter="updateComment"
                >
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                isModerator: false,
                isAlreadyModerator: false,
                isEditing: false,
                newContent: this.comment.content,
            }
        },
        name: "Comment",
        props: {
            comment: {
                id: Number,
                content: String,
                nickname: String,
                post_id: Number,
                user_id: Number,
            },
            user: Object,
            subredditModerators: Array,
            moderators: Array,
            post: Object,
        },
        computed: {
            checkIfUserIsModerator: function () {
                return this.subredditModerators.find(({subreddit_id, user_id}) => {
                    return subreddit_id === this.post.subreddit_id && user_id === this.user.id
                }) !== undefined;
            },
            checkIfUserIsAlreadyModerator: function () {
                return this.moderators.find(({subreddit_id, user_id}) => {
                    return subreddit_id === this.post.subreddit_id && user_id === this.comment.user_id
                }) !== undefined;
            },
        },
        methods: {
            deleteComment() {
                this.$emit('deleteComment', this.comment.id, this.comment.post_id);
            },
            updateComment() {
                this.newContent = document.getElementById("floatingInputEdit").value;
                this.isEditing = false;
                this.$emit('updateComment', this.comment.id, this.newContent, this.comment.post_id);
            },
            setToEditing() {
                this.isEditing = true;
                setTimeout(() => {
                    document.getElementById("floatingInputEdit").focus();
                }, 1)
            },
            addThisUserAsModerator() {
                this.$emit('makeThisUserModerator', this.comment.user_id, this.post.subreddit_id);
            },
        },
    };
</script>

<style lang="scss" scoped>

    .card {
        width: 40vw;
        border-color: #3c8372;
    }

    .card-header {
        background-color: #3c8372;
    }

    .card-body {
        background-color: #4AAE9B;
    }

    @media screen and (max-width: 800px) {
        .card {
            width: 100%;
        }
    }

</style>