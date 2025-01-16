import { defineAction, ActionError } from "astro:actions";
import { z } from "astro:schema";
import { saveFileToPublic, deleteImage, sendEmail } from "@lib/utils";
import {
    getUserLogin, registerUser,
    addUser, editUser, deleteUser, getUserByEmail,
    getUserEmailById, addItem, getItemByName, editItem,
    getItemByID, deleteItem, thereIsReservation, addUReservation, editRentalStatus, getRentalDateWithItemID
} from "@lib/dbFunctions";

import Stripe from "stripe";

// Inicialize o Stripe com sua chave secreta
const stripe = new Stripe("sk_test_51Qe20MQiiUMPEnxKmA9gEAXEMyfMP1pfF4pCNrLsihG686cZWSln7MWzI0sVRH7J3LlmvdrlHsKJayxp0Hq2K9eO001rcErWGV");

const calculateOrderAmount = (items: { id: number; amount: number }[]) => {
    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error("No items provided or invalid format.");
    }

    return items.reduce((total, item) => {
        if (!item.amount || item.amount <= 0) {
            throw new Error(`Invalid amount for item ID: ${item.id}`);
        }
        return total + item.amount;
    }, 0) * 100; // Multiplicar por 100 para Stripe
};

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
        .refine((file) => file && file.size <= 2 * 1024 * 1024, "File must be less than 2MB")
        .optional()
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
        .max(80, "Your item name must be no more than 80 characters"),
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

    login: defineAction({
        // 1) Validação Zod já acontece automaticamente por `input:` 
        input: z.object({
            email: z.string().trim().toLowerCase().email("Invalid email format"),
            password: z.string().min(8, "Password must be at least 8 characters"),
        }),
        handler: async ({ email, password }) => {
            try {
                // 1) Buscar usuário
                const user = await getUserLogin(email, password);

                //console.log("user: ", user)
                if (!user) {
                    return { valid: false, message: "Email not found" };
                }

                // 2) Comparar diretamente com o campo password do BD
                if (user.password !== password) {
                    return { valid: false, message: "Wrong password" };
                }

                // 3) Se der certo, retornar user
                return { valid: true, user };
            } catch (error) {
                if (error instanceof Error) {
                    throw error; // Lança erro caso seja outro tipo de erro
                } else {
                    throw new Error("Unknown error occurred");
                }
            }
        },
    }),

    //User Actions
    addUser: defineAction({
        accept: "form",
        input: addUserSchema,
        handler: async (input) => {

            //console.log("input: ", input)

            try {
                // Verify if user already exist
                const existingUser = await getUserByEmail(input.email);
                //console.log("existingUser: ", existingUser)

                if (existingUser) {
                    throw new ActionError({
                        code: "CONFLICT",
                        message: "A user with this email already exists",
                    });
                }

                const getProfilePicPath = async () => {
                    if (input.profile_pic && input.profile_pic.size > 0) {
                        // Salva a imagem e retorna o caminho
                        return await saveFileToPublic(input.profile_pic, input.name, "profile");
                    } else {
                        // Caminho padrão
                        return "/profile_users/default.webp";
                    }
                };

                const profilePicPath = await getProfilePicPath()

                const user = await addUser({
                    name: input.name,
                    email: input.email,
                    password: input.password,
                    user_type: input.user_type,
                    phone: input.phone ? Number(input.phone) : null,
                    profile_pic: profilePicPath,
                });

                console.log("user: ", user)

                return { valid: true, user }
            } catch (error) {
                if (error instanceof Error) {
                    throw error; // Lança erro caso seja outro tipo de erro
                } else {
                    throw new Error("Unknown error occurred");
                }
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

    getItemID: defineAction({
        input: z.object({
            id: z.number().min(1, "Item id is required."),
        }),
        handler: async ({ id }) => {
            try {
                const item = await getItemByID(id);

                if (!item) {
                    throw new ActionError({
                        code: "NOT_FOUND",
                        message: "Item not found.",
                    });
                }

                return item;
            } catch (error) {
                throw new ActionError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to get item ID. Please try again.",
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

    //Stripe
    createPaymentIntent: defineAction({
        input: z.object({
            items: z
                .array(
                    z.object({
                        id: z.number(),
                        amount: z.number().positive("Amount must be greater than 0"),
                    })
                )
                .nonempty("At least one item is required."),
        }),
        handler: async ({ items }) => {
            //console.log("Items Received:", items); // Log para depuração

            try {
                const totalAmount = calculateOrderAmount(items);
                //console.log("Total Amount (in cents):", totalAmount);

                const paymentIntent = await stripe.paymentIntents.create({
                    amount: totalAmount,
                    currency: "eur",
                    automatic_payment_methods: { enabled: true },
                });

                return { clientSecret: paymentIntent.client_secret, paymentIntent };
            } catch (error: any) {
                console.error("Error Creating PaymentIntent:", error);
                throw new ActionError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: error.message || "Failed to create PaymentIntent. Please try again.",
                });
            }
        },
    }),

    getPaymentMethod: defineAction({
        input: z.object({
            id: z.string().min(1, "id is required."),
        }),
        handler: async ({ id }) => {
            try {
                const paymentMethod = await stripe.paymentMethods.retrieve(id);

                if (!paymentMethod.card) {
                    throw new ActionError({
                        code: "NOT_FOUND",
                        message: "Card details not found.",
                    });
                }
                return paymentMethod.card.brand;
            } catch (error) {
                console.error('Erro ao obter detalhes do método de pagamento:', error);
                throw new ActionError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: (error instanceof Error ? error.message : "Unknown error") || "Error to get details payment method. Please try again.",
                });
            }
        },
    }),

    thereIsReservation: defineAction({
        input: z.object({
            user_id: z.number().min(1, "user id is required."),
            item_id: z.number().min(1, "item id is required."),
            start_date: z.string().refine(
                (date) => !isNaN(Date.parse(date)), // Verifica se a string pode ser convertida para uma data válida
                { message: "start_date must be a valid date in YYYY-MM-DD format." }
            ),
            end_date: z.string().refine(
                (date) => !isNaN(Date.parse(date)), // Verifica se a string pode ser convertida para uma data válida
                { message: "end_date must be a valid date in YYYY-MM-DD format." }
            ),
        }),
        handler: async ({ item_id, start_date, end_date }) => {
            try {
                const reservation = Boolean(await thereIsReservation(item_id, start_date, end_date));
                //console.log("reservation: ", reservation)

                return reservation;
            } catch (error) {
                console.error("Error in sendEmail:", error);
                throw new ActionError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: (error instanceof Error ? error.message : "Unknown error") || "Failed to send email. Please try again.",
                });
            }
        },
    }),

    itemPaymentConfirmation: defineAction({
        input: z.object({
            user_id: z.number().min(1, "user id is required."),
            item_id: z.number().min(1, "item id is required."),
            start_date: z.string().refine(
                (date) => !isNaN(Date.parse(date)), // Verifica se a string pode ser convertida para uma data válida
                { message: "start_date must be a valid date in YYYY-MM-DD format." }
            ),
            end_date: z.string().refine(
                (date) => !isNaN(Date.parse(date)), // Verifica se a string pode ser convertida para uma data válida
                { message: "end_date must be a valid date in YYYY-MM-DD format." }
            ),
            payment_amount: z.number()
                .min(0.01, "payment_amount must be at least 0.01.") // Verifica se o pagamento é positivo
                .refine(
                    (amount) => Number.isFinite(amount),
                    { message: "payment_amount must be a valid number." }
                ),
            payment_method: z.string().min(1, "payment method is required."),
        }),
        handler: async ({ user_id, item_id, start_date, end_date, payment_amount, payment_method }) => {
            try {

                const reservation = await addUReservation(user_id, item_id, start_date, end_date, payment_amount, payment_method);

                if (!reservation) {
                    throw new ActionError({
                        code: "NOT_FOUND",
                        message: "Payment not found.",
                    });
                }

                //ober email do utilizador
                const email = await getUserEmailById(user_id);
                if (!email) {
                    throw new ActionError({
                        code: "NOT_FOUND",
                        message: "User email not found.",
                    });
                }

                // Obtém o item e o email
                const item = await getItemByID(item_id);
                if (!item) {
                    throw new ActionError({
                        code: "NOT_FOUND",
                        message: "Item not found.",
                    });
                }

                //console.log("email: ", email)
                //console.log("item: ", item)

                //messagem para enviar ao user
                const message = {
                    subject: "Thank You for Your Purchase at Oafit Oasis! 🛍️",
                    html: `
                      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <h2 style="color: #5A9;">Thank You for Your Order!</h2>
                        <p>
                          Hi there, <br><br>
                          We’re excited to let you know that your purchase has been successfully processed! Thank you for shopping at <strong>Oafit Oasis</strong>.
                        </p>
                        <p>
                          Your order is ready to collect at address <a href="https://maps.app.goo.gl/EhatjmBKQSNDYaQD6">Rua José Nogueira Vaz 16, Póvoa de Santa Iria</a>.
                        </p>
                        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                          <p><strong>Order Summary:</strong></p>
                          <ul style="list-style: none; padding: 0; margin: 0;">
                            <li>🎽 Product: <strong>${item.name}</strong></li>
                            <li>💲 Price per day: <strong>${item.rental_price}</strong></li>
                            <li>💵 Total: <strong>${payment_amount} €</strong></li>
                          </ul>
                        </div>
                        <p>
                          If you have any questions about your order, feel free to reply to this email, and our support team will be happy to assist you.
                        </p>
                        <p>
                          Warm regards, <br>
                          <strong>The Oafit Oasis Team</strong>
                        </p>
                        <footer style="font-size: 12px; color: #777; margin-top: 20px;">
                          <p>
                            <em>This is an automated email. Please do not reply to this message.</em>
                          </p>
                        </footer>
                      </div>
                    `,
                };

                //console.log("message: ", message)

                // Envia o email
                const send = await sendEmail(email, message);

                if (!send) {
                    throw new ActionError({
                        code: "CONFLICT",
                        message: "Failed to send email.",
                    });
                }

                return { success: true };
            } catch (error) {
                console.error("Error in confirmation in reservation:", error);
                throw new ActionError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: (error instanceof Error ? error.message : "Unknown error") || "Failed to confirm reservation. Please try again.",
                });
            }
        },
    }),

    //Rent
    getRentalDate: defineAction({
        input: z.object({
            id: z.number().min(1, "Item ID is required."),
        }),
        handler: async ({ id }) => {
            const rentalDate = await getRentalDateWithItemID(id);
            if (!rentalDate) {
                throw new ActionError({
                    code: "NOT_FOUND",
                    message: "Item not found.",
                });
            }
            return { rentalDate };
        },
    }),

    validateRentField: defineAction({
        input: z.object({
            value: z.enum(["active", "completed", "late"]),
            id: z.number().min(1, "Rental ID is required."),
        }),
        handler: async ({ value, id }) => {
            try {
                return { valid: true };
            } catch (error) {
                if (error instanceof z.ZodError) {
                    return {
                        valid: false,
                        message: error.message,
                    };
                }
                throw error;
            }
        },
    }),

    editRent: defineAction({
        input: z.object({
            id: z.number().min(1, "Rental ID is required."),
            value: z.enum(['active', 'completed', 'late']),
        }),
        handler: async ({ id, value }) => {
            try {
                await editRentalStatus(id, value);
            } catch (error) {
                throw new ActionError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to edit rental rental. Please try again.",
                });
            }
        },
    }),
};