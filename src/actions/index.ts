import { defineAction, ActionError } from "astro:actions";
import { z } from "astro:schema";
import { addUser, editUser, deleteUser, getUserByEmail, addItem, getItemByName, editItem, deleteItem } from "@lib/dbFunctions";
import { saveFileToPublic, deleteImage } from "@lib/utils";

//User Schemas
const baseUserSchema = z.object({
    name: z
        .string()
        .min(3, "Name must be at least 3 characters")
        .max(20, "Your name must be no more than 20 characters"),
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    user_type: z.enum(["client", "staff"]),
    phone: z
        .string()
        .regex(/^\d+$/, "Phone number must contain only digits")
        .min(9, "Phone number must be at least 9 digits")
        .optional(),
    profile_pic: z
        .instanceof(File)
        .optional()
        .refine((file) => file && file.size <= 2 * 1024 * 1024, "File must be less than 2MB"),
});

const addUserSchema = baseUserSchema;
const editUserSchema = baseUserSchema
    .partial() // Torna todos os campos opcionais
    .extend({
        id: z.string().min(1, "User ID is required."), // ID obrigatório
    });

//Item Schemas
const baseItemSchema = z.object({
    name: z
        .string()
        .min(3, "Name must be at least 3 characters")
        .max(60, "Your item name must be no more than 60 characters"),
    category: z
        .string()
        .min(2, "category must be at least 2 characters")
        .max(20, "Your item category must be no more than 20 characters"),
    type: z.enum(["clothing", "footwear", "other"]),
    size: z.enum(["XS", "S", "M", "L", "XL", "XXL"]),
    color: z.enum(["red", "blue", "yellow", "green", "brown", "black", "white", "other"]),
    brand: z
        .string()
        .min(2, "Brand must be at least 2 characters")
        .max(15, "Your item name must be no more than 15 characters"),
    condition: z.enum(["new", "used", "worn"]),
    rental_price: z
        .string()
        .nonempty("Rental price is required.")
        .regex(/^\d+(\.\d{1,2})?$/, "Rental price must be a valid number with up to 2 decimal places.")
        .transform((value) => parseFloat(value))
        .refine((value) => value >= 0.01, "Rental price must be greater than 0"),
    image: z
        .instanceof(File)
        .refine(file => file.size > 0, "Image is required.")
        .refine((file) => file && file.size <= 2 * 1024 * 1024, "File must be less than 2MB"),
});
const addItemSchema = baseItemSchema;
const editItemSchema = baseItemSchema
    .partial() // Torna todos os campos opcionais
    .extend({
        id: z.string().min(1, "Item ID is required."), // ID obrigatório
    });

