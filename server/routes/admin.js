const express = require('express');
const router = express.Router();
const Post = require ('../models/Post');
const User = require ('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;

// Admin - Check Login (Guard)

const authMiddleware = async (req,res, next) => {
    const token = req.cookies.token;
    if (!token){
        // return res.status(401).json({message: 'Unauthorized'});
        return res.redirect('/admin');
    }
    try {
        // verify token
        const decoded = jwt.verify(token,jwtSecret);
        // Load user (id, username, role)
        const user = await User.findById(decoded.userId).select('_id username role');
        if (!user) {
        res.clearCookie('token');
        return res.redirect('/admin');
        }
        // make user available everywhere
        req.user = user;
        res.locals.currentUser = user;
        return next();
    } catch(error){
        res.clearCookie('token');
        // return res.status(401).json({message: 'Unauthorized'});
        return res.redirect('/admin');
    }
}

// GET Admin / Login Page

router.get('/admin', (req, res) => {
    const token = req.cookies.token;
    if (token) {
        try {
        jwt.verify(token, jwtSecret);
        // Token valid → already logged in
        return res.redirect('/admin/dashboard');
        } catch (err) {
        // Token invalid
        res.clearCookie('token');
        }
    }
    // No token or invalid token → show login page
    const locals = {
        title: "Admin",
        description: "Simple Blog created with NodeJs, Express & MongoDb."
    };
    res.render('admin/index', {
        locals,
        layout: adminLayout,
        error: null
    });
});

// Admin - Get Post Information

router.get('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        const locals = {
        title: "Edit Post",
        description: "Free NodeJs User Management System",
        };

    const query =
        req.user.role === 'admin'
        ? { _id: req.params.id }
        : { _id: req.params.id, author: req.user._id };

    const post = await Post.findOne(query);

    if (!post) {
        return res.status(403).redirect('/admin/dashboard');
    }

    res.render('admin/edit-post', {
        locals,
        data: post,
        layout: adminLayout
    });
    } catch (error) {
    console.log(error);
    res.redirect('/admin/dashboard');
    }
});
// Admin - Check Login

router.post('/admin', async (req,res) => {
    try {
        const {username,password} = req.body;
        if (!username || !password) {
            return res.render('admin/index', {
            layout: adminLayout,
            error: 'Please enter a valid username and password'
            });
        }
        // check if user name is available to login (exists in db)
        const user = await User.findOne({username})
        // if don't get user
        if(!user){
            // return res.status(401).json({message:'Invalid Credentials'})
            return res.render('admin/index', {
                layout: adminLayout,
                error: 'Invalid username or password'
            });
        }
        const isPasswordValid = await bcrypt.compare(password,user.password);
        if(!isPasswordValid){
            // return res.status(401).json({message:'Invalid Credentials'})
            return res.render('admin/index', {
                layout: adminLayout,
                error: 'Invalid username or password'
            });
        }
        const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1h' });
        res.cookie('token',token,{httpOnly:true});
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.log(error);
    }
});

// Admin - Admin Dashboard

router.get('/admin/dashboard', authMiddleware, async (req,res) => {
    try{
        const locals = {
            title: 'Dashboard',
            description: 'Simple Blog created with NodeJs, Express & MongoDb.'
        }
        let data;

        if (req.user.role === 'admin') {
        data = await Post.find().sort({ createdAt: -1 });
        } else {
        data = await Post.find({ author: req.user._id }).sort({ createdAt: -1 });
        }

        res.render('admin/dashboard',{
            locals,
            data,
            layout:adminLayout
        });
    }catch(error){
        console.log(error);
    }
});

// Admin - Create New Post

router.get('/add-post', authMiddleware, async (req,res) => {
    try{
        const locals = {
            title: 'Add Post',
            description: 'Simple Blog created with NodeJs, Express & MongoDb.'
        }
        res.render('admin/add-post',{
            locals,
            layout:adminLayout
        });
    }catch(error){
        console.log(error);
    }
});

// Admin - Save New Post to DB

router.post('/add-post', authMiddleware, async (req, res) => {
    try {
    const newPost = new Post({
        title: req.body.title,
        body: req.body.body,
        author: req.user._id
    });

    await Post.create(newPost);
    res.redirect('/admin/dashboard');
    } catch (error) {
    console.log(error);
    res.redirect('/admin/dashboard');
    }
});

// Admin - Edit Post

router.put('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
    const query =
        req.user.role === 'admin'
        ? { _id: req.params.id }
        : { _id: req.params.id, author: req.user._id };

    const post = await Post.findOne(query);

    if (!post) {
        return res.status(403).redirect('/admin/dashboard');
    }

    post.title = req.body.title;
    post.body = req.body.body;
    post.updatedAt = Date.now();

    await post.save();
    res.redirect('/admin/dashboard');
    } catch (error) {
    console.log(error);
    res.redirect('/admin/dashboard');
    }
});

// Admin - Register

router.post('/admin/register', async (req,res) => {
    try {
        const {username,password} = req.body;
        if (!username || !password) {
            return res.render('admin/register', {
            layout: adminLayout,
            error: 'Please enter a valid username and password',
            csrfToken: req.csrfToken()
            });
        }
        const hashedPassword = await bcrypt.hash(password,10);
        try{
            const user = await User.create ({username,password:hashedPassword});
            return res.redirect('/admin/welcome');
        } catch(error){
            if (error.code === 11000){
                return res.render('admin/register', {
                layout: adminLayout,
                error: "Please choose another username — it's already taken.",
                csrfToken: req.csrfToken()
            });
            }
        }
    } catch (error) {
        console.log(error);
    }
});

// admin - delete post

router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
    try {
    const query =
        req.user.role === 'admin'
        ? { _id: req.params.id }
        : { _id: req.params.id, author: req.user._id };

    const post = await Post.findOne(query);

    if (!post) {
        return res.status(403).redirect('/admin/dashboard');
    }

    await Post.deleteOne({ _id: post._id });
    res.redirect('/admin/dashboard');
    } catch (error) {
    console.log(error);
    res.redirect('/admin/dashboard');
    }
    });

// admin - logout

router.get('/logout', (req,res) => {
    res.clearCookie('token');
    //res.json({message: 'Logout Succesful'});
    res.redirect('/');
});

// admin - register

router.get('/admin/register',(req,res)=>{
    res.render('admin/register',{
        layout: adminLayout
    });
});

// admin - register success page

router.get('/admin/welcome',(req,res)=>{
    res.render('admin/welcome',{
        layout:adminLayout,
        message:'Your account was created successfully.'
    });
});

module.exports = router;
