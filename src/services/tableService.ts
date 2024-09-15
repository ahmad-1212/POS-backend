import createHttpError from "http-errors";
import { ITable } from "../interfaces/table.interface";
import Table from "../models/tableModel";

class TableService {
  public async getAllTables(): Promise<ITable[]> {
    const tables = await Table.find();
    return tables;
  }

  public async createTable(): Promise<ITable> {
    const allTables = Table.countDocuments();
    const newTable = await Table.create({ number: +allTables + 1 });
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
}

export default new TableService();
