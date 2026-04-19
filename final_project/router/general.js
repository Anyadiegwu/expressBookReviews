const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// Register a new user
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!isValid(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered"});
        } else {
            return res.status(404).json({message: "User already exists"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user"});
});

// Get the book list available in the shop
public_users.get('/', function(req, res) {
  res.send(JSON.stringify(books, null, 4));
});

// Get the book list using async/await + Axios
public_users.get('/books-async', async function (req, res) {
    try {
      const response = await axios.get('http://localhost:5000/');
      return res.status(200).json(response.data);
    } catch (error) {
      return res.status(500).json({ 
        message: "Error fetching book list",
        error: error.message 
      });
    }
  });

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function(req, res) {
  const isbn = req.params.isbn;

  res.send(books[isbn]);
});

// Get book details based on an ISBN using async/await + Axios
public_users.get('/isbn-async/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    const url = 'http://localhost:5000/isbn/' + isbn; 

    try {
      const response = await axios.get(url);
      return res.status(200).json(response.data);
    } catch (error) {
      return res.status(500).json({ 
        message: "Error fetching book list",
        error: error.message 
      });
    }
  });

  
// Get all books based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  // Get the keys of the books object
  const keys = Object.keys(books);

  // Filter the books object to get any matches by author
  let filtered_keys = keys.filter((key) => books[key].author === author);

  // Create a new books object containing only the matches
  let filtered_books = {};
  filtered_keys.forEach((key) => {
    let book = {
        "author": books[key].author,
        "title": books[key].title,
        "reviews": books[key].reviews
    }
    filtered_books[key] = book;
  })

  res.send(filtered_books);
});

// Get all books by an author using async/await + Axios
public_users.get('/author-async/:author', async function (req, res) {
    const author = req.params.author;
    const url = 'http://localhost:5000/author/' + author; 

    try {
      const response = await axios.get(url);
      return res.status(200).json(response.data);
    } catch (error) {
      return res.status(500).json({ 
        message: "Error fetching book list",
        error: error.message 
      });
    }
  });

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;

    // Get the keys of the books object
    const keys = Object.keys(books);

    // Filter the books object to get the keys of books that match by title
    let filtered_keys = keys.filter((key) => {  
        return books[key].title === title;
    });
  
    // Create a new books object containing only the matches
    let filtered_books = {};
    filtered_keys.forEach((key) => {
      let book = {
          "author": books[key].author,
          "title": books[key].title,
          "reviews": books[key].reviews
      }
      filtered_books[key] = book;
    })
  
    res.send(filtered_books);
  });

// Get book details based on an title using async/await + Axios
public_users.get('/title-async/:title', async function (req, res) {
    const title = req.params.title;
    const url = 'http://localhost:5000/title/' + title; 

    try {
      const response = await axios.get(url);
      return res.status(200).json(response.data);
    } catch (error) {
      return res.status(500).json({ 
        message: "Error fetching book list",
        error: error.message 
      });
    }
  });

// Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    res.send(books[isbn].reviews);
  } else {
    res.json({message: "There's no match for that ISBN."});
  }

});

module.exports.general = public_users;
