import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Application } from "express";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Pase de Lista API",
      version: "1.0.0",
      description: "API para el sistema de gestión de asistencia",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor de desarrollo",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        LoginRequest: {
          type: "object",
          required: ["matricula", "contrasena"],
          properties: {
            matricula: { type: "string" },
            contrasena: { type: "string" },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            token: { type: "string" },
          },
        },
        PerfilResponse: {
          type: "object",
          properties: {
            id: { type: "integer" },
            nombre: { type: "string" },
            correo: { type: "string", nullable: true },
            rol: { type: "string", enum: ["ALUMNO", "PROFESOR"] },
            matricula: { type: "string" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
        Usuario: {
          type: "object",
          properties: {
            id: { type: "integer" },
            nombre: { type: "string" },
            apellidoPaterno: { type: "string" },
            apellidoMaterno: { type: "string" },
            correo: { type: "string", nullable: true },
            rol: { type: "string", enum: ["ALUMNO", "PROFESOR"] },
          },
        },
        Materia: {
          type: "object",
          properties: {
            id: { type: "integer" },
            clave: { type: "string" },
            nombre: { type: "string" },
          },
        },
        Clase: {
          type: "object",
          properties: {
            id: { type: "integer" },
            grupo: { type: "string" },
            periodo: { type: "string", nullable: true },
            estaActivo: { type: "boolean" },
            materia: { $ref: "#/components/schemas/Materia" },
            profesor: { $ref: "#/components/schemas/Usuario" },
          },
        },
        Horario: {
          type: "object",
          properties: {
            id: { type: "integer" },
            claseId: { type: "integer" },
            dia: { type: "integer" },
            diaDeLaSemana: {
              type: "string",
              enum: [
                "LUNES",
                "MARTES",
                "MIERCOLES",
                "JUEVES",
                "VIERNES",
                "SABADO",
              ],
            },
            horaDeInicio: { type: "string", format: "date-time" },
            horaDeFin: { type: "string", format: "date-time" },
          },
        },
        Inscripcion: {
          type: "object",
          properties: {
            id: { type: "integer" },
            claseId: { type: "integer" },
            alumnoId: { type: "integer" },
            estaActivo: { type: "boolean" },
            fechaDeCreacion: { type: "string", format: "date-time" },
            alumno: {
              type: "object",
              properties: {
                id: { type: "integer" },
                nombre: { type: "string" },
                apellidoPaterno: { type: "string" },
                apellidoMaterno: { type: "string" },
              },
            },
          },
        },
        Dispositivo: {
          type: "object",
          properties: {
            usuarioId: { type: "integer" },
            androidId: { type: "string" },
            fcmToken: { type: "string" },
          },
        },
        Asistencia: {
          type: "object",
          properties: {
            id: { type: "integer" },
            claseId: { type: "integer" },
            alumnoId: { type: "integer" },
            estado: {
              type: "string",
              enum: ["PRESENTE", "FALTA", "RETARDO", "JUSTIFICADO"],
            },
            metodo: { type: "string", enum: ["MANUAL", "BLE", "QR"] },
            fechaDispositivo: { type: "string", format: "date-time" },
            fechaRegistro: { type: "string", format: "date-time" },
            clase: { $ref: "#/components/schemas/Clase" },
            alumno: { $ref: "#/components/schemas/Usuario" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/**/*.ts"],
};

export const setupSwagger = (app: Application) => {
  const specs = swaggerJsdoc(options);
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      swaggerOptions: { url: "/api-docs/swagger.json" },
    }),
  );
  app.get("/api-docs/swagger.json", (_req, res) => res.json(specs));
  console.log("📚 Swagger: http://localhost:3001/api-docs");
};
