import mongoose from "mongoose";
const {Schema} = mongoose; 

const Password = new Schema({
    nombre: { type:String, required: true}, 
    tipo_elemento: { type:String, requierd: true}, 
    url: {type:String, required:true}, 
    password:{type: String, require: true}, 
}, {collection: "Password"}); 

export default mongoose.model("Password", Password);