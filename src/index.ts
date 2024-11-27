import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import Password from './schemas/Password';
import { sendPush } from './pushServer';
import Suscription from './schemas/Suscription';
import userModel from './schemas/userModel';
import FavoriteMusic from './schemas/FavoriteMusic';

dotenv.config(); // Load environment variables

const app = express();
const port = process.env.SERVER_PORT;

// Middleware configuration
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017';
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch((err) => console.log('Error connecting to MongoDB:', err));

// Route to add a new subscription
app.post('/Suscription', async (req: Request, res: Response) => {
  const { userId, endpoint, keys, expirationTime } = req.body;

  try {
    // Buscar si ya existe una suscripción con el mismo userId y endpoint
    const existingSubscription = await Suscription.findOne({ userId, endpoint });

    if (existingSubscription) {
      return res.status(200).json({ message: 'El usuario ya está suscrito con este endpoint' });
    }

    // Crear una nueva suscripción
    const newSubscription = new Suscription({
      userId,
      endpoint,
      keys,
      expirationTime,
    });

    await newSubscription.save();
    res.status(200).json({ message: 'Suscripción añadida exitosamente' });
  } catch (error) {
    console.error('Error al agregar la nueva suscripción:', error);
    res.status(400).json({ error: 'Error al agregar la nueva suscripción' });
  }
});

// Route to send a push notification
app.post('/sendNotification', async (req: Request, res: Response) => {
  const { userId, message } = req.body;

  try {
    // Buscar la suscripción del usuario
    const subscription = await Suscription.findOne({ userId });
    if (!subscription) {
      return res.status(404).json({ error: 'No se encontró suscripción para el usuario especificado.' });
    }

    // Verificar si las claves existen
    if (!subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
      return res.status(400).json({ error: 'Claves de suscripción inválidas.' });
    }

    // Formatear la suscripción para cumplir con el tipo PushSubscription
    const pushSubscription = {
      endpoint: subscription.endpoint,
      expirationTime: subscription.expirationTime ? subscription.expirationTime.getTime() : null, // Convertir Date a número
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    };

     // Enviar notificación push
     await sendPush(pushSubscription, message);
     res.status(200).json({ message: 'Push notification sent successfully.' });
   } catch (error) {
     console.error('Error sending push notification:', error);
     res.status(500).json({ error: 'Failed to send push notification.' });
   }
 });

// Register new user
app.post('/register', async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  try {
    // Verificar si el correo ya existe
    const userExists = await userModel.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'El correo ya está en uso.' });
    }

    // Crear y guardar el nuevo usuario
    const newUser = new userModel({ name, email, password });
    await newUser.save();
    res.status(201).json({ message: 'Usuario registrado exitosamente.', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar el usuario.', error });
  }
});

// Inicio de sesión
app.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validación básica
  if (!email || !password) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
  }

  try {
    // Buscar usuario por correo electrónico
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Correo o contraseña incorrectos.' });
    }

    // Verificar contraseña
    const isMatch = await user.comparePassword(password); // Asegúrate de tener un método `comparePassword` en tu modelo
    if (!isMatch) {
      return res.status(400).json({ message: 'Correo o contraseña incorrectos.' });
    }

    res.status(200).json({ message: 'Inicio de sesión exitoso.', userId: user._id });
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión.', error });
  }
});

// Obtener contraseñas
app.get('/get_passwords', async (req: Request, res: Response) => {
  try {
    const userId = req.headers.userid as string; // Obtener userId desde los headers

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const passwords = await Password.find({ userId });
    res.status(200).json(passwords);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving passwords', error });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Ruta para guardar datos del formulario musical
app.post('/register-music', async (req: Request, res: Response) => {
  const { userId, favoriteArtist, favoriteBand, preferredGenre } = req.body;

  if (!userId || !favoriteArtist || !favoriteBand || !preferredGenre) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
  }

  try {
    const newFavoriteMusic = new FavoriteMusic({
      userId,
      favoriteArtist,
      favoriteBand,
      preferredGenre,
    });

    // Guardar en la base de datos
    await newFavoriteMusic.save();
    res.status(201).json({ message: 'Datos musicales guardados exitosamente.' });
  } catch (error) {
    console.error('Error al guardar datos musicales:', error);
    res.status(500).json({ message: 'Error al guardar datos musicales.', error });
  }
});