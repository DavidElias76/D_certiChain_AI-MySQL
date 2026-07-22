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
// } from "sequelize-typescript";
// import Certificate from "./certificate.model";
// import User from "./users.model";

// export type VerifierType = "student" | "employer" | "public";
// export type VerificationResult = "verified" | "invalid" | "revoked";

// /**
//  * VerificationLog model — records every certificate verification attempt.
//  */
// @Table({
//   tableName: "verification_logs",
//   timestamps: true,
//   createdAt: "verifiedAt",
//   updatedAt: false,
// })
// export default class VerificationLog extends Model {
//   @PrimaryKey
//   @AutoIncrement
//   @Column(DataType.INTEGER)
//   id!: number;

//   /** FK to the certificate being verified */
//   @ForeignKey(() => Certificate)
//   @Column({
//     type: DataType.INTEGER,
//     allowNull: true,
//   })
//   certificateId?: number;

//   /** FK to the user who verified (null for public verifiers) */
//   @ForeignKey(() => User)
//   @Column({
//     type: DataType.INTEGER,
//     allowNull: true,
//   })
//   verifierId?: number;

//   @Column({
//     type: DataType.STRING(255),
//     allowNull: true,
//     validate: {
//       isEmail: { msg: "Please provide a valid verifier email address" },
//     },
//   })
//   verifierEmail?: string;

//   @Column({
//     type: DataType.ENUM("student", "employer", "public"),
//     defaultValue: "public",
//     allowNull: false,
//   })
//   verifierType!: VerifierType;

//   @Column({
//     type: DataType.STRING(66),
//     allowNull: false,
//     validate: {
//       notEmpty: { msg: "Submitted certificate hash is required" },
//       is: {
//         args: /^0x[a-fA-F0-9]{64}$/,
//         msg: "Submitted hash must be a valid SHA-256 hex hash",
//       },
//     },
//   })
//   submittedHash!: string;

//   @Column({
//     type: DataType.STRING(66),
//     allowNull: true,
//   })
//   blockchainHash?: string;

//   @Column({
//     type: DataType.ENUM("verified", "invalid", "revoked"),
//     allowNull: false,
//   })
//   result!: VerificationResult;

//   @Column({
//     type: DataType.STRING(66),
//     allowNull: true,
//   })
//   blockchainTxHash?: string;

//   @Column({
//     type: DataType.STRING(45),
//     allowNull: true,
//   })
//   ipAddress?: string;

//   @Column({
//     type: DataType.STRING(500),
//     allowNull: true,
//   })
//   userAgent?: string;

//   @CreatedAt
//   verifiedAt!: Date;

//   @UpdatedAt
//   updatedAt!: Date;

//   // Associations
//   @BelongsTo(() => Certificate)
//   certificate!: Certificate;

//   @BelongsTo(() => User)
//   verifier!: User;
// }
