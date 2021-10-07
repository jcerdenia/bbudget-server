const User = require('../models/user');
const bcrypt = require('bcrypt');
const auth = require('../auth');
const moment = require('moment');

module.exports.register = (params) => {
  let newUser = new User({
    firstName: params.firstName,
    lastName: params.lastName,
    email: params.email,
    mobileNo: params.mobileNo,
    password: bcrypt.hashSync(params.password, 10)
  });

  return newUser
    .save()
    .then((user, error) => (error) ? false : true);
}

module.exports.emailExists = (params) => {
  return User
    .find({ email: params.email })
    .then((result) => result.length > 0 ? true : false);
}

module.exports.registerNew = (params) => {
  return this.emailExists(params)
    .then((emailExists) => (!emailExists) ? this.register(params) : false );
}

module.exports.login = (params) => {
  const { email, password } = params;
  
  return User
  .findOne({ email: email })
  .then((user) => {
    if (!user) return false;
    let passwordsMatch = bcrypt.compareSync(password, user.password);
    if (!passwordsMatch) return false;
    return { accessToken: auth.createAccessToken(user) }
  });
}

module.exports.addCategory = (params) => {
  return User
  .findById(params.userId)
  .then((user) => {
    user.categories.push({
      name: params.name,
      type: params.type
    });

    return user
      .save()
      .then((user, error) => (error) ? false : true);
  });
}

module.exports.deleteCategory = (params) => {
  return User
    .findById(params.userId)
    .then((user) => {
      user.categories.pull({ _id: params.categoryId });

      return user
        .save()
        .then((user, error) => (error) ? false : true);
  });
}

module.exports.getCategories = (params) => {
  return User
    .findById(params.userId)
    .then((user) => {
      if (typeof params.type === 'undefined') {
        return user.categories;
      } else {
        return user.categories.filter((category) => {
          return category.type.toLowerCase() === params.type.toLowerCase();
        })
      }
    });
}

module.exports.getDetails = (params) => {
  return User
    .findById(params.userId)
    .then((user) => {
      return (user) ? { email: user.email } : false;
    });
}

module.exports.addRecord = (params) => {
  return User
    .findById(params.userId)
    .then((user) => {
      let balanceAfterTransaction = 0;
      const transactions = user.transactions;
      
      if (transactions.length !== 0) {
        const balanceBeforeTransaction = transactions[transactions.length - 1].balanceAfterTransaction;
        if (params.categoryType.toLowerCase() === 'income') {
          balanceAfterTransaction = balanceBeforeTransaction + params.amount;
        } else {
          balanceAfterTransaction = balanceBeforeTransaction - params.amount;
        }
      } else {
        balanceAfterTransaction = params.amount;
      }

      user.transactions.push({
        categoryName: params.categoryName,
        categoryType: params.categoryType,
        amount: params.amount,
        description: params.description,
        balanceAfterTransaction: balanceAfterTransaction
      });

      return user
        .save()
        .then((user, error) => (error) ? false : true);
    });
}

module.exports.deleteRecord = (params) => {
  return User
    .findById(params.userId)
    .then((user) => {
      // Save references to record and index matching user Id.
      let recordToDelete = null;
      let indexToDelete = null;
      for (i in user.transactions) {
        if (user.transactions[i]._id == params.recordId) {
          indexToDelete = i;
          recordToDelete = user.transactions[i];
          break;
        }
      }

      if (recordToDelete !== null) {
        // If type is income, subtract amount from each remaining record. Otherwise, add.
        if (recordToDelete.categoryType.toLowerCase() === 'income') {
          for (let i = indexToDelete + 1; i < user.transactions.length; i++) {
            user.transactions[i].balanceAfterTransaction -= recordToDelete.amount;
          }
        } else {
          for (let i = indexToDelete + 1; i < user.transactions.length; i++) {
            user.transactions[i].balanceAfterTransaction += recordToDelete.amount;
          }
        }

        user.transactions.pull({ _id: params.recordId }) // Delete record from user.
        // Save changes.
        return user
          .save()
          .then((user, error) => (error) ? false : true);
      } else {
        return false;
      }
    });
}

module.exports.getRecords = (params) => {
  return User
    .findById(params.userId)
    .then((user) => {
      return (user) ? user.transactions : false;
    })
}

module.exports.getRecordsBreakdownByRange = (params) => {
  return User
    .findById(params.userId)
    .then((user) => {
      const summary = user.categories.map((category) => {
        return { categoryName: category.name, totalAmount: 0 }
      });

      if (params.fromDate == '') {
        params.fromDate = user.transactions[0].dateAdded;
      }

      if (params.toDate == '') {
        params.toDate = user.transactions[user.transactions.length - 1].dateAdded;
      }

      user.transactions.filter((transaction) => {
        const isSameOrAfter = moment(transaction.dateAdded).isSameOrAfter(params.fromDate, 'day');
        const isSameOrBefore = moment(transaction.dateAdded).isSameOrBefore(params.toDate, 'day');

        if (isSameOrAfter && isSameOrBefore) {
          for (let i = 0; i < summary.length; i++) {
            if (summary[i].categoryName === transaction.categoryName) {
              summary[i].totalAmount += transaction.amount
            }
          }
        }
      })

      return summary;
    });
}

module.exports.getIncomeByMonth = (params) => {
  return getBreakdownByType('income', params);
}

module.exports.getExpensesByMonth = (params) => {
  return getBreakdownByType('expense', params);
}

function getBreakdownByType(type, params) {
  return User
    .findById(params.userId)
    .then((user) => {
      const months = [];
      for (transaction of user.transactions) {
        const month = moment(transaction.dateAdded).format('MMMM YYYY');
        if (!months.includes(month)) months.push(month);
      }
      
      const monthlyBreakdown = [];
      for (month of months) {
        let monthlyTotal = 0;
        for (transaction of user.transactions) {
          if (moment(transaction.dateAdded).format('MMMM YYYY') == month 
            && transaction.categoryType.toLowerCase() == type.toLowerCase()) {
            monthlyTotal += transaction.amount; 
          }
        }

        monthlyBreakdown.push({
          month: month,
          total: monthlyTotal 
        })
      }

      return monthlyBreakdown;
    });
}

module.exports.getBalanceTrendByRange = (params) => {
  return User
    .findById(params.userId)
    .then((user) => {
      if (params.fromDate == '') {
        params.fromDate = user.transactions[0].dateAdded;
      }

      if (params.toDate == '') {
        params.toDate = user.transactions[user.transactions.length - 1].dateAdded;
      }
      
      return user.transactions.filter((transaction) => {
        const isSameOrAfter = moment(transaction.dateAdded).isSameOrAfter(params.fromDate, 'day');
        const isSameOrBefore = moment(transaction.dateAdded).isSameOrBefore(params.toDate, 'day');
        return isSameOrAfter && isSameOrBefore;
      })
      .map((transaction) => {
        return {
          balance: transaction.balanceAfterTransaction,
          date: moment(transaction.dateAdded).format('l')
        }
      });
    });
}