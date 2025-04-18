const bcrypt = require('bcrypt');
const { UserRepository } = require('../repositories');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');
const { Auth } = require('../utils/common');

const userRepo = new UserRepository();

async function create(data) {
    try {
        const user = await userRepo.create(data);
        return user;
    } catch (error) {
        if (
            error.name === "SequelizeValidationError" || 
            error.name === "SequelizeUniqueConstraintError"
        ) {
            let explanation = [];
            error.errors.map((err) => {
                explanation.push(err.message);
            });
            throw new AppError(explanation, StatusCodes.BAD_REQUEST);
        }
        throw new AppError("Cannot create a new user", StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function signin(data){
    try {
        const user = await userRepo.getUserByEmail(data.email);
        if(!user){
            throw new AppError('No user found for the given email', StatusCodes.NOT_FOUND);
        }

        const passwordMatch = await Auth.checkPassword(data.password, user.password);
        if(!passwordMatch){
            throw new AppError('Invalid password', StatusCodes.BAD_REQUEST);
        }

        const jwt = Auth.createToken({ id: user.id, email: user.email });
        return {
            token: jwt,
            user: {
                id: user.id,
                email: user.email
            }
        };
    } catch (error) {
        console.log(error);
        throw error;
    }
}


module.exports = {
    create,
    signin
}
