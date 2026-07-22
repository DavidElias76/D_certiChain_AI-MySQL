// import {
//   Table,
//   Column,
//   Model,
//   DataType,
//   PrimaryKey,
//   AutoIncrement,
//   CreatedAt,
//   UpdatedAt,
//   HasMany,
// } from "sequelize-typescript";
// import User from "./users.model";
// import Certificate from "./certificate.model";

// /**
//  * Institution (tenant) model.
//  * Each university/organization that issues certificates on the platform
//  * is represented as an Institution.
//  */
// @Table({
//   tableName: "institutions",
//   timestamps: true,
// })
// export default class Institution extends Model {
//   @PrimaryKey
//   @AutoIncrement
//   @Column(DataType.INTEGER)
//   id!: number;

//   @Column({
//     type: DataType.STRING(200),
//     allowNull: false,
//     validate: {
//       notEmpty: { msg: "Institution name is required" },
//       len: { args: [1, 200], msg: "Institution name must be 1-200 characters" },
//     },
//   })
//   name!: string;

//   /** e.g. "KCAU" — used in certificate numbers: CERT/2024/SU/001 */
//   @Column({
//     type: DataType.STRING(10),
//     allowNull: false,
//     unique: true,
//     validate: {
//       notEmpty: { msg: "Short code is required" },
//       len: { args: [2, 10], msg: "Short code must be 2-10 characters" },
//       is: {
//         args: /^[A-Z0-9]+$/i,
//         msg: "Short code must be alphanumeric only",
//       },
//     },
//   })
//   shortCode!: string;

//   /** e.g. "@KCAU.edu" — used to auto-assign student roles */
//   @Column({
//     type: DataType.STRING(100),
//     allowNull: false,
//     unique: true,
//     validate: {
//       notEmpty: { msg: "Institution domain is required" },
//     },
//   })
//   domain!: string;

//   /** Institution's Ethereum wallet address — authorized to issue/revoke on-chain */
//   @Column({
//     type: DataType.STRING(42),
//     allowNull: false,
//     unique: true,
//     validate: {
//       notEmpty: { msg: "Institution wallet address is required" },
//       is: {
//         args: /^0x[a-fA-F0-9]{40}$/,
//         msg: "Must be a valid Ethereum address",
//       },
//     },
//   })
//   walletAddress!: string;

//   /** A short description of the institution — motto or vision */
//   @Column({
//     type: DataType.STRING(500),
//     allowNull: true,
//   })
//   description?: string;

//   /** Soft-disable without deleting records */
//   @Column({
//     type: DataType.BOOLEAN,
//     defaultValue: true,
//   })
//   isActive!: boolean;

//   @CreatedAt
//   createdAt!: Date;

//   @UpdatedAt
//   updatedAt!: Date;

//   // Associations
//   @HasMany(() => User)
//   users!: User[];

//   @HasMany(() => Certificate)
//   certificates!: Certificate[];
// }
