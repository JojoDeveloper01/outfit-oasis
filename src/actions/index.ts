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

    editUser: defineAction({
        accept: "form",
        input: editUserSchema,
        handler: async (input) => {
            let errorMessage = "Failed to edit user. Please try again."
            let codeError: any = "INTERNAL_SERVER_ERROR"

            try {
                const updates: Record<string, any> = {};
                if (input.name) updates.name = input.name;
                if (input.password) updates.password = input.password;
                if (input.user_type) updates.user_type = input.user_type;
                if (input.phone) updates.phone = Number(input.phone);

                // Verify if user already exist
                if (input.email) {
                    updates.email = input.email;
                    const existingUser = await getUserByEmail(input.email);

                    if (existingUser) {
                        errorMessage = "A user with this email already exists"
                        codeError = "CONFLICT"
                    }
                }

                // Atualização da imagem
                if (input.profile_pic) {
                    updates.profile_pic = `/uploads/${input.name}_updated.png`;
                }

                await editUser(Number(input.id), updates);
            } catch (error) {
                throw new ActionError({
                    code: codeError,
                    message: errorMessage,
                });
            }
        },
    }),

    deleteUser: defineAction({
        accept: "form",
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