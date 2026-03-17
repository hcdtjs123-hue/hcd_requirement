import { supabase } from "@/infrastructure/supabase/client"
import type { JobRequest, JobRequestInput } from "@/domain/entities/JobRequest"
import type { JobRequestRepository } from "@/domain/repositories/JobRequestRepository"

export class JobRequestRepositoryImpl implements JobRequestRepository {
  async getAll(): Promise<JobRequest[]> {
    const { data, error } = await supabase
      .from("new_employee_application_form")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data ?? []
  }

  async getById(id: string): Promise<JobRequest | null> {
    const { data, error } = await supabase
      .from("new_employee_application_form")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  async create(data: JobRequestInput): Promise<JobRequest> {
    const user = await supabase.auth.getUser()

    const payload = {
      ...this.mapInput(data),
      created_by: user.data.user?.id ?? null,
    }

    const { data: created, error } = await supabase
      .from("new_employee_application_form")
      .insert(payload)
      .select("*")
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return created
  }

  async update(id: string, data: JobRequestInput): Promise<JobRequest> {
    const { data: updated, error } = await supabase
      .from("new_employee_application_form")
      .update({
        ...this.mapInput(data),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return updated
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("new_employee_application_form")
      .delete()
      .eq("id", id)

    if (error) {
      throw new Error(error.message)
    }
  }

  private mapInput(data: JobRequestInput) {
    return {
      pt_pembebanan: data.pt_pembebanan || null,
      employment_status: data.employment_status || null,
      direct_manager: data.direct_manager || null,
      designation: data.designation || null,
      site: data.site || null,
      working_location: data.working_location || null,
      custom_grup_1: data.custom_grup_1 || null,
      custom_grup_2: data.custom_grup_2 || null,
      custom_grup_3: data.custom_grup_3 || null,
      custom_grup_4: data.custom_grup_4 || null,
      custom_grup_5: data.custom_grup_5 || null,
      custom_grup_6: data.custom_grup_6 || null,
      required_date: data.required_date || null,
      position_status: data.position_status || null,
      periode_probation: data.periode_probation ?? null,
      main_position: data.main_position || null,
    }
  }
}
