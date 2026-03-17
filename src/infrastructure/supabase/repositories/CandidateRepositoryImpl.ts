import { supabase } from "@/infrastructure/supabase/client"
import type {
  CandidateApplication,
  CandidateApplicationInput,
  EducationHistoryInput,
  FamilyEmergencyInput,
  WorkHistoryInput,
} from "@/domain/entities/Candidate"
import type { CandidateRepository } from "@/domain/repositories/CandidateRepository"

const applicationSelect = `
  *,
  job_request:new_employee_application_form(
    id,
    main_position,
    designation,
    site
  ),
  family_and_emergency(*),
  education(*),
  work_history(*),
  personal_statement(*)
`

export class CandidateRepositoryImpl implements CandidateRepository {
  async getAll(): Promise<CandidateApplication[]> {
    const { data, error } = await supabase
      .from("main_application_form")
      .select(applicationSelect)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return (data ?? []).map(this.normalizeApplication)
  }

  async getById(id: string): Promise<CandidateApplication | null> {
    const { data, error } = await supabase
      .from("main_application_form")
      .select(applicationSelect)
      .eq("id", id)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    return data ? this.normalizeApplication(data) : null
  }

  async create(data: CandidateApplicationInput): Promise<CandidateApplication> {
    const user = await supabase.auth.getUser()
    const { data: created, error } = await supabase
      .from("main_application_form")
      .insert({
        ...this.mapApplicationInput(data),
        candidate_id: data.candidate_id ?? user.data.user?.id ?? null,
      })
      .select("*")
      .single()

    if (error) {
      throw new Error(error.message)
    }

    await this.syncRelations(created.id, data)
    const application = await this.getById(created.id)

    if (!application) {
      throw new Error("Gagal memuat data aplikasi yang baru dibuat.")
    }

    return application
  }

