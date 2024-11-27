// ./schemas/FavoriteMusic.ts
import mongoose from 'mongoose';

const FavoriteMusicSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  favoriteArtist: {
    type: String,
    required: true,
  },
  favoriteBand: {
    type: String,
    required: true,
  },
  preferredGenre: {
    type: String,
    required: true,
  },
});

export default mongoose.model('FavoriteMusic', FavoriteMusicSchema);