const userModel = require("../models/user")

class UserController{
	//READ
	static async getAllUser(req, res){
		var results = await userModel.getUsers();
		if(results) res.json(results)
	}
	//CREATE
	static async addNewUser(req, res){
		var nom = req.body.nom
		var pswd = req.body.pswd
		var email = req.body.email
		var photo = req.body.photo
		var roles = req.body.roles
		var login_session_key = req.body.login_session_key
		var email_status = req.body.email_status
		var password_reset_key = req.body.password_reset_key
		var account_status = req.body.account_status
		var user_role_id = req.body.user_role_id

		var x = await userModel.addUser(nom, pswd, email, photo, roles, login_session_key, email_status, password_reset_key, account_status, user_role_id)
		if(x) res.send('add successfully')
		else res.send('add error')
	}
	//UPDATE
	static async updateAnUser(req, res){
		var id = req.body.id
		var nom = req.body.nom
		var pswd = req.body.pswd
		var email = req.body.email
		var photo = req.body.photo
		var roles = req.body.roles
		var login_session_key = req.body.login_session_key
		var email_status = req.body.email_status
		var password_reset_key = req.body.password_reset_key
		var account_status = req.body.account_status
		var user_role_id = req.body.user_role_id

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
