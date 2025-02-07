const express = require("express");
const cors = require("cors");
const multer = require("multer");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

//env.config(); // Cargar variables de entorno
require("dotenv").config(); // Cargar variables de entorno correctamente

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage });

// Ruta para recibir y enviar el PDF por correo
app.post("/send-email", upload.single("pdf"), async (req, res) => {
    try {
        const filePath = path.join(__dirname, "uploads", req.file.filename);
        
        let transporter = nodemailer.createTransport({
            service: "gmail", // Usa tu servicio de correo
            auth: {
                user: process.env.EMAIL_USER, // Tu correo
                pass: process.env.EMAIL_PASS, // Tu contraseña o App Password
            },
        });

        let mailOptions = {
            from: process.env.EMAIL_USER,
            to: req.body.to,
            subject: "Tu PDF adjunto",
            text: "Adjunto encontrarás tu archivo PDF.",
            attachments: [
                {
                    filename: req.file.filename,
                    path: filePath,
                },
            ],
        };

        let info = await transporter.sendMail(mailOptions);
        console.log("Correo enviado: ", info.response);
        res.json({ message: "Correo enviado con éxito." });

        // Eliminar el archivo después de enviarlo
        fs.unlinkSync(filePath);
    } catch (error) {
        console.error("Error enviando correo: ", error);
        res.status(500).json({ message: "Error enviando el correo." });
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
