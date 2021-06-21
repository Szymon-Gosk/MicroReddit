<template>
    <div class="m-auto signing-form">
        <h1 class="mt-5">Sign up</h1>
        <form @submit="signup">
            <div class="form-floating mb-3">
                <input v-model="username" type="username" class="form-control" id="floatingInput1"
                       placeholder="Nickname">
                <label for="floatingInput">Nickname</label>
            </div>
            <div class="form-floating mb-3">
                <input v-model="email" type="email" class="form-control" id="floatingInput2" placeholder="Email">
                <label for="floatingPassword">Email</label>
            </div>
            <div class="form-floating mb-3">
                <input v-model="password" type="password" class="form-control" id="floatingPassword1"
                       placeholder="Password">
                <label for="floatingInput">Password</label>
            </div>
            <div class="form-floating">
                <input v-model="confirmPassword" type="password" class="form-control" id="floatingPassword2"
                       placeholder="Confirm password">
                <label for="floatingPassword">Confirm password</label>
            </div>
            <div v-if="message" class="form-group">
                <label>{{ message }}</label>
            </div>
            <button type="submit" class="btn btn-primary mt-3">Sign up</button>
        </form>
    </div>
</template>

<script>
    export default {
        name: 'SignUpForm',
        inheritAttrs: false,
        props: {
            errorRegister: String,
        },
        methods: {
            signup(event) {
                event.preventDefault();
                if (this.username === null || this.email === null || this.password === null || this.confirmPassword === null) {
                    alert("You have to fill all fields!");
                } else {
                    this.$emit("signup", this.username, this.email, this.password, this.confirmPassword);
                    this.username = null;
                    this.email = null;
                    this.password = null;
                    this.confirmPassword = null;
                    this.$router.push('signin');
                }
            }
        },
        data() {
            return {
                username: null,
                email: null,
                password: null,
                confirmPassword: null,
                message: "",
            }
        },
        created() {
            this.message = this.errorRegister;
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
