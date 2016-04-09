module.exports = function(sequelize, DataTypes){
	return sequelize.define('todo', {
		description: {
			type: DataTypes.STRING,
			allowNull: false,  //allow if null = false they must provide this
			validate: {
				len: [1, 250] //only take strings that are greater than 1 and less than 250
			}
		},
		completed: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		}
	});
};