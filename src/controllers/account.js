const Account = require('../models/account');
const User = require('../models/user');
const {getID} = require('../controllers/user');
const Transaction = require('../models/transactions');
const axios = require("axios");
const fetch = require("node-fetch");

exports.createAccount = (req, res) => {
        let flag = true;
        let accountNumber = Math.floor(1000000000 + Math.random() * 9000000000);
        Account.findOne({accountNumber: accountNumber})
        .exec( async (error, account) => {
            if(account) {
                //make sure account number is unique
                while (flag) {
                    accountNumber = Math.floor(1000000000 + Math.random() * 9000000000);
                    Account.findOne({accountNumber: accountNumber})
                    .exec( async (error, account) => {
                        if(!account) {
                            flag = false;
                        }
                    });
                }
            };
            if (error) return res.status(400).json({
                message: error
            });
            
        let accountType = req.body.accountType;
        let accountBalance = req.body.accountBalance;

        Account
            .create({
                accountNumber: accountNumber,
                customerID: getID(req),
                accountType: accountType,
                accountBalance: accountBalance,
            }, function (err, account) {
                if (err) {
                    console.log("Error creating Account: ", err);
                    res
                        .status(400)
                        .json(err)
                } else {
                    console.log("Account Created: ", account);
                    res
                        .status(201)
                        .json(account)
                }
            })

    });
}

exports.activateAccount = (req, res) => {
    Account.findOne({accountNumber: req.body.accountNumber})
    .exec( async (error, account) => {
        if(error) return res.status(400).json({error});
        if(account) {
            account.accountStatus = req.body.accountStatus;
            account.save();
            return res.status(200).json({
                message: 'Account status updated.'
            });
        }
        else {
            return res.status(400).json({
                message: 'Account not found.'
            });
        }
    });
}

exports.withdraw = (req, res) => {
    Account.findOne({accountNumber: req.body.accountNumber})
    .exec( async (error, account) => {
        if(error) return res.status(400).json({error});
        if(account && account.accountStatus === 'active' && account.accountBalance >= req.body.amount) {
            account.accountBalance -= req.body.amount;
            account.save();
            Transaction.create({
                accountNumber: account.accountNumber,
                transactionType: 'withdraw',
                amount: req.body.amount,
                transactionDate: new Date(),
                description: 'withdraw',
                customerID: account.customerID
            });
            return res.status(200).json({
                message: 'Account balance updated.'
            });
        }
        else if (account && account.accountStatus === 'active' && account.accountBalance < req.body.amount) {
            return res.status(400).json({
                message: 'Insufficient funds.'
            });
        }
        else if (account && account.accountStatus != 'active') {
            return res.status(400).json({
                message: 'Account is not active.'
            });
        }
        else {
            return res.status(400).json({
                message: 'Account not found.'
            });
        }
    });
}

exports.recharge = (req, res) => {
    Account.findOne({accountNumber: req.body.accountNumber})
    .exec( async (error, account) => {
        if(error) return res.status(400).json({error});
        if(account && account.accountStatus === 'active') {
            account.accountBalance = parseFloat(account.accountBalance) + parseFloat(req.body.amount);
            account.save();
            Transaction.create({
                accountNumber: account.accountNumber,
                transactionType: 'deposit',
                amount: req.body.amount,
                transactionDate: new Date(),
                description: 'deposit',
                customerID: account.customerID
            });
            return res.status(200).json({
                message: 'Account balance updated.'
            });
        }
        else if (account && account.accountStatus != 'active') {
            return res.status(400).json({
                message: 'Account is not active.'
            });
        }
        else {
            return res.status(400).json({
                message: 'Account not found.'
            });
        }
    });
}

