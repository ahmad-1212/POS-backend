import { RequestHandler } from "express";
import catchAsync from "../util/catchAsync";
import { IngredientDto, UpdateIngredientDto } from "../dtos/ingredient.dto";
import ingredientService from "../services/ingredientService";
import { Types } from "mongoose";

/**
 * Function to add or create ingredient
 */
export const addIngredient: RequestHandler<{}, {}, IngredientDto> = catchAsync(
  async (req, res) => {
    const ingredient = await ingredientService.addIngredient(req.body);

    res.status(201).json({
      status: "success",
      message: "Ingredient successfully created!",
      data: {
        ingredient,
      },
    });
  }
);

/**
 * Function to retreive all ingredients
 */
export const getAllIngredients: RequestHandler = catchAsync(
  async (req, res) => {
    const ingredients = await ingredientService.getAllIngredients();

    res.status(200).json({
      status: "success",
      length: ingredients.length,
      data: {
        ingredients,
      },
    });
  }
);

/**
 * Function to update ingredient
 */
export const updateIngredient: RequestHandler<
  { id: string },
  {},
  UpdateIngredientDto
> = catchAsync(async (req, res) => {
  const { id } = req.params;
  const newObjId = new Types.ObjectId(id);
  const ingredient = await ingredientService.updateIngredient(
    newObjId,
    req.body
  );
  res.status(200).json({
    status: "success",
    message: "Ingredient successfully created!",
    data: {
      ingredient,
    },
  });
});

/**
 * Function to delete ingredient
 */
export const deletIngredient: RequestHandler<{ id: string }> = catchAsync(
  async (req, res) => {
    const { id } = req.params;
    const newObjId = new Types.ObjectId(id);
    await ingredientService.deletIngredient(newObjId);
    res.status(200).json({
      status: "success",
      message: "Ingredient successfully delete!",
    });
  }
);
