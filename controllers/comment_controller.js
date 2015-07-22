var models = require('../models/models.js');

// Autoload :id de comentarios
exports.load = function(req, res, next, commentId) {
	models.Comment.find( {
		where: {
			id: Number(commentId)
		}
	}).then (function (comment) {
		if (comment) {
			req.comment = comment;
			next();
		} else{
			next(new Error('No existe commentId='+commentId))
		}
	}).catch(function(error){next(error)});
}

// GET /quizes/:quizId/comments/new
exports.new = function(req, res){
	res.render('comments/new.ejs', {quizid: req.params.quizId, errors: []});
};

// POST /quizes/:quizId/comments
exports.create = function(req, res){
	var comment = models.Comment.build(
		{
			texto: req.body.comment.texto,
			QuizId: req.params.quizId
		}
	);

	var err_object = comment.validate();
	if (err_object) {
		var err_array = Object.keys(err_object).map(function (key) {return {message: err_object[key]};});
	    res.render('comments/new.ejs', {comment: comment, quizId: req.params.quizId, errors: err_array});
	} else {
		comment // save: guarda en DB  campo texto de comments
	    .save()
	    .then( function(){ res.redirect('/quizes/'+req.params.quizId)})
	}      // res.redirect: Redirección HTTP a la pregunta

}

// GET /quizes/:quizId/comments/:commentId/publish
exports.publish = function(req, res){
	req.comment.publicado = true;

	req.comment.save({fields: ["publicado"]})
	.then (function () {res.redirect('/quizes/'+req.params.quizId);})
	.catch(function(error){next(error)});
};
