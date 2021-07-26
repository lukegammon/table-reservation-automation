const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');
require('dotenv').config()
async function getAvailability() {
    const date = "2021-08-08"; // YYYY-MM-DD
    const hour = "15"; // Hour table is needed
    const URL = `https://www.opentable.co.uk/r/the-ivy-exeter?corrid=812656ee-0181-4506-8e7c-1c67b55eb207&avt=eyJ2IjoyLCJtIjowLCJwIjowLCJzIjowLCJuIjowfQ&p=2&sd=${date}T${hour}%3A00%3A00`
    const browser = await puppeteer.launch({ headless: false }); // For test disable the headless mode,
    const page = await browser.newPage();
    await page.setViewport({ width: 1000, height: 926 });
    await page.goto(URL, { waitUntil: 'networkidle2' });
    console.log("Searching for table availability...");
    const services = await page.evaluate(() =>
        Array.from(
            document.querySelectorAll('._8a6d6d85 span'),
            (element) => element.innerHTML
        )
    )
    // Availability needs to be between 15:00 and 17:00 so if result need to start with (15 or 16).  
    const firstHour = 15; // Availability any time during hour of 15:00
    const secondHour = 16;// Availability any time during hour of 16:00
    const result = services.filter(time => time.startsWith(firstHour) || time.startsWith(secondHour));
    await page.close();
    await browser.close();
    if(result.length) {
        // Send Email as Table is available between specified times
        sendEmail(result);
        console.log(result);
        return true;
    }
    return false;
}

function sendEmail(result) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SENDERS_EMAIL, // Senders Gmail Username (Do Not Hardcode)
          pass: process.env.SENDERS_PASSWORD // Senders Gmail Password (Do Not Hardcode)
        }
      });
      
      const mailOptions = {
        from: process.env.SENDERS_EMAIL, // Senders Gmail Username (Do Not Hardcode)
        to: process.env.RECIPIENTS_EMAIL, // Recipients Gmail Username (Do Not Hardcode)
        subject: 'Possible Booking Time Available',
        text: `Booking Times Available at: ${result}`
      };
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}

// Run getAvailibility() every X milliseconds to auto search until booking timeslot is found
const searchInterval = 10000;
const repeater = setInterval(async () => {
    const isTable = await getAvailability();
    if(isTable) {
      clearInterval(repeater);
    }
}, 10000);
