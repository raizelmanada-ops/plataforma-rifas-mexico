require('dotenv').config();
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Configuración de Servidor y BD
const app = express();
app.use(cors());
app.use(express.json());
const prisma = new PrismaClient();
const PORT = 3001;

// Configuración de Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const SYSTEM_PROMPT = `
Eres el asesor virtual oficial de ventas del "Club VIP Motores" en México. 
Tu único objetivo es VENDER participaciones de forma RÁPIDA y DIRECTA guiando a la gente a: https://plataforma-rifas-mexico.vercel.app/

REGLAS ESTRICTAS DE VENTAS (IMPORTANTE):
1. NUNCA uses la palabra "Rifa" o "Lotería". Usa "Dinámica", "Sorteo" o "Evento". SÍ ESTÁ PERMITIDO usar la palabra "Boletos".
2. Nuestro premio actual es una GMC Sierra 2024 + un bono de $20,000 MXN en efectivo.
3. ERES UN VENDEDOR DIRECTO: No des rodeos. Responde la duda del cliente en UNA SOLA FRASE CORTA e INMEDIATAMENTE envíale la información de los paquetes y el enlace. 
4. Tu estructura OBLIGATORIA para responder siempre debe ser parecida a esta:
   "(Tu respuesta corta de 1 frase). Aprovecha que hoy tenemos estos paquetes de boletos:
   🔥 1 Boleto por $11 MXN
   🔥 2 Boletos por $22 MXN
   🔥 3 Boletos por $33 MXN
   🔥 5 Boletos por $55 MXN
   🔥 10 Boletos por $110 MXN
   🔥 25 Boletos por $275 MXN
   🔥 50 Boletos por $550 MXN
   🔥 100 Boletos VIP por $1100 MXN
   Entra a esta página, elige tus números y ahí encontrarás todo para pagar seguro: https://plataforma-rifas-mexico.vercel.app/ 🛻💨"
