import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './index';

interface EpisodeAttributes {
  id: string;
  title: string;
  description: string;
  duration: number;
  audioUrl: string;
  podcastId: string;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface EpisodeCreationAttributes extends Optional<EpisodeAttributes, 'id' | 'isPublished' | 'publishedAt'> {}

export class Episode extends Model<EpisodeAttributes, EpisodeCreationAttributes> implements EpisodeAttributes {
  public id!: string;
  public title!: string;
  public description!: string;
  public duration!: number;
  public audioUrl!: string;
  public podcastId!: string;
  public isPublished!: boolean;
  public publishedAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Episode.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 255],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [10, 2000],
      },
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    audioUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true,
      },
    },
    podcastId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'podcasts',
        key: 'id',
      },
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'episodes',
    timestamps: true,
  }
);
