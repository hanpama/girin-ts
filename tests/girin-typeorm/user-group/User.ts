import {Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany } from 'typeorm';

import { Group } from './Group';

@Entity()
export class User {

  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  firstName: string;

  @Column('varchar')
  lastName: string;

  @OneToMany(type => Group, group => group.admin)
  ownGroups: Group[];

  @ManyToMany(type => Group, group => group.members)
  groups: Group[];

  @Column({ default: false })
  isRobot: boolean;
}
