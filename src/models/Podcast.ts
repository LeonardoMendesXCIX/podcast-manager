import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './index';

interface PodcastAttributes {
  id: string;
  title: string;
  description: string;
  category: string;
  coverImage?: string;
  authorId: string;
  isPublished: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PodcastCreationAttributes extends Optional<PodcastAttributes, 'id' | 'isPublished' | 'coverImage'> {}

export class Podcast extends Model<PodcastAttributes, PodcastCreationAttributes> implements PodcastAttributes {
  public id!: string;
  public title!: string;
  public description!: string;
  public category!: string;
  public coverImage!: string;
  public authorId!: string;
  public isPublished!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Podcast.init(
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
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 50],
      },
    },
    coverImage: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'podcasts',
    timestamps: true,
  }
);
