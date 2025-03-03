import jwt from 'jsonwebtoken'
import userModel from '../../database/models/userModel.js';
import { AppError } from '../utils/AppError.js';


const userAuth = async (req, res, next) => {
    try {
        const token = req.header('token');
        const decoded = jwt.verify(token, process.env.JWT_LOGIN_KEY)
        if (!decoded.userId || !decoded.userEmail) {
            next(new AppError("Invalid token or it may be expired", 403))
        }
        else {
            const user = await userModel.findById(decoded.userId)
            if (user && user.isActive) {
                req.userId = decoded.userId;
                next();
            }

            else {
                next(new AppError("Please Login first", 403))
            }
        }
    }


    catch (error) {
        next(new AppError(error, 403))
    }
}

export default userAuth;