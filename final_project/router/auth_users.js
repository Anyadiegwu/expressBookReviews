const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    return username && username.length > 0;
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
    return users.some(user => user.username === username && user.password === password);
//write code to check if username and password match the one we have in records.
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Validate credentials using the authenticatedUser function
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate JWT token
    const accessToken = jwt.sign({ username: username }, "access", { expiresIn: '1h' });

    // Save token in session (Important for the auth middleware in index.js)
    req.session.authorization = {
        accessToken: accessToken
    };

    return res.status(200).json({
        message: "User logged in successfully",
        accessToken: accessToken
    });
//   return res.status(300).json({message: "Yet to be implemented"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
    const isbn = req.params.isbn;
    const reviewText = req.query.review;        
    const username = req.user.username;         
    if (!books[isbn]) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }

    if (!reviewText) {
        return res.status(400).json({ message: "Review text is required (use ?review=Your review here)" });
    }

    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    books[isbn].reviews[username] = reviewText;

    return res.status(200).json({
        message: "Review posted successfully",
        isbn: isbn,
        review: reviewText,
        postedBy: username
    });
//   return res.status(300).json({message: "Yet to be implemented"});
});
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.username;   
    if (!books[isbn]) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }

    if (!books[isbn].reviews || Object.keys(books[isbn].reviews).length === 0) {
        return res.status(404).json({ message: "No reviews found for this book" });
    }

    if (!books[isbn].reviews[username]) {
        return res.status(403).json({ 
            message: "You can only delete your own review" 
        });
    }

    delete books[isbn].reviews[username];

    return res.status(200).json({
        message: "Review deleted successfully",
        isbn: isbn,
        deletedBy: username
    });
});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
