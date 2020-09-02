const express = require('express')
const logger = require('../logger')
const { v4: uuid } = require('uuid')
const { bookmarks } = require('../store')

const bookmarksRouter = express.Router()
const bodyParser = express.json()

bookmarksRouter
    .route('/bookmarks')
    .get((req, res) => {
        res.json(bookmarks);
    })
    .post(bodyParser, (req, res) => {
        const { title, url, description, rating } = req.body;

        if (!title) {
            logger.error(`Bookmark title is required`);
            
            return res
                .status(400)
                .send('Invalid data');
        }
        
        if (!url) {
            logger.error(`Bookmark url is required`);
           
            return res
                .status(400)
                .send('Invalid data');
        }

        if (!rating) {
            logger.error(`Bookmark rating is required`);
           
            return res
                .status(400)
                .send('Invalid data');
        }

        const coercedNumRating = Number(rating);

        if (isNaN(coercedNumRating)) {
            logger.error(`Bookmark rating passed in was not a number and could not be coerced into a number`);
           
            return res
                .status(400)
                .send('Invalid data on rating');
        }

        // get an id
        const id = uuid();

        const newBookmark = {
            id,
            title,
            url,
            description,
            number: coercedNumRating
        };

        bookmarks.push(newBookmark);

        logger.info(`Bookmark with id ${id} created`);

        res
            .status(201)
            .location(`http://localhost:8000/bookmarks/${id}`)
            .json(newBookmark);
    })

bookmarksRouter
    .route('/bookmarks/:id')
    .get((req, res) => {
        const { id } = req.params;
        const bookmark = bookmarks.find(b => b.id == id);

        // make sure we found a card
        if (!bookmark) {
            logger.error(`Bookmark with id ${id} not found.`);
            return res
            .status(404)
            .send('Bookmark Not Found');
        }

        res.json(bookmark);
    })
    .delete((req, res) => {
        const { id } = req.params;

        const bookmarkIndex = bookmarks.findIndex(b => b.id == id);

        if (bookmarkIndex === -1) {
            logger.error(`Bookmark with id ${id} not found.`);
            return res
            .status(404)
            .send('Not found');
        }

        bookmarks.splice(bookmarkIndex, 1);

        logger.info(`Bookmark with id ${id} deleted.`);

        res
            .status(204)
            .end();
    })

module.exports = bookmarksRouter