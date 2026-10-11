const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Shop-Home AI-agent ',
            version: '1.0.0',
            description: 'Multi-Tenant WhatsApp AI E-Commerce REST API',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Local Development Server',
            },
        ],
        tags: [
            { name: 'Auth', description: 'User registration, login, JWT & password management' },
            { name: 'Shop', description: 'Shop profile, business settings, delivery configuration & WhatsApp linking' },
            { name: 'Customers', description: 'Customer CRM, address tracking, order history & Udhaar Khata Book' },
            { name: 'Inventory', description: 'Product catalogue, prices, and stock management' },
            { name: 'Orders', description: 'Customer orders lifecycle and automated stock deduction' },
            { name: 'AI Agent', description: 'AI Munshi automated salesman chat, tools & memory' },
            { name: 'WhatsApp', description: 'Meta WhatsApp Cloud API Webhook handshake & messaging' },
            { name: 'System', description: 'System health check' },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            },
            schemas: {
                Shop: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '6708a3d1b82f8a1234567890' },
                        authId: { type: 'string', example: '6708a3d1b82f8a1234567891' },
                        shopName: { type: 'string', example: 'Gupta Kirana & General Store' },
                        ownerName: { type: 'string', example: 'Sunil Gupta' },
                        address: { type: 'string', example: 'Shop No. 4, Main Bazar, Lucknow' },
                        openingTime: { type: 'string', example: '08:00 AM' },
                        closingTime: { type: 'string', example: '10:00 PM' },
                        upiId: { type: 'string', example: 'guptakirana@okaxis' },
                        deliveryRadiusKm: { type: 'number', example: 5 },
                        minimumOrderAmount: { type: 'number', example: 100 },
                        deliveryCharges: { type: 'number', example: 20 },
                        whatsappPhoneNumberId: { type: 'string', example: '105938472910482' },
                        aiEnabled: { type: 'boolean', example: true },
                        aiPersonality: { type: 'string', example: 'Namaste! Main Gupta Kirana ka digital sahayak hoon.' },
                        plan: { type: 'string', enum: ['free', 'basic', 'premium'], example: 'free' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Customer: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '6708b5e2c91a7b2345678901' },
                        shopId: { type: 'string', example: '6708a3d1b82f8a1234567890' },
                        phoneNumber: { type: 'string', example: '+919876543210' },
                        name: { type: 'string', example: 'Ramesh Kumar' },
                        defaultAddress: { type: 'string', example: 'Flat 204, Shivam Apartment, Main Road' },
                        addresses: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['Flat 204, Shivam Apartment', 'Shop No. 12, Market']
                        },
                        totalOrdersCount: { type: 'number', example: 6 },
                        totalSpent: { type: 'number', example: 1840 },
                        outstandingBalance: { type: 'number', example: 250, description: 'Udhaar: positive means customer owes money' },
                        tags: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['Regular', 'VIP']
                        },
                        notes: { type: 'string', example: 'Prefers morning delivery before 10 AM' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                InventoryItem: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '6708c6f3d02b8c3456789012' },
                        shopId: { type: 'string', example: '6708a3d1b82f8a1234567890' },
                        itemName: { type: 'string', example: 'Fortune Mustard Oil 1L' },
                        price: { type: 'number', example: 145 },
                        stockQuantity: { type: 'number', example: 25 },
                        category: { type: 'string', example: 'Cooking Oil' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                Order: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '6708d7a4e13c9d4567890123' },
                        shopId: { type: 'string', example: '6708a3d1b82f8a1234567890' },
                        customerPhone: { type: 'string', example: '+919876543210' },
                        customerName: { type: 'string', example: 'Ramesh Kumar' },
                        deliveryAddress: { type: 'string', example: 'Flat 204, Shivam Apartment' },
                        items: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    itemName: { type: 'string', example: 'Fortune Mustard Oil 1L' },
                                    quantity: { type: 'number', example: 2 },
                                    price: { type: 'number', example: 145 },
                                    subtotal: { type: 'number', example: 290 }
                                }
                            }
                        },
                        totalAmount: { type: 'number', example: 290 },
                        status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'], example: 'PENDING' },
                        paymentStatus: { type: 'string', enum: ['UNPAID', 'PAID'], example: 'UNPAID' },
                        source: { type: 'string', enum: ['WHATSAPP', 'MANUAL'], example: 'WHATSAPP' }
                    }
                }
            }
        },
        security: [{
            bearerAuth: []
        }]
    },
    apis: ['./src/app.js', './src/modules/**/*.route.js'],
};

const specs = swaggerJsdoc(options);

module.exports = {
    swaggerUi,
    specs,
};
