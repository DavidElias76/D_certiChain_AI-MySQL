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
//   HasOne,
// } from "sequelize-typescript";
// import User from "./users.model";
// import VerificationLog from "./verificationLog.model";
// import Recommendation from "./recommendation.model";

// export type CertificateStatus = "issued" | "revoked";

// /**
//  * Certificate model.
//  * certificateHash is dual-stored: in MySQL (for fast lookup) AND on-chain (for immutability).
//  */
// @Table({
//   tableName: "certificates",
//   timestamps: true,
// })
// export default class Certificate extends Model {
//   @PrimaryKey
//   @AutoIncrement
//   @Column(DataType.INTEGER)
//   id!: number;

//   // ── Student / Recipient Info ─────────────────────────────
//   @Column({
//     type: DataType.STRING(80),
//     allowNull: false,
//     validate: {
//       notEmpty: { msg: "Student name is required" },
//       len: { args: [2, 80], msg: "Student name must be 2-80 characters" },
//     },
//   })
//   studentName!: string;

//   @Column({
//     type: DataType.STRING(50),
//     allowNull: false,
//     validate: {
//       notEmpty: { msg: "Student registration number is required" },
//     },
//   })
//   registrationNumber!: string;

//   @Column({
//     type: DataType.STRING(255),
//     allowNull: false,
//     validate: {
//       notEmpty: { msg: "Student email is required for certificate delivery" },
//       isEmail: { msg: "Please provide a valid email address" },
//     },
//   })
//   studentEmail!: string;

//   // ── Academic Details ─────────────────────────────────────
//   @Column({
//     type: DataType.STRING(120),
//     allowNull: false,
//     validate: {
//       notEmpty: { msg: "Institution name is required" },
//     },
//   })
//   institutionName!: string;

//   @Column({
//     type: DataType.STRING(120),
//     allowNull: false,
//     validate: {
//       notEmpty: { msg: "Course name is required" },
//     },
//   })
//   course!: string;

//   @Column({
//     type: DataType.STRING(120),
//     allowNull: false,
//     validate: {
//       notEmpty: { msg: "Degree is required" },
//     },
//   })
//   degree!: string;

//   @Column({
//     type: DataType.DATEONLY,
//     allowNull: false,
//     validate: {
//       notEmpty: { msg: "Graduation date is required" },
//     },
//   })
//   graduationDate!: Date;

//   @Column({
//     type: DataType.STRING(10),
//     allowNull: true,
//   })
//   gpa?: string;

//   /** e.g. "First Class Honors", "Second Class Lower" */
//   @Column({
//     type: DataType.STRING(60),
//     allowNull: true,
//   })
//   classification?: string;

//   /** Optional skills — stored as JSON array */
//   @Column({
//     type: DataType.JSON,
//     defaultValue: [],
//   })
//   skills!: string[];

//   // ── Certificate Identity ──────────────────────────────────
//   /** Human-readable cert number e.g. CERT/2024/SU/001 */
//   @Column({
//     type: DataType.STRING(50),
//     allowNull: false,
//     unique: true,
//     validate: {
//       notEmpty: { msg: "Certificate number is required" },
//     },
//   })
//   certificateNumber!: string;

//   /** SHA-256 hash of certificate data */
//   @Column({
//     type: DataType.STRING(66),
//     allowNull: false,
//     unique: true,
//     validate: {
//       notEmpty: { msg: "Certificate hash is required" },
//       is: {
//         args: /^0x[a-fA-F0-9]{64}$/,
//         msg: "Certificate hash must be a valid SHA-256 hex string",
//       },
//     },
//   })
//   certificateHash!: string;

//   // ── Blockchain Metadata ───────────────────────────────────
//   @Column({
//     type: DataType.STRING(66),
//     allowNull: true,
//   })
//   blockchainTxHash?: string;

//   @Column({
//     type: DataType.STRING(50),
//     allowNull: true,
//   })
//   blockchainCertificateId?: string;

//   // ── Document URLs ─────────────────────────────────────────
//   @Column({
//     type: DataType.STRING(500),
//     allowNull: true,
//   })
//   qrCodeUrl?: string;

//   @Column({
//     type: DataType.STRING(500),
//     allowNull: true,
//   })
//   certificatePdfUrl?: string;

//   // ── Status & Audit ────────────────────────────────────────
//   @Column({
//     type: DataType.ENUM("issued", "revoked"),
//     defaultValue: "issued",
//     allowNull: false,
//   })
//   status!: CertificateStatus;

//   /** FK to the admin user who issued this certificate */
//   @ForeignKey(() => User)
//   @Column({
//     type: DataType.INTEGER,
//     allowNull: false,
//     validate: {
//       notEmpty: { msg: "Issuing admin is required" },
//     },
//   })
//   issuedBy!: number;

//   @Column({
//     type: DataType.DATE,
//     defaultValue: DataType.NOW,
//   })
//   issuedAt!: Date;

//   @Column({
//     type: DataType.DATE,
//     allowNull: true,
//   })
//   revokedAt?: Date;

//   @Column({
//     type: DataType.STRING(250),
//     allowNull: true,
//   })
//   revocationReason?: string;

//   @CreatedAt
//   createdAt!: Date;

//   @UpdatedAt
//   updatedAt!: Date;

//   // Associations
//   @BelongsTo(() => User)
//   issuer!: User;

//   @HasOne(() => Recommendation)
//   recommendation!: Recommendation;

//   @HasMany(() => VerificationLog)
//   verificationLogs!: VerificationLog[];
// }
