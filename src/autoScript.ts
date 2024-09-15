import connectDB from "./config/db";
import Category from "./models/categoryModel";
import Deal from "./models/dealModel";
import KitchenInventory from "./models/kitchenModel";
import MainInventory from "./models/mainInventoryModel";
import Order from "./models/orderModel";
import Product from "./models/productModel";
import Table from "./models/tableModel";
import User from "./models/userModel";

connectDB().then(async () => {
  await Order.deleteMany();
  // await Category.deleteMany();
  // await Product.deleteMany();
  // await Table.deleteMany();
  // await Deal.deleteMany();
  // await KitchenInventory.deleteMany();
  // await MainInventory.deleteMany();
  // await User.create({
  //   username: "Ahmad Ali",
  //   email: "ahmad@admin.io",
  //   password: "admin1234",
  //   confirmPassword: "admin1234",
  //   role: "admin",
  // });
  console.log("success");
});
