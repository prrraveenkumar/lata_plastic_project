import mongoose from 'mongoose';
import { DB_Name } from '../constant.js';

const connectDB = async () => {
    try{
        const conn = await mongoose.connect(`${process.env.MONGO_URI}/${DB_Name}`);

        console.log(`\n✅ MONGODB connected! HOST: ${conn.connection.host}\n`);
    }catch(err){
        console.error(`\n❌ MONGODB connection error: ${err.message}\n`);
        process.exit(1);
    }
}

export default connectDB;