import { sanitizeName } from "./functions";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { promises as fs } from "fs";

import { google } from "googleapis";
import nodemailer from "nodemailer";
import config from "./config";

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

export const sendEmail = async (to: any, message: any) => {
  try {
    const transporter = await getTransporter();

    const mailOptions = {
      from: `"Oafit Oasis" <${config.EMAIL}>`,
      to: to.email,
      subject: message.subject,
      html: message.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email enviado com sucesso:", result.messageId);
    return result;
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    throw new Error("Erro ao enviar email");
  }
};