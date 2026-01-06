const express = require('express');
const router = express.Router();
const Post = require ('../models/Post');


// Get / Home

router.get('', async (req,res)=>{
    try{
        const locals = {
        title: "NodeJs Blog",
        description: "Simple Blog created with NodeJs, Express & MongoDb."
        }
    // blog post to be displayed per page
    let perPage = 6;
    let page = req.query.page || 1;

    const data = await Post.aggregate([ {$sort: {createdAt: -1}}])
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec();

    const count = await Post.countDocuments();
    const nextPage = parseInt(page)+1;
    const hasNextPage = nextPage <= Math.ceil(count/perPage);

    res.render('index',{
        locals,
        data,
        current: page,
        nextPage: hasNextPage ? nextPage : null,
        currentRoute: '/'
    });

    }catch(error){
        console.log(error);
    }

});

// Search bar

router.post('/search', async (req,res)=>{

    try {
        const locals = {
        title: "Search",
        description: "Simple Blog created with NodeJs, Express & MongoDb."
        }

        let searchTerm = req.body.searchTerm;
        // remove all special characters
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g,"")


        const data = await Post.find({
            $or: [
                {title: {$regex: new RegExp(searchNoSpecialChar,'i') }},
                {body: {$regex: new RegExp(searchNoSpecialChar,'i') }}
            ]
        });
        res.render("search",{
            data,
            locals
        });
    } catch (error) {
        console.log(error);
    }
});

// Get post details

router.get('/post/:id', async (req,res)=>{
    try {
        let slug = req.params.id;

        const data = await Post.findById({_id:slug});

        const locals = {
        title: data.title,
        description: "Simple Blog created with NodeJs, Express & MongoDb.",

        }

        res.render('post',{locals,data,currentRoute: `/post/${slug}`});
    } catch (error) {
        console.log(error);
    }
});

// about

router.get('/about',(req,res)=>{
    res.render('about',{
        currentRoute:'/about'});
});

// contact
router.get('/contact',(req,res)=>{
    res.render('contact',{
        currentRoute:'/contact'});
});





module.exports=exports = router;


// test data

// function insertPostData(){
//     Post.insertMany([
//         {
//             title: "Building a Blog",
//             body: "There are many steps in building a blog"
//         },

//         {
//             title: "Memoirs of an Engineer",
//             body: "Every failure is a recipe for success"
//         },

//         {
//             title: "Automation Pitfalls",
//             body: "For 24/7 operations, don't touch heap"
//         },
//     ])
// }


// old stuff

// router.get('', async (req,res)=>{
//     const locals = {
//         title: "NodeJs Blog",
//         description: "Simple Blog created with NodeJs, Express & MongoDb."
//     }

//     try {
//         const data = await Post.find();
//         res.render('index',{locals,data});
//     } catch (error) {
//         console.log(error);
//     }

//     res.render('index',{locals});
// });
