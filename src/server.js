//THIS FILE IS THE ENTRY POINT OF OUR APP

import express from "express";
import bodyParser from "body-parser";
import { MongoClient } from "mongodb";  //this allows us to connect our local database
import path from 'path';


// const articlesInfo = {
//     'learn-react': {
//         upvotes: 0,
//         comments: [],
//     },
//     'learn-node': {
//         upvotes: 0,
//         comments: [],
//     },
//     'my-thoughts-on-resumes': {
//         upvotes: 0,
//         comments: [],
//     },
// }



//this is our backend app. So now we have our app object & we can define different endpoints for our app. 
const app = express();

app.use(express.static(path.join(__dirname, '/build')));

app.use(bodyParser.json());


//WHENEVER WE WANT TO DEFINE THE ENDPOINTS THAT NEEDS TO USE THE DATABASE, WE DON'T HAVE TO DO ALL THE SET UP OF THE CODE.
//WE CAN JUST WRAP WHATEVER THE OPERATIONS WE WANT TO MAKE INSIDE THIS 'withDB' FUNCTION 
const withDB = async (operations, res) => {       //this "operations" is a function
    try{
        //let's come & connect to the database 
        const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true});
        const db = client.db('my-app');  // SO NOW WE CAN QUERY THE DATABASE

        await operations(db); 

        client.close();
    } catch (error) { 
        //500 is the response for internal server error
        res.status(500).json({ message: 'Error connecting to db', error });
    }
}



//this is an endpoint to fetch the data of articles from the backend. Article details are now in the database since 
//we have inserted to 'articles' db
app.get('/api/articles/:name' , async (req, res) => {

    withDB( async (db) => {
        //this is the function passed as the "operations" argument to the withDB function
        const articleName = req.params.name;

        const articleInfo = await db.collection('articles').findOne({ name: articleName });
        res.status(200).json(articleInfo);
    }, res);

});



//this is an endpoint to fetch the data of articles from the backend. Article details are now in the database since
//we have inserted to 'articles' db
// app.get('/api/articles/:name' , async (req, res) => {
//     try{
//         const articleName = req.params.name;

//         //let's come & connect to the database 
//         const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true});
//         const db = client.db('my-app');  // SO NOW WE CAN QUERY THE DATABASE

//         const articleInfo = await db.collection('articles').findOne({ name: articleName });
//         res.status(200).json(articleInfo);

//         client.close();
//     } catch (error) { 
//         //500 is the response for internal server error
//         res.status(500).json({ message: 'Error connecting to db', error });
//     }
// });



app.get('/hello' , (req , res) => res.send('Hello!'));
app.get('/hello/:name', (req, res) => res.send(`Hello ${req.params.name}`));
app.post('/hello', (req , res) => res.send(`Hello ${req.body.name}! Your are ${req.body.age} years old now`));




//this is an endpoint to increase the votes of articles from the backend. Article details are now in the database since
//we have inserted to 'articles' db
app.post('/api/articles/:name/upvote', async (req, res) => {
    withDB(async (db) => {
        //this is the function passed as the "operations" argument to the withDB function
        const articleName = req.params.name;

        const articleInfo = await db.collection('articles').findOne({ name: articleName});
        await db.collection('articles').updateOne(
            { name: articleName }, 
            { '$set' : {upvotes: articleInfo.upvotes + 1} }
        );

        const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName});

        res.status(200).json(updatedArticleInfo);
    }, res);

});  




// //this is an endpoint to increase the votes of articles from the backend. Article details are now in the database since
// //we have inserted to 'articles' db
// app.post('/api/articles/:name/upvote', async (req, res) => {
//     try{
//         const articleName = req.params.name;

//         //let's come & connect to the database 
//         const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true});
//         const db = client.db('my-app');  // SO NOW WE CAN QUERY THE DATABASE

//         const articleInfo = await db.collection('articles').findOne({ name: articleName});
//         await db.collection('articles').updateOne(
//             { name: articleName }, 
//             { '$set' : {upvotes: articleInfo.upvotes + 1} }
//         );
        
//         const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName});

//         res.status(200).json(updatedArticleInfo);
  
//         client.close();
//     }
//     catch(error) {
//         //500 is the response for internal server error
//         res.status(500).json({ message: 'Error connecting to db', error });
//     }
// });  


  



//this is an endpoint to decrease the votes of articles from the backend. Article details are now in the database since
//we have inserted to 'articles' db
app.post('/api/articles/:name/devote', async (req, res) => {
    try{
        const articleName = req.params.name;

        //let's come & connect to the database 
        const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true});
        const db = client.db('my-app');  // SO NOW WE CAN QUERY THE DATABASE

        const articleInfo = await db.collection('articles').findOne({ name: articleName});
        await db.collection('articles').updateOne(
            { name: articleName }, 
            { '$set' : {upvotes: articleInfo.upvotes - 1} }
        );
        
        const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName});

        res.status(200).json(updatedArticleInfo);
  
        client.close();
    }
    catch(error) {
        //500 is the response for internal server error
        res.status(500).json({ message: 'Error connecting to db', error });
    }
}); 




  
app.post('/api/articles/:name/add-comment', (req, res) => {
    const { username , text } = req.body;
    const articleName = req.params.name;

    withDB(async (db) => {
        const articleInfo = await db.collection('articles').findOne({ name : articleName });
        await db.collection('articles').updateOne(
            { name: articleName }, 
            { '$set' : { comments : articleInfo.comments.concat({ username, text }), } }
        );
        
        const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName });

        res.status(200).json(updatedArticleInfo);
    }, res);  
});



// app.post('/api/articles/:name/add-comment', (req, res) => {
//     const { username , text } = req.body;
//     const articleName = req.params.name;

//     articlesInfo[articleName].comments.push({ username, text});

//     res.status(200).send(articlesInfo[articleName]);
// });



app.get('*', (req , res) => {
    res.sendFile(path.join(__dirname + '/build/index.html'));
});



app.listen(8000 , () => console.log('Listening on port 8000'));   



