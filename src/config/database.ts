import { sequelize } from '../models';
import { User } from '../models/User';
import { Podcast } from '../models/Podcast';
import { Episode } from '../models/Episode';

// Definir associações
User.hasMany(Podcast, {
  foreignKey: 'authorId',
  as: 'podcasts',
});

Podcast.belongsTo(User, {
  foreignKey: 'authorId',
  as: 'author',
});

Podcast.hasMany(Episode, {
  foreignKey: 'podcastId',
  as: 'episodes',
});

Episode.belongsTo(Podcast, {
  foreignKey: 'podcastId',
  as: 'podcast',
});

export const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
    
    await sequelize.sync({ force: false });
    console.log('Modelos sincronizados com o banco de dados.');
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    process.exit(1);
  }
};
