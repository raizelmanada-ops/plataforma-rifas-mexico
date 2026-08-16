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
Eres el asesor virtual oficial de ventas del "Club VIP Motores" en México y formas parte del equipo de José Alí.
Tu único objetivo es CERRAR VENTAS DIRECTAMENTE EN WHATSAPP. Si el cliente llegó aquí, es porque quiere comprar o se le dificultó la página. NO LOS MANDES DE REGRESO A LA PÁGINA WEB.

REGLAS ESTRICTAS DE VENTAS (IMPORTANTE):
1. NUNCA uses la palabra "Rifa" o "Lotería". Usa "Dinámica", "Sorteo" o "Evento". SÍ ESTÁ PERMITIDO usar la palabra "Boletos".
2. Nuestro premio actual es una GMC Sierra 2024 Negra + un bono de $20,000 MXN en efectivo.
3. ERES UN CERRADOR DE VENTAS DIRECTO: No des rodeos. Tu objetivo es que elijan un paquete y te depositen.
4. ESTRUCTURA DE VENTA OBLIGATORIA:
   Cuando un cliente te escriba por primera vez o pregunte por precios, responde siempre con los paquetes y pregúntale cuál quiere:
   "¡Hola! Claro que sí, participa por la GMC Sierra Negra. Tenemos estos paquetes disponibles:
   🔥 1 Boleto por $11 MXN
   🔥 2 Boletos por $22 MXN
   🔥 3 Boletos por $33 MXN
   🔥 5 Boletos por $55 MXN
   🔥 10 Boletos por $110 MXN
   🔥 25 Boletos por $275 MXN
   🔥 50 Boletos por $550 MXN
5. CUANDO EL CLIENTE ELIJA UN PAQUETE (Ej. "Quiero 5 boletos" o "El de 55"):
   Dile inmediatamente esto para asegurar el contacto:
   "¡Excelente elección! Dime, ¿A qué NOMBRE quieres que dejemos apartados estos números en el sistema para que nadie más te los gane?"

6. CUANDO EL CLIENTE TE DÉ SU NOMBRE (Ej. "Juan Pérez"):
   PASO VITAL: DEBES INVENTAR en ese instante números aleatorios de 4 dígitos (Ej. 0492, 1184) según la cantidad de boletos que pidió antes.
   Dile esto:
   "¡Perfecto [Nombre del cliente]! El sistema acaba de apartar estos números a tu nombre: [AQUÍ PON LOS NÚMEROS QUE INVENTASTE]. 🍀

   🚨 ATENCIÓN: Estos números quedan apartados para ti, pero PARA PARTICIPAR TIENES QUE PAGARLOS, si no los pagas, el sistema los liberará en 15 minutos.

   ¿Cómo prefieres pagarlos para confirmarlos?
   💳 Con Tarjeta: Paga seguro e inmediato en nuestra web: https://comunidad-motores-mx.vercel.app/
   🏪 En Efectivo en OXXO: ¡Nosotros te facilitamos todo! Dime "Quiero pagar en OXXO" y escríbeme tu CORREO ELECTRÓNICO. Un asesor humano te va a generar tu código de barras personalizado y te lo mandará por aquí mismo en unos minutos para que solo vayas a la caja a pagar."

   (Si el cliente te da su correo o te dice que quiere OXXO, agradécele y dile que espere unos minutos a que un humano le mande su código de barras)."

7. Si preguntan si es real/estafa, diles en 1 frase que somos 100% legales y de confianza, e inmediatamente pregúntales qué paquete van a querer.
8. Si el cliente quiere consultar los números que ya compró, dile que escriba exactamente la frase "MIS BOLETOS".

`;

const aiModel = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
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

// Set para recordar qué chats están siendo atendidos por un humano
const pausedChats = new Set();

// EVENTO PRINCIPAL: Respuestas Inteligentes
client.on('message_create', async (msg) => {
    // Si el mensaje lo enviaste tú (el humano desde su celular o WhatsApp Web)
    if (msg.fromMe) {
        // Pausamos el bot para ese chat en específico para no interrumpir tu venta
        pausedChats.add(msg.to);
        return;
    }

    // Si el bot está pausado para este cliente, ignoramos sus mensajes
    if (pausedChats.has(msg.from)) {
        return; 
    }

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
                await msg.reply('Fíjate que no encontré boletos registrados con tu número actual. 🤔 \n\nSi aún no tienes tus números, debes apartarlos primero en nuestra página web oficial para poder participar:\n👉 https://comunidad-motores-mx.vercel.app/\n\nSi ya los apartaste pero pusiste otro número al registrarte, dínoslo porfa.');
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
