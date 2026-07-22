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

// export interface ISourceProfile {
//   degree: string;
//   course: string;
//   gpa?: string;
//   skills: string[];
//   locationPreference?: string;
// }

// export interface IRecommendedRole {
//   title: string;
//   matchScore: number;
//   reason: string;
//   requiredSkills: string[];
//   missingSkills: string[];
// }

// export interface IJobMatch {
//   title: string;
//   company: string;
//   location?: string;
//   url?: string;
//   salaryRange?: string;
//   matchScore: number;
// }

// /**
//  * Recommendation model — AI-generated career recommendations based on verified certificates.
//  */
// @Table({
//   tableName: "recommendations",
//   timestamps: true,
// })
// export default class Recommendation extends Model {
//   @PrimaryKey
//   @AutoIncrement
//   @Column(DataType.INTEGER)
//   id!: number;

//   /** FK to the certificate this recommendation is based on */
//   @ForeignKey(() => Certificate)
//   @Column({
//     type: DataType.INTEGER,
//     allowNull: false,
//     validate: {
//       notEmpty: { msg: "Certificate reference is required" },
//     },
//   })
//   certificateId!: number;

//   /** FK to the user who received this recommendation */
//   @ForeignKey(() => User)
//   @Column({
//     type: DataType.INTEGER,
//     allowNull: true,
//   })
//   userId?: number;

//   /** Source academic profile */
//   @Column({
//     type: DataType.JSON,
//     allowNull: false,
//   })
//   sourceProfile!: ISourceProfile;

//   /** AI-suggested job roles */
//   @Column({
//     type: DataType.JSON,
//     defaultValue: [],
//   })
//   recommendedRoles!: IRecommendedRole[];

//   /** Skills suggested by AI to improve employability */
//   @Column({
//     type: DataType.JSON,
//     defaultValue: [],
//   })
//   suggestedSkills!: string[];

//   /** Market insights from AI analysis */
//   @Column({
//     type: DataType.JSON,
//     defaultValue: [],
//   })
//   marketInsights!: string[];

//   /** Matching job opportunities */
//   @Column({
//     type: DataType.JSON,
//     defaultValue: [],
//   })
//   jobMatches!: IJobMatch[];

//   @Column({
//     type: DataType.DATE,
//     defaultValue: DataType.NOW,
//   })
//   generatedAt!: Date;

//   @CreatedAt
//   createdAt!: Date;

//   @UpdatedAt
//   updatedAt!: Date;

//   // Associations
//   @BelongsTo(() => Certificate)
//   certificate!: Certificate;

//   @BelongsTo(() => User)
//   user!: User;
// }
