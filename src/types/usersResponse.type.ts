import { UsersEntity } from '../entities/users.entity';

export type UsersResponseType = Omit<UsersEntity, 'password'> & {token: string};
