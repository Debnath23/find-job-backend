import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { hash } from 'bcrypt';
import { Document, Types } from 'mongoose';


@Schema({timestamps: true})
export class UsersEntity extends Document {
  @Prop({unique: true, required: true})
  username: string;

  @Prop({required: true})
  email: string;

  @Prop({ select: false, required: true})
  password: string;

  @Prop([{ type: Types.ObjectId, ref: 'JobEntity' }])
  applyFor: Types.ObjectId[];

  @Prop({ required: true, default: 2})
  usersType: number;

  @Prop({ default: true})
  isActive: boolean;
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
