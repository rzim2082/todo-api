var bcrypt = require('bcrypt');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

module.exports = function(sequelize, DataTypes){
	var user = sequelize.define('user', {
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true, //make sure no other records have same value
			validate: {
				isEmail: true
			}
		},
		salt: {
			type: DataTypes.STRING
		},
		password_hash: {
			type: DataTypes.STRING
		},
		password: {
			type: DataTypes.VIRTUAL,
			allowNull: false,
			validate: {
				len: [7, 100]    //this is length of password
			},
			set: function(value){
				var salt = bcrypt.genSaltSync(10);
				var hashedPassword = bcrypt.hashSync(value, salt);

				this.setDataValue('password', value);
				this.setDataValue('salt', salt);
				this.setDataValue('password_hash', hashedPassword);
			}
		}
		}, {
			hooks: {
				beforeValidate: function(user, options) {
					//user.email convert to lower case if only its a string
					//true user.email to lower case
					if(typeof user.email === 'string'){
						user.email = user.email.toLowerCase();
					}
				}
			},
			classMethods: {
				authenticate: function(body){
					return new Promise(function (resolve, reject){
						if(typeof body.email !== 'string' || typeof body.password !== 'string'){
							return reject();
						}
	
						user.findOne({
							where: {email: body.email}
						}).then(function(found){
							if(!found || !bcrypt.compareSync(body.password, found.get('password_hash'))){ //compareSynce will run comparison between password and hashed and salted password
								return reject();
							}
							resolve(found);
							
						}, function(e) {
							reject();
						});
					});
				},
				findByToken: function(token) {
					return new Promise(function (resolve, reject){
						try {
							var decodedJWT = jwt.verify(token, 'qwerty098');
							var bytes = cryptojs.AES.decrypt(decodedJWT.token, 'abc123!@#!');
							var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));

							user.findById(tokenData.id).then(function(user){
								if(user){
									resolve(user);

								} else {
									reject();
								}
							}, function(e){
								reject();
							});
						} catch (e) {
							
							reject();
						}
					});
				}
			},
			instanceMethods: {
				toPublicJSON: function() {
					var json = this.toJSON();
					return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
				},
				generateToken: function(type) {
					if(!_.isString(type)){
						return undefined;
					}

					try { //encryption of token and return to server.js
						var stringData = JSON.stringify({id: this.get('id'), type: type}); //take user id and type and turn it to json string
						var encryptedData = cryptojs.AES.encrypt(stringData, 'abc123!@#!').toString(); //encrypt
						var token = jwt.sign({
							token: encryptedData

						}, 'qwerty098');

						return token;
					} catch (e) {
						return undefined;
					}
				}
			}
		});
	return user;
};





