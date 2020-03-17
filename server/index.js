const express = require('express');
const cors = require('cors');
const monk = require('monk');
const Filter = require('bad-words');
const rateLimit = require('express-rate-limit');

const app = express();
const db = monk(process.env.MONGO_URI ||'localhost/twitterclone')
const tweets = db.get('tweets');
const filter = new Filter();

app.use(cors());
app.use(express.json());


app.get('/', (req,res) => {
    res.json({
        message: 'Test test'
    })
});

app.get('/tweets', (req,res) => {
    tweets
        .find()
        .then(tweets => {
            res.json(tweets);
        });
});

function isValidTweet(tweet) {
    return tweet.name && 
    tweet.name.toString().trim() !== '' &&
    tweet.content && 
    tweet.content.toString().trim() !== '';
}
//positioning rate limiting here makes it only apply to posting to the website
//app.use is not entirely asynchronous
app.use(rateLimit({
    windowMs: 60 * 1000, //1 every minute
    max: 1
}));

app.post('/tweets', (req,res) => {
    if(isValidTweet(req.body)) {
        //insert into db
        const tweet = {
            name: filter.clean(req.body.name.toString()),
            content: filter.clean(req.body.content.toString()),
            created: new Date()
        };

        tweets
            .insert(tweet)
            .then(createdTweet => {
                res.json(createdTweet)
            })
    } else {
        res.status(422);
        res.json({
            messaage: 'Name and Content required'
        })
    }
});

app.listen(5000, () =>{
    console.log('Listening on https://localhost:5000');
});

