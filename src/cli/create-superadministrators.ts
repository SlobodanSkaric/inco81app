import { plainToInstance } from "class-transformer";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import { AddSuperadministratorsDto } from "../modules/superadministrator/dtos/add.superadministrators.dto";
import { validate } from "class-validator";
import { NestFactory } from "@nestjs/core";
import { CliModules } from "./cli.modules";
import { SuperadministratorService } from "../modules/superadministrator/superadministrator.service";
import { ApiResponse } from "../misc/api.response.dto";

let muted = false;
const output = new Writable({
    write(chunk, encoding, callback) {
        if(!muted) process.stdout.write(chunk);
        callback();
        }
});

const rl = createInterface({ input: process.stdin, output, terminal: true });

async function ask(question: string, hidden=false): Promise<string> {
    const pending = rl.question(question);
    muted = hidden;
    const answer = await pending;
    muted = false;
    
    if(hidden) {
        process.stdout.write("\n");
        return answer;
    }
    return answer.trim();
}

async function bootstrap(): Promise<void> {
    if(!process.stdin.isTTY) {
        process.stdout.write("This program requires a TTY to run.\n");
        process.exit(1);
    }

    const username = await ask("Username: ");
    const email = await ask("Email: ");
    const phoneNumber = await ask("Phone Number: ");
    const password = await ask("Password: ", true);
    const confirmPassword = await ask("Confirm Password: ", true);
    rl.close();

    if(password !== confirmPassword) {
        process.stdout.write("Passwords do not match.\n");
        process.exit(1);
    }

    const dto = plainToInstance(AddSuperadministratorsDto, { username, email, password, phoneNumber: phoneNumber || undefined });


    const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });
    if(errors.length > 0) {
        for(const error of errors){
            console.error(`${error.property}: ${Object.values(error.constraints || {}).join(", ")}`);
        }
        process.exit(1);
    }

    const app = await NestFactory.createApplicationContext(CliModules,{logger: ["error", "warn"]});

    try{
        const result = await app.get(SuperadministratorService).addSuperAdministrators(dto);

        if(result instanceof ApiResponse) {
            console.error(`${result.messages}`);
            process.exitCode = 1;
            return;
        }
        console.log(`Superadministrator created successfully: ${result.username}`);
    }finally{
        await app.close();
    }
}

bootstrap().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});