/**
 * Dependency Injection Container
 *
 * This module exports a single, app-wide (true singleton) instance for each
 * repository. Import your repo from here – never instantiate repos manually.
 */
import { ApprovalRepositoryImpl } from '@/infrastructure/supabase/repositories/ApprovalRepositoryImpl'
import { AuthRepositoryImpl } from '@/infrastructure/supabase/repositories/AuthRepositoryImpl'
import { CandidateFormRepositoryImpl } from '@/infrastructure/supabase/repositories/CandidateFormRepositoryImpl'
import { EmployeeRequestFormRepositoryImpl } from '@/infrastructure/supabase/repositories/EmployeeRequestFormRepositoryImpl'
import { RecruitmentTrackingRepositoryImpl } from '@/infrastructure/supabase/repositories/RecruitmentTrackingRepositoryImpl'
import { RoleRepositoryImpl } from '@/infrastructure/supabase/repositories/RoleRepositoryImpl'
import { UserManagementRepositoryImpl } from '@/infrastructure/supabase/repositories/UserManagementRepositoryImpl'

export const approvalRepo = new ApprovalRepositoryImpl()
export const authRepo = new AuthRepositoryImpl()
export const candidateFormRepo = new CandidateFormRepositoryImpl()
export const employeeRequestFormRepo = new EmployeeRequestFormRepositoryImpl()
export const recruitmentTrackingRepo = new RecruitmentTrackingRepositoryImpl()
export const roleRepo = new RoleRepositoryImpl()
export const userManagementRepo = new UserManagementRepositoryImpl()
