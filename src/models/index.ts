import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

export { sequelize };
export * from './User';
export * from './Podcast';
export * from './Episode';
