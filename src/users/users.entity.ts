import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { hash } from 'bcrypt';

@Schema()
export class UsersEntity {
  @Prop()
  username: string;

  @Prop()
  email: string;

  @Prop({ select: false })
  password: string;
}

export const UsersEntitySchema = SchemaFactory.createForClass(UsersEntity);

UsersEntitySchema.pre<UsersEntity>('save', async function (next: Function) {
  this.password = await hash(this.password, 10);
  next();
});
