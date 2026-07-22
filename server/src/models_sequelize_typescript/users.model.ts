// import {
//   Table,
//   Column,
//   Model,
//   DataType,
//   PrimaryKey,
//   AutoIncrement,
//   CreatedAt,
//   UpdatedAt,
//   ForeignKey,
//   BelongsTo,
//   HasMany,
// } from "sequelize-typescript";
// import Institution from "./institution.model";
// import Certificate from "./certificate.model";
// import VerificationLog from "./verificationLog.model";

// export type UserRole = "admin" | "student" | "employer" | "systemAdmin";

// /**
//  * User model — students, employers, university admins, and system admins.
//  */
// @Table({
//   tableName: "users",
//   timestamps: true,
// })
// export default class User extends Model {
//   @PrimaryKey
//   @AutoIncrement
//   @Column(DataType.INTEGER)
//   id!: number;

//   @Column({
//     type: DataType.STRING(80),
//     allowNull: false,
//     validate: {
//       notEmpty: { msg: "Full name is required" },
//       len: { args: [2, 80], msg: "Full name must be 2-80 characters" },
//     },
//   })
//   username!: string;

//   @Column({
//     type: DataType.STRING(255),
//     allowNull: false,
//     unique: true,
//     validate: {
//       notEmpty: { msg: "Email is required" },
//       isEmail: { msg: "Please provide a valid email address" },
//     },
//   })
//   email!: string;

//   @Column({
//     type: DataType.STRING(255),
//     allowNull: false,
//     validate: {
//       notEmpty: { msg: "Password is required" },
//       len: { args: [6, 255], msg: "Password must be at least 6 characters" },
//     },
//   })
//   password!: string;

//   @Column({
//     type: DataType.ENUM("admin", "student", "employer", "systemAdmin"),
//     defaultValue: "student",
//     allowNull: false,
//     validate: {
//       notEmpty: { msg: "Role is required" },
//     },
//   })
//   role!: UserRole;

//   /** Optional Ethereum wallet address */
//   @Column({
//     type: DataType.STRING(42),
//     allowNull: true,
//     validate: {
//       is: {
//         args: /^0x[a-fA-F0-9]{40}$/,
//         msg: "Must be a valid Ethereum wallet address",
//       },
//     },
//   })
//   wallet_address?: string;

//   /** FK to institution (for students and university admins) */
//   @ForeignKey(() => Institution)
//   @Column({
//     type: DataType.INTEGER,
//     allowNull: true,
//   })
//   institutionId?: number;

//   @Column({
//     type: DataType.STRING(120),
//     allowNull: true,
//     validate: {
//       len: { args: [0, 120], msg: "Institution name must be at most 120 characters" },
//     },
//   })
//   institutionName?: string;

//   @Column({
//     type: DataType.BOOLEAN,
//     defaultValue: false,
//   })
//   isVerified!: boolean;

//   @CreatedAt
//   createdAt!: Date;

//   @UpdatedAt
//   updatedAt!: Date;

//   // Associations
//   @BelongsTo(() => Institution)
//   institution!: Institution;

//   @HasMany(() => Certificate)
//   certificates!: Certificate[];

//   @HasMany(() => VerificationLog)
//   verificationLogs!: VerificationLog[];
// }
