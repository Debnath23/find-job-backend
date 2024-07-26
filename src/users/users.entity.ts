import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { hash } from 'bcrypt';
import { Types } from 'mongoose';

@Schema({timestamps: true})
export class UsersEntity extends Document {
  @Prop()
  username: string;

  @Prop()
  email: string;

  @Prop({ select: false})
  password: string;

  @Prop([{ type: Types.ObjectId, ref: 'JobEntity' }])
  applyFor: [];
}

export const UsersEntitySchema = SchemaFactory.createForClass(UsersEntity);

UsersEntitySchema.pre<UsersEntity>('save', async function (next: Function) {
  this.password = await hash(this.password, 10);
  next();
});