5. Si preguntan si es real/estafa, diles en 1 frase que somos 100% legales y avalados, e inmediatamente mándales los paquetes y el link.
6. Si preguntan cómo pagar, diles que se paga en la web con OXXO, SPEI o Tarjeta e inmediatamente mándales el link.
7. Si el cliente pide hablar con un humano o que le llamen, dile: "Claro, déjame tu duda detallada y te llamamos. Mientras tanto, puedes ir viendo los paquetes aquí: [link]".
8. Si el cliente quiere consultar los números que ya compró, dile que escriba exactamente la frase "MIS BOLETOS".
9. Eres parte del equipo de José Alí.
`;

const aiModel = genAI.getGenerativeModel({ 
    model: "gemini-3.5-flash",
    systemInstruction: SYSTEM_PROMPT
});

// Inicializa el cliente de WhatsApp
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
});

// Memoria temporal para saber a quién ya le mandamos la foto
const contactedUsers = new Set();

client.on('qr', (qr) => {
    console.log(' Escanea este código QR con tu WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Cliente de WhatsApp listo y conectado con INTELIGENCIA ARTIFICIAL!');
});

client.on('authenticated', () => {
    console.log('✅ Autenticado correctamente.');
});

client.on('auth_failure', (msg) => {
    console.error('❌ Error de autenticación:', msg);
});

// EVENTO PRINCIPAL: Respuestas Inteligentes
client.on('message_create', async (msg) => {
    if (msg.fromMe) return;

    const texto = msg.body.toLowerCase();
    const remitente = msg.from.replace('@c.us', '');

    // Si el usuario envía una imagen (como el comprobante de pago)
    if (msg.hasMedia) {
        await msg.reply('¡Recibimos tu imagen/comprobante! 📸\n\nUn asesor humano de nuestro equipo la revisará enseguida para validar tu pago o atender tu caso. En unos minutos te confirmaremos. ✅');
        return; // Salimos para no enviarle la imagen a la IA
    }

    // Si es la primera vez que nos escriben (desde que se prendió el bot), les mandamos la foto para antojar
    if (!contactedUsers.has(remitente)) {
        contactedUsers.add(remitente);
        try {
            const mediaPath = path.join(__dirname, 'public', 'sierra-1.jpg');
            const media = MessageMedia.fromFilePath(mediaPath);
            await client.sendMessage(msg.from, media, { caption: '🔥 ¡Esta es la espectacular GMC Sierra que te puedes llevar!' });
        } catch (err) {
            console.error('Error enviando la imagen:', err);
        }
    }

    // CAPA 1: Base de Datos (Si piden ver sus boletos)
    if (texto.includes('mis folios') || texto.includes('mis numeros') || texto.includes('mis números') || texto.includes('mis boletos') || texto.includes('mi boleto')) {
        try {
            const phoneStr = remitente.length > 10 ? remitente.slice(-10) : remitente; 
            const customer = await prisma.customer.findFirst({
                where: { phone: { contains: phoneStr } },
                include: { tickets: true },
                orderBy: { createdAt: 'desc' }
            });

            if (customer && customer.tickets.length > 0) {
                let respuesta = `Hola *${customer.name}*, claro que sí, aquí te paso los boletos que separaste:\n\n`;
                customer.tickets.forEach(ticket => {
                    const statusEmoji = ticket.status === 'PAID' ? '✅ PAGADO' : '⚠️ PENDIENTE';
                    respuesta += `📝 Boleto: *${ticket.number}* - Estado: ${statusEmoji}\n`;
                });
                respuesta += `\nOjo: si tienes boletos pendientes, recuerda que el sistema los libera en automático si pasa el tiempo límite. ¡No te quedes por fuera! 🍀`;
                await msg.reply(respuesta);
            } else {
                await msg.reply('Fíjate que no encontré boletos registrados con tu número actual. 🤔 \n\nSi aún no tienes tus números, debes apartarlos primero en nuestra página web oficial para poder participar:\n👉 https://plataforma-rifas-mexico.vercel.app/\n\nSi ya los apartaste pero pusiste otro número al registrarte, dínoslo porfa.');
            }
        } catch (e) {
            console.error('Error buscando boletos:', e);
            await msg.reply('Ocurrió un error al buscar tus datos. Dame un momento o espera a que te conteste un humano.');
        }
        return; // Salimos para no enviarle esto a la IA
    }

    // CAPA 2: Inteligencia Artificial Gemini
    try {
        // Consultar estado del cliente en la BD para darle contexto a la IA
        const phoneStr = remitente.length > 10 ? remitente.slice(-10) : remitente; 
        const dbCustomer = await prisma.customer.findFirst({
            where: { phone: { contains: phoneStr } },
            include: { tickets: true }
        });

        let contextoDinamico = "";
        if (dbCustomer && dbCustomer.tickets.length > 0) {
            contextoDinamico = `[INSTRUCCIÓN SECRETA: El sistema detecta que este cliente YA TIENE boletos separados en la web. NO le intentes vender más paquetes. Tu objetivo es decirle que si ya pagó, envíe la foto de su comprobante por aquí para que un asesor humano lo valide, o si tiene dudas del pago, ayudarle a resolverlas.]\n\nMensaje del cliente: `;
        } else {
            contextoDinamico = `[INSTRUCCIÓN SECRETA: El sistema detecta que este cliente AÚN NO TIENE boletos. Eres un VENDEDOR DIRECTO. Respóndele rápido y ofrécele los paquetes (1 por $11, 2 por $22, 3 por $33, 5 por $55, 10 por $110, etc.) con el enlace de la web.]\n\nMensaje del cliente: `;
        }

        const result = await aiModel.generateContent(contextoDinamico + msg.body);
        const responseText = result.response.text();
        await msg.reply(responseText);
    } catch (error) {
        console.error('Error en Gemini AI:', error);
        // Si la IA falla, damos una respuesta genérica de respaldo
        await msg.reply('¡Recibimos tu mensaje! ✅\n\nSi nos estás enviando tu comprobante de pago o tienes una duda importante, no te preocupes. Un asesor humano de nuestro equipo te atenderá de forma personal en unos minutos. 🙏');
    }
});

// Endpoint del API para enviar mensajes automáticos (Cuando compran en la web)
app.post('/api/send-ticket', async (req, res) => {
    try {
        const { phone, message } = req.body;
        if (!phone || !message) return res.status(400).json({ error: 'Número y mensaje requeridos.' });

        let formattedPhone = phone.replace(/\D/g, '');
        if (formattedPhone.length === 10) {
            formattedPhone = '521' + formattedPhone; 
        } else if (formattedPhone.startsWith('52') && formattedPhone.length === 12) {
            if (!formattedPhone.startsWith('521')) formattedPhone = '521' + formattedPhone.substring(2);
        }
        
        const chatId = `${formattedPhone}@c.us`;
        await client.sendMessage(chatId, message);
        console.log(`Mensaje enviado automático a ${phone}`);
        
        return res.status(200).json({ success: true, message: 'Mensaje enviado correctamente.' });
    } catch (error) {
        console.error('Error enviando mensaje web:', error);
        return res.status(500).json({ error: 'Error interno al enviar.' });
    }
});

// Iniciar
app.listen(PORT, () => {
    console.log(`🤖 Webhook API escuchando en puerto ${PORT}`);
    console.log('Iniciando Inteligencia Artificial Gemini...');
    client.initialize();
});
