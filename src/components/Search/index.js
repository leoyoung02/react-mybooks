// External Dependencies
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

// Our Dependencies
import * as BooksAPI from '../../BooksAPI';
import { getSuggetions } from '../../util/search';
import BookList from '../BookList';

export default class Search extends Component {
  static propTypes = {
    onBackClick: PropTypes.func.isRequired,
    isFetching: PropTypes.bool.isRequired,
    onShelfChange: PropTypes.func.isRequired,
    books: PropTypes.array.isRequired,
    onBookClick: PropTypes.func.isRequired,
  }

  state = {
    query: '',
    isSearching: false,
    results: [],
  }
  
  // istanbul ignore next
  componentDidMount() {
    const { lastQuery } = localStorage;
    if (lastQuery) {
      this.updateQuery(lastQuery);
    }
  }

  componentWillReceiveProps =({ books }) => {
    const clonedResults = _.cloneDeep(this.state.results);
    books.forEach(b => {
      clonedResults.forEach((r, i, arr) => {
        if (r.id === b.id) {
          arr[i].shelf = b.shelf;
        }
      })
    });
    this.setState({ results: clonedResults });
  }

  updateQuery = (query) => {
    this.setState({ query });

    // Store query so it can be retrieved
    // when the back arrow is clicked
    // from the BookDetail screen
    localStorage.lastQuery = query;

    // If query is empty do
    // not send an API request
    if (query.trim().length > 0) {
      this.setState({ isSearching: true });
      
      BooksAPI.search(query).then(resp => {
        let results = [];
    
        // Only set state if resp is an array
        // since the endpoint returns undefined 
        // and an error object as well
        if (Array.isArray(resp)) {
          const { books } = this.props;

          // istanbul ignore next
          books.forEach(b => {
            resp.forEach((r, i, arr) => {
              if (r.id === b.id) {
                arr[i].shelf = b.shelf;
              }
            })
          });
          results = resp;
        }
        this.setState({ results, isSearching: false });
      })
    } else {
      this.setState({ results: [] });
    }
  }

  render() {
    const { query, results, isSearching } = this.state;
    const { onBackClick, onShelfChange, isFetching, onBookClick } = this.props;
    const suggestions = getSuggetions();

    return (
      <div>
        <div className="search-books">
          <div className="search-books-bar">
            <a className="close-search" onClick={() => onBackClick()}>Close</a>
            <div className={isSearching ? "animated loading-bar" : ""}></div>
            <div className="search-books-input-wrapper">
              <input
                type="text"
                placeholder="Search by Title or Author"
                value={query}
                onChange={(e) => this.updateQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="search-books-results">

             {/*  
              If results were returned and something
              was searched for show the following
             */}

             { !!results.length && 
               !!query.length && ( 
                <ol className="books-grid">
                  <BookList 
                    onShelfChange={onShelfChange}
                    books={results}
                    isFetching={isFetching}
                    onBookClick={onBookClick}
                  />
                </ol>
             )} 

             {/*  
              If no results were returned,
              we are not currently searching
              and text has been typed in the 
              search box then display the following
             */}
            { !results.length && 
              !isSearching &&
              !!query.length && (
                <div className="search-not-found">
                  <h2>Could not find anything 😣</h2>
                  <div>Try search for 
                    <strong> {suggestions[0]} </strong> or 
                    <strong> {suggestions[1]} </strong>
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>
    )
  }
}