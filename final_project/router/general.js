const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ 
            message: "Username and password are required" 
        });
    }

    const userExists = users.some(user => user.username === username);

    if (userExists) {
        return res.status(409).json({ 
            message: `User with username '${username}' already exists` 
        });
    }

    users.push({
        username: username,
        password: password  
    });

    return res.status(201).json({ 
        message: `User '${username}' registered successfully!` 
    });
//   return res.status(300).json({message: "Yet to be implemented"});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        const getBooks = () => {
            return new Promise((resolve, reject) => {
                resolve(books);
            });
        };

        const bookList = await getBooks();
        res.status(200).send(JSON.stringify(bookList, null, 4));
    } catch (error) {
        res.status(500).json({ message: "Error retrieving book list" });
    }
});

// Get book details based on ISBN
// Task 11: Get book details based on ISBN using Async-Await
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;

    try {
        const fetchBookByIsbn = (isbn) => {
            return new Promise((resolve, reject) => {
                const book = books[isbn];
                if (book) {
                    resolve(book);
                } else {
                    reject({ status: 404, message: `Book with ISBN ${isbn} not found` });
                }
            });
        };

        const bookDetails = await fetchBookByIsbn(isbn);
        
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).send(JSON.stringify(bookDetails, null, 4));

    } catch (error) {
        return res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
    }
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const author = req.params.author;   
    let booksByAuthor = [];

    Object.keys(books).forEach((isbn) => {
        if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
            booksByAuthor.push(books[isbn]);
        }
    });

    if (booksByAuthor.length > 0) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(booksByAuthor, null, 4));  
    } else {
        return res.status(404).json({ 
            message: `No books found by author: ${author}` 
        });
    }
//   return res.status(300).json({message: "Yet to be implemented"});
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title;   
  let booksByTitle = [];

  Object.keys(books).forEach((isbn) => {
      if (books[isbn].title.toLowerCase() === title.toLowerCase()) {
          booksByTitle.push(books[isbn]);
      }
  });

  if (booksByTitle.length > 0) {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(booksByTitle, null, 4));   
  } else {
      return res.status(404).json({ 
          message: `No books found by author: ${title}` 
      });
  }
//   return res.status(300).json({message: "Yet to be implemented"});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
//   Write your code here
const isbn = req.params.isbn;

    if (books[isbn]) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(books[isbn].reviews, null, 4));
    } else {
        return res.status(404).json({ 
            message: `Book with ISBN ${isbn} not found` 
        });
    }
//   return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.general = public_users;
