import createHttpError from 'http-errors';
import { ITable } from '../interfaces/table.interface';
import Table from '../models/tableModel';
import { Types } from 'mongoose';

class TableService {
  public async getAllTables(): Promise<ITable[]> {
    const tables = await Table.find();
    return tables;
  }

  public async createTable(): Promise<ITable> {
    const allTables = +(await Table.countDocuments());
    const newTable = await Table.create({
      number: isNaN(allTables) ? 1 : allTables + 1,
    });
    return newTable;
  }

  public async updateTable(num: number): Promise<ITable> {
    const updatedTable = await Table.findOneAndUpdate(
      { number: num },
      { isReserved: false },
      { new: true }
    );
    if (!updatedTable)
      throw createHttpError(404, `No table were found with number ${num}`);
    return updatedTable;
  }

  public async deleteTable(id: Types.ObjectId): Promise<void> {
    const table = await Table.findById(id);
    if (!table) throw createHttpError(404, `Table with id ${id} not found`);
    if (table.isReserved) throw createHttpError(400, `Table is reserved`);

    await Table.findByIdAndDelete(id);
  }
}

export default new TableService();
