import {Router} from 'express';
import {login,register} from '../Controllers/UserManager.js'; // Importing the user manager functions
import { addToHistory, getUserHistory } from '../Models/user.js';
const router= Router();

router.route('/login').post(login)
router.route('/register').post(register);
router.route('/add_to_activity').post(addToHistory)
router.route('/get_all_activity').post(getUserHistory)

export default router;