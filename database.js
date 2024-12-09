import { Sequelize, DataTypes} from 'sequelize';
import { SqliteDialect } from '@sequelize/sqlite3';

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'sequelize.sqlite',
});

export const Book = sequelize.define('Books', {
  book_iden: DataTypes.INTEGER,
  content: DataTypes.TEXT,
  metadata: DataTypes.JSON,
  gencontent: DataTypes.TEXT,
});

