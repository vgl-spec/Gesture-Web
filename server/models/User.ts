import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

// PSA Birth Certificate Fields Interface
export interface IBirthCertificate {
  // PSA Document Info
  certificateNumber: string | null;
  registryNumber: string | null;
  dateIssued: Date | null;
  placeOfRegistration: string | null;
  
  // Child's Information (from PSA)
  childFirstName: string | null;
  childMiddleName: string | null;
  childLastName: string | null;
  childSex: "Male" | "Female" | null;
  dateOfBirth: Date | null;
  placeOfBirth: string | null;
  
  // Father's Information
  fatherFirstName: string | null;
  fatherMiddleName: string | null;
  fatherLastName: string | null;
  fatherNationality: string | null;
  fatherOccupation: string | null;
  fatherReligion: string | null;
  
  // Mother's Information
  motherFirstName: string | null;
  motherMiddleName: string | null;
  motherMaidenLastName: string | null;
  motherNationality: string | null;
  motherOccupation: string | null;
  motherReligion: string | null;
  
  // Marriage of Parents
  parentsMarriedDate: Date | null;
  parentsMarriedPlace: string | null;
  
  // Birth Certificate Document Upload
  documentUrl: string | null;
  documentFilename: string | null;
  documentUploadedAt: Date | null;
}

// Profile Completion Status
export interface IProfileCompletion {
  isComplete: boolean;
  completionDeadline: Date | null;
  remindersSent: number;
  lastReminderSentAt: Date | null;
  firstWarningShown: boolean;
  deadlineWarningShown: boolean;
}

// Profile Edit Request Status
export type ProfileEditStatus = "none" | "pending" | "approved" | "rejected";

export interface IProfileEditRequest {
  status: ProfileEditStatus;
  requestedAt: Date | null;
  reviewedAt: Date | null;
  reviewedBy: mongoose.Types.ObjectId | null;
  rejectionReason: string | null;
  // Snapshot of old data for admin comparison
  previousData: Partial<IBirthCertificate> | null;
}

export interface IUser extends Document {
  // Basic Auth Info
  email: string;
  password: string;
  role: "client" | "admin" | "superadmin";
  
  // Basic Personal Info (required at registration)
  firstName: string;
  lastName: string;
  
  // PSA Birth Certificate Fields (all blank initially, 3 months to complete)
  birthCertificate: IBirthCertificate;
  
  // Profile Completion Tracking
  profileCompletion: IProfileCompletion;
  
  // Profile Edit Request (for when user requests to edit after initial submission)
  profileEditRequest: IProfileEditRequest;
  
  // Account Status
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  isProfileComplete(): boolean;
  getDaysUntilDeadline(): number | null;
  isDeadlineApproaching(): boolean;
}

const birthCertificateSchema = new Schema<IBirthCertificate>({
  // PSA Document Info
  certificateNumber: { type: String, trim: true, default: null },
  registryNumber: { type: String, trim: true, default: null },
  dateIssued: { type: Date, default: null },
  placeOfRegistration: { type: String, trim: true, default: null },
  
  // Child's Information
  childFirstName: { type: String, trim: true, default: null },
  childMiddleName: { type: String, trim: true, default: null },
  childLastName: { type: String, trim: true, default: null },
  childSex: { type: String, enum: ["Male", "Female", null], default: null },
  dateOfBirth: { type: Date, default: null },
  placeOfBirth: { type: String, trim: true, default: null },
  
  // Father's Information
  fatherFirstName: { type: String, trim: true, default: null },
  fatherMiddleName: { type: String, trim: true, default: null },
  fatherLastName: { type: String, trim: true, default: null },
  fatherNationality: { type: String, trim: true, default: null },
  fatherOccupation: { type: String, trim: true, default: null },
  fatherReligion: { type: String, trim: true, default: null },
  
  // Mother's Information
  motherFirstName: { type: String, trim: true, default: null },
  motherMiddleName: { type: String, trim: true, default: null },
  motherMaidenLastName: { type: String, trim: true, default: null },
  motherNationality: { type: String, trim: true, default: null },
  motherOccupation: { type: String, trim: true, default: null },
  motherReligion: { type: String, trim: true, default: null },
  
  // Marriage of Parents
  parentsMarriedDate: { type: Date, default: null },
  parentsMarriedPlace: { type: String, trim: true, default: null },
  
  // Document Upload
  documentUrl: { type: String, trim: true, default: null },
  documentFilename: { type: String, trim: true, default: null },
  documentUploadedAt: { type: Date, default: null },
}, { _id: false });

const profileCompletionSchema = new Schema<IProfileCompletion>({
  isComplete: { type: Boolean, default: false },
  completionDeadline: { type: Date, default: null },
  remindersSent: { type: Number, default: 0 },
  lastReminderSentAt: { type: Date, default: null },
  firstWarningShown: { type: Boolean, default: false },
  deadlineWarningShown: { type: Boolean, default: false },
}, { _id: false });

const profileEditRequestSchema = new Schema<IProfileEditRequest>({
  status: { 
    type: String, 
    enum: ["none", "pending", "approved", "rejected"], 
    default: "none" 
  },
  requestedAt: { type: Date, default: null },
  reviewedAt: { type: Date, default: null },
  reviewedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  rejectionReason: { type: String, trim: true, default: null },
  previousData: { type: Schema.Types.Mixed, default: null },
}, { _id: false });

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    select: false,
  },
  role: {
    type: String,
    enum: ["client", "admin", "superadmin"],
    default: "client",
  },
  firstName: {
    type: String,
    required: [true, "First name is required"],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
    trim: true,
  },
  birthCertificate: {
    type: birthCertificateSchema,
    default: () => ({}),
  },
  profileCompletion: {
    type: profileCompletionSchema,
    default: () => ({}),
  },
  profileEditRequest: {
    type: profileEditRequestSchema,
    default: () => ({}),
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLoginAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Set 3-month deadline on new user creation
userSchema.pre("save", function(next) {
  if (this.isNew && this.role === "client") {
    const deadline = new Date();
    deadline.setMonth(deadline.getMonth() + 3);
    this.profileCompletion.completionDeadline = deadline;
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if profile is complete (all required PSA fields filled + document uploaded)
userSchema.methods.isProfileComplete = function(): boolean {
  const bc = this.birthCertificate;
  const requiredFields = [
    bc.certificateNumber,
    bc.registryNumber,
    bc.childFirstName,
    bc.childLastName,
    bc.childSex,
    bc.dateOfBirth,
    bc.placeOfBirth,
    bc.fatherFirstName,
    bc.fatherLastName,
    bc.motherFirstName,
    bc.motherMaidenLastName,
    bc.documentUrl, // Birth certificate document must be uploaded
  ];
  
  return requiredFields.every(field => field !== null && field !== undefined && field !== "");
};

// Get days until deadline
userSchema.methods.getDaysUntilDeadline = function(): number | null {
  if (!this.profileCompletion.completionDeadline) return null;
  
  const now = new Date();
  const deadline = new Date(this.profileCompletion.completionDeadline);
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Check if deadline is approaching (within 14 days)
userSchema.methods.isDeadlineApproaching = function(): boolean {
  const daysLeft = this.getDaysUntilDeadline();
  if (daysLeft === null) return false;
  return daysLeft <= 14 && daysLeft > 0;
};

export const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