exports.sendMail = (req,res) => {
    let{
        accountNumber,
        amount,
        destinationAccountNumber} = req.body;

    let to;
    Account.findOne({accountNumber: accountNumber}).exec( async(error, account) => {
        if(error)
            return res.status(400).json({error});
        if(account){
            console.log(account);
            let id = account.customerID;
            User.findOne({_id: id}).exec(async(error, user) => {
                if(error)
                    return res.status(400).json({error});
                if(user){
                    console.log(user);
                    to = user.email;
                    console.log(user.email);
                }
            
                    
            })  
        }
    })

    console.log("yaha tak pohocha re");
    // const responseData = await axios.post(`https://prod-51.eastus.logic.azure.com:443/workflows/e49bea489ec04a19831802c4a01c5512/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=f42q2kd3-3XdDUIRElzqSH5PgLbV1hwFeQ66J6xrQbY`, {'to':to, 'subject':"test mail", 'body': "This is sample email for transaction of x rupees!"});

    fetch('https://prod-51.eastus.logic.azure.com:443/workflows/e49bea489ec04a19831802c4a01c5512/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=f42q2kd3-3XdDUIRElzqSH5PgLbV1hwFeQ66J6xrQbY',
    {
        method: 'Post',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "to":"barge237@gmail.com",
            "subject":"Money Debit Notification", 
            "body": `Dear Customer,<br>
            
            We are writing to inform you that a debit has been made from your account for the amount of Rs. ${amount}/- .<br><br>
            If you did not authorize this transaction or have any questions, please contact our customer support team immediately at<br><br>
            Phone no.: 09874563210<br>
            Email: vbanking123@gmail.com<br><br> 

            Thank you for your attention to this matter.<br><br>
            
            Sincerely,<br><br>
            
            VBank`
        })
    }).then(function (res){
        return res.text();
    })
    .then(function (json){
        console.log(json);
        res.json("Success");
    })
    .catch(error => console.log("Error!!"));

    console.log("This worked3");



    // (async () => {
    //     const rawResponse = await fetch('https://prod-51.eastus.logic.azure.com:443/workflows/e49bea489ec04a19831802c4a01c5512/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=f42q2kd3-3XdDUIRElzqSH5PgLbV1hwFeQ66J6xrQbY', {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json'
    //       },
    //       body: JSON.stringify({
    //         "to":"barge237@gmail.com",
    //         "subject":"Money Debit Notification", 
    //         "body": `Dear Customer,<br>
            
    //         We are writing to inform you that a debit has been made from your account for the amount of Rs. ${amount}/- .<br><br>
    //         If you did not authorize this transaction or have any questions, please contact our customer support team immediately at<br><br>
    //         Phone no.: 09874563210<br>
    //         Email: vbanking123@gmail.com<br><br> 

    //         Thank you for your attention to this matter.<br><br>
            
    //         Sincerely,<br><br>
            
    //         VBank`
        
    //       })
    //     });
    //     const content = await rawResponse.json();
      
    //     console.log(content);
    //   })();




    // const apiUrl = 'https://prod-51.eastus.logic.azure.com:443/workflows/e49bea489ec04a19831802c4a01c5512/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=f42q2kd3-3XdDUIRElzqSH5PgLbV1hwFeQ66J6xrQbY';
    // const params = {
    // to: 'barge237@gmail.com',
    // subject: 'test mail',
    // body: 'This is sample email for transaction of x rupees!'
    // };

    // // Make the API call using axios
    // axios.get(apiUrl, { params })
    // .then(response => {
    //     console.log(response.data);
    // })
    // .catch(error => {
    //     console.error(error);
    // });

    
}

