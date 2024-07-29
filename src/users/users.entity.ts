import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { hash } from 'bcrypt';
import { Document, Types } from 'mongoose';
import { JobEntity } from './job.entity';

@Schema({timestamps: true})
export class UsersEntity extends Document {
  @Prop({unique: true})
  username: string;

  @Prop()
  email: string;

  @Prop({ select: false})
  password: string;

  @Prop([{ type: Types.ObjectId, ref: 'JobEntity' }])
  applyFor: Types.ObjectId[];
}

export const UsersEntitySchema = SchemaFactory.createForClass(UsersEntity);


UsersEntitySchema.pre<UsersEntity>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    this.password = await hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});
