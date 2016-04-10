module.exports = function(sequelize, DataTypes){
	return sequelize.define('user', {
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true, //make sure no other records have same value
			validate: {
				isEmail: true
			}
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				len: [7, 100]    //this is length of password
			}
		}, {
			hooks: {
				beforeValidate: function(user, options) {
					//user.email convert to lower case if only its a string
					//true user.email to lower case
					if(typeof user.email ==== 'string'){
						user.email = user.email.toLowerCase();
					}
				}
			}
		}
	});
}