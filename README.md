postman collection link: https://drive.google.com/file/d/1FfgI4d8fgKHoh4N1cjZhIWEP0p3CrqWC/view?usp=drive_link

//Explanation using express for section 1 and 2
1. run npm install
2. turn on xampp (since im using mysql on sqlyog)
3. put the database name on the .env file
4. setting up the sql database and run the script which i put on the schema.sql (for manual)
5. for the automation script database, ensure all the connection is done from db connection and set the name for the database
6. then run "node initializeDb.js"
7. run npm start and you can test the code on postman (since im using nodemon so it will auto refresh if there any changes on the code)
8. for uploading file im using your xlsx from the email
