<template>
    <div class="m-auto signing-form">
        <h1 class="mt-5">Sign in</h1>
        <form @submit="signin">
            <div class="form-floating mb-3">
                <input v-model="username" type="username" class="form-control" id="floatingInput1"
                       placeholder="Nickname">
                <label for="floatingInput">Nickname</label>
            </div>
            <div class="form-floating">
                <input v-model="password" type="password" class="form-control" id="floatingPassword1"
                       placeholder="Password">
                <label for="floatingPassword">Password</label>
            </div>
            <div v-if="message" class="form-group">
                <label>{{ message }}</label>
            </div>
            <button type="submit" class="btn btn-primary mt-3">Sign in</button>
        </form>
    </div>
</template>

<script>
    export default {
        name: 'SignInForm',
        props: {
            errorMessage: String
        },
        methods: {
            signin(event) {
                event.preventDefault();
                if (this.username === null || this.password === null) {
                    alert("You have to fill all fields!");
                } else {
                    this.$emit("signin", this.username, this.password);
                    this.username = null;
                    this.password = null;
                    this.$router.push('/');
                }
            }
        },
        data() {
            return {
                message: "",
                username: null,
                password: null
            }
        },
        created() {
            this.message = this.errorMessage;
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
    .form {
        background-color: gray;
    }

    .signing-form {
        width: 40vw;
    }

    @media screen and (max-width: 800px) {
        .signing-form {
            width: 100%;
        }
    }
</style>
