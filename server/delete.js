const connect = require('./db')

connect.deleteMany()
    .then(res=> {
    console.log("Success deleting all");
    })
    .catch((error) => {
        console.log("Error deleting:", error);
    });