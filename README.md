# Movie Watchlist Site

This is a Node.js web application built using Express and MongoDB. Follow the
steps below to install dependencies and run the project.
1. Install required packages if not using JSON (make sure to delete):
npm install express
npm install mongodb

If using the JSON do:
npm install

2. Make sure mongoDB is installed:
[https://www.mongodb.com/try/download/shell](https://www.mongodb.com/try/download/community)
  mongodb.com/try/download/shell

Then run mongod to start MongoDB shell. NOTE: you may have to add to PATH:
C:\Program Files\MongoDB\Server\[version]\bin

NOTE: may have to create folder to store databases as it may not be automatically created
If so, do this:
mkdir \data\db

The path should be C:\data\db

NOTE: this was done on a Windows system. MacOS or Linux may differ

3. Start the server:
node server.js
The application will run at http://localhost:8080
