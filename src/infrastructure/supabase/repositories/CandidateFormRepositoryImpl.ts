import { supabase } from '@/infrastructure/supabase/client'
import type {
  CandidateForm,
  CandidateFormInput,
  EducationHistoryInput,
  FamilyEmergencyInput,
  WorkHistoryInput,
} from '@/domain/entities/CandidateForm'
import type { CandidateFormRepository } from '@/domain/repositories/CandidateFormRepository'

const candidateSelect = `
  *,
  employee_request_form:employee_request_form(
    id,
    main_position,
    site,
    approval_director_bu,
    approval_director_bu_date,
    approval_gm_hrd,
    approval_gm_hrd_date,
    approval_director_hrd,
    approval_director_hrd_date
  ),
  family_and_emergency(*),
  education(*),
  work_history(*),
  personal_statement(*)
`

export class CandidateFormRepositoryImpl implements CandidateFormRepository {
  async getAll(): Promise<CandidateForm[]> {
    const accessScope = await this.getAccessScope()
    let query = supabase.from('candidate_form').select(candidateSelect)

    if (accessScope.isCandidate && accessScope.userId) {
      query = query.eq('candidate_id', accessScope.userId)
    }
    if (accessScope.isManager) {
      if (accessScope.employeeRequestFormIds.length === 0) {
        return []
      }
      query = query.in('employee_request_form_id', accessScope.employeeRequestFormIds)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return (data ?? []).map(this.normalizeCandidateForm)
  }

  async getById(id: string): Promise<CandidateForm | null> {
    const accessScope = await this.getAccessScope()
    let query = supabase.from('candidate_form').select(candidateSelect).eq('id', id)

    if (accessScope.isCandidate && accessScope.userId) {
      query = query.eq('candidate_id', accessScope.userId)
    }
    if (accessScope.isManager) {
      if (accessScope.employeeRequestFormIds.length === 0) {
        return null
      }
      query = query.in('employee_request_form_id', accessScope.employeeRequestFormIds)
    }

    const { data, error } = await query.maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    return data ? this.normalizeCandidateForm(data) : null
  }

  async create(data: CandidateFormInput): Promise<CandidateForm> {
    const accessScope = await this.getAccessScope()

    if (accessScope.isManager && !accessScope.employeeRequestFormIds.includes(data.employee_request_form_id)) {
      throw new Error('You can only add candidates to Employee Request Forms you created.')
    }

    const { data: created, error } = await supabase
      .from('candidate_form')
      .insert({
        ...this.mapCandidateFormInput(data),
        candidate_id: accessScope.isCandidate
          ? accessScope.userId
          : (data.candidate_id ?? accessScope.userId ?? null),
      })
      .select('*')
      .single()

    if (error) {
      throw new Error(error.message)
    }

    await this.syncRelations(created.id, data)
    const candidate = await this.getById(created.id)

    if (!candidate) {
      throw new Error('Failed to load the newly created candidate form.')
    }

    return candidate
  }

  async update(id: string, data: CandidateFormInput): Promise<CandidateForm> {
    const accessScope = await this.getAccessScope()

    if (accessScope.isManager && !accessScope.employeeRequestFormIds.includes(data.employee_request_form_id)) {
      throw new Error('You can only move candidates to Employee Request Forms you created.')
    }

    let query = supabase
      .from('candidate_form')
      .update({
        ...this.mapCandidateFormInput(data),
        candidate_id: accessScope.isCandidate ? accessScope.userId : (data.candidate_id ?? null),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (accessScope.isCandidate && accessScope.userId) {
      query = query.eq('candidate_id', accessScope.userId)
    }
    if (accessScope.isManager) {
      if (accessScope.employeeRequestFormIds.length === 0) {
        throw new Error('Candidate form not found or inaccessible.')
      }
      query = query.in('employee_request_form_id', accessScope.employeeRequestFormIds)
    }

    const { data: updatedRows, error } = await query.select('id')

    if (error) {
      throw new Error(error.message)
    }

    if (!updatedRows || updatedRows.length === 0) {
      throw new Error('Candidate form not found or inaccessible.')
    }

    await this.syncRelations(id, data)
    const candidate = await this.getById(id)

    if (!candidate) {
      throw new Error('Failed to load the updated candidate form.')
    }

    return candidate
  }

  async delete(id: string): Promise<void> {
    const accessScope = await this.getAccessScope()
    let query = supabase.from('candidate_form').delete().eq('id', id)

    if (accessScope.isCandidate && accessScope.userId) {
      query = query.eq('candidate_id', accessScope.userId)
    }
    if (accessScope.isManager) {
      if (accessScope.employeeRequestFormIds.length === 0) {
        throw new Error('Candidate form not found or could not be deleted.')
      }
      query = query.in('employee_request_form_id', accessScope.employeeRequestFormIds)
    }

    const { data, error } = await query.select('id')

    if (error) {
      throw new Error(error.message)
    }

    if ((accessScope.isCandidate || accessScope.isManager) && (!data || data.length === 0)) {
      throw new Error('Candidate form not found or could not be deleted.')
    }
  }

  private async getAccessScope() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      throw new Error(userError.message)
    }

    if (!user) {
      return {
        isCandidate: false,
        isManager: false,
        employeeRequestFormIds: [] as string[],
        userId: null as string | null,
      }
    }

    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', user.id)
      .maybeSingle()

    if (roleError) {
      throw new Error(roleError.message)
    }

    const roleName = (roleData as { roles?: { name?: string } | null } | null)?.roles?.name
    const isManager = roleName?.toLowerCase() === 'manager'
    let employeeRequestFormIds: string[] = []

    if (isManager) {
      const { data: ownedEmployeeRequestForms, error: ownedEmployeeRequestFormsError } = await supabase
        .from('employee_request_form')
        .select('id')
        .eq('created_by', user.id)

      if (ownedEmployeeRequestFormsError) {
        throw new Error(ownedEmployeeRequestFormsError.message)
      }

      employeeRequestFormIds = (ownedEmployeeRequestForms || []).map((employeeRequestForm) => employeeRequestForm.id as string)
    }

    return {
      isCandidate: roleName?.toLowerCase() === 'candidate',
      isManager,
      employeeRequestFormIds,
      userId: user.id,
    }
  }

  private normalizeCandidateForm(data: Record<string, unknown>): CandidateForm {
    return {
      ...(data as unknown as CandidateForm),
      family_and_emergency: Array.isArray(data.family_and_emergency)
        ? (data.family_and_emergency as CandidateForm['family_and_emergency'])
        : [],
      education: Array.isArray(data.education)
        ? (data.education as CandidateForm['education'])
        : [],
      work_history: Array.isArray(data.work_history)
        ? (data.work_history as CandidateForm['work_history'])
        : [],
      personal_statement: Array.isArray(data.personal_statement)
        ? ((data.personal_statement[0] as CandidateForm['personal_statement']) ?? null)
        : ((data.personal_statement as CandidateForm['personal_statement']) ?? null),
    }
  }

  private mapCandidateFormInput(data: CandidateFormInput) {
    return {
      employee_request_form_id: data.employee_request_form_id || null,
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

  private async syncRelations(candidateFormId: string, data: CandidateFormInput) {
    await Promise.all([
      this.replaceFamilyEmergency(candidateFormId, data.family_and_emergency),
      this.replaceEducation(candidateFormId, data.education),
      this.replaceWorkHistory(candidateFormId, data.work_history),
      this.upsertPersonalStatement(candidateFormId, data.personal_statement),
    ])
  }

  private async replaceFamilyEmergency(candidateFormId: string, items: FamilyEmergencyInput[]) {
    const { error: deleteError } = await supabase
      .from('family_and_emergency')
      .delete()
      .eq('candidate_form_id', candidateFormId)

    if (deleteError) {
      throw new Error(deleteError.message)
    }

    const payload = items
      .filter((item) => item.name || item.relationship || item.education || item.description)
      .map((item) => ({
        candidate_form_id: candidateFormId,
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

    const { error } = await supabase.from('family_and_emergency').insert(payload)

    if (error) {
      throw new Error(error.message)
    }
  }

  private async replaceEducation(candidateFormId: string, items: EducationHistoryInput[]) {
    const { error: deleteError } = await supabase
      .from('education')
      .delete()
      .eq('candidate_form_id', candidateFormId)

    if (deleteError) {
      throw new Error(deleteError.message)
    }

    const payload = items
      .filter((item) => item.institution || item.major || item.category || item.description)
      .map((item) => ({
        candidate_form_id: candidateFormId,
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

    const { error } = await supabase.from('education').insert(payload)

    if (error) {
      throw new Error(error.message)
    }
  }

  private async replaceWorkHistory(candidateFormId: string, items: WorkHistoryInput[]) {
    const { error: deleteError } = await supabase
      .from('work_history')
      .delete()
      .eq('candidate_form_id', candidateFormId)

    if (deleteError) {
      throw new Error(deleteError.message)
    }

    const payload = items
      .filter(
        (item) => item.company || item.position || item.reason_to_quitting || item.description,
      )
      .map((item) => ({
        candidate_form_id: candidateFormId,
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

    const { error } = await supabase.from('work_history').insert(payload)

    if (error) {
      throw new Error(error.message)
    }
  }

  private async upsertPersonalStatement(
    candidateFormId: string,
    personalStatement: CandidateFormInput['personal_statement'],
  ) {
    const { error } = await supabase.from('personal_statement').upsert(
      {
        candidate_form_id: candidateFormId,
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
      },
      {
        onConflict: 'candidate_form_id',
      },
    )

    if (error) {
      throw new Error(error.message)
    }
  }
}
