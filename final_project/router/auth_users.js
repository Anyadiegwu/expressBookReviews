const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });

    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

// Check if the user with the given username and password exists
const authenticatedUser = (username, password) => {
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

// Login endpoint
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }

        return res.status(200).json({message: "User successfully logged in"});
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization.username;
  const isbn = req.params.isbn;
  const review = req.query.review;

  if (isbn) {
    // Check if this user has already submitted a review
    if (books[isbn].reviews[username]) {
        books[isbn].reviews[username] = review;
        return res.send("Your review has been updated.");
    } else {
        // This is a new review
        books[isbn].reviews[username] = review;
        return res.send({message: "Your review has been added. Thank you."});
    }
  } else {
    return res.json({ message: "Please provide an ISBN." })
  }

});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization.username;
    const isbn = req.params.isbn;
  
    if (isbn) {
        // Get all reviews for this book
        const isbn_reviews = books[isbn].reviews;

        // Filter out reviews by the currently-logged-in user
        const reviews_keys = Object.keys(isbn_reviews);
        let filtered_keys = reviews_keys.filter((key) => key !== username);

        // Create a new reviews object
        let filtered_reviews = {};
        filtered_keys.forEach((key) => {
            filtered_reviews[key] = isbn_reviews[key];
        });

        // Replace the old reviews with the filtered reviews
        books[isbn].reviews = filtered_reviews;

        res.send("Your review has been deleted");

    } else {
      return res.send("Please provide an ISBN.");
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
