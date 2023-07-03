const connect = require('./db')

connect.find()
    .then(res=> {
    console.log("Success deleting all");
    })
    .catch((error) => {
        console.log("Error deleting:", error);
    });