import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

// Interfaz para definir el tipo de usuario
interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

// Esquema de Mongoose para el modelo de usuario
const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { collection: "User" }
);

// Middleware para encriptar la contraseña antes de guardar
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Método para comparar la contraseña en el login
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Exportar el modelo de usuario
export default mongoose.model<IUser>("User", userSchema);

