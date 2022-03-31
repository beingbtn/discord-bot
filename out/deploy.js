"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const Log_1 = require("./utility/Log");
const rest_1 = require("@discordjs/rest");
const v9_1 = require("discord-api-types/v9");
(async () => {
    try {
        Log_1.Log.log('Starting deployment of the deploy command.');
        const deployCommand = (await Promise.resolve().then(() => __importStar(require(`${__dirname}/commands/deploy.ts`)))).properties.structure;
        await new rest_1.REST({ version: '9' })
            .setToken(process.env.discordAPIkey)
            .put(v9_1.Routes.applicationCommands(process.env.CLIENT_ID), {
            body: [deployCommand],
        });
        Log_1.Log.log('Successfully deployed the deploy command.');
    }
    catch (error) {
        Log_1.Log.error(error);
    }
})();
