<template>
    <div class="card mt-5 m-auto signing-form">
        <div class="card-header ch">
            Signing out
        </div>
        <div class="card-body">
            <h5 class="card-title mb-3">Do you really want to sign out ?</h5>
            <a v-on:click="signout()" class="btn btn-primary btw">Sign out</a>
            <a v-on:click="goBack()" class="btn btn-danger ms-4">Go back</a>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'SignOut',
        inheritAttrs: false,
        methods: {
            signout() {
                this.$emit("signout");
                this.$router.push('/signin');
            },
            goBack() {
                this.$router.push('/');
            }
        },
    }
</script>
<style lang="scss">

    .signing-form {
        width: 40vw;
    }

    .btw {
        background-color: #3c8372;
        border-color: #3c8372;
    }

    .btw:hover {
        background-color: #2f6556;
        border-color: #2f6556;
    }

    .ch {
        text-align: center;
    }

    @media screen and (max-width: 800px) {
        .signing-form {
            width: 100%;
        }
    }

</style>
