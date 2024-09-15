import { Types } from "mongoose";
import { ProductDto, UpdateProductDto } from "../dtos/product.dto";
import { IProduct } from "../interfaces/product.interface";
import Product from "../models/productModel";
import createHttpError from "http-errors";
import Deal from "../models/dealModel";

class ProductService {
  /**
   * Creates a new product document in the database.
   *
   * @param {ProductDto} productData - The data for the new product, including necessary fields.
   * @returns {Promise<IProduct>} - A promise that resolves to the created product document.
   *
   * @throws {Error} If there is an issue creating the product, such as a database error.
   */
  public async addProduct(productData: ProductDto): Promise<IProduct> {
    const { name } = productData;
    const isProdExists = await Product.findOne({
      name: name,
      deleted: { $ne: true }, // Exclude documents where 'deleted' is true
    });

    if (isProdExists)
      throw createHttpError(
        400,
        "Name already exists, please use another one!"
      );
    // Create a new product using the provided data
    const newProduct = await Product.create(productData);

    return newProduct;
  }

  /**
   * Retrieves all product documents from the database.
   *
   * @returns {Promise<IProduct[]>} - A promise that resolves to an array of all product documents.
   *
   * @throws {Error} If there is an issue retrieving the products, such as a database error.
   */
  public async getAllProducts(): Promise<IProduct[]> {
    // Find and return all products
    const products = await Product.find({ deleted: { $ne: true } });
    return products;
  }

  /**
   * Retrieves a product document by its ID.
   *
   * @param {Types.ObjectId} id - The ID of the product to retrieve.
   * @returns {Promise<IProduct>} - A promise that resolves to the product document.
   *
   * @throws {createHttpError} If the product with the specified ID is not found.
   */
  public async getProduct(id: Types.ObjectId): Promise<IProduct> {
    // Find the product by ID
    const product = await Product.findById(id);
    if (!product)
      throw createHttpError(404, `Product not found with ID: ${id}`);

    return product;
  }

  /**
   * Updates an existing product by its ID.
   *
   * @param {Types.ObjectId} id - The ID of the product to update.
   * @param {UpdateProductDto} prodData - The updated data for the product.
   * @returns {Promise<IProduct>} - A promise that resolves to the updated product document.
   *
   * @throws {createHttpError} If the product with the specified ID is not found.
   */
  public async updateProduct(
    id: Types.ObjectId,
    prodData: UpdateProductDto
  ): Promise<IProduct> {
    // Update the product by ID and return the updated document
    const updatedProduct = await Product.findByIdAndUpdate(id, prodData, {
      new: true, // Return the updated document
    });

    // Throw an error if the product is not found
    if (!updatedProduct)
      throw createHttpError(404, `No product found with ID: ${id}`);

    return updatedProduct;
  }

  /**
   * Deletes a product document by its ID.
   *
   * @param {Types.ObjectId} id - The ID of the product to delete.
   * @returns {Promise<void>} - A promise that resolves when the product is deleted.
   *
   * @throws {Error} If there is an issue deleting the product, such as a database error.
   */
  public async deleteProduct(id: Types.ObjectId): Promise<void> {
    const deal = await Deal.updateMany(
      {
        "products.product": id,
      },
      {
        $pull: { products: { product: id } },
      }
    );
    // Delete the product by ID
    await Product.findByIdAndUpdate(id, { deleted: true });
  }
}

export default new ProductService();
