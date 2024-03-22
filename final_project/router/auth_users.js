const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }}


const authenticatedUser = (username,password) => { //returns boolean
  const validusers = users.filter((user) => {

    return (user.username === username && user.password === password)
  });
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken,username
  }
  return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});


// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization.username;
  if(!username) return res.status(401).json({error: `Cannot find user`});
  
  const isbn = Number(req.params.isbn);
  if(!isbn) return res.send(401).json({error: "No isbn provided"});

  const review = req.query.review;
  if(!review) return res.status(401).json({error: "Add a review text to add a review"});

  const book = books[isbn];
  if(!book) return res.status(401).json({error: `Could not find book with isbn ${isbn}`});

  
  books[isbn]["reviews"][username] = review;
  return res.status(201).json(`Review: ${review} added to the ${books[isbn]["title"]} book`);
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization.username;
  if(!username) return res.status(401).json({error: `Cannot find user`});
  
  const isbn = Number(req.params.isbn);
  if(!isbn) return res.send(401).json({error: "No isbn provided"});

  const book = books[isbn];
  if(!book) return res.status(401).json({error: `Could not find book with isbn ${isbn}`});

  if(!books[isbn]["reviews"][username]){
    return res
      .status(401)
      .json({
        error: `No reviews by ${username} to the ${books[isbn]["title"]} book found`
      });
  }
  delete books[isbn]["reviews"][username];
  return res.status(201).json("Review successfully deleted");
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
