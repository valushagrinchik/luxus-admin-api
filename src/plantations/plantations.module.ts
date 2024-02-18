import { Module } from '@nestjs/common';
import { PlantationsService } from './plantations.service';
import { PlantationsController } from './plantations.controller';

@Module({
  controllers: [PlantationsController],
  providers: [PlantationsService],
})
export class PlantationsModule {}