exports.transferMoney = (req, res) => {
    Account.findOne({accountNumber: req.body.accountNumber})
    .exec( async (error, account) => {
        if(error) return res.status(400).json({error});
        if(account && account.accountStatus === 'active' && account.accountBalance >= req.body.amount) {
            Account.findOne({accountNumber: req.body.destinationAccountNumber})
            .exec( async (error, toAccount) => {
                if(error) return res.status(400).json({error});
                if(toAccount && toAccount.accountStatus === 'active') {
                    account.accountBalance -= req.body.amount;
                    toAccount.accountBalance = parseFloat(toAccount.accountBalance) + parseFloat(req.body.amount);
                    account.save();
                    toAccount.save();

                    // create transaction for source account
                    Transaction.create({
                        accountNumber: account.accountNumber,
                        transactionType: 'sent',
                        amount: req.body.amount,
                        transactionDate: new Date(),
                        description: 'Transfer to ' + toAccount.accountNumber,
                        customerID: account.customerID
                    });

                    // create transaction for destination account
                    Transaction.create({
                        accountNumber: toAccount.accountNumber,
                        transactionType: 'received',
                        amount: req.body.amount,
                        transactionDate: new Date(),
                        description: 'Transfer from ' + account.accountNumber,
                        customerID: toAccount.customerID
                    });
                    return res.status(200).json({
                        message: 'Transfer operation completed succesfully.'
                    });
                }
                else if (toAccount && toAccount.accountStatus != 'active') {
                    return res.status(400).json({
                        message: 'Destination Account is not active.'
                    });
                }
                else {
                    return res.status(400).json({
                        message: 'Destination Account not found.'
                    });
                }
            });
                        
        }
        else if (account && account.accountStatus === 'active' && account.accountBalance < req.body.amount) {
            return res.status(400).json({
                message: 'Insufficient funds.'
            });
        }
        else if (account && account.accountStatus != 'active') {
            return res.status(400).json({
                message: 'Account is not active.'
            });
        }
        else {
            return res.status(400).json({
                message: 'Account not found.'
            });
        }
    });
    // console.log("This worked2");

    let to;
    Account.findOne({accountNumber: req.body.accountNumber}).exec( async(error, account) => {
        if(error)
            return res.status(400).json({error});
        if(account){
            console.log(account);
            let id = account.customerID;
            User.findOne({_id: id}).exec(async(error, user) => {
                if(error)
                    return res.status(400).json({error});
                if(user){
                    console.log(user);
                    to = user.email;
                    console.log(user.email);
                }
            
                    
            })  
        }
    })

    // console.log("yaha tak pohocha re");
    // const responseData = await axios.post(`https://prod-51.eastus.logic.azure.com:443/workflows/e49bea489ec04a19831802c4a01c5512/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=f42q2kd3-3XdDUIRElzqSH5PgLbV1hwFeQ66J6xrQbY`, {'to':to, 'subject':"test mail", 'body': "This is sample email for transaction of x rupees!"});

    fetch('https://prod-51.eastus.logic.azure.com:443/workflows/e49bea489ec04a19831802c4a01c5512/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=f42q2kd3-3XdDUIRElzqSH5PgLbV1hwFeQ66J6xrQbY',
    {
        method: 'Post',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "to":"barge237@gmail.com",
            "subject":"Money Debit Notification", 
            "body": `Dear Customer,<br>
            
            We are writing to inform you that a debit has been made from your account for the amount of Rs. ${req.body.amount}/- .<br><br>
            If you did not authorize this transaction or have any questions, please contact our customer support team immediately at<br><br>
            Phone no.: 09874563210<br>
            Email: vbanking123@gmail.com<br><br> 

            Thank you for your attention to this matter.<br><br>
            
            Sincerely,<br><br>
            
            VBank`
        })
    }).then(function (res){
        return res.text();
    })
    .then(function (json){
        console.log(json);
        res.json("Success");
    })
    .catch(error => console.log("Error!!"));

    // console.log("This worked3");
}

//get all accounts of a user and the total balance of all accounts
exports.getUserAccounts = (req, res) => {
    let userId = getID(req);
    Account.find({customerID: userId})
    .exec( async (error, accounts) => {
        if(error) return res.status(400).json({error});
        let totalBalance = 0;
            for(let i = 0; i < accounts.length; i++) {
                totalBalance += accounts[i].accountBalance;
            }
        res.status(200).json({
            accounts,
            totalBalance: totalBalance
        })
    })
}