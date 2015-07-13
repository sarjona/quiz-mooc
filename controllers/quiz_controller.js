var models = require ('../models/models.js');

// Autoload - factoriza el código si ruta incluye :quizId
exports.load = function (req, res, next, quizId) {
	models.Quiz.find(quizId).then(
		function (quiz) {
			if (quiz) {
				req.quiz = quiz;
				next();
			} else {
				next(new Error('No existe quizId=' + quizId));
			}
		}
	).catch(function (error) { next(error);});
};

// GET /quizes
exports.index = function (req, res) {
	if (req.query.search) {
		var search = '%'+req.query.search.replace(/ /, '%')+'%';
		models.Quiz.findAll({where: ["pregunta like ?", search], order: ["pregunta"]}).then(
			function(quizes) {
				res.render('quizes/index.ejs', {quizes: quizes, search: req.query.search, errors: []});
			}
		).catch(function(error) {next(error);})
	} else{
		models.Quiz.findAll().then(
			function(quizes) {
				res.render('quizes/index.ejs', {quizes: quizes, search: '', errors: []});
			}
		).catch(function(error) {next(error);})
	}
};

// GET /quizes/:id
exports.show = function (req, res) {
	models.Quiz.find(req.params.quizId).then(function(quiz){
		res.render('quizes/show', {quiz: req.quiz, errors: []});
	})
};

// GET /quizes/:id/answer
exports.answer = function (req, res){
	var resultado = 'Incorrecto';
	if (req.query.respuesta === req.quiz.respuesta) {
		resultado = 'Correcto';
	}
	res.render('quizes/answer',{quiz: req.quiz, respuesta: resultado, errors: []});
};

// GET /quizes/new
exports.new = function(req, res) {
	var quiz = models.Quiz.build(  // Crea objeto quiz
			{pregunta: "Pregunta", respuesta: "Respuesta"}
		);
	res.render('quizes/new', {quiz: quiz, errors: []});
	};


// POST /quizes/create
exports.create = function(req, res) {
  var quiz = models.Quiz.build( req.body.quiz );

  var err_object = quiz.validate();
  if (err_object) {
  		var err_array = Object.keys(err_object).map(function (key) {return {message: err_object[key]};});
        res.render('quizes/new', {quiz: quiz, errors: err_array});
  } else {
  		quiz // save: guarda en DB campos pregunta y respuesta de quiz
        .save({fields: ["pregunta", "respuesta"]})
        .then( function(){ res.redirect('/quizes')}) 
  }      // res.redirect: Redirección HTTP a lista de preguntas
};