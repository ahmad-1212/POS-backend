import { model, Schema } from "mongoose";
import { ITable } from "../interfaces/table.interface";

const tableSchema = new Schema<ITable>({
  number: {
    type: Number,
    unique: true,
  },
  isReserved: {
    type: Boolean,
    default: false,
  },
});

const Table = model<ITable>("Table", tableSchema);

export default Table;
