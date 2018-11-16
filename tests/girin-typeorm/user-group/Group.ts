import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable} from 'typeorm';
import { User } from './User';

@Entity()
export class Group {

  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  name: string;

  @Column('text')
  description: string;

  @ManyToMany(type => User, user => user.groups)
  @JoinTable()
  members: User[];

  @ManyToOne(type => User, user => user.ownGroups)
  @JoinTable()
  admin: User;
}