export const server = {

    //User Actions
    addUser: defineAction({
        accept: "form",
        input: addUserSchema,
        handler: async (input) => {

            let errorMessage = "Failed to add user. Please try again."
            let codeError: any = "INTERNAL_SERVER_ERROR"

            try {
                // Verify if user already exist
                const existingUser = await getUserByEmail(input.email);

                if (existingUser) {
                    errorMessage = "A user with this email already exists"
                    codeError = "CONFLICT"
                }

                const getProfilePicPath = async () => {
                    if (input.profile_pic && input.profile_pic.size > 0) {
                        // Salva a imagem e retorna o caminho
                        return await saveFileToPublic(input.profile_pic, input.name, "profile");
                    } else {
                        // Caminho padrão
                        return "/profile_users/default.png";
                    }
                };

                const profilePicPath = await getProfilePicPath()

                await addUser({
                    name: input.name,
                    email: input.email,
                    password: input.password,
                    user_type: input.user_type,
                    phone: input.phone ? Number(input.phone) : null,
                    profile_pic: profilePicPath,
                });
            } catch (error) {
                throw new ActionError({
                    code: codeError,
                    message: errorMessage,
                });
            }
        },
    }),

    validateUserField: defineAction({
        input: z.object({
            field: z.enum(["name", "email", "user_type", "phone"]),
            value: z.string().optional(),
            id: z.string().min(1, "User ID is required."),
        }),
        handler: async ({ field, value, id }) => {
            try {
                // Valida o valor com base no campo específico
                const validationSchemas: Record<string, z.ZodSchema> = {
                    name: baseUserSchema.shape.name,
                    email: baseUserSchema.shape.email,
                    user_type: baseUserSchema.shape.user_type,
                    phone: baseUserSchema.shape.phone,
                };

                if (!validationSchemas[field]) {
                    throw new ActionError({
                        code: "BAD_REQUEST",
                        message: `Field "${field}" is not supported for validation.`,
                    });
                }

                // Executa a validação
                validationSchemas[field].parse(value);

                return { valid: true };
            } catch (error) {
                if (error instanceof z.ZodError) {
                    return {
                        valid: false,
                        message: error.errors[0].message,
                    };
                }
                throw error;
            }
        },
    }),

    editUser: defineAction({
        input: editUserSchema,
        handler: async (input) => {
            try {
                const updates: Record<string, any> = {};
                if (input.name) updates.name = input.name;
                if (input.user_type) updates.user_type = input.user_type;
                if (input.phone) updates.phone = Number(input.phone);

                // Verifica email duplicado
                if (input.email) {
                    const existingUser = await getUserByEmail(input.email);
                    if (existingUser && existingUser.id !== Number(input.id)) {
                        throw new ActionError({
                            code: "CONFLICT",
                            message: "A user with this email already exists.",
                        });
                    }
                    updates.email = input.email;
                }

                // Atualiza a imagem do perfil
                if (input.profile_pic) {
                    updates.profile_pic = `/uploads/${input.name}_updated.png`;
                }

                await editUser(Number(input.id), updates);
            } catch (error) {
                throw new ActionError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to edit user. Please try again.",
                });
            }
        },
    }),

    //Item Actions
    addItem: defineAction({
        accept: "form",
        input: addItemSchema,
        handler: async (input) => {

            let errorMessage = "Failed to add item. Please try again."
            let codeError: any = "INTERNAL_SERVER_ERROR"

            try {
                const existingItem = await getItemByName(input.name);

                if (existingItem) {
                    errorMessage = "A item with this name already exists"
                    codeError = "CONFLICT"
                }

                const getImagePath = async () => {
                    if (input.image && input.image.size > 0) {
                        // Salva a imagem e retorna o caminho
                        return await saveFileToPublic(input.image, input.name, "item");
                    }
                    else {
                        throw new ActionError({
                            code: codeError,
                            message: errorMessage,
                        });
                    }
                };

                const imagePath = await getImagePath()

                await addItem({
                    name: input.name,
                    type: input.type,
                    category: input.category,
                    size: input.size,
                    color: input.color,
                    brand: input.brand,
                    rental_price: input.rental_price.toString(),
                    condition: input.condition,
                    image: imagePath,
                });
            } catch (error: any) {
                //console.error("Error adding item:", error.message);
                throw new ActionError({
                    code: codeError,
                    message: errorMessage,
                });
            }
        },
    }),

    validateItemField: defineAction({
        input: z.object({
            field: z.enum(["name", "category", "type", "color", "size", "brand", "condition", "rental_price"]),
            value: z.string().optional(),
            id: z.string().min(1, "Item ID is required."),
        }),
        handler: async ({ field, value, id }) => {
            try {
                // Valida o valor com base no campo específico
                const validationSchemas: Record<string, z.ZodSchema> = {
                    name: baseItemSchema.shape.name,
                    category: baseItemSchema.shape.category,
                    type: baseItemSchema.shape.type,
                    color: baseItemSchema.shape.color,
                    size: baseItemSchema.shape.size,
                    brand: baseItemSchema.shape.brand,
                    condition: baseItemSchema.shape.condition,
                    rental_price: baseItemSchema.shape.rental_price,
                };

                if (!validationSchemas[field]) {
                    throw new ActionError({
                        code: "BAD_REQUEST",
                        message: `Field "${field}" is not supported for validation.`,
                    });
                }

                // Executa a validação
                validationSchemas[field].parse(value);

                return { valid: true };
            } catch (error) {
                if (error instanceof z.ZodError) {
                    return {
                        valid: false,
                        message: error.errors[0].message,
                    };
                }
                throw error;
            }
        },
    }),

    editItem: defineAction({
        input: editItemSchema,
        handler: async (input) => {
            try {
                const updates: Record<string, any> = {};
                if (input.name) updates.name = input.name;
                if (input.category) updates.category = input.category;
                if (input.type) updates.type = input.type;
                if (input.color) updates.color = input.color;
                if (input.size) updates.size = input.size;
                if (input.brand) updates.brand = input.brand;
                if (input.condition) updates.condition = input.condition;
                if (input.rental_price) updates.rental_price = input.rental_price;

                // Verifica name duplicado
                if (input.name) {
                    const existingItem = await getItemByName(input.name);
                    if (existingItem && existingItem.id !== Number(input.id)) {
                        throw new ActionError({
                            code: "CONFLICT",
                            message: "Item with this name already exists.",
                        });
                    }
                    updates.name = input.name;
                }

                await editItem(Number(input.id), updates);
            } catch (error) {
                throw new ActionError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to edit item. Please try again.",
                });
            }
        },
    }),

    //Delete User or Item
    delete: defineAction({
        input: z.object({
            id: z.number().min(1, "ID is required."),
            type: z.enum(["user", "item"]),
            imagePath: z.string().nonempty("Image path is required."),
        }),
        handler: async (input) => {
            try {

                // Delete the record based on type
                if (input.type === "user") {
                    await deleteUser(input.id);
                } else {
                    await deleteItem(input.id);
                }

                // Delete the image
                await deleteImage(input.imagePath);

                //console.log(`Deleted ${input.type} with ID ${input.id}`);
            } catch (error: any) {
                console.error(`Error deleting ${input.type}:`, error);
                throw new ActionError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Failed to delete ${input.type}.`,
                });
            }
        },
    }),
};