const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

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
        // We call our own internal data structure or local endpoint
        const response = await axios.get("http://localhost:5000/"); 
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching book list" });
    }
});

public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
        const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(404).json({ message: "Book not found" });
    }
});

public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
        const response = await axios.get(`http://localhost:5000/author/${author}`);
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(404).json({ message: "Author not found" });
    }
});

public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
    try {
        const response = await axios.get(`http://localhost:5000/title/${title}`);
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(404).json({ message: "Title not found" });
    }
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
