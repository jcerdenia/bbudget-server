const mongoose = require('mongoose');

function setRequired(type, name) {
  return { 
    type: type,
    required: [true, `${name} is required.`]
  }
}

function setDefault(type, defaultValue) {
  return {
    type: type,
    default: defaultValue
  }
}

const userSchema = new mongoose.Schema({
  firstName: setRequired(String, 'First name'),
  lastName: setRequired(String, 'Last name'),
  email: setRequired(String, 'Email address'),
  password: setRequired(String, 'Password'),
  mobileNo: setRequired(String, 'Mobile no.'),
  categories: [{
    name: setRequired(String, 'Category name'),
    type: setRequired(String, 'Category type') 	   
  }],
  transactions: [{
    categoryName: setRequired(String, 'Category name'),
    categoryType: setRequired(String, 'Category type'),
    amount: setRequired(Number, 'Amount'),
    description: setDefault(String, null),
    balanceAfterTransaction: setRequired(Number, 'Balance'),
    dateAdded: setDefault(Date, new Date())
  }]
});

module.exports = mongoose.model('user', userSchema);