// Transfer request workflow states
export enum TransferRequestStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  SCHOOL_REVIEWED = 'school_reviewed',
  FORWARDED_TO_ZONAL = 'forwarded_to_zonal',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

// Teacher assignment status
export enum TeacherAssignmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  TERMINATED = 'terminated',
}

// Teacher leaving reasons
export enum TeacherLeavingReason {
  TRANSFER = 'transfer',
  RESIGNATION = 'resignation',
  RETIREMENT = 'retirement',
  DISMISSAL = 'dismissal',
  OTHER = 'other',
}

// User roles enum
export enum UserRole {
  IT_ADMIN = 'it_admin',
  ZONAL_DIRECTOR = 'zonal_director',
  PRINCIPAL = 'principal',
  SCHOOL_ADMIN = 'school_admin',
  TEACHER = 'teacher',
  STAFF = 'staff',
  PAP = 'pap',
}
