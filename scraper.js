const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const Discord = require('discord.js');
const fetch = require('node-fetch');
const chalk = require('chalk');

const {LOGIN_USERNAME, LOGIN_PASSWORD, WEBHOOK_ID, WEBHOOK_TOKEN, JSON_URL } = require('./config.js');
const { getNewsEmbed } = require('./utils/embeds.js');

////////////////////////////////////////////////////

// The url from which it scrapes and the webhook client that it will eventually send the data to
const url = "https://www.fit.ba/student/login.aspx";
const webhookClient = new Discord.WebhookClient(WEBHOOK_ID, WEBHOOK_TOKEN);

// Async function to handle logging into the site through the Puppeteer browser
async function pageLogin(page) {
    try {
        await page.goto(url);
    } catch (error) {
        console.log(chalk.red("(SCRAPER): " + error));
        return false;
    }
    
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
        
        console.log(chalk.green("(SCRAPER): Logged in succesfully."))
        return true;
    } catch (error) {
        console.log(chalk.red("(SCRAPER): " + error));
        return false;
    }
}

// Here, using the Cheerio library, we extract the HTML elements we need, parse them as strings and pass into the news object
async function Scraper() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox','--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    var logged = false;

    while (logged == false) {
        logged = await pageLogin(page);
        if (logged) {
            break;
        }
        await sleep(300000);
    }
    
    while (logged == true) {
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

        if (await checkLast(titleTag) != false && titleTag != "") {
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
        
        try {
            await sleep(300000);
            await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
            
        } catch (error) {
            console.log(chalk.red("(SCRAPER): " + error));
            return null;
        }
    }
}

// Simple sleep function in ms
function sleep(ms) {
    console.log(chalk.yellow("(SCRAPER): Sleeping for " + ms));
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Creates a Discord Embed and fills it with the scraped data then makes a HTTP request to the webhook in order to post the embed
function sendMessage(news) {
    console.log(chalk.green("(SCRAPER): Sending new post..."));
    webhookClient.send('', {
        embeds: [getNewsEmbed(news)],
    });
}

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
            console.log(chalk.green('(SCRAPER): Posted new title to JSON:', titleTag));
        })
        .catch((error) => {
            console.error(chalk.red('(SCRAPER):', error));
        });
}

async function checkLast(titleTag) {
    
    try {
        var response = await fetch(JSON_URL);
        var obj = await response.json();
    } catch (error) {
        console.error(chalk.red("(SCRAPER): " + error));
    }

    if (obj.title == titleTag) {
        return false;
    }

    return true;
}

module.exports.Scraper = Scraper;