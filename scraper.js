const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const Discord = require('discord.js');
const fetch = require('node-fetch');

const {LOGIN_USERNAME, LOGIN_PASSWORD, BACKGROUND_IMAGE, WEBHOOK_ID, WEBHOOK_TOKEN, JSON_URL } = require('./config.js');

////////////////////////////////////////////////////

// The url from which it scrapes and the webhook client that it will eventually send the data to
const url = "https://www.fit.ba/student/login.aspx";
const webhookClient = new Discord.WebhookClient(WEBHOOK_ID, WEBHOOK_TOKEN);

// Async function to handle logging into the site through the Puppeteer browser
async function pageLogin(page) {
    await page.goto(url);
    
    // Try-catches the login process
    try {
        await Promise.all([
            page.waitForSelector('[name="txtBrojDosijea"]'),
            page.waitForSelector('[name="txtLozinka"]'),
            page.waitForSelector('[name="btnPrijava"]'),
        ]);
        
        await page.type('[name="txtBrojDosijea"]', LOGIN_USERNAME);
        await page.type('[name="txtLozinka"]', LOGIN_PASSWORD);
        
        await Promise.all([
            page.waitForNavigation({
                waitUntil: 'load',
            }),
            await page.click('[name="btnPrijava"]'),
        ]);
        
        return console.log("SCRAPER: Logged in succesfully.");
    } catch (error) {
        console.log("SCRAPER Error: " + error);
        return null
    }
}

// Here, using the Cheerio library, we extract the HTML elements we need, parse them as strings and pass into the news object
async function Scraper() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox','--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    await pageLogin(page);
    
    while (true) {
        const content = await page.content();
        const $ = cheerio.load(content);
        const news = {
            title: "",
            url: "",
            date: "",
            subject: "",
            author: "",
            description: ""
        }
        
        const titleTag = $("#lnkNaslov").slice(0,1).text();

        // Scrapes the last news post and stores it into the news object
        if (await checkLast(titleTag) != false) {
            $('.newslist').slice(0, 1).each(function() {
                const title = $(this).find('#lnkNaslov').text();
                const url = $(this).find('#lnkNaslov').attr('href');
                const date = $(this).find('#lblDatum').text();
                const subject = $(this).find('#lblPredmet').text();
                const author = $(this).find('#HyperLink9').text();
                const description = $(this).find('.abstract').text();
                
                news.title = title;
                news.url = url;
                news.date = date;
                news.subject = subject;
                news.author = author;
                news.description = description;
            })
            
            sendMessage(news);
        }

        await writeData(titleTag);
        
        // Sleeps the function for 5 minutes and then reloads the browser to scrape again
        try {
            await sleep(300000);
            await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
            
        } catch (error) {
            console.log(error);
        }
    }
}

// Simple sleep function in ms
function sleep(ms) {
    console.log("SCRAPER: Sleeping for " + ms);
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Creates a Discord Embed and fills it with the scraped data then makes a HTTP request to the webhook in order to post the embed
function sendMessage(news) {

    // 03.07.2021 10:25
    try {
        var day = news.date.substr(0,2);
        var month = news.date.substr(3,2);
        var year = news.date.substr(6,4);
        var hour = news.date.substr(11, 2);
        var minute = news.date.substr(14, 2);
    } catch (error) {
        console.log("SCRAPER Error: " + error);
    }
    
    const dFormat = `${day}.${month}.${year} ${hour}:${minute}`;

    const newsEmbed = new Discord.MessageEmbed()
        .setTitle(news.title)
        .setURL(`https://www.fit.ba/student/${news.url}`)
        .setAuthor(news.author)
        .setDescription(news.description)
        .setThumbnail(BACKGROUND_IMAGE)
        .setFooter(`Roku - ${dFormat}`, '');

    console.log("SCRAPER: Sending new post...");
    webhookClient.send('@everyone', {
        embeds: [newsEmbed],
    });
}

// Simply posts the latest news title to a JSON file
async function writeData(titleTag) {
    const payload = {
        title: titleTag
    }

    fetch(JSON_URL, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })
        .then(response => response.json())
        .then(payload => {
            console.log('Posted new title to JSON:', payload);
        })
        .catch((error) => {
            console.error('SCRAPER Error:', error);
        });
}

// Checks if the newest scraped title is identical to the posted one, to verify if it is a new news post
async function checkLast(titleTag) {
    
    try {
        var response = await fetch(JSON_URL);
        var obj = await response.json();
    } catch (error) {
        console.error("SCRAPER Error: " + error);
    }

    if (obj.title == titleTag) {
        return false;
    }

    return true;
}

module.exports.Scraper = Scraper;