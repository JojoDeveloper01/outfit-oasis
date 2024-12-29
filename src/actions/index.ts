import { defineAction, ActionError } from "astro:actions";
import { z } from "astro:schema";
import { addUser, editUser, deleteUser, getUserByEmail, userExistsByID } from "@lib/dbFunctions";
import { saveFileToPublic } from "@lib/utils";

// Validação com Zod
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

export const server = {
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
                        return await saveFileToPublic(input.profile_pic, input.name);
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

    validateField: defineAction({
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

    deleteUser: defineAction({
        input: z.object({
            id: z.string().min(1, "User ID is required."),
        }),
        handler: async (input) => {
            try {
                await deleteUser(Number(input.id));
            } catch (error) {
                throw new ActionError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to delete user.",
                });
            }
        },
    }),
};