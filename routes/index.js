        var express = require('express');
        var router = express.Router();
        var Cart = require('../models/cart');
        var Product = require('../models/product');
        var Order = require('../models/order');



        router.get('/about', function(req, res, next){
          res.render('shop/about');
        })
        
        /* GET home page. */
        router.get('/', function(req, res, next) { 
          if (req.query.search) {
            const regex = new RegExp(escapeRegex(req.query.search), 'gi');
          
        Product.find( { title: regex}, function(err, docs){
        var productChunks = [];
        var chunkSize = 3;
        for(var i = 0; i < docs.length; i += chunkSize){
        productChunks.push(docs.slice(i, i+chunkSize));
        }
        res.render('index', { title: 'Express', products: productChunks });
        });
      }
      else{
        Product.find(  function(err, docs){
          var productChunks = [];
          var chunkSize = 3;
          for(var i = 0; i < docs.length; i += chunkSize){
          productChunks.push(docs.slice(i, i+chunkSize));
          }
          res.render('index', { title: 'Express', products: productChunks });
          });
      
      }
        });



        router.get('/add-to-cart/:id', function(req, res, next){
          var productId = req.params.id;
          var cart = new Cart(req.session.cart ? req.session.cart : {}); 
          Product.findById(productId, function(err, product){
            if(err){
              return res.redirect('/');
            }
            cart.add(product,product.id);
            req.session.cart =cart;
            console.log(req.session.cart);
            res.redirect('/');

          })
        });

        router.get('/remove/:id', function(req, res, next) {
          var productId = req.params.id;
          var cart = new Cart(req.session.cart ? req.session.cart : {});
      
          cart.removeItem(productId);
          req.session.cart = cart;
          res.redirect('/shopping-cart');
      });

        router.get('/checkout',isLoggedIn, function(req, res, next){
          if(!req.session.cart){
           return res.redirect('/shopping-cart');
          }
          var cart = new Cart(req.session.cart);
          
         
          res.render('shop/checkout');
          var cart = new Cart(req.session.cart ? req.session.cart : {});
          req.session.cart = null;
          var order = new Order({
            user: req.user,
            cart: cart
          });
          order.save();
          
        });



        
        router.get('/shopping-cart',isLoggedIn, function(req, res, next){
          if(!req.session.cart){
            return res.render('shop/shopping-cart', {products: null});
          }
          var cart = new Cart(req.session.cart);
          res.render('shop/shopping-cart', {products: cart.generateArray(), totalPrice: cart.totalPrice, aa: cart.pay });

       
        });


       
        function isLoggedIn(req, res, next){
          if (req.isAuthenticated()){
              return next();
                  }
                  req.session.oldUrl = req.url;
                  res.redirect('/user/signin');
      }

      function escapeRegex(text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };

        module.exports = router;
