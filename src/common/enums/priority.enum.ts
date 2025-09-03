import { registerEnumType } from '@nestjs/graphql';

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

registerEnumType(Priority, {
  name: 'Priority',
  description: 'Priority level',
});
