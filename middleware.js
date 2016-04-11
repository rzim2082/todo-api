module.exports = function (db) { //reason we set it to a function is so other files can pass in config data

	return {
		requireAuthentication: function(req, res, next){
			var token = req.get('Auth');

			db.user.findByToken(token).then(function (user) {
				req.user = user;
				next();
			}, function(){
				
				res.status(401).send();
			});
		}
	};


};