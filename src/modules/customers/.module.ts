import { Module } from '@nestjs/common';
import { Service } from './.service';

@Module({
  providers: [Service]
})
export class Module {}
