const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  const errors = [];

  if (username && password) {
    if (!isValid(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registred. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  } 
  else {
    if(!username) errors.push("Username is required.");
    if(!password) errors.push("Password is required.");
    return res.status(401).json({errors});
  }
});



public_users.get('/',function (req, res) {
  let booksPromise = new Promise((resolve,reject) => resolve(books));
  booksPromise
    .then((books) => res.status(200).json(books))
    .catch((err) => res.status(401).json({error: err}));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = Number(req.params.isbn);
  let bookPromise = new Promise((resolve,reject) => resolve(books[isbn]));
  bookPromise
    .then((book) => {
      // console.log(book);
      if(!isbn) throw new Error("Invalid format of ISBN");
      if(!book) throw new Error(`No book with isbn ${isbn} found`);
      return res.status(200).json(book);
    })
    .catch((err) => {
      return res.status(400).json({err: err.message});
    });
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const author = req.params.author;
  const booksFound = [];
  for(let key in books){
    if(books[key].author === author) booksFound.push(books[key]);
  }
  let bookPromise = new Promise((resolve,reject) => resolve(booksFound));
  bookPromise
  .then((booksFound) => {
    if(!author) throw new Error("Invalid format of 'author' parameter");
    if(!booksFound || booksFound.length === 0) throw new Error(`No books by ${author} found`);
    return res.status(200).json(booksFound);
  })
  .catch((err) => {
    return res.status(400).json({error: err.message});
  });
  // if(author){
  //   const booksFound = [];
  //   for(let key in books){
  //     if(books[key].author === author) booksFound.push(books[key]);
  //   }
  //   if(booksFound.length === 0){
  //     return res
  //       .status(404)
  //       .send({ message: `Could not find any books by ${author}`});
  //   }
  //   return res.status(200).json(booksFound);
  // }
  // return res.status(401).json({message: "Something went wrong"});
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title;
  const booksFound = [];
  for(let key in books){
    if(books[key].title === title) booksFound.push(books[key]);
  }
  let bookPromise = new Promise((resolve,reject) => resolve(booksFound));
  bookPromise
  .then((booksFound) => {
    if(!title) throw new Error("Invalid format of 'title' parameter");
    if(!booksFound || booksFound.length === 0) throw new Error(`No books with the title '${title}' found`);
    return res.status(200).json(booksFound);
  })
  .catch((err) => {
    return res.status(400).json({error: err.message});
  });
  // if(title){
  //   const booksFound = [];
  //   for(let key in books){
  //     if(books[key].title === title) booksFound.push(books[key]);
  //   }
  //   if(booksFound.length === 0) {
  //     return res
  //       .status(404)
  //       .send({ message: `Could not find any books with the title ${author}`});
  //   }
  //   return res.status(200).json(booksFound);
  // }
  // return res.status(401).json({message: "Something went wrong"});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  if(isbn){
    const book = books[isbn];
    if(book) {
      const reviews = book.reviews;
      if(reviews && Object.keys(reviews).length > 0){
        return res.status(200).json(reviews);
      }
      return res.status(404).json({message: `The book with ISBN ${isbn} does not have any reviews yet`});
    }
    return res.status(404).json({error: `No book with isbn ${isbn} found`});
  }
  return res.status(401).json({error: "Invalid isbn parameter"});
});

module.exports.general = public_users;
