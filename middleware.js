var cryptojs = require('crypto-js');

module.exports = function (db) { //reason we set it to a function is so other files can pass in config data

	return {
		requireAuthentication: function(req, res, next){
			var token = req.get('Auth') || ''; //keeps from erroing out

			db.token.findOne({
				where: {
					tokenHash: cryptojs.MD5(token).toString()
				}
			}).then(function(tokenInstance){
				if(!tokenInstance){
					throw new Error();
				}

				req.token = tokenInstance;
				return db.user.findByToken(token);

			}).then(function(user){
				req.user = user;
				next();
			}).catch(function(){
				res.status(401).send();
			});

		}
	};


};