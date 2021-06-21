<template>
    <div class="card">
        <div class="card-header">
            Edit profile for
        </div>
        <ul class="list-group list-group-flush">
            <li class="list-group-item bl">{{user.nickname}}</li>
        </ul>
    </div>

    <div class="m-auto signing-form">
        <div class="card mt-5">
            <h5 class="card-header">Email</h5>
            <div class="card-body">
                <p class="card-text">{{user.email}}</p>
                <button v-on:click="changeEmail" type="button" class="btn btn-primary btn-sm">Change email
                </button>
            </div>
        </div>

        <div class="card mt-5">
            <h5 class="card-header">Password</h5>
            <div class="card-body">
                <p class="card-text">***** ***</p>
                <button v-on:click="changePassword" type="button" class="btn btn-primary btn-sm">Change
                    password
                </button>
            </div>
        </div>

        <form v-if="isEmailToChange" @submit="setNewEmail" class="m-auto mt-5">

            <div class="form-floating mb-3">
                <input v-model="newEmail" type="email" class="form-control" id="floatingInput2"
                       placeholder="New email adress">
                <label for="floatingPassword">New email adress</label>
            </div>

            <div class="form-group m-auto">
                <label>{{ message }}</label>
            </div>
            <button type="submit" class="btn btn-primary mt-3">Change email</button>
        </form>
        <form v-if="isPasswordToChange" @submit="setNewPassword" class="m-auto mt-5">

            <div class="form-floating mb-3">
                <input v-model="oldPassword" type="password" class="form-control" id="floatingPassword1"
                       placeholder="Old password">
                <label for="floatingPassword1">Old password</label>
            </div>

            <div class="form-floating mb-3">
                <input v-model="newPassword" type="password" class="form-control" id="floatingPassword2"
                       placeholder="New password">
                <label for="floatingPassword2">New password</label>
            </div>
            <div class="form-floating">
                <input v-model="newPasswordConfirm" type="password" class="form-control" id="floatingPassword3"
                       placeholder="Confirm new password">
                <label for="floatingPassword3">Confirm new password</label>
            </div>

            <div class="form-group m-auto">
                <label>{{ message }}</label>
            </div>
            <button type="submit" class="btn btn-primary mt-3">Change password</button>
        </form>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                newEmail: "",
                oldPassword: "",
                newPassword: "",
                newPasswordConfirm: "",
                isEmailToChange: false,
                isPasswordToChange: false,
                message: "",
            }
        },
        name: "EditProfile",
        props: {
            user: Object,
            errorMessage: String,
        },
        methods: {
            changeEmail() {
                this.isPasswordToChange = false;
                this.isEmailToChange = !this.isEmailToChange;
            },
            changePassword() {
                this.isEmailToChange = false;
                this.isPasswordToChange = !this.isPasswordToChange;
            },

            setNewEmail(event) {
                this.isEmailToChange = !this.isEmailToChange;
                this.message = "";
                event.preventDefault();
                if (this.newEmail === "") {
                    alert("No email entered");
                } else {
                    this.$emit("setNewEmail", this.newEmail, this.user.id);
                    this.newEmail = "";
                    this.$router.push('/');
                }
            },
            setNewPassword(event) {
                this.isPasswordToChange = !this.isPasswordToChange;
                this.message = "";
                event.preventDefault();
                if (this.oldPassword === null || this.newPassword === null || this.newPasswordConfirm === null) {
                    alert("All fields must be filled");
                } else {
                    this.$emit("setNewPassword", this.oldPassword, this.newPassword, this.newPasswordConfirm, this.user.id);
                    this.oldPassword = "";
                    this.newPassword = "";
                    this.newPasswordConfirm = "";
                    this.$router.push('/');
                }
            },
        },
        created() {
            this.message = this.errorMessage;
            if (this.message === "User with this email already exists") {
                this.isEmailToChange = true;
            } else if (this.message === "Passwords do not match" || this.message === "Invalid password") {
                this.isPasswordToChange = true;
            }
        },
    };
</script>

<style lang="scss">

    .signing-form {
        width: 40vw;
    }

    .bl {
        font-weight: bold;
        font-size: 120%;
    }

    @media screen and (max-width: 800px) {
        .signing-form {
            width: 100%;
        }
    }

</style>