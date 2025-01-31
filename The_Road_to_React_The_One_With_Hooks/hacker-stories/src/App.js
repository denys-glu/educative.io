import React from 'react';
import axios from 'axios';

import SearchForm from './SearchForm';
import List from './List';

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

const useSemiPersistentState = (key, initialState) => {
    const [value, setValue] = React.useState(
        localStorage.getItem(key) || initialState
    );

    React.useEffect(() => {
        localStorage.setItem(key, value);
    }, [value, key]);

    return [value, setValue];
};

const storiesReducer = (state, action) => {
    switch (action.type) {
        case 'STORIES_FETCH_INIT':
            return {
                ...state,
                isLoading: true,
                isError: false,
            };
        case 'STORIES_FETCH_SUCCESS':
            return {
                ...state,
                isLoading: false,
                isError: false,
                data: action.payload,
            };
        case 'STORIES_FETCH_FAILURE':
            return {
                ...state,
                isLoading: false,
                isError: true,
            };
        case 'STORIES_SORT':
            return {
                ...state,
                isLoading: false,
                isError: false,
                data: action.payload,
            }
        case 'REMOVE_STORY':
            return {
                ...state,
                data: state.data.filter(
                    story => action.payload.objectID !== story.objectID
                ),
            };
        default:
            throw new Error();
    }
};

const App = () => {
    const [searchTerm, setSearchTerm] = useSemiPersistentState(
        'search',
        'React'
    );

    const [url, setUrl] = React.useState(
        `${API_ENDPOINT}${searchTerm}`
    );

    const [stories, dispatchStories] = React.useReducer(
        storiesReducer,
        { data: [], isLoading: false, isError: false }
    );

    const handleFetchStories = React.useCallback(async () => {
        dispatchStories({ type: 'STORIES_FETCH_INIT' });

        try {
            const result = await axios.get(url);

            dispatchStories({
                type: 'STORIES_FETCH_SUCCESS',
                payload: result.data.hits,
            });
        } catch {
            dispatchStories({ type: 'STORIES_FETCH_FAILURE' });
        }
    }, [url]);

    React.useEffect(() => {
        handleFetchStories();
    }, [handleFetchStories]);

    const handleRemoveStory = item => {
        dispatchStories({
            type: 'REMOVE_STORY',
            payload: item,
        });
    };

    const handleSearchInput = event => {
        setSearchTerm(event.target.value);
    };

    const handleSearchSubmit = event => {
        setUrl(`${API_ENDPOINT}${searchTerm}`);

        event.preventDefault();
    };

    const sortHandler = prop => {
        console.log(prop)
        let temp; 
        if(prop === "author" || prop === "title") {
            temp = stories.data.sort(function (a, b) {
                var stringA = a[prop].toUpperCase(); // ignore upper and lowercase
                var stringB = b[prop].toUpperCase(); // ignore upper and lowercase
                if (stringA < stringB) {
                    return -1;
                }
                if (stringA > stringB) {
                    return 1;
                }

                // names must be equal
                return 0;
            })
        } else {
            temp = stories.data.sort((a, b) => a[prop] - b[prop])
        }
        dispatchStories({
            type: 'STORIES_SORT',
            payload: temp
        })
    }

    return (
        <div>
            <h1>My Hacker Stories</h1>

            <SearchForm
                searchTerm={searchTerm}
                onSearchInput={handleSearchInput}
                onSearchSubmit={handleSearchSubmit}
            />

            <hr />

            {stories.isError && <p>Something went wrong ...</p>}

            {stories.isLoading ? (
                <p>Loading ...</p>
            ) : (
                <>
                    <div>
                            <button onClick={() => sortHandler("title")}>By Title</button>
                            <button onClick={() => sortHandler("author")}>By Author</button>
                            <button onClick={() => sortHandler("points")}>By Points</button>
                            <button onClick={() => sortHandler("num_comments")}>By Comments</button>
                    </div>
                    <List list={stories.data} onRemoveItem={handleRemoveStory} />
                </>
                )}
        </div>
    );
};

export default App;

export { storiesReducer };