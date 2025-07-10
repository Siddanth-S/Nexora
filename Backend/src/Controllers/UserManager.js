import httpStatus from 'http-status';
import User from '../Models/user.js';
import bcrypt,{hash} from 'bcrypt';
import crypto from 'crypto';

const register=async (req, res) => {
    const { name,username,  password } = req.body;
    try{
        const existingUser= await User.findOne({ username });
        if(existingUser){
            return res.status(httpStatus.FOUND).json({ message: 'Username already exists' });
        }
        const hashedPassword = bcrypt.hashSync(password, 10);
        const user = new User({ name:name, username:username, password: hashedPassword });
        await user.save();
        res.status(httpStatus.CREATED).json({message: 'User registered successfully', user: { name, username } });
    }catch(e){
        return res.json({message:`Something whent wrong ${e}`}); 
    }
}

const login= async(req,res)=>{
    try{
    const { username, password } = req.body;
    const CheckUser=await User.findOne({ username });
    if(!CheckUser){
        return res.status(httpStatus.NOT_FOUND).json({ message: 'User not found' });
    }
    let passwordcheck=await bcrypt.compare(password,CheckUser.password);
    if(passwordcheck){
       let token=crypto.randomBytes(16).toString('hex');
       CheckUser.token=token;
       await CheckUser.save();
       res.status(httpStatus.OK).json({ message: 'Login successful',token});
    }else{
        return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Invalid password' });
    }
}catch(e){
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `Something went wrong ${e}` });
    }
}

export {login, register};