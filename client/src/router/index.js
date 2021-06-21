import {createRouter, createWebHistory} from 'vue-router'
import PostList from "../../src/components/posts/PostList";
import CreatePostForm from "../../src/components/posts/CreatePostForm";
import EditPostForm from "../../src/components/posts/EditPostForm";
import CreateSubredditForm from "../../src/components/subreddits/CreateSubredditForm";
import Subreddit from "../../src/components/subreddits/Subreddit";
import PopularSubreddits from "../../src/components/subreddits/PopularSubreddits";
import PostComments from "../../src/components/posts/PostComments";
import EditProfile from "../../src/components/auth/EditProfile";
import SignUpForm from "../../src/components/auth/SignUpForm";
import SignInForm from "../../src/components/auth/SignInForm";
import SignOut from "../../src/components/auth/SignOut";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            components: {
                default: PostList,
            }
        },
        {
            path: '/new-post',
            name: 'new-post',
            components: {
                default: CreatePostForm,
            },
            props: true,
        },
        {
            path: '/edit-post/:post_id',
            name: 'edit-post',
            components: {
                default: EditPostForm,
            },
            props: true,
        },
        {
            path: '/new-subreddit',
            name: 'new-subreddit',
            components: {
                default: CreateSubredditForm,
            },
        },
        {
            path: '/subreddit/:name',
            name: 'subreddit',
            components: {
                default: Subreddit,
            },
            props: true,
        },
        {
            path: '/popular-subreddits',
            name: 'popular-subreddits',
            components: {
                default: PopularSubreddits,
            },
        },
        {
            path: '/post-comments/:post_id',
            name: 'post-comments',
            components: {
                default: PostComments,
            },
            props: true,
        },
        {
            path: '/edit-profile',
            name: 'edit-profile',
            components: {
                default: EditProfile,
            }
        },
        {
            path: '/signup',
            name: 'signup',
            components: {
                default: SignUpForm,
            }
        },
        {
            path: '/signin',
            name: 'signin',
            component: SignInForm,
        },
        {
            path: '/signout',
            name: 'signout',
            component: SignOut,
        },
    ],
});

export default router
