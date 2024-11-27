import mongoose from "mongoose";
const {Schema} = mongoose; 

const Suscription = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }, // Referencia al modelo User
    endpoint: { type: String, required: true },
    expirationTime: { type: Date, default: null },
    keys: {
        p256dh: { type: String, required: true },
        auth: { type: String, required: true },
    },
}, { collection: "Subscription" });

export default mongoose.model("Subscription", Suscription); 