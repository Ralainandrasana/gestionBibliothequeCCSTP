const userModel = require("../models/user")

class UserController{
	//READ
	static async getAllUser(req, res){
		var results = await userModel.getUsers();
		if(results) res.json(results)
	}
	//CREATE
	static async addNewUser(req, res){
		const { 
			nom, 
			pswd, 
			email, 
			photo, 
			roles, 
			login_session_key, 
			email_status, 
			password_reset_key, 
			account_status, 
			user_role_id 
		  } = req.body;
		  

		var x = await userModel.addUser(nom, pswd, email, photo, roles, login_session_key, email_status, password_reset_key, account_status, user_role_id)
		if(x) res.send('add successfully')
		else res.send('add error')
	}
	//UPDATE
	static async updateAnUser(req, res){
		const { 
			id, 
			nom, 
			pswd, 
			email, 
			photo, 
			roles, 
			login_session_key, 
			email_status, 
			password_reset_key, 
			account_status, 
			user_role_id 
		  } = req.body;
		  

		var x = await userModel.updateUser(id, nom, pswd, email, photo, roles, login_session_key, email_status, password_reset_key, account_status, user_role_id)
		if(x) res.send('update successfully')
		else res.send('update error')
	}
	//DELETE
	static async deleteAnUser(req, res){
		var id = req.body.id

		var x = await userModel.deleteUser(id)
		if(x) res.send('delete successfully')
		else res.send('delete error')
	}
}

module.exports = UserController
