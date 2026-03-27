import { supabase } from '@/infrastructure/supabase/client'
import type { MasterDataInput, MasterDataItem, MasterDataType } from '@/domain/entities/MasterData'

const tableNameByType: Record<MasterDataType, string> = {
  pt: 'master_pt',
  department: 'master_department',
}

export class MasterDataRepositoryImpl {
  private resolveTableName(type: MasterDataType) {
    return tableNameByType[type]
  }

  async getAll(type: MasterDataType): Promise<MasterDataItem[]> {
    const { data, error } = await supabase
      .from(this.resolveTableName(type))
      .select('*')
      .order('name', { ascending: true })

    if (error) throw new Error(error.message)
    return data ?? []
  }

  async create(type: MasterDataType, input: MasterDataInput): Promise<MasterDataItem> {
    const payload = {
      name: input.name.trim(),
      description: input.description?.trim() || null,
    }

    const { data, error } = await supabase
      .from(this.resolveTableName(type))
      .insert(payload)
      .select('*')
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  async update(type: MasterDataType, id: string, input: MasterDataInput): Promise<MasterDataItem> {
    const payload = {
      name: input.name.trim(),
      description: input.description?.trim() || null,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from(this.resolveTableName(type))
      .update(payload)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  async delete(type: MasterDataType, id: string): Promise<void> {
    const { error } = await supabase
      .from(this.resolveTableName(type))
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
  }
}

export const masterDataRepo = new MasterDataRepositoryImpl()
