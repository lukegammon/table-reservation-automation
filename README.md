Automated table availability for a popular table reservation platform

This is a JavaScript project I put together for a friend.

Instead of constantly refreshing the website in order to find a table at particular time and date he wanted an automated solution.

What i used to achieve this:

- JavaScript
- Puppetteer as the dynamic web scraper
- nodemailer to send an email once a table is available

This works by:

- Searching the original url for when a table becomes available
- If table is not available repeat function after X minutes
- If table is available send and email and stop the function from repeating
