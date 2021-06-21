<template>
    <div class="div-form m-auto">
     <h1 class="mt-5 mb-4">Edit this post</h1>
      <form @submit="editPost">

        <div class="form-floating mb-3">
          <input v-model="edit_title" type="text" class="form-control" id="floatingInput" placeholder="name@example.com">
          <label for="floatingInput"></label>
        </div>

        <div class="mb-3">
          <textarea v-model="edit_content" class="form-control" id="exampleFormControlTextarea1" rows="3" placeholder="Text (optional)"></textarea>
        </div>

        <div class="form-floating mb-3">
          <input v-model="edit_video_url" type="url" class="form-control" id="floatingInput2" placeholder="Enter video url...">
          <label for="floatingInput2"></label>
        </div>

        <div v-if="message" class="form-group">
        <label>{{ message }}</label>
        </div>
        <button type="submit" class="btn btn-success mt-3">Edit</button>
    </form>
  </div>
</template>

<script>
export default {
    name: 'EditPostForm',
    data() {
        return {
            message: "",
            edit_title: null,
            edit_content: null,
            edit_video_url: null,
            selectedFile: null,
        }
    },
    props: {
        errorMessage: String,
        post_id: String,
        title: String,
        content: String,
        video_url: String,
    },
    computed: {
    },
    methods: {
      editPost(event) {
      event.preventDefault();
          if (this.edit_title === null) {
              alert("You have to fill the title");
          } else {
              this.$emit("editPost", this.edit_title, this.edit_content, this.edit_video_url, this.post_id);
              this.edit_title = null;
              this.edit_content = null;
              this.edit_video_url = null;
              this.$router.push(`/post-comments/${this.post_id}`);
          }
      },
    },
    created() {
        this.message = this.errorMessage;
        this.edit_title = this.title;
        this.edit_content = this.content;
        this.edit_video_url = this.video_url;
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
