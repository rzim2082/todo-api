var bcrypt = require('bcrypt');
var _ = require('underscore');

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
				}
			},
			instanceMethods: {
				toPublicJSON: function() {
					var json = this.toJSON();
					return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
				}
			}
		});
	return user;
};





