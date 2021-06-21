<template>
    <div class="d-flex m-auto autocomplete mb-3 mt-2 search-subreddits">
        <input
                class="form-control"
                placeholder="Search subreddits"
                aria-label="Search subreddits"
                type="text"
                @input="onChange"
                v-model="search"
                @keydown.down="onArrowDown"
                @keydown.up="onArrowUp"
                @keydown.enter="onEnter"
        />
        <ul
                id="autocomplete-results"
                v-show="isOpen"
                class="autocomplete-results"
        >
            <li
                    v-for="(result, i) in results"
                    :key="i"
                    @click="setResult(result.name)"
                    class="autocomplete-result"
                    :class="{ 'is-active': i === arrowCounter }"
            >
                <span>{{ result.name }}</span><span class="ms-3 fst-italic">{{ result.members }} members</span>
            </li>
        </ul>
    </div>
</template>

<script>
    export default {
        name: 'Search',
        props: {
            items: {
                type: Array,
                required: false,
                default: () => [],
            },
            isAsync: {
                type: Boolean,
                required: false,
                default: false,
            },
        },
        data() {
            return {
                isOpen: false,
                results: [],
                search: '',
                isLoading: false,
                arrowCounter: -1,
            };
        },
        watch: {
            items: function (value, oldValue) {
                if (value.length !== oldValue.length) {
                    this.results = value;
                    this.isLoading = false;
                }
            },
        },
        mounted() {
            document.addEventListener('click', this.handleClickOutside)
        },
        unmounted() {
            document.removeEventListener('click', this.handleClickOutside)
        },
        methods: {
            setResult(result) {
                this.search = "";
                this.isOpen = false;
                this.$emit('redirectToSubreddit', result);
            },
            filterResults() {
                this.results = this.items.filter((item) => {
                    return item.name.toLowerCase().indexOf(this.search.toLowerCase()) > -1;
                });
            },
            onChange() {
                this.$emit('input', this.search);

                if (this.isAsync) {
                    this.isLoading = true;
                } else {
                    this.filterResults();
                    this.isOpen = true;
                }
            },
            handleClickOutside(event) {
                if (!this.$el.contains(event.target)) {
                    this.isOpen = false;
                    this.arrowCounter = -1;
                }
            },
            onArrowDown() {
                if (this.arrowCounter < this.results.length) {
                    this.arrowCounter = this.arrowCounter + 1;
                }
            },
            onArrowUp() {
                if (this.arrowCounter > 0) {
                    this.arrowCounter = this.arrowCounter - 1;
                }
            },
            onEnter() {
                this.search = this.results[this.arrowCounter];
                this.isOpen = false;
                this.arrowCounter = -1;
            },
        },
    };
</script>

<style lang="scss">

    .search-subreddits {
        width: 40vw;
        margin-top: 30px;
    }

    .autocomplete {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .autocomplete-results {
        padding: 0;
        margin: 0;
        border: 1px solid #eeeeee;
        width: 40vw;
        height: 10vh;
        overflow: auto;
        z-index: 9999;
        background-color: white;
    }

    .autocomplete-result {
        list-style: none;
        text-align: left;
        padding: 4px 2px;
        cursor: pointer;
    }

    .autocomplete-result.is-active,
    .autocomplete-result:hover {
        background-color: #4AAE9B;
        color: white;
    }

    @media screen and (max-width: 800px) {

        .search-subreddits {
            width: 90vw;
            margin-top: 30px;
        }

        .autocomplete-results {
            width: 90vw;
        }

        .form-control {
            width: 90vw;
        }
    }
</style>