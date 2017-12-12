var express = require('express');
var app = express();
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/msgBoard');
var Schema = mongoose.Schema;
var MessageSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 2 },
    text: { type: String, required: true },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
}, { timestamps: true });
var CommentSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 2 },
    text: { type: String, required: true },
    _message: { type: Schema.Types.ObjectId, ref: 'Message' },
}, { timestamps: true });
mongoose.model('Message', MessageSchema);
mongoose.model('Comment', CommentSchema);
var Message = mongoose.model('Message')
var Comment = mongoose.model('Comment')
mongoose.Promise = global.Promise;
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
var path = require('path');
app.use(express.static(path.join(__dirname, './static')));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');


//ROUTES
app.get('/', function (req, res) {
    Message.find({}).populate('comments').exec(function (err, result) {
        res.render('index', { msgs: result });
    });
});

app.post('/message', function (req, res) {
    var msgs = new Message({ name: req.body.name, text: req.body.message });
    msgs.save(function (err) {
        if (err) {
            console.log('Error posting a message!');
            res.render('index', { errors: msgs.errors })
        } else {
            console.log('Successfully posted a message!');
            res.redirect('/');
        }
    });
});

app.post('/comment/:id', function (req, res) {
    Message.findOne({ _id: req.params.id }, function (err, result) {
        var comment = new Comment({ name: req.body.name, text: req.body.comment });
        comment._message = result.id;
        comment.save(function (err) {
            if (err) {
                console.log('Error posting a comment!');
                res.render('index', { cErrors: comment.errors })
            }
            else {
                result.comments.push(comment);
                result.save(function (err) {
                    if (err) {

                    }
                    else {
                        console.log('Successfully posted a comment!');
                        res.redirect('/');
                    }
                }

                )
            }
        });
    });
});

app.listen(8000, function () {
    console.log("listening on port 8000");
})
