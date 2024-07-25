import { UsersEntity } from '../users/users.entity';

export type UsersResponseType = Omit<UsersEntity, 'password'> & {token: string};
