# Movie Watchlist Site

This is a Node.js web application built using Express and MongoDB. Follow the
steps below to install dependencies and run the project.
<br>
1. Install required packages if not using JSON (make sure to delete):
&emsp;npm install express
&emsp;npm install mongodb

&emsp;If using the JSON do:
&emsp;npm install
<br><br>
2. Make sure mongoDB is installed:
[https://www.mongodb.com/try/download/shell](https://www.mongodb.com/try/download/community)
&emsp;mongodb.com/try/download/shell

&emsp;Then run mongod to start MongoDB shell. NOTE: you may have to add to PATH:
&emsp;C:\Program Files\MongoDB\Server\[version]\bin
<br>
&emsp;NOTE: may have to create folder to store databases as it may not be automatically created
&emsp;If so, do this:
&emsp;mkdir \data\db
<br>
&emsp;The path should be C:\data\db

&emsp;NOTE: this was done on a Windows system. MacOS or Linux may differ
<br><br>
3. Start the server:
node server.js
The application will run at http://localhost:8080
