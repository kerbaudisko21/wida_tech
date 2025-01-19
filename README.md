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

//Explanation for section 3 problem solving
To solve this problem, I used the backtracking algorithm. Backtracking is an effective algorithmic technique for solving problems where we need to explore all possible solutions. Here's a breakdown of the steps involved in the solution:

1. Backtracking Function: We define a function named combination() that will be responsible for exploring all valid combinations of digits. This function will take several arguments:

    nums: The list of digits to choose from, which is [1, 2, 3, ..., 9].
    target: The remaining sum we need to reach (initially, it's the total sum t).
    length: The length of the combination we are trying to build.
    start: The index in nums from where we should begin selecting digits.   
    curr: The current combination being built.

2. Base Case: The base case for the recursion is when the length of the current combination curr is equal to l and the sum of the digits in curr equals the target sum t. If both conditions are met, we know we've found a valid combination, so we add it to the res list.

3. Exploration: The function will iterate over the digits in nums, starting from the start index. At each step, it checks if the current digit is less than or equal to the remaining target sum. If this condition is satisfied, we add the digit to the current combination (curr) and recursively call the combination() function to continue exploring further combinations.

4. Backtracking: After exploring all possibilities with the current digit, we need to backtrack. This is done by removing the last digit from curr using curr.pop(), which ensures we can try different combinations by excluding the current digit and exploring the next one.