  async update(id: string, data: CandidateApplicationInput): Promise<CandidateApplication> {
    const { error } = await supabase
      .from("main_application_form")
      .update({
        ...this.mapApplicationInput(data),
        candidate_id: data.candidate_id ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      throw new Error(error.message)
    }

    await this.syncRelations(id, data)
    const application = await this.getById(id)

    if (!application) {
      throw new Error("Gagal memuat data aplikasi yang diperbarui.")
    }

    return application
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("main_application_form")
      .delete()
      .eq("id", id)

    if (error) {
      throw new Error(error.message)
    }
  }

  private normalizeApplication(data: Record<string, unknown>): CandidateApplication {
    return {
      ...(data as unknown as CandidateApplication),
      family_and_emergency: Array.isArray(data.family_and_emergency)
        ? (data.family_and_emergency as CandidateApplication["family_and_emergency"])
        : [],
      education: Array.isArray(data.education)
        ? (data.education as CandidateApplication["education"])
        : [],
      work_history: Array.isArray(data.work_history)
        ? (data.work_history as CandidateApplication["work_history"])
        : [],
      personal_statement: Array.isArray(data.personal_statement)
        ? (data.personal_statement[0] as CandidateApplication["personal_statement"]) ?? null
        : (data.personal_statement as CandidateApplication["personal_statement"]) ?? null,
    }
  }

  private mapApplicationInput(data: CandidateApplicationInput) {
    return {
      job_request_id: data.job_request_id || null,
      date_application: data.date_application || null,
      notice_period: data.notice_period || null,
      first_name: data.first_name || null,
      middle_name: data.middle_name || null,
      last_name: data.last_name || null,
      hire_location: data.hire_location || null,
      date_of_birth: data.date_of_birth || null,
      place_of_birth: data.place_of_birth || null,
      nationality: data.nationality || null,
      marital_status: data.marital_status || null,
      religion: data.religion || null,
      gender: data.gender || null,
      ethnic: data.ethnic || null,
      blood_type: data.blood_type || null,
      id_card_address: data.id_card_address || null,
      residential_address: data.residential_address || null,
      personal_email: data.personal_email || null,
      instagram: data.instagram || null,
      linkedin: data.linkedin || null,
      phone_number: data.phone_number || null,
      id_type: data.id_type || null,
      id_no: data.id_no || null,
      reference_name: data.reference_name || null,
      reference_no: data.reference_no || null,
      reference_relationship: data.reference_relationship || null,
      reference_position: data.reference_position || null,
      reference_transportation: data.reference_transportation || null,
      reference_ownership: data.reference_ownership || null,
      reference_residence: data.reference_residence || null,
    }
  }

  private async syncRelations(applicationId: string, data: CandidateApplicationInput) {
    await Promise.all([
      this.replaceFamilyEmergency(applicationId, data.family_and_emergency),
      this.replaceEducation(applicationId, data.education),
      this.replaceWorkHistory(applicationId, data.work_history),
      this.upsertPersonalStatement(applicationId, data.personal_statement),
    ])
  }

  private async replaceFamilyEmergency(applicationId: string, items: FamilyEmergencyInput[]) {
    const { error: deleteError } = await supabase
      .from("family_and_emergency")
      .delete()
      .eq("application_id", applicationId)

    if (deleteError) {
      throw new Error(deleteError.message)
    }

    const payload = items
      .filter((item) => item.name || item.relationship || item.education || item.description)
      .map((item) => ({
        application_id: applicationId,
        name: item.name || null,
        relationship: item.relationship || null,
        gender: item.gender || null,
        place_and_date_of_birth: item.place_and_date_of_birth || null,
        education: item.education || null,
        description: item.description || null,
      }))

    if (payload.length === 0) {
      return
    }

    const { error } = await supabase.from("family_and_emergency").insert(payload)

    if (error) {
      throw new Error(error.message)
    }
  }

  private async replaceEducation(applicationId: string, items: EducationHistoryInput[]) {
    const { error: deleteError } = await supabase
      .from("education")
      .delete()
      .eq("application_id", applicationId)

    if (deleteError) {
      throw new Error(deleteError.message)
    }

    const payload = items
      .filter((item) => item.institution || item.major || item.category || item.description)
      .map((item) => ({
        application_id: applicationId,
        level: item.level || null,
        institution: item.institution || null,
        city: item.city || null,
        major: item.major || null,
        from_year: item.from_year ?? null,
        to_year: item.to_year ?? null,
        category: item.category || null,
        description: item.description || null,
      }))

    if (payload.length === 0) {
      return
    }

    const { error } = await supabase.from("education").insert(payload)

    if (error) {
      throw new Error(error.message)
    }
  }

  private async replaceWorkHistory(applicationId: string, items: WorkHistoryInput[]) {
    const { error: deleteError } = await supabase
      .from("work_history")
      .delete()
      .eq("application_id", applicationId)

    if (deleteError) {
      throw new Error(deleteError.message)
    }

    const payload = items
      .filter((item) => item.company || item.position || item.reason_to_quitting || item.description)
      .map((item) => ({
        application_id: applicationId,
        company: item.company || null,
        position: item.position || null,
        from_year: item.from_year ?? null,
        to_year: item.to_year ?? null,
        reason_to_quitting: item.reason_to_quitting || null,
        last_salary: item.last_salary ?? null,
        benefit: item.benefit || null,
        description: item.description || null,
      }))

    if (payload.length === 0) {
      return
    }

    const { error } = await supabase.from("work_history").insert(payload)

    if (error) {
      throw new Error(error.message)
    }
  }

  private async upsertPersonalStatement(
    applicationId: string,
    personalStatement: CandidateApplicationInput["personal_statement"],
  ) {
    const { error } = await supabase
      .from("personal_statement")
      .upsert({
        application_id: applicationId,
        contract: personalStatement.contract,
        contract_period: personalStatement.contract_period || null,
        legal_issues: personalStatement.legal_issues || null,
        reference_check_reason: personalStatement.reference_check_reason || null,
        family_details: personalStatement.family_details || null,
        detailed_care: personalStatement.detailed_care || null,
        serious_accident: personalStatement.serious_accident || null,
        psychological_test_details: personalStatement.psychological_test_details || null,
        business_trip: personalStatement.business_trip,
        expected_salary: personalStatement.expected_salary ?? null,
      }, {
        onConflict: "application_id",
      })

    if (error) {
      throw new Error(error.message)
    }
  }
}
