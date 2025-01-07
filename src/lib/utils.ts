import { sanitizeName } from "./functions";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { promises as fs } from "fs";

import { google } from "googleapis";
import nodemailer from "nodemailer";
import config from "./config";

export const stripe = Stripe(
    "pk_test_51Qe20MQiiUMPEnxK0iI0rdoNI2ypnoGNTrna9PadMTbptmaQCoB8tVwiWfi1DxD783Uqq69yRVr5Sq1ytDTZCmmA001BOcIb1X",
);

export async function saveFileToPublic(file: File, name: string, type: string): Promise<string> {
    try {
        const pathType = (type === "profile") ? "/profile_users" : "/items_images";

        // Garante que a pasta public/profile_users existe
        const uploadDir = path.join(process.cwd(), `public/${pathType}`);
        await mkdir(uploadDir, { recursive: true });

        // Gera o nome do ficheiro: "profile_nome-do-user.extensão" ou "item_nome-do-item.extensão"
        const fileExtension = path.extname(file.name);
        const sanitizedFileName = sanitizeName(name);
        const fileName = `${type}_${sanitizedFileName}${fileExtension}`;
        const filePath = path.join(uploadDir, fileName);

        // Salva o ficheiro no diretório
        await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

        // Retorna o caminho relativo
        return `${pathType}/${fileName}`;
    } catch (error: any) {
        console.error("Erro ao salvar o ficheiro:", error);
        throw new Error(`Falha ao salvar o ficheiro: ${error.message}`);
    }
}

//delete the images when the item or user is deleted
export async function deleteImage(imagePath: string): Promise<void> {
    try {
        // Construct the absolute path to the file
        const filePath = path.join(process.cwd(), "public", imagePath.replace(/^\/+/, ""));

        // Log the resolved path for debugging
        //console.log(`Resolved file path: ${filePath}`);

        // Check if the file exists
        await fs.access(filePath);

        // Delete the file
        await fs.unlink(filePath);

        //console.log(`Image successfully deleted: ${filePath}`);
    } catch (error: any) {
        if (error.code === "ENOENT") {
            console.warn(`Image not found: ${imagePath}`);
            return; // Do not throw an error if the file does not exist
        }

        console.error("Error deleting the image:", error);
        throw new Error(`Failed to delete the image: ${error.message}`);
    }
}

//Send Email

let oAuth2Client: any = null;
let transporter: any = null;

const getOAuth2Client = () => {
    if (!oAuth2Client) {
        oAuth2Client = new google.auth.OAuth2(
            config.CLIENT_ID,
            config.CLIENT_SECRET,
            config.REDIRECT_URI
        );
        oAuth2Client.setCredentials({ refresh_token: config.REFRESH_TOKEN });
    }

    return oAuth2Client;
};

const getTransporter = async () => {
    if (!transporter) {
        const accessToken = await getOAuth2Client().getAccessToken();

        transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: config.EMAIL,
                clientId: config.CLIENT_ID,
                clientSecret: config.CLIENT_SECRET,
                refreshToken: config.REFRESH_TOKEN,
                accessToken: accessToken,
            },
        } as nodemailer.TransportOptions);
    }

    return transporter;
};

export const sendEmail = async (to: string, object: any) => {
    try {
        const transporter = await getTransporter();

        const mailOptions = {
            from: `"Oafit Oasis" <${config.EMAIL}>`,
            to,
            subject: "Thank You for Your Purchase at Oafit Oasis! 🛍️",
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #5A9;">Thank You for Your Order!</h2>
                <p>
                  Hi there, <br><br>
                  We’re excited to let you know that your purchase has been successfully processed! Thank you for shopping at <strong>Oafit Oasis</strong>.
                </p>
                <p>
                  Your order is being prepared and will be shipped soon. We'll send you a tracking number as soon as it’s available.
                </p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p><strong>Order Summary:</strong></p>
                  <ul style="list-style: none; padding: 0; margin: 0;">
                    <li>🎽 Product: <strong>${object.name}</strong></li>
                    <li>💵 Total: <strong>€${object.price}</strong></li>
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

        const result = await transporter.sendMail(mailOptions);
        console.log("Email enviado com sucesso:", result.messageId);
        return result;
    } catch (error) {
        console.error("Erro ao enviar email:", error);
        throw new Error("Erro ao enviar email");
    }
};