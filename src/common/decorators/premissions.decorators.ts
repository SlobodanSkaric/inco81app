import { SetMetadata } from "@nestjs/common";

export const PREMISSIONS_KEY = 'premissions';
export const Premissions = (...premissions: string[]) => SetMetadata(PREMISSIONS_KEY, premissions)